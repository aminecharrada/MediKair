const SiteSettings = require("../models/siteSettingsModel");
const catchAsyncError = require("../middleware/CatchAsyncErrors");

// ── Get site settings (public) ───────────────────────────────
exports.getSettings = catchAsyncError(async (req, res, next) => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    // Create default settings automatically
    settings = await SiteSettings.create({});
  }

  res.status(200).json({
    success: true,
    settings,
  });
});

// ── Update site settings (admin — full update) ──────────────
exports.updateSettings = catchAsyncError(async (req, res, next) => {
  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = new SiteSettings({});
  }

  // Whitelist of updatable fields
  const updatableFields = [
    "storeName", "storeEmail", "storePhone", "currency", "address",
    "maintenanceMode",
    "notifyOrders", "notifyStock", "notifyNewClients", "notifyAI", "notificationEmail",
    "paymentMethods", "bankInfo",
    "shippingZones", "defaultCarrier", "freeShippingThreshold",
    "require2FA", "hierarchicalValidation", "validationThreshold",
    "auditLogs", "ipRestriction",
    "offerTimerEnd",
  ];

  for (const field of updatableFields) {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  }

  await settings.save();

  res.status(200).json({
    success: true,
    settings,
    message: "Paramètres mis à jour",
  });
});

// ── Update offer timer (admin) ───────────────────────────────
exports.updateOfferTimer = catchAsyncError(async (req, res, next) => {
  const { offerTimerEnd } = req.body;

  let settings = await SiteSettings.findOne();

  if (!settings) {
    settings = await SiteSettings.create({
      offerTimerEnd,
      admin: req.user._id,
    });
  } else {
    settings.offerTimerEnd = offerTimerEnd;
    await settings.save();
  }

  res.status(200).json({
    success: true,
    settings,
  });
});
