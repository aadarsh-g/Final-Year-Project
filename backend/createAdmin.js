require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
  try {
    console.log('\n🚀 Bookify Admin User Creator\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin details
    const fullName = await question('Enter admin full name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 6 characters): ');

    // Validate
    if (!fullName || !email || !password) {
      console.log('\n❌ All fields are required!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('\n❌ Password must be at least 6 characters long!');
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('\n❌ User with this email already exists!');
      
      const update = await question('Do you want to update this user to admin role? (yes/no): ');
      if (update.toLowerCase() === 'yes' || update.toLowerCase() === 'y') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('\n✅ User updated to admin role successfully!');
        console.log(`📧 Email: ${existingUser.email}`);
        console.log(`👤 Name: ${existingUser.fullName}`);
        console.log(`🔑 Role: ${existingUser.role}\n`);
      }
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      fullName,
      email,
      password,
      role: 'admin',
      agreedToTerms: true
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.fullName}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`\n🎉 You can now login with these credentials!\n`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

createAdmin();

