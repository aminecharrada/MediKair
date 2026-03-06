const router = require("express").Router();
const cartController = require("../controllers/cartController");
const { checkClientAuthentication } = require("../middleware/Auth");

// All routes require client authentication
router.use(checkClientAuthentication);

router.route("/").get(cartController.getCart).delete(cartController.clearCart);
router.route("/add").post(cartController.addToCart);
router.route("/sync").post(cartController.syncCart);
router.route("/:itemId").put(cartController.updateCartItem).delete(cartController.removeFromCart);

module.exports = router;
