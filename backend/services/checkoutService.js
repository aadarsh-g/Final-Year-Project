const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const Rental = require('../models/Rental');
const notificationService = require('./notificationService');
const rewardService = require('./rewardService');
const emailService = require('./emailService');

class CheckoutService {
  /**
   * Process checkout and create order from cart
   */
  async checkout(userId, checkoutData) {
    try {
      // 1. Get user's cart
      const cart = await Cart.findOne({ userId: userId }).populate('items.bookId');
      
      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // 2. Validate cart (stock, prices)
      const validationResult = await this.validateCartForCheckout(cart);
      if (!validationResult.valid) {
        throw new Error(validationResult.message);
      }
      
      // 3. Prepare order items with book snapshots
      const orderItems = cart.items.map(item => {
        const orderItem = {
          book: item.bookId._id,
          type: item.type,
          pricePerUnit: item.type === 'purchase' ? item.bookId.price.purchase : item.bookId.price.rental.perDay,
          subtotal: item.subtotal,
          bookSnapshot: {
            title: item.bookId.title,
            author: item.bookId.author,
            coverImage: item.bookId.coverImage,
            isbn: item.bookId.isbn,
          },
        };
        
        if (item.type === 'purchase') {
          orderItem.quantity = item.quantity;
        } else {
          orderItem.quantity = 1;
          // Use the dates from the cart item (already calculated)
          orderItem.rentalDuration = item.rentalDuration || item.totalDays; // Support both field names
          orderItem.rentalStartDate = item.rentStartDate || item.rentalStartDate;
          orderItem.rentalEndDate = item.rentEndDate || item.rentalEndDate;
        }
        
        return orderItem;
      });
      
      // 3.5. Handle free book reward if provided
      let freeBookDiscount = 0;
      let freeBookId = null;
      
      if (checkoutData.freeBookReward && checkoutData.freeBookReward.bookId) {
        try {
          // Verify user has active free book rewards
          const hasReward = await rewardService.hasActiveFreeBookReward(userId);
          if (!hasReward) {
            console.warn('User tried to use free book reward but has none active');
          } else {
            // Find the cart item and calculate discount
            const freeCartItem = cart.items.find(item => item._id.toString() === checkoutData.freeBookReward.itemId);
            if (freeCartItem && freeCartItem.type === 'purchase') {
              const pricePerUnit = freeCartItem.bookId.price.purchase;
              freeBookDiscount = pricePerUnit;
              freeBookId = freeCartItem.bookId._id;
              console.log(`✅ Applying free book reward: Rs. ${freeBookDiscount} discount`);
            }
          }
        } catch (error) {
          console.error('Error applying free book reward:', error);
          // Continue with order even if reward fails
        }
      }
      
      // Calculate final total with free book discount
      let finalTotal = cart.finalAmount - freeBookDiscount;
      finalTotal = Math.max(0, finalTotal); // Ensure non-negative
      
      // 4. Create order
      // Generate unique order number
      const timestamp = Date.now().toString(36).toUpperCase();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const orderNumber = `ORD-${timestamp}-${random}`;
      
      const order = new Order({
        user: userId,
        orderNumber: orderNumber,
        items: orderItems,
        subtotal: cart.totalAmount, // Cart uses totalAmount, not subtotal
        discountCode: cart.discountCode,
        discountAmount: cart.discountAmount + freeBookDiscount, // Include free book discount
        totalAmount: finalTotal, // Use adjusted total with free book
        customerInfo: checkoutData.customerInfo,
        shippingAddress: checkoutData.shippingAddress,
        paymentMethod: checkoutData.paymentMethod,
        paymentStatus: checkoutData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed',
        status: 'pending',
        customerNotes: checkoutData.customerNotes || '',
      });
      
      await order.save();
      
      // 4.5. Mark free book reward as used (if applied)
      if (freeBookId) {
        try {
          await rewardService.useFreeBookReward(userId, order._id, freeBookId);
          console.log(`✅ Free book reward marked as used for order ${order.orderNumber}`);
        } catch (error) {
          console.error('Error marking free book reward as used:', error);
          // Order is already created, so we don't fail here
        }
      }
      
      // 4.7. Create Rental documents for rental items
      for (const item of orderItems) {
        if (item.type === 'rental') {
          const startDate = item.rentalStartDate ? new Date(item.rentalStartDate) : new Date();
          const dueDate = item.rentalEndDate
            ? new Date(item.rentalEndDate)
            : new Date(startDate.getTime() + (item.rentalDuration || 1) * 24 * 60 * 60 * 1000);

          const rental = new Rental({
            user: userId,
            book: item.book,
            startDate,
            dueDate,
            rentalDuration: item.rentalDuration || 1,
            pricePerDay: item.pricePerUnit,
            totalRentalAmount: item.subtotal,
            status: 'active',
            paymentMethod: checkoutData.paymentMethod || 'cash_on_delivery',
            isPaid: checkoutData.paymentMethod !== 'cash_on_delivery',
          });
          await rental.save();
          console.log(`✅ Rental document created: ${rental.rentalNumber} for book ${item.book}`);
        }
      }

      // 5. Update book stock
      for (const item of cart.items) {
        if (item.type === 'purchase') {
          await Book.findByIdAndUpdate(item.bookId._id, {
            $inc: { 'stock.available': -item.quantity },
          });
        } else if (item.type === 'rental') {
          await Book.findByIdAndUpdate(item.bookId._id, {
            $inc: { 'stock.available': -1 },
          });
        }
      }
      
      // 6. Clear cart
      cart.items = [];
      cart.totalQuantity = 0;
      cart.subtotal = 0;
      cart.discountCode = '';
      cart.discountAmount = 0;
      cart.totalAmount = 0;
      await cart.save();
      
      // 7. Send notification
      await notificationService.createNotification({
        userId: userId,
        type: 'order_placed',
        title: 'Order Placed Successfully',
        message: `Your order #${order.orderNumber} has been placed successfully. Total: Rs. ${order.totalAmount.toFixed(2)}`,
        link: `/orders`,
        priority: 'high',
        metadata: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
        },
      });
      
      // 7.5 Send order placed email — never blocks the order flow
      try {
        const populatedForEmail = await Order.findById(order._id).populate('user', 'fullName email');
        if (populatedForEmail?.user?.email) {
          const emailItems = orderItems.map(item => ({
            title:           item.bookSnapshot?.title  || 'Book',
            author:          item.bookSnapshot?.author || '',
            type:            item.type,
            quantity:        item.quantity,
            rentalDuration:  item.rentalDuration,
            rentalStartDate: item.rentalStartDate,
            rentalEndDate:   item.rentalEndDate,
            subtotal:        item.subtotal,
          }));
          await emailService.sendOrderPlacedEmail(
            populatedForEmail.user.email,
            populatedForEmail.user.fullName,
            order.orderNumber,
            emailItems,
            order.totalAmount,
            order.paymentMethod,
            order.paymentStatus
          );
        }
      } catch (emailErr) {
        console.error('⚠️ Order placed email failed:', emailErr.message);
      }

      // 8. Award reward points for purchases and rentals
      try {
        let purchaseCount = 0;
        let rentalCount = 0;
        
        for (const item of orderItems) {
          if (item.type === 'purchase') {
            purchaseCount += item.quantity;
          } else if (item.type === 'rental') {
            rentalCount += 1;
          }
        }
        
        // Award points for purchases (10 points per book)
        if (purchaseCount > 0) {
          await rewardService.awardPointsForPurchase(userId, order._id, purchaseCount);
          console.log(`✅ Awarded ${purchaseCount * 10} points for ${purchaseCount} book purchase(s)`);
        }
        
        // Award points for rentals (5 points per book)
        if (rentalCount > 0) {
          await rewardService.awardPointsForRental(userId, order._id, rentalCount);
          console.log(`✅ Awarded ${rentalCount * 5} points for ${rentalCount} book rental(s)`);
        }
      } catch (rewardError) {
        // Log but don't fail the order if reward points fail
        console.error('Failed to award reward points:', rewardError);
      }
      
      return {
        success: true,
        order: await order.populate('user', 'fullName email'),
      };
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }
  
  /**
   * Validate cart before checkout
   */
  async validateCartForCheckout(cart) {
    for (const item of cart.items) {
      const book = item.bookId;
      
      // Check if book still exists
      if (!book) {
        return {
          valid: false,
          message: 'One or more books in your cart are no longer available',
        };
      }
      
      // Check stock for purchases
      if (item.type === 'purchase') {
        if (book.stock.available < item.quantity) {
          return {
            valid: false,
            message: `Insufficient stock for "${book.title}". Only ${book.stock.available} available.`,
          };
        }
      }
      
      // Validate rental availability
      if (item.type === 'rental') {
        if (book.stock.available < 1) {
          return {
            valid: false,
            message: `"${book.title}" is currently not available for rental.`,
          };
        }
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Get order by ID
   */
  async getOrderById(orderId, userId = null) {
    try {
      const query = { _id: orderId };
      if (userId) query.user = userId;
      
      const order = await Order.findOne(query)
        .populate('items.book', 'title author coverImage isbn')
        .populate('user', 'fullName email');
      
      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }
  
  /**
   * Get user's orders
   */
  async getUserOrders(userId, filters = {}) {
    try {
      const query = { user: userId };
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      const orders = await Order.find(query)
        .populate('items.book', 'title author coverImage')
        .sort({ orderDate: -1 })
        .limit(filters.limit || 50);
      
      return orders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }
  
  /**
   * Get all orders (admin)
   */
  async getAllOrders(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
      }
      
      const orders = await Order.find(query)
        .populate('user', 'fullName email')
        .populate('items.book', 'title author coverImage')
        .sort({ orderDate: -1 })
        .limit(filters.limit || 100);
      
      return orders;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }
  
  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, updateData = {}) {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      order.status = status;
      
      if (updateData.trackingNumber) {
        order.trackingNumber = updateData.trackingNumber;
      }
      
      if (status === 'shipped' && !order.shippedAt) {
        order.shippedAt = new Date();
      }
      
      if (status === 'delivered' && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }
      
      if (updateData.adminNotes) {
        order.adminNotes = updateData.adminNotes;
      }
      
      await order.save();
      console.log(`✅ Order ${order.orderNumber} status updated to: ${status}`);
      
      // Send notification to user — wrapped in try-catch so it NEVER blocks the status update
      try {
        let notificationMessage = '';
        switch (status) {
          case 'confirmed':
            notificationMessage = `Your order #${order.orderNumber} has been confirmed!`;
            break;
          case 'processing':
            notificationMessage = `Your order #${order.orderNumber} is being processed.`;
            break;
          case 'shipped':
            notificationMessage = `Your order #${order.orderNumber} has been shipped! Tracking: ${order.trackingNumber || 'N/A'}`;
            break;
          case 'delivered':
            notificationMessage = `Your order #${order.orderNumber} has been delivered. Enjoy your book!`;
            break;
          case 'cancelled':
            notificationMessage = `Your order #${order.orderNumber} has been cancelled.`;
            break;
          default:
            notificationMessage = `Your order #${order.orderNumber} status has been updated to: ${status}.`;
        }

        // order.user is an ObjectId (not populated here), so use it directly
        const notifyUserId = order.user;

        if (notifyUserId) {
          await notificationService.createNotification({
            userId: notifyUserId,
            type: status === 'cancelled' ? 'order_cancelled' : 'order_approved',
            title: 'Order Status Update',
            message: notificationMessage,
            actionUrl: `/orders`,
            priority: 'high',
            metadata: {
              orderId: order._id,
              orderNumber: order.orderNumber,
              status: status,
            },
          });
          console.log(`✅ Notification sent to user ${notifyUserId} for order ${order.orderNumber}`);
        } else {
          console.warn(`⚠️ Skipping notification — order ${order._id} has no user field`);
        }
      } catch (notifError) {
        // Notification failure should NEVER block order status update
        console.error(`⚠️ Notification failed for order ${order._id} (status still updated):`, notifError.message);
      }

      // Send combined order update email — failure is never propagated
      try {
        const populatedOrder = await Order.findById(order._id).populate('user', 'fullName email');
        if (populatedOrder?.user?.email) {
          await emailService.sendOrderUpdateEmail(
            populatedOrder.user.email,
            populatedOrder.user.fullName,
            order.orderNumber,
            status,                    // new order status
            order.paymentStatus,       // current payment status (unchanged)
            order.totalAmount,
            order.paymentMethod,
            order.trackingNumber,
            'order'                    // trigger: order-status change
          );
        }
      } catch (emailErr) {
        console.error(`⚠️ Order update email failed for order ${order._id}:`, emailErr.message);
      }

      return order;
    } catch (error) {
      // Only throw real errors (not notification errors — those are caught above)
      console.error('Error updating order status:', error.message);
      throw new Error(error.message || 'Failed to update order status');
    }
  }
  
  /**
   * Cancel order
   */
  async cancelOrder(orderId, userId = null) {
    try {
      const query = { _id: orderId };
      if (userId) query.user = userId;
      
      const order = await Order.findOne(query).populate('items.bookId');
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      if (order.status === 'delivered' || order.status === 'cancelled') {
        throw new Error('Cannot cancel this order');
      }
      
      // Restore stock for purchased items
      for (const item of order.items) {
        if (item.type === 'purchase' && item.book) {
          await Book.findByIdAndUpdate(item.book._id, {
            $inc: { 'stock.available': item.quantity },
          });
        }
      }
      
      order.status = 'cancelled';
      await order.save();
      
      return order;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * Update payment status (admin only)
   */
  async updatePaymentStatus(orderId, paymentStatus) {
    try {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(paymentStatus)) {
        throw new Error(`Invalid payment status. Must be one of: ${validStatuses.join(', ')}`);
      }

      const order = await Order.findById(orderId).populate('user', 'fullName email');
      if (!order) {
        throw new Error('Order not found');
      }

      order.paymentStatus = paymentStatus;
      await order.save();
      console.log(`✅ Order ${order.orderNumber} payment status updated to: ${paymentStatus}`);

      // Send combined order update email — failure is never propagated
      try {
        if (order.user?.email) {
          await emailService.sendOrderUpdateEmail(
            order.user.email,
            order.user.fullName,
            order.orderNumber,
            order.status,              // current order status (unchanged)
            paymentStatus,             // new payment status
            order.totalAmount,
            order.paymentMethod,
            order.trackingNumber,
            'payment'                  // trigger: payment-status change
          );
        }
      } catch (emailErr) {
        console.error(`⚠️ Payment update email failed for order ${order._id}:`, emailErr.message);
      }

      // Send in-app notification — failure is never propagated
      try {
        await notificationService.createNotification({
          userId: order.user._id,
          type: 'order_approved',
          title: 'Payment Status Update',
          message: `Payment for order #${order.orderNumber} is now ${paymentStatus}.`,
          link: '/orders',
          priority: 'high',
          metadata: { orderId: order._id, orderNumber: order.orderNumber, paymentStatus },
        });
      } catch (notifErr) {
        console.error(`⚠️ Payment notification failed for order ${order._id}:`, notifErr.message);
      }

      return order;
    } catch (error) {
      console.error('Error updating payment status:', error.message);
      throw error;
    }
  }
}

module.exports = new CheckoutService();
