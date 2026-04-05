const CartService = require('../services/cartService');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const cart = await CartService.getCart(userId);

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

// @desc    Get cart item count
// @route   GET /api/cart/count
// @access  Private
exports.getCartCount = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const count = await CartService.getCartCount(userId);

    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart count',
      error: error.message
    });
  }
};

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
exports.getCartSummary = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const summary = await CartService.getCartSummary(userId);

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart summary',
      error: error.message
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { bookId, type, quantity, rentStartDate, rentEndDate } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!bookId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Book ID and type are required'
      });
    }

    if (!['purchase', 'rental'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "purchase" or "rental"'
      });
    }

    // Validate rental dates
    if (type === 'rental') {
      if (!rentStartDate || !rentEndDate) {
        return res.status(400).json({
          success: false,
          message: 'Rental start and end dates are required'
        });
      }

      const start = new Date(rentStartDate);
      const end = new Date(rentEndDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Reset to start of day

      // Validate start date is not in the past
      if (start < now) {
        return res.status(400).json({
          success: false,
          message: 'Start date cannot be in the past'
        });
      }

      // Validate end date is after start date
      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: 'Return date must be after start date'
        });
      }

      // Calculate rental duration
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Validate minimum rental period
      if (diffDays < 1) {
        return res.status(400).json({
          success: false,
          message: 'Minimum rental period is 1 day'
        });
      }
    }

    const cart = await CartService.addToCart(userId, {
      bookId,
      type,
      quantity,
      rentStartDate,
      rentEndDate
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add item to cart',
      error: error.message
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { itemId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const cart = await CartService.removeFromCart(userId, itemId);

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove item from cart',
      error: error.message
    });
  }
};

// @desc    Update item quantity
// @route   PUT /api/cart/update-quantity/:itemId
// @access  Private
exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const cart = await CartService.updateQuantity(userId, itemId, quantity);

    res.status(200).json({
      success: true,
      message: 'Quantity updated',
      cart
    });
  } catch (error) {
    console.error('Update quantity error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update quantity',
      error: error.message
    });
  }
};

// @desc    Update rental duration
// @route   PUT /api/cart/update-duration/:itemId
// @access  Private
exports.updateRentalDuration = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { itemId } = req.params;
    const { rentStartDate, rentEndDate } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!rentStartDate || !rentEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Rental start and end dates are required'
      });
    }

    const start = new Date(rentStartDate);
    const end = new Date(rentEndDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Validate start date
    if (start < now) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    // Validate end date
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be after start date'
      });
    }

    // Calculate duration
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      return res.status(400).json({
        success: false,
        message: 'Minimum rental period is 1 day'
      });
    }

    const cart = await CartService.updateRentalDates(userId, itemId, rentStartDate, rentEndDate);

    res.status(200).json({
      success: true,
      message: 'Rental dates updated',
      cart
    });
  } catch (error) {
    console.error('Update rental dates error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update rental dates',
      error: error.message
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const cart = await CartService.clearCart(userId);

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to clear cart',
      error: error.message
    });
  }
};

// @desc    Apply discount code
// @route   POST /api/cart/discount
// @access  Private
exports.applyDiscount = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const { code } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Discount code is required'
      });
    }

    const cart = await CartService.applyDiscount(userId, code);

    res.status(200).json({
      success: true,
      message: 'Discount applied',
      cart
    });
  } catch (error) {
    console.error('Apply discount error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to apply discount',
      error: error.message
    });
  }
};

// @desc    Remove discount
// @route   DELETE /api/cart/discount
// @access  Private
exports.removeDiscount = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const cart = await CartService.removeDiscount(userId);

    res.status(200).json({
      success: true,
      message: 'Discount removed',
      cart
    });
  } catch (error) {
    console.error('Remove discount error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove discount',
      error: error.message
    });
  }
};

// @desc    Validate cart
// @route   GET /api/cart/validate
// @access  Private
exports.validateCart = async (req, res) => {
  try {
    const userId = req.user?._id || req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const validation = await CartService.validateCart(userId);

    res.status(200).json({
      success: true,
      ...validation
    });
  } catch (error) {
    console.error('Validate cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate cart',
      error: error.message
    });
  }
};

// @desc    Checkout cart
// @route   POST /api/cart/checkout
// @access  Private
exports.checkout = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.userId;
    const checkoutData = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await CartService.checkout(userId, checkoutData);

    res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      ...result
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process checkout',
      error: error.message
    });
  }
};
