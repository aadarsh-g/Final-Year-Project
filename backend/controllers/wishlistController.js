const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    let wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: 'books.book',
        select: 'title author coverImage price category isActive stock',
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, books: [] });
    }

    // Filter out inactive books or books that no longer exist
    wishlist.books = wishlist.books.filter(item => item.book && item.book.isActive);

    res.json({
      success: true,
      wishlist: wishlist.books,
      count: wishlist.books.length,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message,
    });
  }
};

// Add book to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required',
      });
    }

    // Check if book exists and is active
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Book not found or unavailable',
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        books: [{ book: bookId }],
      });
    } else {
      // Check if book already in wishlist
      const bookExists = wishlist.books.some(
        item => item.book.toString() === bookId
      );

      if (bookExists) {
        return res.status(400).json({
          success: false,
          message: 'Book already in wishlist',
        });
      }

      // Add book to wishlist
      wishlist.books.push({ book: bookId });
      await wishlist.save();
    }

    // Populate and return
    wishlist = await Wishlist.findById(wishlist._id).populate({
      path: 'books.book',
      select: 'title author coverImage price category',
    });

    res.status(201).json({
      success: true,
      message: 'Book added to wishlist',
      wishlist: wishlist.books,
      count: wishlist.books.length,
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add book to wishlist',
      error: error.message,
    });
  }
};

// Remove book from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    // Remove book from wishlist
    wishlist.books = wishlist.books.filter(
      item => item.book.toString() !== bookId
    );

    await wishlist.save();

    // Populate and return
    await wishlist.populate({
      path: 'books.book',
      select: 'title author coverImage price category',
    });

    res.json({
      success: true,
      message: 'Book removed from wishlist',
      wishlist: wishlist.books,
      count: wishlist.books.length,
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove book from wishlist',
      error: error.message,
    });
  }
};

// Check if book is in wishlist
exports.checkWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId } = req.params;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.json({
        success: true,
        inWishlist: false,
      });
    }

    const inWishlist = wishlist.books.some(
      item => item.book.toString() === bookId
    );

    res.json({
      success: true,
      inWishlist,
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
      error: error.message,
    });
  }
};

// Clear entire wishlist
exports.clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    wishlist.books = [];
    await wishlist.save();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      wishlist: [],
      count: 0,
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message,
    });
  }
};

// Get wishlist count
exports.getWishlistCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });

    const count = wishlist ? wishlist.books.length : 0;

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist count',
      error: error.message,
    });
  }
};
