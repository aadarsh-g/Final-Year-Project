require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

const listBooks = async () => {
  try {
    console.log('\n📚 Listing All Books in Database...\n');

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookify';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all books
    const books = await Book.find({});
    
    console.log(`📊 Total books in database: ${books.length}\n`);
    
    if (books.length === 0) {
      console.log('❌ No books found in database!');
      console.log('   Add books using the Admin Book Management page.\n');
    } else {
      console.log('📖 Books:\n');
      books.forEach((book, index) => {
        console.log(`${index + 1}. ${book.title}`);
        console.log(`   Author: ${book.author}`);
        console.log(`   Category: ${book.category}`);
        console.log(`   Price: $${book.price.purchase}`);
        console.log(`   Stock: ${book.stock.available}/${book.stock.total}`);
        console.log(`   Status: ${book.isActive ? '✅ Active' : '❌ Inactive'}`);
        console.log(`   ID: ${book._id}`);
        console.log(`   Created: ${book.createdAt}\n`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

listBooks();

