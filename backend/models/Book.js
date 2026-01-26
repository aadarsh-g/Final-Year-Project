const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide book title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    author: {
      type: String,
      required: [true, 'Please provide author name'],
      trim: true
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide book description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    coverImage: {
      type: String,
      default: 'https://via.placeholder.com/400x600?text=No+Cover'
    },
    category: {
      type: String,
      required: [true, 'Please provide book category'],
      enum: [
        'Fiction',
        'Non-Fiction',
        'Mystery',
        'Thriller',
        'Romance',
        'Science Fiction',
        'Fantasy',
        'Biography',
        'History',
        'Self-Help',
        'Business',
        'Technology',
        'Children',
        'Young Adult',
        'Poetry',
        'Other'
      ]
    },
    genre: {
      type: [String],
      default: []
    },
    language: {
      type: String,
      required: [true, 'Please provide book language'],
      default: 'English'
    },
    publisher: {
      type: String,
      trim: true
    },
    publishedDate: {
      type: Date
    },
    pages: {
      type: Number,
      min: [1, 'Pages must be at least 1']
    },
    price: {
      purchase: {
        type: Number,
        required: [true, 'Please provide purchase price'],
        min: [0, 'Price cannot be negative']
      },
      rental: {
        perDay: {
          type: Number,
          required: [true, 'Please provide rental price per day'],
          min: [0, 'Rental price cannot be negative']
        }
      }
    },
    stock: {
      total: {
        type: Number,
        required: [true, 'Please provide total stock'],
        min: [0, 'Stock cannot be negative'],
        default: 0
      },
      available: {
        type: Number,
        required: [true, 'Please provide available stock'],
        min: [0, 'Available stock cannot be negative'],
        default: 0
      },
      rented: {
        type: Number,
        min: [0, 'Rented count cannot be negative'],
        default: 0
      }
    },
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      count: {
        type: Number,
        min: 0,
        default: 0
      }
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    tags: {
      type: [String],
      default: []
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Made optional - no authentication required
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Made optional
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
bookSchema.index({ title: 'text', author: 'text', description: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ isActive: 1 });
bookSchema.index({ 'price.purchase': 1 });
bookSchema.index({ createdAt: -1 });

// Virtual for stock status
bookSchema.virtual('stockStatus').get(function () {
  if (this.stock.available === 0) return 'Out of Stock';
  if (this.stock.available <= 5) return 'Low Stock';
  return 'In Stock';
});

// Pre-save middleware to ensure available stock doesn't exceed total
bookSchema.pre('save', function (next) {
  if (this.stock.available > this.stock.total) {
    this.stock.available = this.stock.total;
  }
  next();
});

module.exports = mongoose.model('Book', bookSchema);

