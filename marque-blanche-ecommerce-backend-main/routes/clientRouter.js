const router = require("express").Router();
const clientController = require("../controllers/clientController");
const auth = require("../middleware/Auth");

// Public routes
router.route("/register").post(clientController.registerClient);
router.route("/login").post(clientController.loginClient);
router.route("/logout").get(clientController.logoutClient);

// Protected client routes
router.route("/me").get(auth.checkClientAuthentication, clientController.getMe);
router.route("/profile").put(auth.checkClientAuthentication, clientController.updateProfile);
router.route("/favorites").get(auth.checkClientAuthentication, clientController.getFavorites);
router.route("/favorites/:productId").put(auth.checkClientAuthentication, clientController.toggleFavorite);
router.route("/notifications").put(auth.checkClientAuthentication, clientController.updateNotifPrefs);

module.exports = router;
