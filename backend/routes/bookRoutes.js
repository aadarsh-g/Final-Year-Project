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
  getBookStats
} = require('../controllers/bookController');

// All routes are now public - no authentication required
router.get('/', getAllBooks);
router.get('/:id', getBookById);
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);
router.patch('/:id/stock', updateBookStock);
router.patch('/:id/toggle-active', toggleBookActive);
router.get('/admin/stats', getBookStats);

module.exports = router;

