const router = require("express").Router();
const notificationController = require("../controllers/notificationController");
const { checkClientAuthentication } = require("../middleware/Auth");

// All routes require client authentication
router.use(checkClientAuthentication);

router.route("/").get(notificationController.getMyNotifications);
router.route("/read-all").put(notificationController.markAllAsRead);
router.route("/:id/read").put(notificationController.markAsRead);
router.route("/:id").delete(notificationController.deleteNotification);

module.exports = router;
