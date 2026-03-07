const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Client = require("../models/clientModel");
const SiteSettings = require("../models/siteSettingsModel");
const Notification = require("../models/notificationModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/CatchAsyncErrors");

// ── Helper: create a notification ────────────────────────────
const createNotification = async (clientId, type, title, message, link = "") => {
  try {
    await Notification.create({ client: clientId, type, title, message, link });
  } catch (e) {
    console.error("Notification creation failed:", e.message);
  }
};

// ── Create new order (client authenticated) ──────────────────
exports.createNewOrder = catchAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    shippingPrice,
    totalPrice,
    notes,
    source,
  } = req.body;

  // Verify stock BEFORE creating the order
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      return next(new ErrorHandler(`Produit introuvable: ${item.name}`, 404));
    }
    if (product.stock < item.quantity) {
      return next(
        new ErrorHandler(
          `Stock insuffisant pour "${item.name}" (disponible: ${product.stock}, demandé: ${item.quantity})`,
          400
        )
      );
    }
  }

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo: paymentInfo || { id: "COD", status: "En attente", method: "cod" },
    itemsPrice,
    shippingPrice,
    totalPrice,
    client: req.user.id,
    notes: notes || "",
    source: source || "web",
  });

  // ── B2B Hierarchical validation check ─────────────────────
  try {
    const client = await Client.findById(req.user.id);
    const settings = await SiteSettings.findOne();
    if (
      client &&
      client.validationRequired &&
      settings &&
      settings.hierarchicalValidation &&
      totalPrice > (settings.validationThreshold || 5000)
    ) {
      order.validationStatus = "pending-validation";
      order.orderStatus = "En attente de validation";
      order.statusHistory.push({
        status: "pending-validation",
        date: new Date(),
        by: "system",
      });
      await order.save({ validateBeforeSave: false });

      // Notify parent client if exists
      if (client.parentClient) {
        await createNotification(
          client.parentClient,
          "order",
          "Validation requise",
          `La commande ${order.orderNumber} de ${client.name} nécessite votre validation (${totalPrice.toFixed(2)} TND).`,
          `/orders/${order._id}`
        );
      }
    }
  } catch (e) {
    console.error("B2B validation check failed:", e.message);
  }

  // Send notification to client
  await createNotification(
    req.user.id,
    "order",
    "Commande créée",
    `Votre commande ${order.orderNumber} a été créée avec succès.`,
    `/orders/${order._id}`
  );

  res.status(201).json({
    success: true,
    data: order,
    message: "Commande créée avec succès",
  });
});

// ── Get single order ─────────────────────────────────────────
exports.getSingleOrder = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("Order not found", 400));
  }
  const order = await Order.findById(req.params.id).populate("client", "name email phone cabinet");
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }
  res.status(200).json({
    success: true,
    data: order,
  });
});

// ── Get user's orders (client authenticated) ─────────────────
exports.getUserOrders = catchAsyncError(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = { client: req.user.id };
  if (req.query.status) filter.orderStatus = req.query.status;

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ── Get all orders (admin, with pagination & filters) ────────
exports.getAllOrders = catchAsyncError(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.orderStatus = req.query.status;
  if (req.query.client) filter.client = req.query.client;
  if (req.query.source) filter.source = req.query.source;
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("client", "name email phone cabinet")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ── Update order status (admin) ──────────────────────────────
exports.updateOrderStatus = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("Order not found", 400));
  }
  if (!req.body.status) {
    return next(new ErrorHandler("Invalid request", 400));
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }
  if (order.orderStatus === "delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  // Stock deduction on confirmation
  if (req.body.status === "confirmed") {
    for (const item of order.orderItems) {
      const success = await updateStock(item.product, item.quantity);
      if (!success) {
        return next(new ErrorHandler(`Stock insuffisant pour "${item.name}"`, 400));
      }
    }
  }

  order.orderStatus = req.body.status;
  if (req.body.status === "delivered") {
    order.deliveredAt = Date.now();
  }

  // Push to status history
  order.statusHistory.push({
    status: req.body.status,
    date: new Date(),
    by: req.user.email || req.user.name || "admin",
  });

  await order.save({ validateBeforeSave: false });

  // Notify client
  if (order.client) {
    const statusLabels = {
      confirmed: "confirmée",
      "En préparation": "en préparation",
      shipped: "expédiée",
      delivered: "livrée",
      cancelled: "annulée",
    };
    const label = statusLabels[req.body.status] || req.body.status;
    await createNotification(
      order.client,
      "order",
      "Mise à jour commande",
      `Votre commande ${order.orderNumber} est maintenant ${label}.`,
      `/orders/${order._id}`
    );
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// ── Delete order ─────────────────────────────────────────────
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("Order not found", 400));
  }
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }
  await Order.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "Order deleted",
  });
});

// ── Reorder — duplicate an existing order ────────────────────
exports.reorder = catchAsyncError(async (req, res, next) => {
  const originalOrder = await Order.findById(req.params.id);
  if (!originalOrder) {
    return next(new ErrorHandler("Commande originale introuvable", 404));
  }

  // Verify the order belongs to this client
  if (originalOrder.client.toString() !== req.user.id) {
    return next(new ErrorHandler("Accès non autorisé", 403));
  }

  // Verify stock for all items
  for (const item of originalOrder.orderItems) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.quantity) {
      return next(
        new ErrorHandler(
          `Stock insuffisant pour "${item.name}" — impossible de recommander`,
          400
        )
      );
    }
  }

  const newOrder = await Order.create({
    shippingInfo: originalOrder.shippingInfo,
    orderItems: originalOrder.orderItems,
    paymentInfo: { id: "COD", status: "En attente", method: originalOrder.paymentInfo.method },
    itemsPrice: originalOrder.itemsPrice,
    shippingPrice: originalOrder.shippingPrice,
    totalPrice: originalOrder.totalPrice,
    client: req.user.id,
    source: "reorder",
    notes: `Recommande de ${originalOrder.orderNumber}`,
  });

  res.status(201).json({
    success: true,
    data: newOrder,
    message: "Commande dupliquée avec succès",
  });
});

// ── Validate order (B2B hierarchical) ────────────────────────
exports.validateOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Commande introuvable", 404));
  }

  const { action } = req.body; // "approve" or "reject"
  if (!["approve", "reject"].includes(action)) {
    return next(new ErrorHandler("Action invalide (approve/reject)", 400));
  }

  order.validationStatus = action === "approve" ? "approved" : "rejected";
  order.validatedBy = req.user.id;
  order.validatedAt = new Date();
  order.statusHistory.push({
    status: `validation-${action}d`,
    date: new Date(),
    by: req.user.email || req.user.name || "validator",
  });

  if (action === "reject") {
    order.orderStatus = "Annulée";
    order.statusHistory.push({
      status: "Annulée",
      date: new Date(),
      by: "system",
    });
  }

  await order.save({ validateBeforeSave: false });

  // Notify owner
  await createNotification(
    order.client,
    "order",
    action === "approve" ? "Commande validée" : "Commande rejetée",
    `Votre commande ${order.orderNumber} a été ${action === "approve" ? "validée" : "rejetée"}.`,
    `/orders/${order._id}`
  );

  res.status(200).json({
    success: true,
    data: order,
  });
});

// ── Import CSV orders — parse raw CSV with ref_produit, quantité ──
exports.importCSVOrders = catchAsyncError(async (req, res, next) => {
  const { csvData, clientId, shippingInfo } = req.body;

  // Support both raw CSV string and pre-parsed rows
  let rows = [];
  if (typeof csvData === "string") {
    // Parse CSV text: expected columns = ref_produit, quantité
    const lines = csvData.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return next(new ErrorHandler("Le CSV doit contenir au moins un en-tête et une ligne de données", 400));
    }
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[;,]/).map((c) => c.trim());
      if (cols.length >= 2) {
        rows.push({ ref: cols[0], quantity: parseInt(cols[1]) || 1 });
      }
    }
  } else if (Array.isArray(req.body.orders)) {
    // Legacy JSON format
    const legacyResults = { created: 0, errors: [] };
    for (let i = 0; i < req.body.orders.length; i++) {
      try {
        const row = req.body.orders[i];
        await Order.create({
          shippingInfo: row.shippingInfo,
          orderItems: row.orderItems,
          paymentInfo: row.paymentInfo || { id: "CSV", status: "En attente", method: "transfer" },
          itemsPrice: row.itemsPrice || 0,
          shippingPrice: row.shippingPrice || 0,
          totalPrice: row.totalPrice || 0,
          client: row.client,
          source: "csv-import",
          notes: row.notes || "Import CSV",
        });
        legacyResults.created++;
      } catch (err) {
        legacyResults.errors.push({ row: i + 1, message: err.message });
      }
    }
    return res.status(201).json({ success: true, data: legacyResults, message: `${legacyResults.created} commande(s) importée(s)` });
  } else {
    return next(new ErrorHandler("Fournissez csvData (string CSV) ou orders (tableau JSON)", 400));
  }

  if (rows.length === 0) {
    return next(new ErrorHandler("Aucun produit valide trouvé dans le CSV", 400));
  }

  // Resolve products by reference (refFabricant, codeEAN, or name)
  const orderItems = [];
  const errors = [];
  let itemsPrice = 0;

  for (let i = 0; i < rows.length; i++) {
    const { ref, quantity } = rows[i];
    const product = await Product.findOne({
      $or: [
        { refFabricant: ref },
        { codeEAN: ref },
        { name: { $regex: new RegExp(`^${ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } },
      ],
    });

    if (!product) {
      errors.push({ row: i + 2, ref, message: `Produit introuvable: "${ref}"` });
      continue;
    }
    if (product.stock < quantity) {
      errors.push({ row: i + 2, ref, message: `Stock insuffisant pour "${product.name}" (disponible: ${product.stock})` });
      continue;
    }

    const price = product.discountPercentage > 0
      ? product.price * (1 - product.discountPercentage / 100)
      : product.price;

    orderItems.push({
      name: product.name,
      price,
      quantity,
      image: product.images?.[0]?.url || "",
      product: product._id,
    });
    itemsPrice += price * quantity;
  }

  if (orderItems.length === 0) {
    return res.status(400).json({
      success: false,
      data: { created: 0, errors },
      message: "Aucun produit valide — commande non créée",
    });
  }

  // Determine shipping
  const settings = await SiteSettings.findOne();
  const freeThreshold = settings?.freeShippingThreshold || 500;
  const shippingPrice = itemsPrice >= freeThreshold ? 0 : 49;
  const totalPrice = itemsPrice + shippingPrice;

  // Determine client: use provided clientId or the authenticated user
  const orderClient = clientId || req.user?.id;

  const order = await Order.create({
    shippingInfo: shippingInfo || { address: "À préciser", city: "À préciser", phoneNumber: "À préciser" },
    orderItems,
    paymentInfo: { id: "CSV", status: "En attente", method: "transfer" },
    itemsPrice,
    shippingPrice,
    totalPrice,
    client: orderClient,
    source: "csv-import",
    notes: `Import CSV — ${orderItems.length} produit(s)`,
  });

  res.status(201).json({
    success: true,
    data: {
      order,
      imported: orderItems.length,
      errors,
    },
    message: `Commande créée avec ${orderItems.length} produit(s), ${errors.length} erreur(s)`,
  });
});

// ── Helper: update product stock ─────────────────────────────
const updateStock = async (id, quantity) => {
  const product = await Product.findById(id);
  if (!product || product.stock < quantity) {
    return false;
  }
  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
  return true;
};
