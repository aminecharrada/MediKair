/**
 * AI Recommendation Controller
 * ─────────────────────────────
 * Proxies requests to the Python AI micro-service running on AI_SERVICE_URL.
 * Falls back gracefully when the AI service is unavailable.
 */

const catchAsyncErrors = require("../middleware/CatchAsyncErrors");

const AI_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Helper – proxy GET to AI service.
 */
async function aiGet(path, query = {}) {
  const url = new URL(path, AI_URL);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`AI service error: ${res.status} – ${body}`);
    err.statusCode = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Helper – proxy POST to AI service.
 */
async function aiPost(path, body = {}, query = {}) {
  const url = new URL(path, AI_URL);
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`AI service error: ${res.status} – ${text}`);
    err.statusCode = res.status;
    throw err;
  }
  return res.json();
}

// ─── Similar products (content-based) ────────────────────────────────
exports.getSimilar = catchAsyncErrors(async (req, res) => {
  const { productId } = req.params;
  const limit = req.query.limit || 6;
  const data = await aiGet(`/api/ai/recommendations/similar/${productId}`, { limit });
  res.status(200).json({ success: true, ...data });
});

// ─── Personal recommendations (collaborative) ───────────────────────
exports.getPersonal = catchAsyncErrors(async (req, res) => {
  const { clientId } = req.params;
  const limit = req.query.limit || 8;
  const data = await aiGet(`/api/ai/recommendations/personal/${clientId}`, { limit });
  res.status(200).json({ success: true, ...data });
});

// ─── Hybrid recommendations ─────────────────────────────────────────
exports.getHybrid = catchAsyncErrors(async (req, res) => {
  const clientId = req.params.clientId || req.client?._id;
  const { product_id, limit } = req.query;
  const data = await aiGet(`/api/ai/recommendations/hybrid/${clientId}`, {
    product_id,
    limit: limit || 8,
  });
  res.status(200).json({ success: true, ...data });
});

// ─── Cross-sell ──────────────────────────────────────────────────────
exports.getCrossSell = catchAsyncErrors(async (req, res) => {
  const { product_ids } = req.body;
  const limit = req.query.limit || 4;
  const data = await aiPost(
    `/api/ai/recommendations/cross-sell`,
    { product_ids: product_ids || [] },
    { limit }
  );
  res.status(200).json({ success: true, ...data });
});

// ─── Up-sell ─────────────────────────────────────────────────────────
exports.getUpSell = catchAsyncErrors(async (req, res) => {
  const { productId } = req.params;
  const limit = req.query.limit || 3;
  const data = await aiGet(`/api/ai/recommendations/up-sell/${productId}`, { limit });
  res.status(200).json({ success: true, ...data });
});

// ─── Health check on AI service ──────────────────────────────────────
exports.health = catchAsyncErrors(async (req, res) => {
  try {
    const data = await aiGet("/health");
    res.status(200).json({ success: true, aiService: data });
  } catch (err) {
    res.status(200).json({
      success: true,
      aiService: { status: "unreachable", error: err.message },
    });
  }
});
