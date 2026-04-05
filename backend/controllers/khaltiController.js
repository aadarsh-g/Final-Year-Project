const khaltiService = require('../services/khaltiService');
const checkoutService = require('../services/checkoutService');
const Order = require('../models/Order');
const Rental = require('../models/Rental');
const Cart = require('../models/Cart');
const notificationService = require('../services/notificationService');

/**
 * Initiate a Khalti payment for a checkout order.
 * Creates the order in 'pending' state, then redirects the user to Khalti.
 */
exports.initiateCheckout = async (req, res) => {
  try {
    const { userId, customerInfo, shippingAddress, customerNotes, freeBookReward } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    if (!customerInfo || !customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({ success: false, message: 'Customer information is incomplete' });
    }
    if (!shippingAddress || !shippingAddress.city) {
      return res.status(400).json({ success: false, message: 'City is required' });
    }

    // Build the full checkout data (khalti as payment method, mark pending)
    const checkoutData = {
      customerInfo,
      shippingAddress: {
        street: shippingAddress.street || 'N/A',
        city: shippingAddress.city,
        state: shippingAddress.state || 'N/A',
        zipCode: shippingAddress.zipCode || '00000',
        country: shippingAddress.country || 'Nepal',
      },
      paymentMethod: 'khalti',
      customerNotes: customerNotes || '',
      freeBookReward: freeBookReward || null,
    };

    // Create the order (stock reserved, cart cleared)
    const result = await checkoutService.checkout(userId, checkoutData);
    const order = result.order;

    // Minimum amount check — Khalti requires at least Rs. 10
    const amountNPR = order.totalAmount < 10 ? 10 : order.totalAmount;

    // Build product details for Khalti
    const productDetails = order.items.map(item => ({
      identity: item.book.toString(),
      name: item.bookSnapshot?.title || 'Book',
      total_price: Math.round(item.subtotal * 100),
      quantity: item.quantity || 1,
      unit_price: Math.round(item.pricePerUnit * 100),
    }));

    // Initiate Khalti payment
    const khaltiResponse = await khaltiService.initiatePayment({
      purchaseOrderId: order.orderNumber,
      purchaseOrderName: `Bookify Order ${order.orderNumber}`,
      amountNPR,
      customerInfo: {
        name: customerInfo.fullName,
        email: customerInfo.email,
        phone: customerInfo.phone,
      },
      returnPath: '/khalti/verify',
      productDetails,
    });

    // Save pidx on the order for later verification
    await Order.findByIdAndUpdate(order._id, { khaltiPidx: khaltiResponse.pidx });

    res.status(200).json({
      success: true,
      paymentUrl: khaltiResponse.payment_url,
      pidx: khaltiResponse.pidx,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Khalti initiate checkout error:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      message: error.response?.data?.detail || error.message || 'Failed to initiate Khalti payment',
    });
  }
};

/**
 * Verify a Khalti checkout payment after the user returns from the payment portal.
 * Called by the frontend with pidx query param.
 */
exports.verifyCheckoutPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ success: false, message: 'pidx is required' });
    }

    // Lookup with Khalti
    const lookup = await khaltiService.lookupPayment(pidx);

    // Find the corresponding order
    const order = await Order.findOne({ khaltiPidx: pidx });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for this payment' });
    }

    if (khaltiService.isPaymentSuccessful(lookup.status)) {
      order.paymentStatus = 'completed';
      order.khaltiTransactionId = lookup.transaction_id;
      await order.save();

      // Notify user
      try {
        await notificationService.createNotification({
          userId: order.user,
          type: 'order_approved',
          title: 'Payment Successful',
          message: `Your Khalti payment for order #${order.orderNumber} was successful!`,
          link: '/orders',
          priority: 'high',
          metadata: { orderId: order._id, orderNumber: order.orderNumber },
        });
      } catch (notifErr) {
        console.error('Notification error after Khalti verification:', notifErr.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        status: lookup.status,
        transactionId: lookup.transaction_id,
        orderNumber: order.orderNumber,
        orderId: order._id,
      });
    }

    // Non-completed statuses — mark order payment as failed
    order.paymentStatus = 'failed';
    await order.save();

    return res.status(200).json({
      success: false,
      message: `Payment ${lookup.status.toLowerCase()}`,
      status: lookup.status,
      orderNumber: order.orderNumber,
      orderId: order._id,
    });
  } catch (error) {
    console.error('Khalti verify checkout error:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      message: error.response?.data?.detail || error.message || 'Failed to verify payment',
    });
  }
};

/**
 * Initiate a Khalti payment for a rental fine.
 */
exports.initiateFinePayment = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const userId = req.user._id;

    const rental = await Rental.findOne({ _id: rentalId, user: userId }).populate('book', 'title');
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    if (rental.fineStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'No pending fine for this rental' });
    }

    const amountNPR = rental.fineAmount < 10 ? 10 : rental.fineAmount;
    const purchaseOrderId = `FINE-${rental.rentalNumber}-${Date.now()}`;

    const khaltiResponse = await khaltiService.initiatePayment({
      purchaseOrderId,
      purchaseOrderName: `Fine for ${rental.book?.title || 'Rental'} (${rental.rentalNumber})`,
      amountNPR,
      customerInfo: {
        name: req.user.fullName || 'Customer',
        email: req.user.email,
        phone: req.user.phone || '9800000000',
      },
      returnPath: '/khalti/verify-fine',
    });

    // Store the pidx on the rental for later verification
    rental.khaltiPidx = khaltiResponse.pidx;
    rental.khaltiPurchaseOrderId = purchaseOrderId;
    await rental.save();

    res.status(200).json({
      success: true,
      paymentUrl: khaltiResponse.payment_url,
      pidx: khaltiResponse.pidx,
      rentalId: rental._id,
      fineAmount: rental.fineAmount,
    });
  } catch (error) {
    console.error('Khalti initiate fine error:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      message: error.response?.data?.detail || error.message || 'Failed to initiate fine payment',
    });
  }
};

/**
 * Verify a Khalti fine payment after user returns from the payment portal.
 */
exports.verifyFinePayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ success: false, message: 'pidx is required' });
    }

    const lookup = await khaltiService.lookupPayment(pidx);
    const rental = await Rental.findOne({ khaltiPidx: pidx });

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found for this payment' });
    }

    if (khaltiService.isPaymentSuccessful(lookup.status)) {
      rental.fineStatus = 'paid';
      rental.finePaidDate = new Date();
      rental.paymentMethod = 'khalti';
      await rental.save();

      // Notify user
      try {
        await notificationService.createNotification({
          userId: rental.user,
          type: 'order_approved',
          title: 'Fine Paid Successfully',
          message: `Your late fee of Rs. ${rental.fineAmount} for rental ${rental.rentalNumber} has been paid via Khalti.`,
          link: '/fines',
          priority: 'high',
        });
      } catch (notifErr) {
        console.error('Notification error after fine verification:', notifErr.message);
      }

      return res.status(200).json({
        success: true,
        message: 'Fine payment verified successfully',
        status: lookup.status,
        transactionId: lookup.transaction_id,
        rentalNumber: rental.rentalNumber,
        fineAmount: rental.fineAmount,
      });
    }

    return res.status(200).json({
      success: false,
      message: `Payment ${lookup.status.toLowerCase()}`,
      status: lookup.status,
      rentalNumber: rental.rentalNumber,
    });
  } catch (error) {
    console.error('Khalti verify fine error:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      message: error.response?.data?.detail || error.message || 'Failed to verify fine payment',
    });
  }
};
