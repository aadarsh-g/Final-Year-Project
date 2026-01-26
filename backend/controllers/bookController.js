const Book = require('../models/Book');

// @desc    Get all books (with filters, search, pagination)
// @route   GET /api/books
// @access  Public
exports.getAllBooks = async (req, res) => {
  try {
    const {
      search,
      category,
      language,
      minPrice,
      maxPrice,
      isActive,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 100 // Increased to 100 to show more books
    } = req.query;

    // Build query
    const query = {};

    // Search in title, author, description
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (category) query.category = category;
    if (language) query.language = language;
    if (isActive !== undefined && isActive !== '') query.isActive = isActive === 'true';
    
    // Price range
    if (minPrice || maxPrice) {
      query['price.purchase'] = {};
      if (minPrice) query['price.purchase'].$gte = Number(minPrice);
      if (maxPrice) query['price.purchase'].$lte = Number(maxPrice);
    }

    // Count total documents
    const total = await Book.countDocuments(query);

    // Execute query with pagination (removed populate since addedBy might be null)
    const books = await Book.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      books
    });
  } catch (error) {
    console.error('Get all books error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: error.message
    });
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      book
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: error.message
    });
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private/Admin
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      isbn,
      description,
      coverImage,
      category,
      genre,
      language,
      publisher,
      publishedDate,
      pages,
      price,
      stock,
      tags
    } = req.body;

    // Validation
    if (!title || !author || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (title, author, description, category)'
      });
    }

    if (!price || !price.purchase || !price.rental || !price.rental.perDay) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid pricing information'
      });
    }

    // Check if ISBN already exists
    if (isbn) {
      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: 'A book with this ISBN already exists'
        });
      }
    }

    // Create book (no authentication required - removed addedBy)
    const book = await Book.create({
      title,
      author,
      isbn,
      description,
      coverImage,
      category,
      genre,
      language,
      publisher,
      publishedDate,
      pages,
      price,
      stock: {
        total: stock?.total || 0,
        available: stock?.available || stock?.total || 0,
        rented: 0
      },
      tags,
      addedBy: null // No user tracking
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book
    });
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create book',
      error: error.message
    });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private/Admin
exports.updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if ISBN is being changed and if it already exists
    if (req.body.isbn && req.body.isbn !== book.isbn) {
      const existingBook = await Book.findOne({ isbn: req.body.isbn });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: 'A book with this ISBN already exists'
        });
      }
    }

    // Update lastUpdatedBy (removed - no authentication)
    // req.body.lastUpdatedBy = req.user.id;

    // Update book
    book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: error.message
    });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private/Admin
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book has active rentals
    if (book.stock.rented > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active rentals. Please wait for all rentals to be returned.'
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error.message
    });
  }
};

// @desc    Update book stock
// @route   PATCH /api/books/:id/stock
// @access  Private/Admin
exports.updateBookStock = async (req, res) => {
  try {
    const { total, available } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Update stock (removed lastUpdatedBy)
    if (total !== undefined) {
      book.stock.total = total;
      // Ensure available doesn't exceed total
      if (book.stock.available > total) {
        book.stock.available = total - book.stock.rented;
      }
    }

    if (available !== undefined) {
      // Ensure available + rented doesn't exceed total
      if (available + book.stock.rented > book.stock.total) {
        return res.status(400).json({
          success: false,
          message: 'Available stock + rented stock cannot exceed total stock'
        });
      }
      book.stock.available = available;
    }

    // book.lastUpdatedBy = req.user.id; // Removed
    await book.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      book
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// @desc    Toggle book active status
// @route   PATCH /api/books/:id/toggle-active
// @access  Private/Admin
exports.toggleBookActive = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    book.isActive = !book.isActive;
    // book.lastUpdatedBy = req.user.id; // Removed
    await book.save();

    res.status(200).json({
      success: true,
      message: `Book ${book.isActive ? 'activated' : 'deactivated'} successfully`,
      book
    });
  } catch (error) {
    console.error('Toggle active error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle book status',
      error: error.message
    });
  }
};

// @desc    Get book statistics (for admin dashboard)
// @route   GET /api/books/stats
// @access  Private/Admin
exports.getBookStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const activeBooks = await Book.countDocuments({ isActive: true });
    const inactiveBooks = await Book.countDocuments({ isActive: false });
    const outOfStock = await Book.countDocuments({ 'stock.available': 0 });
    const lowStock = await Book.countDocuments({
      'stock.available': { $gt: 0, $lte: 5 }
    });

    // Books by category
    const booksByCategory = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Total value of inventory
    const inventoryValue = await Book.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price.purchase', '$stock.total'] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalBooks,
        activeBooks,
        inactiveBooks,
        outOfStock,
        lowStock,
        booksByCategory,
        totalInventoryValue: inventoryValue[0]?.totalValue || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

