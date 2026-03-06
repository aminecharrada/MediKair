require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/adminModel');

const verifyAdmin = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the admin
    const admin = await Admin.findOne({ email: 'admin@medikair.com' });
    
    if (!admin) {
      console.log('❌ Admin not found');
      process.exit(1);
    }

    console.log('📋 Admin Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`ID:         ${admin._id}`);
    console.log(`Name:       ${admin.name}`);
    console.log(`Email:      ${admin.email}`);
    console.log(`Privilege:  ${admin.privilege}`);
    console.log(`Created:    ${admin.createdAt || 'N/A'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Count all admins
    const totalAdmins = await Admin.countDocuments();
    console.log(`\n📊 Total admins in database: ${totalAdmins}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

verifyAdmin();
