require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Order = require('./models/orderModel');

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('Connected to database...');
    
    const productsDeleted = await Product.deleteMany({});
    console.log(`Deleted ${productsDeleted.deletedCount} products`);
    
    const ordersDeleted = await Order.deleteMany({});
    console.log(`Deleted ${ordersDeleted.deletedCount} orders`);
    
    console.log('\n✅ Database cleared successfully!');
    console.log('You can now add new furniture products with the updated form.');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
    process.exit(1);
  });
