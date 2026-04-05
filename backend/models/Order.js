const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  type: {
    type: String,
    enum: ['purchase', 'rental'],
    required: true,
  },
  quantity: {
    type: Number,
    required: function() { return this.type === 'purchase'; },
    default: 1,
    min: 1,
  },
  rentalDuration: {
    type: Number,
    required: function() { return this.type === 'rental'; },
    min: 1,
    max: 90,
  },
  rentalStartDate: {
    type: Date,
    required: function() { return this.type === 'rental'; },
  },
  rentalEndDate: {
    type: Date,
    required: function() { return this.type === 'rental'; },
  },
  pricePerUnit: {
    type: Number,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  // Snapshot of book details at time of order
  bookSnapshot: {
    title: String,
    author: String,
    coverImage: String,
    isbn: String,
  },
}, { _id: true });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  items: [orderItemSchema],
  
  // Pricing
  subtotal: {
    type: Number,
    required: true,
  },
  discountCode: {
    type: String,
    trim: true,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  
  // Customer Information
  customerInfo: {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  
  // Shipping Address
  shippingAddress: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      default: 'USA',
    },
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'khalti'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  // Khalti-specific fields
  khaltiPidx: {
    type: String,
  },
  khaltiTransactionId: {
    type: String,
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true,
  },
  
  // Fulfillment
  trackingNumber: {
    type: String,
  },
  shippedAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  
  // Timestamps
  orderDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  // Notes
  customerNotes: {
    type: String,
    maxlength: 500,
  },
  adminNotes: {
    type: String,
    maxlength: 1000,
  },
}, {
  timestamps: true,
});

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Index for faster queries
orderSchema.index({ user: 1, orderDate: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1, orderDate: -1 });

module.exports = mongoose.model('Order', orderSchema);
