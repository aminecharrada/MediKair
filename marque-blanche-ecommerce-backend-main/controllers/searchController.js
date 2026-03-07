const { getIndex } = require("../config/meilisearch");
const catchAsync = require("../middleware/CatchAsyncErrors");

/**
 * @route   GET /api/search
 * @desc    Full-text search with faceted filters, sorting, pagination
 * @query   q, brand, category, subcategory, famille, priceMin, priceMax,
 *          inStock, isOffer, sort, page, limit, productType
 * @access  Public
 */
exports.search = catchAsync(async (req, res) => {
  const {
    q = "",
    brand,
    category,
    subcategory,
    famille,
    priceMin,
    priceMax,
    inStock,
    isOffer,
    productType,
    badge,
    featured,
    sort,
    page = 1,
    limit = 20,
  } = req.query;

  const index = getIndex();
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  // Build filter array
  const filters = [];
  if (brand) {
    const brands = brand.split(",").map((b) => `brand = "${b.trim()}"`);
    filters.push(`(${brands.join(" OR ")})`);
  }
  if (category) {
    const cats = category.split(",").map((c) => `category = "${c.trim()}"`);
    filters.push(`(${cats.join(" OR ")})`);
  }
  if (subcategory) filters.push(`subcategory = "${subcategory}"`);
  if (famille) filters.push(`famille = "${famille}"`);
  if (productType) filters.push(`productType = "${productType}"`);
  if (badge) filters.push(`badge = "${badge}"`);
  if (inStock === "true") filters.push("inStock = true");
  if (isOffer === "true") filters.push("isOffer = true");
  if (featured === "true") filters.push("featured = true");
  if (priceMin) filters.push(`price >= ${parseFloat(priceMin)}`);
  if (priceMax) filters.push(`price <= ${parseFloat(priceMax)}`);

  // Build sort array
  const sortArr = [];
  if (sort) {
    switch (sort) {
      case "price_asc":
        sortArr.push("price:asc");
        break;
      case "price_desc":
        sortArr.push("price:desc");
        break;
      case "name":
        sortArr.push("name:asc");
        break;
      case "rating":
        sortArr.push("rating:desc");
        break;
      case "newest":
        sortArr.push("createdAt:desc");
        break;
    }
  }

  // Execute search
  const results = await index.search(q, {
    filter: filters.length > 0 ? filters.join(" AND ") : undefined,
    sort: sortArr.length > 0 ? sortArr : undefined,
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    facets: [
      "brand",
      "category",
      "subcategory",
      "famille",
      "inStock",
      "isOffer",
      "productType",
      "badge",
      "featured",
    ],
    attributesToHighlight: ["name", "description", "brand"],
    highlightPreTag: "<mark>",
    highlightPostTag: "</mark>",
  });

  res.status(200).json({
    success: true,
    query: q,
    hits: results.hits,
    totalHits: results.estimatedTotalHits || results.totalHits || 0,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil((results.estimatedTotalHits || results.totalHits || 0) / limitNum),
    processingTimeMs: results.processingTimeMs,
    facetDistribution: results.facetDistribution || {},
    facetStats: results.facetStats || {},
  });
});

/**
 * @route   GET /api/search/suggest
 * @desc    Autocomplete / instant suggestions (top N results)
 * @query   q (required)
 * @access  Public
 */
exports.suggest = catchAsync(async (req, res) => {
  const { q = "" } = req.query;

  if (!q || q.length < 1) {
    return res.status(200).json({ success: true, suggestions: [] });
  }

  const index = getIndex();

  const results = await index.search(q, {
    limit: 8,
    attributesToRetrieve: [
      "id",
      "name",
      "brand",
      "category",
      "refFabricant",
      "codeEAN",
      "price",
      "image",
      "inStock",
    ],
    attributesToHighlight: ["name", "brand"],
    highlightPreTag: "<mark>",
    highlightPostTag: "</mark>",
  });

  // Also extract unique categories and brands from results for suggestion grouping
  const categories = [...new Set(results.hits.map((h) => h.category).filter(Boolean))];
  const brands = [...new Set(results.hits.map((h) => h.brand).filter(Boolean))];

  res.status(200).json({
    success: true,
    suggestions: results.hits,
    categories: categories.slice(0, 4),
    brands: brands.slice(0, 4),
    processingTimeMs: results.processingTimeMs,
  });
});

/**
 * @route   GET /api/search/facets
 * @desc    Get all available facet values (for filter panels)
 * @access  Public
 */
exports.facets = catchAsync(async (req, res) => {
  const index = getIndex();

  // Empty search to get all facet distributions
  const results = await index.search("", {
    limit: 0,
    facets: [
      "brand",
      "category",
      "subcategory",
      "famille",
      "inStock",
      "isOffer",
      "productType",
      "badge",
    ],
  });

  res.status(200).json({
    success: true,
    facetDistribution: results.facetDistribution || {},
    facetStats: results.facetStats || {},
    totalProducts: results.estimatedTotalHits || 0,
  });
});

/**
 * @route   POST /api/search/reindex
 * @desc    Force full reindex from MongoDB (admin only)
 * @access  Admin
 */
exports.reindex = catchAsync(async (req, res) => {
  const Product = require("../models/productModel");
  const { transformProduct, configureIndex } = require("../config/meilisearch");
  const index = getIndex();

  // Reconfigure settings
  await configureIndex();

  // Fetch all products
  const products = await Product.find().lean();
  const docs = products.map(transformProduct);

  // Clear and re-add
  await index.deleteAllDocuments();

  if (docs.length > 0) {
    // Batch index in groups of 500
    for (let i = 0; i < docs.length; i += 500) {
      await index.addDocuments(docs.slice(i, i + 500));
    }
  }

  res.status(200).json({
    success: true,
    message: `Reindexed ${docs.length} products`,
  });
});
