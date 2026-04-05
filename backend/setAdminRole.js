require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const setAdminRole = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find the user
    const user = await User.findOne({ email: email });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      await mongoose.connection.close();
      process.exit(1);
    }
    
    console.log(`📋 Current user info:`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);
    console.log(`   Is Active: ${user.isActive}`);
    console.log(`   Is Verified: ${user.isVerified}`);
    
    // Update to admin
    user.role = 'admin';
    await user.save();
    
    console.log(`\n✅ SUCCESS! ${user.fullName} is now an admin!`);
    console.log(`\n🔄 Next steps:`);
    console.log(`   1. Logout from the application`);
    console.log(`   2. Login again with your credentials`);
    console.log(`   3. You should now have admin access`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Replace with your admin email
const ADMIN_EMAIL = 'aadarshganesh20@gmail.com';

console.log(`🚀 Setting admin role for: ${ADMIN_EMAIL}\n`);
setAdminRole(ADMIN_EMAIL);
