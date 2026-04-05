const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { protect, authorize } = require('../middleware/auth');

// Checkout routes
router.post('/checkout', protect, checkoutController.checkout);
router.get('/order/:orderId', protect, checkoutController.getOrderById);
router.get('/orders', protect, checkoutController.getUserOrders);
router.get('/orders/all', protect, authorize('admin'), checkoutController.getAllOrders); // Admin only
router.put('/order/:orderId/status', protect, authorize('admin'), checkoutController.updateOrderStatus); // Admin only
router.put('/order/:orderId/payment-status', protect, authorize('admin'), checkoutController.updatePaymentStatus); // Admin only
router.put('/order/:orderId/cancel', protect, checkoutController.cancelOrder);

module.exports = router;
