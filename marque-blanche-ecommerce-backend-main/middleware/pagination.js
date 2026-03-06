/**
 * Pagination middleware (CDC §3.8)
 * 
 * Usage: router.get("/", paginate, handler)
 * Provides req.pagination = { page, limit, skip }
 * 
 * Query params: ?page=1&limit=20
 */
module.exports = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit,
  };
  next();
};
