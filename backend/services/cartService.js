const Cart = require('../models/Cart');
const Book = require('../models/Book');
const NotificationService = require('./notificationService');

class CartService {
  /**
   * Get user's cart (or create if doesn't exist)
   */
  static async getCart(userId) {
    try {
      const cart = await Cart.getOrCreateCart(userId);
      await cart.populate('items.bookId', 'title author coverImage stock price');
      
      return cart;
    } catch (error) {
      console.error('Error getting cart:', error);
      throw error;
    }
  }

  /**
   * Add item to cart
   */
  static async addToCart(userId, itemData) {
    try {
      const { bookId, type, quantity, rentStartDate, rentEndDate } = itemData;

      // Validate book exists and is active
      const book = await Book.findById(bookId);
      if (!book) {
        throw new Error('Book not found');
      }

      if (!book.isActive) {
        throw new Error('Book is not available');
      }

      // Check stock availability
      if (type === 'purchase') {
        if (book.stock.available < (quantity || 1)) {
          throw new Error('Insufficient stock');
        }
      } else {
        // For rentals, check if book is available for rent
        if (book.stock.available < 1) {
          throw new Error('Book not available for rental');
        }
      }

      // Get or create cart
      const cart = await Cart.getOrCreateCart(userId);

      // Determine price
      const pricePerUnit = type === 'rental' 
        ? 50 // Rs. 50 per day fixed
        : book.price.purchase;

      // Add item to cart
      await cart.addItem({
        bookId,
        type,
        quantity: quantity || 1,
        rentStartDate,
        rentEndDate,
        pricePerUnit
      });

      // Populate book details
      await cart.populate('items.bookId', 'title author coverImage stock price');

      return cart;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(userId, itemId) {
    try {
      const cart = await Cart.findOne({ userId, status: 'active' });
      
      if (!cart) {
        throw new Error('Cart not found');
      }

      await cart.removeItem(itemId);
      await cart.populate('items.bookId', 'title author coverImage stock price');

      return cart;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  /**
   * Update item quantity (for purchases)
   */
  static async updateQuantity(userId, itemId, quantity) {
    try {
      const cart = await Cart.findOne({ userId, status: 'active' });
      
      if (!cart) {
        throw new Error('Cart not found');
      }

      const item = cart.items.id(itemId);
      if (!item) {
        throw new Error('Item not found in cart');
      }

      // Validate stock availability
      const book = await Book.findById(item.bookId);
      if (book.stock.available < quantity) {
        throw new Error('Insufficient stock');
      }

      await cart.updateItemQuantity(itemId, quantity);
      await cart.populate('items.bookId', 'title author coverImage stock price');

      return cart;
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }

  /**
   * Update rental duration/dates
   */
  static async updateRentalDates(userId, itemId, rentStartDate, rentEndDate) {
    try {
      const cart = await Cart.findOne({ userId, status: 'active' });
      
      if (!cart) {
        throw new Error('Cart not found');
      }

      await cart.updateRentalDates(itemId, rentStartDate, rentEndDate);
      await cart.populate('items.bookId', 'title author coverImage stock price');

      return cart;
    } catch (error) {
      console.error('Error updating rental dates:', error);
      throw error;
    }
  }

  // Legacy method for backward compatibility
  static async updateRentalDuration(userId, itemId, duration) {
    return this.updateRentalDates(userId, itemId, duration);
  }

  /**
   * Clear entire cart
   */
  static async clearCart(userId) {
    try {
      const cart = await Cart.findOne({ userId, status: 'active' });
      
      if (!cart) {
        throw new Error('Cart not found');
      }

      await cart.clearCart();
      
      return cart;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  /**
   * Apply discount code
   */
  static async applyDiscount(userId, discountCode) {
    try {
      const cart = await Cart.findOne({ userId, status: 'active' });
      
      if (!cart) {
        throw new Error('Cart not found');
      }

      // TODO: Implement discount code validation
      // For now, just apply a flat discount
      let discountAmount = 0;
      
      if (discountCode === 'SAVE10') {
        discountAmount = cart.totalAmount * 0.1; // 10% off
      } else if (discountCode === 'SAVE20') {
        discountAmount = cart.totalAmount * 0.2; // 20% off
      } else {
        throw new Error('Invalid discount code');
      }

      await cart.applyDiscount(discountCode, discountAmount);
      await cart.populate('items.bookId', 'title author coverImage stock price');

      return cart;
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  }

  /**
   * Remove discount
   */
  static async removeDiscount(userId) {
    try {
      const cart = await Cart.findOne({ userId, status: 'active' });
      
      if (!cart) {
        throw new Error('Cart not found');
      }

      await cart.applyDiscount(null, 0);
      await cart.populate('items.bookId', 'title author coverImage stock price');

      return cart;
    } catch (error) {
      console.error('Error removing discount:', error);
      throw error;
    }
  }

  /**
   * Get cart item count
   */
  static async getCartCount(userId) {
    try {
      const cart = await Cart.findOne({ userId, status: 'active' });
      
      if (!cart) {
        return 0;
      }

      return cart.totalItems;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }

  /**
   * Checkout cart (process order)
   */
  static async checkout(userId, checkoutData) {
    try {
      const cart = await Cart.findOne({ userId, status: 'active' });
      
      if (!cart) {
        throw new Error('Cart is empty');
      }

      if (cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      await cart.populate('items.bookId');

      // Validate stock for all items
      for (const item of cart.items) {
        const book = await Book.findById(item.bookId._id);
        
        if (!book.isActive) {
          throw new Error(`${book.title} is no longer available`);
        }

        if (item.type === 'purchase' && book.stock.available < item.quantity) {
          throw new Error(`Insufficient stock for ${book.title}`);
        }

        if (item.type === 'rental' && book.stock.available < 1) {
          throw new Error(`${book.title} is not available for rental`);
        }
      }

      // Update book stock
      for (const item of cart.items) {
        const book = await Book.findById(item.bookId._id);
        
        if (item.type === 'purchase') {
          book.stock.available -= item.quantity;
          book.stock.sold += item.quantity;
        } else {
          book.stock.available -= 1;
          book.stock.rented += 1;
        }
        
        await book.save();
      }

      // Create order/rental records (you'll need to implement Order and Rental models)
      // For now, we'll just mark the cart as checked out

      // Mark cart as checked out
      cart.status = 'checked_out';
      await cart.save();

      // Send notifications
      await NotificationService.notifyOrderPlaced(userId, {
        orderId: cart._id,
        bookTitle: cart.items[0].bookId.title,
        totalAmount: cart.finalAmount
      });

      // Create a new active cart for the user
      await Cart.create({ userId });

      return {
        success: true,
        orderId: cart._id,
        totalAmount: cart.finalAmount,
        items: cart.items
      };
    } catch (error) {
      console.error('Error during checkout:', error);
      throw error;
    }
  }

  /**
   * Validate cart items (check stock, prices, availability)
   */
  static async validateCart(userId) {
    try {
      const cart = await Cart.findOne({ userId, status: 'active' });
      
      if (!cart) {
        return { valid: true, issues: [] };
      }

      await cart.populate('items.bookId');

      const issues = [];

      for (const item of cart.items) {
        const book = item.bookId;

        // Check if book still exists and is active
        if (!book || !book.isActive) {
          issues.push({
            itemId: item._id,
            issue: 'Book no longer available',
            action: 'remove'
          });
          continue;
        }

        // Check stock
        if (item.type === 'purchase' && book.stock.available < item.quantity) {
          issues.push({
            itemId: item._id,
            issue: `Only ${book.stock.available} available`,
            action: 'update_quantity',
            maxQuantity: book.stock.available
          });
        }

        if (item.type === 'rental' && book.stock.available < 1) {
          issues.push({
            itemId: item._id,
            issue: 'Not available for rental',
            action: 'remove'
          });
        }

        // Check if price changed
        const currentPrice = item.type === 'rental' 
          ? book.price.rental.perDay 
          : book.price.purchase;

        if (item.pricePerUnit !== currentPrice) {
          issues.push({
            itemId: item._id,
            issue: `Price changed from $${item.pricePerUnit} to $${currentPrice}`,
            action: 'update_price',
            newPrice: currentPrice
          });
        }
      }

      return {
        valid: issues.length === 0,
        issues
      };
    } catch (error) {
      console.error('Error validating cart:', error);
      throw error;
    }
  }

  /**
   * Get cart summary
   */
  static async getCartSummary(userId) {
    try {
      const cart = await Cart.findOne({ userId, status: 'active' });
      
      if (!cart) {
        return {
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          total: 0,
          purchaseItems: 0,
          rentalItems: 0
        };
      }

      return {
        itemCount: cart.totalItems,
        subtotal: cart.totalAmount,
        discount: cart.discountAmount,
        total: cart.finalAmount,
        purchaseItems: cart.items.filter(i => i.type === 'purchase').length,
        rentalItems: cart.items.filter(i => i.type === 'rental').length,
        discountCode: cart.discountCode
      };
    } catch (error) {
      console.error('Error getting cart summary:', error);
      throw error;
    }
  }
}

module.exports = CartService;
