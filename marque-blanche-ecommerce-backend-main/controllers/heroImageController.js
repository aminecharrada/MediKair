const HeroImage = require("../models/heroImageModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/CatchAsyncErrors");
const cloudinary = require("../config/cloudinary");

// Get all hero images (for frontend)
exports.getAllHeroImages = catchAsyncError(async (req, res, next) => {
  const heroImages = await HeroImage.find({ isActive: true }).sort({ order: 1 });
  res.status(200).json({
    success: true,
    data: heroImages,
  });
});

// Get all hero images including inactive (for admin)
exports.getAllHeroImagesAdmin = catchAsyncError(async (req, res, next) => {
  const heroImages = await HeroImage.find().sort({ order: 1 });
  res.status(200).json({
    success: true,
    data: heroImages,
  });
});

// Create a new hero image
exports.createHeroImage = catchAsyncError(async (req, res, next) => {
  const { image, title, titleAr, subtitle, subtitleAr, order, isActive } = req.body;

  if (!image) {
    return next(new ErrorHandler("Please provide an image", 400));
  }

  // Upload image to cloudinary
  const { public_id, url } = await cloudinary.uploader.upload(image, {
    folder: "hero-images",
  });

  const heroImage = await HeroImage.create({
    image: { public_id, url },
    title: title || "",
    titleAr: titleAr || "",
    subtitle: subtitle || "",
    subtitleAr: subtitleAr || "",
    order: order || 0,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json({
    success: true,
    data: heroImage,
  });
});

// Update a hero image
exports.updateHeroImage = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { image, title, titleAr, subtitle, subtitleAr, order, isActive } = req.body;

  let heroImage = await HeroImage.findById(id);
  if (!heroImage) {
    return next(new ErrorHandler("Hero image not found", 404));
  }

  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (titleAr !== undefined) updateData.titleAr = titleAr;
  if (subtitle !== undefined) updateData.subtitle = subtitle;
  if (subtitleAr !== undefined) updateData.subtitleAr = subtitleAr;
  if (order !== undefined) updateData.order = order;
  if (isActive !== undefined) updateData.isActive = isActive;

  // If new image is provided, upload to cloudinary and delete old one
  if (image && image.startsWith("data:")) {
    // Delete old image from cloudinary
    await cloudinary.uploader.destroy(heroImage.image.public_id);
    
    // Upload new image
    const { public_id, url } = await cloudinary.uploader.upload(image, {
      folder: "hero-images",
    });
    updateData.image = { public_id, url };
  }

  heroImage = await HeroImage.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: heroImage,
  });
});

// Delete a hero image
exports.deleteHeroImage = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const heroImage = await HeroImage.findById(id);
  if (!heroImage) {
    return next(new ErrorHandler("Hero image not found", 404));
  }

  // Delete image from cloudinary
  await cloudinary.uploader.destroy(heroImage.image.public_id);

  await HeroImage.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Hero image deleted successfully",
  });
});

// Reorder hero images
exports.reorderHeroImages = catchAsyncError(async (req, res, next) => {
  const { orderedIds } = req.body;

  if (!orderedIds || !Array.isArray(orderedIds)) {
    return next(new ErrorHandler("Please provide ordered IDs", 400));
  }

  // Update order for each hero image
  for (let i = 0; i < orderedIds.length; i++) {
    await HeroImage.findByIdAndUpdate(orderedIds[i], { order: i });
  }

  const heroImages = await HeroImage.find().sort({ order: 1 });

  res.status(200).json({
    success: true,
    data: heroImages,
  });
});
