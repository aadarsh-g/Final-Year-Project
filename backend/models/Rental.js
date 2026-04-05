const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  rentalNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  // Rental Details
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  rentalDuration: {
    type: Number, // in days
    required: true,
  },
  // Pricing
  pricePerDay: {
    type: Number,
    required: true,
  },
  totalRentalAmount: {
    type: Number,
    required: true,
  },
  // Fine Details
  fineAmount: {
    type: Number,
    default: 0,
  },
  finePerDay: {
    type: Number,
    default: 100, // Rs. 100 per overdue day
  },
  overdueDays: {
    type: Number,
    default: 0,
  },
  fineStatus: {
    type: String,
    enum: ['none', 'pending', 'paid'],
    default: 'none',
  },
  finePaidDate: {
    type: Date,
  },
  // Reminder tracking
  reminderSent: {
    type: Boolean,
    default: false,
  },
  reminderSentAt: {
    type: Date,
  },
  // Rental Status
  status: {
    type: String,
    enum: ['active', 'returned', 'overdue'],
    default: 'active',
  },
  // Payment Info
  paymentMethod: {
    type: String,
    default: 'cash_on_delivery',
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
  // Khalti-specific fields for fine payments
  khaltiPidx: {
    type: String,
  },
  khaltiPurchaseOrderId: {
    type: String,
  },
  // Additional Info
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Generate rental number BEFORE validation (required field must exist before validate runs)
rentalSchema.pre('validate', async function(next) {
  try {
    if (!this.rentalNumber) {
      const count = await mongoose.model('Rental').countDocuments();
      this.rentalNumber = `RNT${String(count + 1).padStart(6, '0')}`;
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Calculate fine for overdue rentals — Rs. 100 per overdue day
rentalSchema.methods.calculateFine = function() {
  if (this.fineStatus === 'paid') {
    return this.fineAmount;
  }

  const currentDate = this.returnDate || new Date();
  const dueDate = new Date(this.dueDate);

  if (currentDate > dueDate) {
    const overdueDays = Math.ceil((currentDate - dueDate) / (1000 * 60 * 60 * 24));
    this.overdueDays = overdueDays;
    this.fineAmount = (this.finePerDay || 100) * overdueDays;

    if (this.status === 'active') {
      this.status = 'overdue';
    }
    if (this.fineStatus === 'none') {
      this.fineStatus = 'pending';
    }
  }

  return this.fineAmount;
};

// Virtual for total amount (rental + fine)
rentalSchema.virtual('totalAmount').get(function() {
  return this.totalRentalAmount + (this.fineAmount || 0);
});

rentalSchema.set('toJSON', { virtuals: true });
rentalSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Rental', rentalSchema);
