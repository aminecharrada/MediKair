const express = require("express");
const router = express.Router();
const { search, suggest, facets, reindex } = require("../controllers/searchController");
const { checkUserAuthentication } = require("../middleware/Auth");

// Public search routes
router.get("/", search);
router.get("/suggest", suggest);
router.get("/facets", facets);

// Admin-only reindex
router.post("/reindex", checkUserAuthentication, reindex);

module.exports = router;
