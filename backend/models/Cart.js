const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  // Book reference
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },

  // Item type: purchase or rental
  type: {
    type: String,
    enum: ['purchase', 'rental'],
    required: true
  },

  // Quantity (for purchases only, rentals are always 1)
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },

  // Rental specific fields
  rentalDuration: {
    type: Number, // in days (calculated from dates)
    min: 1,
    max: 90,
    required: function() {
      return this.type === 'rental';
    }
  },

  rentStartDate: {
    type: Date,
    required: function() {
      return this.type === 'rental';
    }
  },

  rentEndDate: {
    type: Date,
    required: function() {
      return this.type === 'rental';
    }
  },

  // Price at time of adding to cart (snapshot)
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },

  // Calculated subtotal
  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

const cartSchema = new mongoose.Schema(
  {
    // User who owns this cart
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },

    // Cart items
    items: [cartItemSchema],

    // Cart totals
    totalItems: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    // Discount/coupon (future feature)
    discountCode: {
      type: String,
      default: null
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    // Final amount after discount
    finalAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    // Cart status
    status: {
      type: String,
      enum: ['active', 'checked_out', 'abandoned'],
      default: 'active'
    },

    // Last activity timestamp
    lastActivity: {
      type: Date,
      default: Date.now
    },

    // Expiry date (for abandoned cart cleanup)
    expiresAt: {
      type: Date,
      default: function() {
        // Cart expires after 30 days of inactivity
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes
cartSchema.index({ userId: 1, status: 1 });
cartSchema.index({ lastActivity: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for purchase items count
cartSchema.virtual('purchaseItemsCount').get(function() {
  return this.items.filter(item => item.type === 'purchase').length;
});

// Virtual for rental items count
cartSchema.virtual('rentalItemsCount').get(function() {
  return this.items.filter(item => item.type === 'rental').length;
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  // Calculate total items
  this.totalItems = this.items.reduce((sum, item) => {
    return sum + (item.type === 'purchase' ? item.quantity : 1);
  }, 0);

  // Calculate total amount
  this.totalAmount = this.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Calculate final amount (after discount)
  this.finalAmount = this.totalAmount - this.discountAmount;

  // Update last activity
  this.lastActivity = new Date();

  // Extend expiry
  this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  next();
});

// Method to add item to cart
cartSchema.methods.addItem = async function(itemData) {
  const { bookId, type, quantity, rentStartDate, rentEndDate, pricePerUnit } = itemData;

  // Check if item already exists
  const existingItemIndex = this.items.findIndex(
    item => item.bookId.toString() === bookId.toString() && item.type === type
  );

  if (existingItemIndex > -1) {
    // Update existing item
    const existingItem = this.items[existingItemIndex];
    
    if (type === 'purchase') {
      // Increase quantity for purchases
      existingItem.quantity += quantity || 1;
      existingItem.subtotal = existingItem.quantity * existingItem.pricePerUnit;
    } else {
      // For rentals, update dates and recalculate duration
      if (rentStartDate && rentEndDate) {
        existingItem.rentStartDate = new Date(rentStartDate);
        existingItem.rentEndDate = new Date(rentEndDate);
        
        // Calculate duration in days
        const start = new Date(rentStartDate);
        const end = new Date(rentEndDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        existingItem.rentalDuration = diffDays;
        
        // Recalculate rental subtotal (Rs. 50 per day)
        existingItem.subtotal = 50 * diffDays;
      }
    }
  } else {
    // Add new item
    let subtotal;
    let rentalDuration;
    
    if (type === 'rental') {
      // Calculate rental duration from dates
      const start = new Date(rentStartDate);
      const end = new Date(rentEndDate);
      const diffTime = Math.abs(end - start);
      rentalDuration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Rs. 50 per day
      subtotal = 50 * rentalDuration;
    } else {
      subtotal = pricePerUnit * quantity;
    }

    this.items.push({
      bookId,
      type,
      quantity: quantity || 1,
      rentalDuration,
      rentStartDate: rentStartDate ? new Date(rentStartDate) : undefined,
      rentEndDate: rentEndDate ? new Date(rentEndDate) : undefined,
      pricePerUnit: type === 'rental' ? 50 : pricePerUnit,
      subtotal
    });
  }

  return await this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  return await this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(itemId, quantity) {
  const item = this.items.id(itemId);
  
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (item.type !== 'purchase') {
    throw new Error('Cannot update quantity for rental items');
  }

  item.quantity = quantity;
  item.subtotal = item.quantity * item.pricePerUnit;

  return await this.save();
};

// Method to update rental duration
cartSchema.methods.updateRentalDates = async function(itemId, rentStartDate, rentEndDate) {
  const item = this.items.id(itemId);
  
  if (!item) {
    throw new Error('Item not found in cart');
  }

  if (item.type !== 'rental') {
    throw new Error('Cannot update rental dates for purchase items');
  }

  // Validate dates
  const start = new Date(rentStartDate);
  const end = new Date(rentEndDate);
  
  if (start >= end) {
    throw new Error('Return date must be after start date');
  }
  
  if (start < new Date()) {
    throw new Error('Start date cannot be in the past');
  }

  // Calculate duration
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 1) {
    throw new Error('Minimum rental period is 1 day');
  }

  item.rentStartDate = start;
  item.rentEndDate = end;
  item.rentalDuration = diffDays;
  item.subtotal = 50 * diffDays; // Rs. 50 per day

  return await this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.discountCode = null;
  this.discountAmount = 0;
  return await this.save();
};

// Method to apply discount
cartSchema.methods.applyDiscount = async function(code, amount) {
  this.discountCode = code;
  this.discountAmount = amount;
  return await this.save();
};

// Static method to get or create cart for user
cartSchema.statics.getOrCreateCart = async function(userId) {
  let cart = await this.findOne({ userId, status: 'active' });
  
  if (!cart) {
    cart = await this.create({ userId });
  }
  
  return cart;
};

// Static method to cleanup abandoned carts
cartSchema.statics.cleanupAbandonedCarts = async function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return await this.updateMany(
    {
      status: 'active',
      lastActivity: { $lt: cutoffDate }
    },
    {
      status: 'abandoned'
    }
  );
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
