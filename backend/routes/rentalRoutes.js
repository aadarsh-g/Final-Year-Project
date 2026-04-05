const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { protect, authorize } = require('../middleware/auth');

// User routes
router.post('/', protect, rentalController.createRental);
router.get('/my-rentals', protect, rentalController.getUserRentals);
router.get('/overdue', protect, rentalController.getOverdueRentals);
router.patch('/:id/return', protect, rentalController.returnRental);
router.post('/:id/pay-fine', protect, rentalController.payFine);

// Admin routes
router.get('/all', protect, authorize('admin'), rentalController.getAllRentals);
router.get('/pending-fines', protect, authorize('admin'), rentalController.getAllPendingFines);
router.get('/:id', protect, rentalController.getRentalDetails);

module.exports = router;
