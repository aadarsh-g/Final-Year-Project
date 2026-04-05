require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const connectDatabase = require('./config/database');

const generateSlugs = async () => {
  try {
    await connectDatabase();

    // Find all books without slugs
    const books = await Book.find({ $or: [{ slug: null }, { slug: '' }] });
    console.log(`\n📚 Found ${books.length} books without slugs\n`);

    if (books.length === 0) {
      console.log('✅ All books already have slugs!\n');
      process.exit(0);
    }

    let updated = 0;

    for (const book of books) {
      const oldTitle = book.title;
      
      // Just save the book - the pre-save hook will generate the slug
      await book.save();
      
      updated++;
      console.log(`✅ Generated slug for: "${oldTitle}"`);
      console.log(`   URL: /book/${book.slug}\n`);
    }

    console.log(`\n🎉 Complete! Generated slugs for ${updated} book(s)\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating slugs:', error);
    process.exit(1);
  }
};

generateSlugs();
