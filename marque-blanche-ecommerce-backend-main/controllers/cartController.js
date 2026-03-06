const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/CatchAsyncErrors");

// ── Get cart (populated with product details) ────────────────
exports.getCart = catchAsyncError(async (req, res, next) => {
  let cart = await Cart.findOne({ client: req.user.id }).populate(
    "items.product",
    "name images price originalPrice stock category"
  );

  if (!cart) {
    cart = { client: req.user.id, items: [] };
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// ── Add to cart (or increment qty if exists) ─────────────────
exports.addToCart = catchAsyncError(async (req, res, next) => {
  const { productId, quantity, variation } = req.body;

  if (!productId || !quantity || quantity < 1) {
    return next(new ErrorHandler("productId et quantity sont requis", 400));
  }

  // Verify product exists and is in stock
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Produit introuvable", 404));
  }

  let cart = await Cart.findOne({ client: req.user.id });

  if (!cart) {
    cart = await Cart.create({
      client: req.user.id,
      items: [{ product: productId, quantity, variation: variation || null }],
    });
  } else {
    // Check if product already in cart
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, variation: variation || null });
    }

    await cart.save();
  }

  // Populate before returning
  cart = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price originalPrice stock category"
  );

  res.status(200).json({
    success: true,
    data: cart,
    message: "Produit ajouté au panier",
  });
});

// ── Update cart item quantity ────────────────────────────────
exports.updateCartItem = catchAsyncError(async (req, res, next) => {
  const { quantity } = req.body;
  const { itemId } = req.params;

  if (!quantity || quantity < 1) {
    return next(new ErrorHandler("La quantité doit être au moins 1", 400));
  }

  const cart = await Cart.findOne({ client: req.user.id });
  if (!cart) {
    return next(new ErrorHandler("Panier introuvable", 404));
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return next(new ErrorHandler("Article introuvable dans le panier", 404));
  }

  item.quantity = quantity;
  await cart.save();

  const populated = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price originalPrice stock category"
  );

  res.status(200).json({
    success: true,
    data: populated,
  });
});

// ── Remove item from cart ────────────────────────────────────
exports.removeFromCart = catchAsyncError(async (req, res, next) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ client: req.user.id });
  if (!cart) {
    return next(new ErrorHandler("Panier introuvable", 404));
  }

  cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
  await cart.save();

  const populated = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price originalPrice stock category"
  );

  res.status(200).json({
    success: true,
    data: populated,
    message: "Article retiré du panier",
  });
});

// ── Clear cart ───────────────────────────────────────────────
exports.clearCart = catchAsyncError(async (req, res, next) => {
  const cart = await Cart.findOne({ client: req.user.id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({
    success: true,
    data: { client: req.user.id, items: [] },
    message: "Panier vidé",
  });
});

// ── Sync cart (merge localStorage cart with server cart) ─────
exports.syncCart = catchAsyncError(async (req, res, next) => {
  const { items } = req.body; // Array of { productId, quantity, variation }

  if (!Array.isArray(items)) {
    return next(new ErrorHandler("items doit être un tableau", 400));
  }

  let cart = await Cart.findOne({ client: req.user.id });

  if (!cart) {
    cart = new Cart({ client: req.user.id, items: [] });
  }

  // Merge: for each incoming item, add or update
  for (const incoming of items) {
    if (!incoming.productId || !incoming.quantity) continue;

    // Verify product exists
    const product = await Product.findById(incoming.productId);
    if (!product) continue;

    const existing = cart.items.find(
      (item) => item.product.toString() === incoming.productId
    );

    if (existing) {
      // Take the larger quantity (server or local)
      existing.quantity = Math.max(existing.quantity, incoming.quantity);
    } else {
      cart.items.push({
        product: incoming.productId,
        quantity: incoming.quantity,
        variation: incoming.variation || null,
      });
    }
  }

  await cart.save();

  const populated = await Cart.findById(cart._id).populate(
    "items.product",
    "name images price originalPrice stock category"
  );

  res.status(200).json({
    success: true,
    data: populated,
    message: "Panier synchronisé",
  });
});
