const router = require("express").Router();
const reportController = require("../controllers/reportController");
const auth = require("../middleware/Auth");

router
  .route("/dashboard")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super", "low"),
    reportController.getDashboardStats
  );

router
  .route("/revenue")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super"),
    reportController.getRevenueReport
  );

router
  .route("/top-products")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super"),
    reportController.getTopProducts
  );

router
  .route("/categories")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super"),
    reportController.getCategoryStats
  );

router
  .route("/client-segments")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super"),
    reportController.getClientSegmentStats
  );

router
  .route("/order-trends")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("moderate", "super"),
    reportController.getOrderTrends
  );

router
  .route("/ai-metrics")
  .get(
    auth.checkUserAuthentication,
    auth.checkAdminPrivileges("super"),
    reportController.getAIMetrics
  );

module.exports = router;
