const Rental = require('../models/Rental');
const Book = require('../models/Book');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

// Create a new rental
exports.createRental = async (req, res) => {
  try {
    const { bookId, rentalDuration } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!bookId || !rentalDuration || rentalDuration < 1) {
      return res.status(400).json({ message: 'Invalid rental details' });
    }

    // Check book availability
    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ message: 'Book not found or unavailable' });
    }

    if (book.stock.available < 1) {
      return res.status(400).json({ message: 'Book is out of stock' });
    }

    // Calculate dates and amounts
    const startDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + rentalDuration);

    const pricePerDay = book.price.rental.perDay;
    const totalRentalAmount = pricePerDay * rentalDuration;

    // Create rental
    const rental = new Rental({
      user: userId,
      book: bookId,
      startDate,
      dueDate,
      rentalDuration,
      pricePerDay,
      totalRentalAmount,
      status: 'active',
      isPaid: false,
    });

    await rental.save();

    // Update book stock
    book.stock.available -= 1;
    await book.save();

    // Create notification
    await notificationService.createNotification(
      userId,
      'rental_created',
      `You have rented "${book.title}" for ${rentalDuration} days`,
      { rentalId: rental._id, bookId: book._id }
    );

    res.status(201).json({
      message: 'Rental created successfully',
      rental: await rental.populate(['user', 'book']),
    });
  } catch (error) {
    console.error('Create rental error:', error);
    res.status(500).json({ message: 'Failed to create rental', error: error.message });
  }
};

// Get user's rentals
exports.getUserRentals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const rentals = await Rental.find(query)
      .populate('book', 'title author coverImage')
      .sort({ createdAt: -1 });

    // Calculate fines for each rental
    rentals.forEach(rental => {
      rental.calculateFine();
    });

    // Save any updated fines
    await Promise.all(rentals.map(r => r.save()));

    res.json({ rentals });
  } catch (error) {
    console.error('Get user rentals error:', error);
    res.status(500).json({ message: 'Failed to fetch rentals', error: error.message });
  }
};

// Get all rentals (Admin)
exports.getAllRentals = async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const rentals = await Rental.find(query)
      .populate('user', 'fullName email')
      .populate('book', 'title author coverImage')
      .sort({ createdAt: -1 });

    // Calculate fines for each rental
    rentals.forEach(rental => {
      rental.calculateFine();
    });

    // Save any updated fines
    await Promise.all(rentals.map(r => r.save()));

    res.json({ rentals });
  } catch (error) {
    console.error('Get all rentals error:', error);
    res.status(500).json({ message: 'Failed to fetch rentals', error: error.message });
  }
};

// Return rental (User or Admin)
exports.returnRental = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findById(id).populate('book');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    if (rental.status === 'returned') {
      return res.status(400).json({ message: 'Book already returned' });
    }

    // Set return date and calculate fine
    rental.returnDate = new Date();
    rental.calculateFine();
    rental.status = 'returned';

    await rental.save();

    // Update book stock
    const book = rental.book;
    book.stock.available += 1;
    await book.save();

    // Create notification
    await notificationService.createNotification(
      rental.user,
      'rental_returned',
      `You have returned "${book.title}". ${rental.fineAmount > 0 ? `Fine: Rs. ${rental.fineAmount}` : 'No fine.'}`,
      { rentalId: rental._id, bookId: book._id }
    );

    res.json({
      message: 'Book returned successfully',
      rental: await rental.populate('user'),
      fine: rental.fineAmount,
    });
  } catch (error) {
    console.error('Return rental error:', error);
    res.status(500).json({ message: 'Failed to return rental', error: error.message });
  }
};

// Pay fine
exports.payFine = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    const userId = req.user.id;

    const rental = await Rental.findById(id).populate('book');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Verify user owns this rental or is admin
    if (rental.user.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (rental.fineStatus === 'paid') {
      return res.status(400).json({ message: 'Fine already paid' });
    }

    if (rental.fineAmount <= 0) {
      return res.status(400).json({ message: 'No fine to pay' });
    }

    // Process fine payment
    rental.fineStatus = 'paid';
    rental.finePaidDate = new Date();
    rental.paymentMethod = paymentMethod || 'cash_on_delivery';

    await rental.save();

    // Create notification
    await notificationService.createNotification(
      rental.user,
      'fine_paid',
      `Fine of Rs. ${rental.fineAmount} paid successfully for "${rental.book.title}"`,
      { rentalId: rental._id }
    );

    res.json({
      message: 'Fine paid successfully',
      rental: await rental.populate('user'),
    });
  } catch (error) {
    console.error('Pay fine error:', error);
    res.status(500).json({ message: 'Failed to pay fine', error: error.message });
  }
};

// Get rental details
exports.getRentalDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const rental = await Rental.findById(id)
      .populate('user', 'fullName email phone')
      .populate('book', 'title author coverImage isbn');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Calculate latest fine
    rental.calculateFine();
    await rental.save();

    res.json({ rental });
  } catch (error) {
    console.error('Get rental details error:', error);
    res.status(500).json({ message: 'Failed to fetch rental details', error: error.message });
  }
};

// Get user's overdue rentals with pending fines
exports.getOverdueRentals = async (req, res) => {
  try {
    const userId = req.user.id;

    const rentals = await Rental.find({
      user: userId,
      $or: [
        { status: 'overdue' },
        { fineStatus: 'pending' }
      ]
    }).populate('book', 'title author coverImage');

    // Update fines
    rentals.forEach(rental => {
      rental.calculateFine();
    });

    await Promise.all(rentals.map(r => r.save()));

    res.json({ rentals });
  } catch (error) {
    console.error('Get overdue rentals error:', error);
    res.status(500).json({ message: 'Failed to fetch overdue rentals', error: error.message });
  }
};

// Admin: Get all pending fines
exports.getAllPendingFines = async (req, res) => {
  try {
    const rentals = await Rental.find({
      fineStatus: 'pending',
      fineAmount: { $gt: 0 }
    })
      .populate('user', 'fullName email phone')
      .populate('book', 'title author coverImage')
      .sort({ dueDate: 1 });

    // Update fines
    rentals.forEach(rental => {
      rental.calculateFine();
    });

    await Promise.all(rentals.map(r => r.save()));

    const totalPendingFines = rentals.reduce((sum, r) => sum + r.fineAmount, 0);

    res.json({
      rentals,
      totalPendingFines,
      count: rentals.length,
    });
  } catch (error) {
    console.error('Get pending fines error:', error);
    res.status(500).json({ message: 'Failed to fetch pending fines', error: error.message });
  }
};
