const PlatformReview = require("../models/platformReviewModel");
const catchAsyncError = require("../middleware/CatchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

// Create a platform review
exports.createPlatformReview = catchAsyncError(async (req, res, next) => {
  const { name, email, rating, comment } = req.body;

  // Check if user already reviewed
  const existingReview = await PlatformReview.findOne({ email });

  if (existingReview) {
    // Update existing review
    existingReview.name = name;
    existingReview.rating = rating;
    existingReview.comment = comment;
    await existingReview.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: existingReview,
    });
  }

  // Create new review
  const review = await PlatformReview.create({
    name,
    email,
    rating,
    comment,
  });

  res.status(201).json({
    success: true,
    message: "Review added successfully",
    review,
  });
});

// Get all platform reviews
exports.getAllPlatformReviews = catchAsyncError(async (req, res, next) => {
  const reviews = await PlatformReview.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    reviews,
  });
});

// Delete a platform review (admin only)
exports.deletePlatformReview = catchAsyncError(async (req, res, next) => {
  const review = await PlatformReview.findById(req.params.id);

  if (!review) {
    return next(new ErrorHandler("Review not found", 404));
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});
