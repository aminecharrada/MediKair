const catchAsyncError = require("../middleware/CatchAsyncErrors");
const Promotion = require("../models/promotionModel");
const ErrorHandler = require("../utils/ErrorHandler");

// Create promotion
exports.createPromotion = catchAsyncError(async (req, res, next) => {
  req.body.admin = req.user.id;

  // For simple offers, ensure discount is set
  if (req.body.offerType === 'simple' || !req.body.offerType) {
    if (!req.body.discount && req.body.discount !== 0 && req.body.type !== 'freeShipping') {
      return next(new ErrorHandler('Veuillez fournir une valeur de réduction', 400));
    }
  }

  const promotion = await Promotion.create(req.body);
  res.status(201).json({
    success: true,
    data: promotion,
  });
});

// Get all promotions
exports.getAllPromotions = catchAsyncError(async (req, res, next) => {
  const promotions = await Promotion.find().sort({ createdAt: -1 });
  const data = promotions.map((p) => {
    const obj = p.toObject();
    // Compute a human-readable "value" display string
    let displayValue = '';
    if (obj.offerType === 'bundle' && obj.bundleRule) {
      displayValue = `${obj.bundleRule.buyQty}+${obj.bundleRule.getQty} offert`;
    } else if (obj.offerType === 'volume' && obj.tiers && obj.tiers.length) {
      displayValue = obj.tiers.map((t) => `≥${t.minQty}: -${t.discountPercent}%`).join(', ');
    } else {
      displayValue = obj.type === 'percentage' ? `-${obj.discount}%`
        : obj.type === 'fixed' ? `-${obj.discount} TND`
        : obj.type === 'freeShipping' ? 'Livraison gratuite'
        : String(obj.discount || 0);
    }
    // Compute a target summary
    let targetSummary = '';
    if (obj.segmentClient) targetSummary += obj.segmentClient;
    if (obj.typeStructure) targetSummary += (targetSummary ? ' · ' : '') + obj.typeStructure;
    if (obj.groupeSpecifique) targetSummary += (targetSummary ? ' · ' : '') + obj.groupeSpecifique;
    if (!targetSummary && obj.categories && obj.categories.length) targetSummary = obj.categories.join(', ');
    if (!targetSummary) targetSummary = 'Tout le catalogue';
    return {
      ...obj,
      _id: obj._id,
      name: obj.name,
      offerType: obj.offerType || 'simple',
      value: displayValue,
      target: targetSummary,
      active: obj.isActive,
      uses: obj.usageCount || 0,
    };
  });
  res.status(200).json({
    success: true,
    data,
  });
});

// Get active promotions (public)
exports.getActivePromotions = catchAsyncError(async (req, res, next) => {
  const now = new Date();
  const promotions = await Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).populate("products", "name price images");
  res.status(200).json({
    success: true,
    data: promotions,
  });
});

// Get single promotion
exports.getPromotion = catchAsyncError(async (req, res, next) => {
  const promotion = await Promotion.findById(req.params.id).populate("products");
  if (!promotion) {
    return next(new ErrorHandler("Promotion non trouvée", 404));
  }
  res.status(200).json({
    success: true,
    data: promotion,
  });
});

// Update promotion
exports.updatePromotion = catchAsyncError(async (req, res, next) => {
  let promotion = await Promotion.findById(req.params.id);
  if (!promotion) {
    return next(new ErrorHandler("Promotion non trouvée", 404));
  }
  promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: promotion,
  });
});

// Toggle promotion active status
exports.togglePromotion = catchAsyncError(async (req, res, next) => {
  const promotion = await Promotion.findById(req.params.id);
  if (!promotion) {
    return next(new ErrorHandler("Promotion non trouvée", 404));
  }
  promotion.isActive = !promotion.isActive;
  await promotion.save();
  res.status(200).json({
    success: true,
    data: promotion,
  });
});

// Delete promotion
exports.deletePromotion = catchAsyncError(async (req, res, next) => {
  const promotion = await Promotion.findById(req.params.id);
  if (!promotion) {
    return next(new ErrorHandler("Promotion non trouvée", 404));
  }
  await Promotion.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "Promotion supprimée",
  });
});
