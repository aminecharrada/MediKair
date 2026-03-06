const express = require("express");
const router = express.Router();
const platformReviewController = require("../controllers/platformReviewController");
const auth = require("../middleware/Auth");

// Create a platform review
router.route("/").post(platformReviewController.createPlatformReview);

// Get all platform reviews
router.route("/").get(platformReviewController.getAllPlatformReviews);

// Delete a platform review (admin only — protected)
router.route("/:id").delete(
  auth.checkUserAuthentication,
  auth.checkAdminPrivileges("moderate", "super"),
  platformReviewController.deletePlatformReview
);

module.exports = router;
