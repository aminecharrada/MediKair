const router = require("express").Router();
const promotionController = require("../controllers/promotionController");
const auth = require("../middleware/Auth");

// Public route - get active promotions
router.route("/active").get(promotionController.getActivePromotions);

// Admin routes
router
  .route("/")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super"),
    promotionController.getAllPromotions
  )
  .post(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super"),
    promotionController.createPromotion
  );

router
  .route("/:id")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super"),
    promotionController.getPromotion
  )
  .put(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super"),
    promotionController.updatePromotion
  )
  .delete(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super"),
    promotionController.deletePromotion
  );

router
  .route("/:id/toggle")
  .put(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super"),
    promotionController.togglePromotion
  );

module.exports = router;
