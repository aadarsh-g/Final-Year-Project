// Script to update user role to admin
// Usage: node updateUserRole.js <email> <role>

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const updateUserRole = async (email, role = 'admin') => {
  try {
    // Connect to MongoDB using the same connection string as your backend
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ Error: MONGODB_URI or MONGO_URI not found in .env file');
      console.log('💡 Make sure your .env file has the MongoDB connection string');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find the user
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User with email "${email}" not found in database`);
      console.log('\n📋 Available users:');
      const allUsers = await User.find().select('email fullName role');
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.fullName}) - Role: ${u.role}`);
      });
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log(`📋 Current user info:`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Is Active: ${user.isActive}`);
    console.log(`   Is Verified: ${user.isVerified}\n`);
    
    // Update role
    user.role = role;
    await user.save();
    
    console.log(`✅ SUCCESS!`);
    console.log(`   ${user.fullName} (${user.email}) is now an ${role.toUpperCase()}!\n`);
    console.log(`🔄 Next steps:`);
    console.log(`   1. Go back to your browser`);
    console.log(`   2. Open browser console (F12)`);
    console.log(`   3. Run: localStorage.clear()`);
    console.log(`   4. Then run: location.reload()`);
    console.log(`   5. Login again with your credentials`);
    console.log(`   6. You should now have admin access! ✅\n`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('uri')) {
      console.error('\n💡 Make sure your .env file has MONGODB_URI or MONGO_URI set correctly');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2] || 'aadarshganesh20@gmail.com';
const role = process.argv[3] || 'admin';

console.log(`🚀 Updating user role...`);
console.log(`   Email: ${email}`);
console.log(`   New Role: ${role}\n`);

updateUserRole(email, role);
