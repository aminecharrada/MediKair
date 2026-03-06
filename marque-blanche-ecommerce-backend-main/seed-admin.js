require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/adminModel');

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@medikair.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists:', existingAdmin.email);
      console.log('   Name:', existingAdmin.name);
      console.log('   Privilege:', existingAdmin.privilege);
      console.log('   ID:', existingAdmin._id);
      process.exit(0);
    }

    // Create new super admin
    const admin = await Admin.create({
      name: 'Admin MediKair',
      email: 'admin@medikair.com',
      password: 'Medikair',
      privilege: 'super'
    });

    console.log('✅ Super admin created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Privilege:', admin.privilege);
    console.log('   ID:', admin._id);
    console.log('\n📝 Login credentials:');
    console.log('   Email: admin@medikair.com');
    console.log('   Password: Medikair');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
