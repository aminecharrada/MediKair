const catchAsyncError = require("../middleware/CatchAsyncErrors");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Client = require("../models/clientModel");

// Dashboard stats
exports.getDashboardStats = catchAsyncError(async (req, res, next) => {
  const totalOrders = await Order.countDocuments();
  const totalClients = await Client.countDocuments();
  const totalProducts = await Product.countDocuments();

  const orders = await Order.find();
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);

  // Orders by status
  const pendingOrders = orders.filter(o => o.orderStatus === "En attente").length;
  const confirmedOrders = orders.filter(o => o.orderStatus === "confirmed").length;
  const deliveredOrders = orders.filter(o => o.orderStatus === "delivered").length;

  // Recent orders (last 10)
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("client", "name email");

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      totalClients,
      totalProducts,
      totalRevenue,
      pendingOrders,
      confirmedOrders,
      deliveredOrders,
      recentOrders,
    },
  });
});

// Revenue report (monthly for current year)
exports.getRevenueReport = catchAsyncError(async (req, res, next) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
  });

  const monthlyRevenue = Array(12).fill(0);
  const monthlyOrders = Array(12).fill(0);

  orders.forEach((order) => {
    const month = new Date(order.createdAt).getMonth();
    monthlyRevenue[month] += order.totalPrice;
    monthlyOrders[month] += 1;
  });

  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
  ];

  res.status(200).json({
    success: true,
    data: months.map((name, i) => ({
      month: name,
      revenue: monthlyRevenue[i],
      orders: monthlyOrders[i],
    })),
  });
});

// Top products by sales
exports.getTopProducts = catchAsyncError(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;

  const orders = await Order.find();
  const productSales = {};

  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const pid = item.product.toString();
      if (!productSales[pid]) {
        productSales[pid] = { name: item.name, quantity: 0, revenue: 0 };
      }
      productSales[pid].quantity += item.quantity;
      productSales[pid].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  res.status(200).json({
    success: true,
    data: topProducts,
  });
});

// Category distribution
exports.getCategoryStats = catchAsyncError(async (req, res, next) => {
  const products = await Product.find();
  const categoryCounts = {};

  products.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  const data = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
  }));

  res.status(200).json({
    success: true,
    data,
  });
});

// ── Client segment stats (B2B) ──────────────────────────────
exports.getClientSegmentStats = catchAsyncError(async (req, res, next) => {
  const clients = await Client.find();

  // By role
  const byRole = {};
  clients.forEach((c) => {
    byRole[c.role] = (byRole[c.role] || 0) + 1;
  });

  // By city (top 10)
  const byCity = {};
  clients.forEach((c) => {
    if (c.city) byCity[c.city] = (byCity[c.city] || 0) + 1;
  });
  const topCities = Object.entries(byCity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([city, count]) => ({ city, count }));

  // By structure type
  const byStructure = {};
  clients.forEach((c) => {
    const st = c.structure?.type || "cabinet";
    byStructure[st] = (byStructure[st] || 0) + 1;
  });

  // Active in last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activeClients = clients.filter(
    (c) => c.lastActivity && new Date(c.lastActivity) >= thirtyDaysAgo
  ).length;

  res.status(200).json({
    success: true,
    data: {
      total: clients.length,
      activeClients,
      byRole,
      byStructure,
      topCities,
    },
  });
});

// ── Order trends (daily/weekly/monthly) ──────────────────────
exports.getOrderTrends = catchAsyncError(async (req, res, next) => {
  const period = req.query.period || "daily"; // daily | weekly | monthly
  const days = parseInt(req.query.days) || 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await Order.find({
    createdAt: { $gte: startDate },
  }).sort({ createdAt: 1 });

  const trends = {};

  orders.forEach((order) => {
    let key;
    const d = new Date(order.createdAt);
    if (period === "daily") {
      key = d.toISOString().split("T")[0]; // YYYY-MM-DD
    } else if (period === "weekly") {
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      key = weekStart.toISOString().split("T")[0];
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!trends[key]) {
      trends[key] = { orders: 0, revenue: 0 };
    }
    trends[key].orders += 1;
    trends[key].revenue += order.totalPrice;
  });

  const data = Object.entries(trends).map(([date, stats]) => ({
    date,
    ...stats,
  }));

  res.status(200).json({
    success: true,
    data,
  });
});

// ── AI Metrics (placeholder — wired in Phase 10-11) ─────────
exports.getAIMetrics = catchAsyncError(async (req, res, next) => {
  // Placeholder: will be enriched when AI module is integrated
  const totalClients = await Client.countDocuments();
  const segmented = await Client.countDocuments({ segment: { $ne: "" } });
  const highChurn = await Client.countDocuments({ churnRisk: { $gte: 0.7 } });

  res.status(200).json({
    success: true,
    data: {
      totalClients,
      segmentedClients: segmented,
      highChurnRisk: highChurn,
      segmentationRate: totalClients > 0 ? Math.round((segmented / totalClients) * 100) : 0,
      aiEnabled: false,
      lastTraining: null,
      recommendations: 0,
    },
  });
});
