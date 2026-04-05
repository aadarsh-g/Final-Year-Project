const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  books: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Ensure one wishlist per user
wishlistSchema.index({ user: 1 }, { unique: true });

// Remove duplicates before saving
wishlistSchema.pre('save', function(next) {
  if (this.books) {
    const uniqueBooks = [];
    const bookIds = new Set();
    
    this.books.forEach(item => {
      const bookId = item.book.toString();
      if (!bookIds.has(bookId)) {
        bookIds.add(bookId);
        uniqueBooks.push(item);
      }
    });
    
    this.books = uniqueBooks;
  }
  next();
});

module.exports = mongoose.model('Wishlist', wishlistSchema);
