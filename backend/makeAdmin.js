require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const makeUserAdmin = async () => {
  try {
    console.log('\n🔧 Converting User to Admin...\n');

    // Get the email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address!');
      console.log('Usage: node makeAdmin.js <email>\n');
      console.log('Example: node makeAdmin.js user@example.com\n');
      process.exit(1);
    }

    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookify';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      console.log('Please signup first, then run this script.\n');
      process.exit(1);
    }

    // Update to admin
    user.role = 'admin';
    await user.save();

    console.log('✅ User updated to admin successfully!\n');
    console.log('📋 User Details:');
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   👤 Name: ${user.fullName}`);
    console.log(`   🔑 Role: ${user.role}`);
    console.log(`   📅 Created: ${user.createdAt}\n`);
    console.log('🎉 You can now login and access admin features!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
};

makeUserAdmin();

