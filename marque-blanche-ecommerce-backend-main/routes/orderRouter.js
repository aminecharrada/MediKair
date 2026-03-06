const router = require('express').Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/Auth');

// Client routes
router.route('/new').post(auth.checkClientAuthentication, orderController.createNewOrder);
router.route('/my-orders').get(auth.checkClientAuthentication, orderController.getUserOrders);
router.route('/reorder/:id').post(auth.checkClientAuthentication, orderController.reorder);

// Admin routes
router.route('/import-csv').post(
  auth.checkUserAuthentication,
  auth.checkAdminPrivileges('super', 'admin'),
  orderController.importCSVOrders
);

// Parameterized routes (must be last)
router.route('/:id/validate').put(auth.checkClientAuthentication, orderController.validateOrder);
router.route('/:id').get(orderController.getSingleOrder);

module.exports = router;
