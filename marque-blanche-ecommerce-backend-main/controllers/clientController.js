const catchAsyncError = require("../middleware/CatchAsyncErrors");
const Client = require("../models/clientModel");
const Order = require("../models/orderModel");
const ErrorHandler = require("../utils/ErrorHandler");
const { sendClientToken } = require("../utils/jwt");

// ── Register client (B2B enriched) ──────────────────────────
exports.registerClient = catchAsyncError(async (req, res, next) => {
  const {
    name, email, password, phone, city, cabinet, address,
    role, structure, parentClient,
  } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorHandler("Veuillez remplir tous les champs obligatoires", 400));
  }
  const existingClient = await Client.findOne({ email });
  if (existingClient) {
    return next(new ErrorHandler("Cet email est déjà utilisé", 400));
  }

  const clientData = {
    name,
    email,
    password,
    phone: phone || "",
    city: city || "",
    cabinet: cabinet || "",
    address: address || "",
  };

  // B2B fields
  if (role) clientData.role = role;
  if (structure) clientData.structure = structure;
  if (parentClient) {
    const parent = await Client.findById(parentClient);
    if (!parent) {
      return next(new ErrorHandler("Compte parent introuvable", 404));
    }
    clientData.parentClient = parentClient;
    clientData.validationRequired = true;
  }

  const client = await Client.create(clientData);
  sendClientToken(client, 201, res);
});

// Login client
exports.loginClient = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Veuillez fournir un email et un mot de passe", 400));
  }
  const client = await Client.findOne({ email }).select("+password");
  if (!client) {
    return next(new ErrorHandler("Email ou mot de passe invalide", 401));
  }
  const isPasswordMatched = await client.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Email ou mot de passe invalide", 401));
  }
  sendClientToken(client, 200, res);
});

// Logout client
exports.logoutClient = catchAsyncError(async (req, res, next) => {
  res.cookie("client_token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  res.status(200).json({
    success: true,
    message: "Déconnexion réussie",
  });
});

// ── Get current client (session check) ──────────────────────
exports.getMe = catchAsyncError(async (req, res, next) => {
  const client = await Client.findById(req.user.id).populate("favorites", "name images price");
  if (!client) {
    return res.status(200).json({ success: false, data: null });
  }
  res.status(200).json({
    success: true,
    data: {
      id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      city: client.city,
      cabinet: client.cabinet,
      address: client.address,
      role: client.role,
      structure: client.structure,
      parentClient: client.parentClient,
      validationRequired: client.validationRequired,
      favorites: client.favorites,
      preferredPayment: client.preferredPayment,
      notificationPrefs: client.notificationPrefs,
    },
  });
});

// ── Update client profile (B2B enriched) ────────────────────
exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const {
    name, phone, city, cabinet, address,
    role, structure, preferredPayment,
  } = req.body;

  const client = await Client.findById(req.user.id);
  if (!client) {
    return next(new ErrorHandler("Client non trouvé", 404));
  }

  if (name) client.name = name;
  if (phone !== undefined) client.phone = phone;
  if (city !== undefined) client.city = city;
  if (cabinet !== undefined) client.cabinet = cabinet;
  if (address !== undefined) client.address = address;

  // B2B fields
  if (role) client.role = role;
  if (structure) {
    if (structure.type !== undefined) client.structure.type = structure.type;
    if (structure.name !== undefined) client.structure.name = structure.name;
    if (structure.siret !== undefined) client.structure.siret = structure.siret;
    if (structure.tvaIntracom !== undefined) client.structure.tvaIntracom = structure.tvaIntracom;
    if (structure.adressePro !== undefined) client.structure.adressePro = structure.adressePro;
  }
  if (preferredPayment) client.preferredPayment = preferredPayment;

  // Update last activity
  client.lastActivity = new Date();
  await client.save();

  res.status(200).json({
    success: true,
    data: {
      id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      city: client.city,
      cabinet: client.cabinet,
      address: client.address,
      role: client.role,
      structure: client.structure,
      preferredPayment: client.preferredPayment,
    },
  });
});

// ── Get all clients (admin only, with pagination) ───────────
exports.getAllClients = catchAsyncError(async (req, res, next) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.city) filter.city = { $regex: req.query.city, $options: "i" };

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  const total = await Client.countDocuments(filter);
  const clients = await Client.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);

  // Enrich with order stats
  const enrichedClients = await Promise.all(
    clients.map(async (client) => {
      const orders = await Order.find({ client: client._id });
      const totalSpent = orders.reduce((acc, o) => acc + o.totalPrice, 0);
      const lastOrder = orders.length > 0
        ? orders.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt
        : null;
      return {
        id: client._id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        city: client.city,
        cabinet: client.cabinet,
        role: client.role,
        structure: client.structure,
        orders: orders.length,
        totalSpent,
        lastOrder,
        createdAt: client.createdAt,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: enrichedClients,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// ── Get single client (admin only) ──────────────────────────
exports.getClientById = catchAsyncError(async (req, res, next) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return next(new ErrorHandler("Client non trouvé", 404));
  }
  const orders = await Order.find({ client: client._id }).sort({ createdAt: -1 });
  const totalSpent = orders.reduce((acc, o) => acc + o.totalPrice, 0);

  res.status(200).json({
    success: true,
    data: {
      id: client._id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      city: client.city,
      cabinet: client.cabinet,
      address: client.address,
      role: client.role,
      structure: client.structure,
      parentClient: client.parentClient,
      validationRequired: client.validationRequired,
      preferredPayment: client.preferredPayment,
      notificationPrefs: client.notificationPrefs,
      segment: client.segment,
      churnRisk: client.churnRisk,
      lastActivity: client.lastActivity,
      orders: orders.length,
      totalSpent,
      orderHistory: orders,
      createdAt: client.createdAt,
    },
  });
});

// ── Delete client (admin only) ──────────────────────────────
exports.deleteClient = catchAsyncError(async (req, res, next) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return next(new ErrorHandler("Client non trouvé", 404));
  }
  await Client.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "Client supprimé",
  });
});

// ── Toggle favorite product ─────────────────────────────────
exports.toggleFavorite = catchAsyncError(async (req, res, next) => {
  const client = await Client.findById(req.user.id);
  if (!client) {
    return next(new ErrorHandler("Client non trouvé", 404));
  }

  const productId = req.params.productId;
  const index = client.favorites.indexOf(productId);

  if (index > -1) {
    client.favorites.splice(index, 1);
  } else {
    client.favorites.push(productId);
  }
  await client.save();

  res.status(200).json({
    success: true,
    data: client.favorites,
    message: index > -1 ? "Retiré des favoris" : "Ajouté aux favoris",
  });
});

// ── Get favorites (populated) ───────────────────────────────
exports.getFavorites = catchAsyncError(async (req, res, next) => {
  const client = await Client.findById(req.user.id).populate("favorites");
  if (!client) {
    return next(new ErrorHandler("Client non trouvé", 404));
  }
  res.status(200).json({
    success: true,
    data: client.favorites,
  });
});

// ── Update notification preferences ─────────────────────────
exports.updateNotifPrefs = catchAsyncError(async (req, res, next) => {
  const client = await Client.findById(req.user.id);
  if (!client) {
    return next(new ErrorHandler("Client non trouvé", 404));
  }

  const { email, stock, promotions, newsletter } = req.body;
  if (email !== undefined) client.notificationPrefs.email = email;
  if (stock !== undefined) client.notificationPrefs.stock = stock;
  if (promotions !== undefined) client.notificationPrefs.promotions = promotions;
  if (newsletter !== undefined) client.notificationPrefs.newsletter = newsletter;
  await client.save();

  res.status(200).json({
    success: true,
    data: client.notificationPrefs,
  });
});
