const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  updateBookStock,
  toggleBookActive,
  getBookStats,
  getReviews,
  addReview,
  updateReview,
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAllBooks);
router.get('/admin/stats', getBookStats);
router.get('/:id', getBookById);

// Admin book management
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);
router.patch('/:id/stock', updateBookStock);
router.patch('/:id/toggle-active', toggleBookActive);

// Review routes
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', protect, addReview);
router.put('/:id/reviews/:reviewId', protect, updateReview);

module.exports = router;

