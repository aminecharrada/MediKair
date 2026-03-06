const router = require('express').Router();

const productController = require('../controllers/productController');
const auth = require('../middleware/Auth');

// send all product details (admin — protected)
router.route('/').get(
  auth.checkUserAuthentication,
  auth.checkAdminPrivileges('moderate', 'super', 'low'),
  productController.getAllProducts
);

// public product list for clients
router.route('/client').get(productController.getAllProductsFromClient);

// create product review
router.route('/client/reviews').post(productController.createProductReview);

// send all product reviews for a specific product
router.route('/client/reviews/:id').get(productController.getAllReviews);

// get all product reviews across all products (for admin — protected)
router.route('/admin/all-reviews').get(
  auth.checkUserAuthentication,
  auth.checkAdminPrivileges('moderate', 'super'),
  productController.getAllProductReviews
);

// delete a product review (admin — protected)
router.route('/admin/reviews/:id').delete(
  auth.checkUserAuthentication,
  auth.checkAdminPrivileges('moderate', 'super'),
  productController.deleteReview
);

// send a single product (must be LAST — /:id is a wildcard catch)
router.route('/:id').get(productController.getSingleProduct);

module.exports = router;