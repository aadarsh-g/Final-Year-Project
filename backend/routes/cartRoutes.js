const express = require('express');
const router = express.Router();
const {
  getCart,
  getCartCount,
  getCartSummary,
  addToCart,
  removeFromCart,
  updateQuantity,
  updateRentalDuration,
  clearCart,
  applyDiscount,
  removeDiscount,
  validateCart,
  checkout
} = require('../controllers/cartController');

// Cart routes
router.get('/', getCart);
router.get('/count', getCartCount);
router.get('/summary', getCartSummary);
router.get('/validate', validateCart);

router.post('/add', addToCart);
router.post('/checkout', checkout);
router.post('/discount', applyDiscount);

router.put('/update-quantity/:itemId', updateQuantity);
router.put('/update-duration/:itemId', updateRentalDuration);

router.delete('/remove/:itemId', removeFromCart);
router.delete('/clear', clearCart);
router.delete('/discount', removeDiscount);

module.exports = router;
