const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/', wishlistController.getWishlist);
router.get('/count', wishlistController.getWishlistCount);
router.post('/add', wishlistController.addToWishlist);
router.delete('/remove/:bookId', wishlistController.removeFromWishlist);
router.delete('/clear', wishlistController.clearWishlist);
router.get('/check/:bookId', wishlistController.checkWishlist);

module.exports = router;
