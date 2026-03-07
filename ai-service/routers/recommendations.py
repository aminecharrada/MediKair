"""
MediKair AI – Recommendation endpoints
========================================
• Content-based  : cosine similarity on product feature vectors
• Collaborative   : SVD-based matrix factorization on purchase history
• Hybrid          : weighted blend (0.4 content + 0.6 collaborative)
• Cross-sell      : co-purchase frequency analysis
• Up-sell         : same category, higher price tier
"""

import logging
from typing import List, Optional

import numpy as np
import pandas as pd
from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.decomposition import TruncatedSVD

from db import get_db

router = APIRouter(tags=["recommendations"])
logger = logging.getLogger("ai-service.recs")

# ─── Pydantic models ────────────────────────────────────────────────

class CrossSellRequest(BaseModel):
    product_ids: List[str]

class RecommendationItem(BaseModel):
    product_id: str
    score: float

class RecommendationResponse(BaseModel):
    recommendations: List[dict]
    strategy: str

# ─── Helpers ─────────────────────────────────────────────────────────

def _oid(s: str) -> ObjectId:
    try:
        return ObjectId(s)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid ObjectId: {s}")

def _serialize(product: dict) -> dict:
    """Convert Mongo document to JSON-safe dict."""
    p = {**product}
    p["_id"] = str(p["_id"])
    p["id"] = str(p["_id"])  # Add id field for frontend compatibility
    if "admin" in p:
        p["admin"] = str(p["admin"])
    # Convert Map objects
    if "specs" in p and p["specs"]:
        p["specs"] = dict(p["specs"])
    # Convert images array to proper format
    if "images" in p and p["images"]:
        p["images"] = [
            {"url": img.get("url", ""), "public_id": img.get("public_id", "")}
            for img in (p["images"] or [])
        ]
        # Add single 'image' field for ProductCard compatibility
        p["image"] = p["images"][0]["url"] if p["images"] else ""
    else:
        p["images"] = []
        p["image"] = ""
    return p


async def _get_all_products() -> list:
    db = get_db()
    cursor = db.products.find({"inStock": True})
    products = await cursor.to_list(length=5000)
    return products


async def _get_all_orders() -> list:
    db = get_db()
    cursor = db.orders.find({}, {"client": 1, "orderItems": 1, "createdAt": 1})
    orders = await cursor.to_list(length=50000)
    return orders


def _build_product_text(p: dict) -> str:
    """Build a text blob for TF-IDF from product features."""
    parts = [
        p.get("category", "") or "",
        p.get("subcategory", "") or "",
        p.get("famille", "") or "",
        p.get("brand", "") or "",
        p.get("name", "") or "",
        p.get("normes", "") or "",
    ]
    # Add specs
    specs = p.get("specs") or {}
    if isinstance(specs, dict):
        parts.extend(specs.values())
    return " ".join(filter(None, parts)).lower()


# ══════════════════════════════════════════════════════════════════════
# 1. CONTENT-BASED FILTERING  (CDC §4.1)
# ══════════════════════════════════════════════════════════════════════

@router.get("/recommendations/similar/{product_id}", response_model=RecommendationResponse)
async def similar_products(product_id: str, limit: int = Query(6, ge=1, le=20)):
    """
    Content-based: find products similar to the given product using
    TF-IDF vectorization + cosine similarity on category / brand / specs.
    """
    products = await _get_all_products()
    if not products:
        return RecommendationResponse(recommendations=[], strategy="content-based")

    pid = _oid(product_id)
    target_idx = None
    texts: list[str] = []
    prices: list[float] = []

    for i, p in enumerate(products):
        texts.append(_build_product_text(p))
        prices.append(float(p.get("price", 0)))
        if p["_id"] == pid:
            target_idx = i

    if target_idx is None:
        raise HTTPException(status_code=404, detail="Product not found")

    # TF-IDF vectorisation
    vectorizer = TfidfVectorizer(max_features=500, stop_words=None)
    tfidf_matrix = vectorizer.fit_transform(texts)

    # Cosine similarity for target product
    sim_scores = cosine_similarity(tfidf_matrix[target_idx:target_idx + 1], tfidf_matrix).flatten()

    # Combine with price proximity (normalize)
    target_price = prices[target_idx] if prices[target_idx] else 1
    price_arr = np.array(prices)
    price_diff = np.abs(price_arr - target_price) / max(target_price, 1)
    price_sim = 1 - np.clip(price_diff, 0, 1)

    # Weighted: 0.75 text similarity + 0.25 price proximity
    combined = 0.75 * sim_scores + 0.25 * price_sim

    # Exclude self
    combined[target_idx] = -1

    # Top indices
    top_indices = combined.argsort()[::-1][:limit]

    recommendations = []
    for idx in top_indices:
        if combined[idx] <= 0:
            continue
        recommendations.append({
            **_serialize(products[idx]),
            "score": round(float(combined[idx]), 4),
        })

    return RecommendationResponse(recommendations=recommendations, strategy="content-based")


# ══════════════════════════════════════════════════════════════════════
# 2. COLLABORATIVE FILTERING  (CDC §4.2)
# ══════════════════════════════════════════════════════════════════════

@router.get("/recommendations/personal/{client_id}", response_model=RecommendationResponse)
async def personal_recommendations(client_id: str, limit: int = Query(8, ge=1, le=30)):
    """
    Collaborative filtering: SVD matrix factorization on the
    user-product purchase matrix.
    """
    orders = await _get_all_orders()
    products = await _get_all_products()
    product_map = {str(p["_id"]): p for p in products}
    product_ids = list(product_map.keys())

    if not orders or not products:
        return RecommendationResponse(recommendations=[], strategy="collaborative")

    # Build user-product matrix
    user_purchases: dict[str, dict[str, float]] = {}
    for order in orders:
        cid = str(order.get("client", ""))
        if not cid:
            continue
        if cid not in user_purchases:
            user_purchases[cid] = {}
        for item in order.get("orderItems", []):
            pid = str(item.get("product", ""))
            if pid:
                qty = float(item.get("quantity", 1))
                user_purchases[cid][pid] = user_purchases[cid].get(pid, 0) + qty

    user_ids = list(user_purchases.keys())

    if client_id not in user_purchases or len(user_ids) < 2:
        # Cold start → fall back to popular products
        return await _popular_fallback(products, client_id, limit)

    # Create matrix
    uid_idx = {uid: i for i, uid in enumerate(user_ids)}
    pid_idx = {pid: i for i, pid in enumerate(product_ids)}

    matrix = np.zeros((len(user_ids), len(product_ids)))
    for uid, prods in user_purchases.items():
        for pid, qty in prods.items():
            if pid in pid_idx:
                matrix[uid_idx[uid]][pid_idx[pid]] = qty

    # Log-transform to reduce heavy-buyer bias
    matrix = np.log1p(matrix)

    # SVD (truncated for speed)
    n_components = min(20, min(matrix.shape) - 1)
    if n_components < 1:
        return await _popular_fallback(products, client_id, limit)

    svd = TruncatedSVD(n_components=n_components, random_state=42)
    user_factors = svd.fit_transform(matrix)
    item_factors = svd.components_.T

    # Predicted scores for the target user
    user_row = uid_idx[client_id]
    predicted = user_factors[user_row] @ item_factors.T

    # Exclude products already purchased
    already_bought = set(user_purchases[client_id].keys())
    for pid in already_bought:
        if pid in pid_idx:
            predicted[pid_idx[pid]] = -999

    # Top indices
    top_indices = predicted.argsort()[::-1][:limit]

    recommendations = []
    for idx in top_indices:
        if predicted[idx] <= -999:
            continue
        pid = product_ids[idx]
        if pid in product_map:
            recommendations.append({
                **_serialize(product_map[pid]),
                "score": round(float(predicted[idx]), 4),
            })

    return RecommendationResponse(recommendations=recommendations, strategy="collaborative")


async def _popular_fallback(products: list, client_id: str, limit: int) -> RecommendationResponse:
    """Fallback: return best-rated / featured products."""
    # Exclude products the user already bought
    db = get_db()
    bought_pids: set = set()
    try:
        cursor = db.orders.find(
            {"client": _oid(client_id)},
            {"orderItems.product": 1}
        )
        async for order in cursor:
            for item in order.get("orderItems", []):
                bought_pids.add(str(item.get("product", "")))
    except Exception:
        pass

    sorted_products = sorted(
        [p for p in products if str(p["_id"]) not in bought_pids],
        key=lambda p: (p.get("featured", False), p.get("rating", 0)),
        reverse=True,
    )[:limit]

    return RecommendationResponse(
        recommendations=[{**_serialize(p), "score": round(float(p.get("rating", 0)), 4)} for p in sorted_products],
        strategy="popular-fallback",
    )


# ══════════════════════════════════════════════════════════════════════
# 3. HYBRID FILTERING  (CDC §4.3)
# ══════════════════════════════════════════════════════════════════════

@router.get("/recommendations/hybrid/{client_id}", response_model=RecommendationResponse)
async def hybrid_recommendations(
    client_id: str,
    product_id: Optional[str] = Query(None),
    limit: int = Query(8, ge=1, le=30),
):
    """
    Hybrid: blend content-based (0.4) + collaborative (0.6).
    Cold-start users get content-based only if product_id is provided,
    else popular fallback.
    """
    # Weights
    W_CONTENT = 0.4
    W_COLLAB = 0.6

    products = await _get_all_products()
    product_map = {str(p["_id"]): p for p in products}

    # --- Collaborative scores ---
    collab_res = await personal_recommendations(client_id, limit=50)
    collab_scores: dict[str, float] = {}
    is_fallback = collab_res.strategy == "popular-fallback"
    for rec in collab_res.recommendations:
        pid = rec.get("_id", "")
        collab_scores[pid] = rec.get("score", 0)

    # Normalize collab scores to [0, 1]
    if collab_scores:
        max_c = max(collab_scores.values()) or 1
        min_c = min(collab_scores.values())
        rng = max_c - min_c if max_c != min_c else 1
        collab_scores = {k: (v - min_c) / rng for k, v in collab_scores.items()}

    # --- Content-based scores ---
    content_scores: dict[str, float] = {}
    if product_id:
        content_res = await similar_products(product_id, limit=50)
        for rec in content_res.recommendations:
            pid = rec.get("_id", "")
            content_scores[pid] = rec.get("score", 0)
    elif is_fallback:
        # No collab data and no product_id → popular only
        return collab_res

    # Normalize content scores to [0, 1]
    if content_scores:
        max_s = max(content_scores.values()) or 1
        min_s = min(content_scores.values())
        rng = max_s - min_s if max_s != min_s else 1
        content_scores = {k: (v - min_s) / rng for k, v in content_scores.items()}

    # Blend
    all_pids = set(collab_scores.keys()) | set(content_scores.keys())
    blended: list[tuple[str, float]] = []
    for pid in all_pids:
        cs = content_scores.get(pid, 0) * W_CONTENT
        cl = collab_scores.get(pid, 0) * W_COLLAB
        blended.append((pid, cs + cl))

    blended.sort(key=lambda x: x[1], reverse=True)

    recommendations = []
    for pid, score in blended[:limit]:
        if pid in product_map:
            recommendations.append({
                **_serialize(product_map[pid]),
                "score": round(score, 4),
            })

    strategy = "hybrid" if content_scores and collab_scores else (
        "content-based" if content_scores else "collaborative"
    )

    return RecommendationResponse(recommendations=recommendations, strategy=strategy)


# ══════════════════════════════════════════════════════════════════════
# 4. CROSS-SELL  (CDC §10.5)
# ══════════════════════════════════════════════════════════════════════

@router.post("/recommendations/cross-sell", response_model=RecommendationResponse)
async def cross_sell(body: CrossSellRequest, limit: int = Query(4, ge=1, le=20)):
    """
    'Frequently bought together': analyse co-purchase frequency
    for the given product IDs across all orders.
    """
    if not body.product_ids:
        return RecommendationResponse(recommendations=[], strategy="cross-sell")

    input_set = set(body.product_ids)
    orders = await _get_all_orders()
    products = await _get_all_products()
    product_map = {str(p["_id"]): p for p in products}

    # Count co-purchases
    co_freq: dict[str, int] = {}
    for order in orders:
        order_pids = {str(item.get("product", "")) for item in order.get("orderItems", [])}
        # Only consider orders that contain at least one input product
        if not order_pids & input_set:
            continue
        complements = order_pids - input_set
        for pid in complements:
            co_freq[pid] = co_freq.get(pid, 0) + 1

    if not co_freq:
        # Fallback: same-category products
        categories = set()
        for pid in input_set:
            if pid in product_map:
                cat = product_map[pid].get("category", "")
                if cat:
                    categories.add(cat)

        recs = [
            p for p in products
            if str(p["_id"]) not in input_set and p.get("category", "") in categories
        ][:limit]

        return RecommendationResponse(
            recommendations=[{**_serialize(p), "score": 0} for p in recs],
            strategy="cross-sell-fallback",
        )

    # Sort by frequency
    sorted_co = sorted(co_freq.items(), key=lambda x: x[1], reverse=True)[:limit]

    recommendations = []
    for pid, count in sorted_co:
        if pid in product_map:
            recommendations.append({
                **_serialize(product_map[pid]),
                "score": count,
            })

    return RecommendationResponse(recommendations=recommendations, strategy="cross-sell")


# ══════════════════════════════════════════════════════════════════════
# 5. UP-SELL  (CDC §10.5)
# ══════════════════════════════════════════════════════════════════════

@router.get("/recommendations/up-sell/{product_id}", response_model=RecommendationResponse)
async def up_sell(product_id: str, limit: int = Query(3, ge=1, le=10)):
    """
    'Premium alternative': same category, higher price, better rating.
    """
    products = await _get_all_products()
    pid = _oid(product_id)
    target = None
    for p in products:
        if p["_id"] == pid:
            target = p
            break

    if not target:
        raise HTTPException(status_code=404, detail="Product not found")

    target_cat = target.get("category", "")
    target_price = float(target.get("price", 0))

    candidates = [
        p for p in products
        if p["_id"] != pid
        and p.get("category", "") == target_cat
        and float(p.get("price", 0)) > target_price
    ]

    # Score: weighted by rating and how much more premium it is
    for c in candidates:
        price_ratio = float(c.get("price", 0)) / max(target_price, 1)
        rating_bonus = float(c.get("rating", 0)) / 5.0
        c["_upsell_score"] = 0.5 * rating_bonus + 0.5 * min(price_ratio / 3, 1)

    candidates.sort(key=lambda c: c["_upsell_score"], reverse=True)

    recommendations = []
    for c in candidates[:limit]:
        score = c.pop("_upsell_score", 0)
        recommendations.append({
            **_serialize(c),
            "score": round(score, 4),
        })

    return RecommendationResponse(recommendations=recommendations, strategy="up-sell")
