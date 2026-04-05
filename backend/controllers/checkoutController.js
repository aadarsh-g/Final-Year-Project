const checkoutService = require('../services/checkoutService');

// Process checkout
exports.checkout = async (req, res) => {
  try {
    const { userId, customerInfo, shippingAddress, paymentMethod, customerNotes } = req.body;
    
    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
    }
    
    if (!customerInfo || !customerInfo.fullName || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer information is incomplete',
      });
    }
    
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
        !shippingAddress.state || !shippingAddress.zipCode) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is incomplete',
      });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required',
      });
    }
    
    const checkoutData = {
      customerInfo,
      shippingAddress,
      paymentMethod,
      customerNotes,
    };
    
    const result = await checkoutService.checkout(userId, checkoutData);
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: result.order,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to process checkout',
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.query;
    
    const order = await checkoutService.getOrderById(orderId, userId || null);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    // Use the authenticated user's ID from the JWT (set by the protect middleware)
    const userId = req.user._id;

    const filters = {
      status: req.query.status,
      limit: parseInt(req.query.limit) || 50,
    };

    const orders = await checkoutService.getUserOrders(userId, filters);

    res.status(200).json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      paymentStatus: req.query.paymentStatus,
      limit: parseInt(req.query.limit) || 100,
    };
    
    const orders = await checkoutService.getAllOrders(filters);
    
    res.status(200).json({
      success: true,
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const updateData = { trackingNumber, adminNotes };

    // updateOrderStatus handles notification internally — any notification
    // failure is caught inside the service and logged; it never throws here.
    const order = await checkoutService.updateOrderStatus(orderId, status, updateData);

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    // Only order-not-found or DB errors reach here — notifications are
    // handled inside the service and will never cause a 500 here.
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update order status',
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    // Use authenticated user's ID from JWT — never trust req.body for ownership
    const userId = req.user._id;

    const order = await checkoutService.cancelOrder(orderId, userId);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to cancel order',
    });
  }
};

// Update payment status (admin only)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({ success: false, message: 'Payment status is required' });
    }

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await checkoutService.updatePaymentStatus(orderId, paymentStatus);

    return res.status(200).json({
      success: true,
      message: `Payment status updated to "${paymentStatus}"`,
      order,
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update payment status',
    });
  }
};
