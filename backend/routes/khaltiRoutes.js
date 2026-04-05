const express = require('express');
const router = express.Router();
const khaltiController = require('../controllers/khaltiController');
const { protect } = require('../middleware/auth');

// Initiate Khalti payment for checkout (creates order, returns payment_url)
router.post('/initiate-checkout', protect, khaltiController.initiateCheckout);

// Verify Khalti payment after user returns from payment portal
router.post('/verify-checkout', protect, khaltiController.verifyCheckoutPayment);

// Initiate Khalti payment for a rental fine
router.post('/initiate-fine/:rentalId', protect, khaltiController.initiateFinePayment);

// Verify Khalti payment for a fine
router.post('/verify-fine', protect, khaltiController.verifyFinePayment);

module.exports = router;
