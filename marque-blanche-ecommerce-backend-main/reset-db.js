require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/adminModel');
const Product = require('./models/productModel');
const Order = require('./models/orderModel');
const Category = require('./models/categoryModel');
const HeroImage = require('./models/heroImageModel');
const PlatformReview = require('./models/platformReviewModel');

const connectDB = async () => {
  try {
    console.log('Connecting to database...');
    // Handle deprecation warnings
    mongoose.set('strictQuery', false);
    
    await mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
    
    console.log('🗑️  Deleting all data...');
    
    await Admin.deleteMany({});
    console.log(' - Admins cleared');
    
    await Product.deleteMany({});
    console.log(' - Products cleared');
    
    await Order.deleteMany({});
    console.log(' - Orders cleared');
    
    await Category.deleteMany({});
    console.log(' - Categories cleared');
    
    await HeroImage.deleteMany({});
    console.log(' - Hero Images cleared');
    
    await PlatformReview.deleteMany({});
    console.log(' - Platform Reviews cleared');

    console.log('✨ Creating default admin user...');
    // Create default admin
    await Admin.create({
      name: "Admin",
      email: "admin@admin.com",
      password: "password123",
      privilege: "super" // 'super' based on your routing logic
    });
    
    console.log('✅ Database reset complete!');
    console.log('-----------------------------------');
    console.log('🆕 Default Login Credentials:');
    console.log('📧 Email:    admin@admin.com');
    console.log('🔑 Password: password123');
    console.log('-----------------------------------');

    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

connectDB();
