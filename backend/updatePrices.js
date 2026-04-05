require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const connectDatabase = require('./config/database');

const updateBookPrices = async () => {
  try {
    await connectDatabase();

    // Find all books
    const books = await Book.find();
    console.log(`\n📚 Found ${books.length} books\n`);

    let updated = 0;

    for (const book of books) {
      let needsUpdate = false;
      const updates = {};

      // Check purchase price
      if (book.price.purchase < 1000) {
        updates['price.purchase'] = 1200; // Set to Rs. 1200
        needsUpdate = true;
      }

      // Check rental price per day
      if (book.price.rental.perDay < 50) {
        updates['price.rental.perDay'] = 80; // Set to Rs. 80/day
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Book.findByIdAndUpdate(book._id, { $set: updates });
        updated++;
        console.log(`✅ Updated: "${book.title}"`);
        console.log(`   Purchase: Rs. ${book.price.purchase} → Rs. ${updates['price.purchase'] || book.price.purchase}`);
        console.log(`   Rental: Rs. ${book.price.rental.perDay}/day → Rs. ${updates['price.rental.perDay'] || book.price.rental.perDay}/day\n`);
      } else {
        console.log(`✓ "${book.title}" already has prices above minimum`);
      }
    }

    console.log(`\n🎉 Complete! Updated ${updated} book(s)\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating prices:', error);
    process.exit(1);
  }
};

updateBookPrices();
