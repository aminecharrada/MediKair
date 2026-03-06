const router = require('express').Router();
const heroImageController = require('../controllers/heroImageController');
const { checkUserAuthentication, checkAdminPrivileges } = require('../middleware/Auth');

// Public routes
router.route('/').get(heroImageController.getAllHeroImages);

// Admin routes
router.route('/admin')
  .get(checkUserAuthentication, checkAdminPrivileges('super', 'moderate'), heroImageController.getAllHeroImagesAdmin)
  .post(checkUserAuthentication, checkAdminPrivileges('super', 'moderate'), heroImageController.createHeroImage);

router.route('/admin/reorder')
  .put(checkUserAuthentication, checkAdminPrivileges('super', 'moderate'), heroImageController.reorderHeroImages);

router.route('/admin/:id')
  .put(checkUserAuthentication, checkAdminPrivileges('super', 'moderate'), heroImageController.updateHeroImage)
  .delete(checkUserAuthentication, checkAdminPrivileges('super'), heroImageController.deleteHeroImage);

module.exports = router;
