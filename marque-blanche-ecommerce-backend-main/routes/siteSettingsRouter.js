const express = require("express");
const router = express.Router();
const { getSettings, updateSettings, updateOfferTimer } = require("../controllers/siteSettingsController");
const { checkUserAuthentication, checkAdminPrivileges } = require("../middleware/Auth");

// Public route to get settings
router.route("/").get(getSettings);

// Admin route to update all settings
router.route("/").put(checkUserAuthentication, checkAdminPrivileges("super", "admin"), updateSettings);

// Admin route to update timer - allowed for super and admin roles
router.route("/offer-timer").put(checkUserAuthentication, checkAdminPrivileges("super", "admin"), updateOfferTimer);

module.exports = router;
