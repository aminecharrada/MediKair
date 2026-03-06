const router = require('express').Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/Auth');

// Protected — only authenticated admins can upload
router.route('/').post(
  auth.checkUserAuthentication,
  auth.checkAdminPrivileges('moderate', 'super'),
  uploadController.uploadImage
);
router.route('/document').post(
  auth.checkUserAuthentication,
  auth.checkAdminPrivileges('moderate', 'super'),
  uploadController.uploadDocument
);

module.exports = router;
