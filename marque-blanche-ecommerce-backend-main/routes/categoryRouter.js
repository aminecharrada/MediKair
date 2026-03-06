const router = require('express').Router();
const categoryController = require('../controllers/categoryController');
const { checkUserAuthentication, checkAdminPrivileges } = require('../middleware/Auth');

// Public routes
router.route('/').get(categoryController.getAllCategories);
router.route('/tree').get(categoryController.getCategoryTree);

// Admin routes
router.route('/admin')
  .post(checkUserAuthentication, checkAdminPrivileges('super', 'moderate'), categoryController.createCategory);

router.route('/admin/:id')
  .put(checkUserAuthentication, checkAdminPrivileges('super', 'moderate'), categoryController.updateCategory)
  .delete(checkUserAuthentication, checkAdminPrivileges('super'), categoryController.deleteCategory);

module.exports = router;
