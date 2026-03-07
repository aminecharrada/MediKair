const express = require("express");
const router = express.Router();
const {
  checkClientAuthentication,
} = require("../middleware/Auth");
const {
  getSimilar,
  getPersonal,
  getHybrid,
  getCrossSell,
  getUpSell,
  health,
} = require("../controllers/aiController");

// Health check (public)
router.get("/health", health);

// Similar products – public (used on product detail page)
router.get("/similar/:productId", getSimilar);

// Up-sell – public (used on product detail page)
router.get("/up-sell/:productId", getUpSell);

// Personal recommendations – requires auth
router.get("/personal/:clientId", checkClientAuthentication, getPersonal);

// Hybrid recommendations – requires auth
router.get("/hybrid/:clientId", checkClientAuthentication, getHybrid);

// Cross-sell – public (used on cart page)
router.post("/cross-sell", getCrossSell);

module.exports = router;
