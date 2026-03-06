const Category = require("../models/categoryModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/CatchAsyncErrors");
const cloudinary = require("../config/cloudinary");

// ── Get all categories (flat list, sorted) ───────────────────
exports.getAllCategories = catchAsyncError(async (req, res, next) => {
  const filter = {};
  if (req.query.level) filter.level = parseInt(req.query.level);
  if (req.query.parent) filter.parent = req.query.parent;
  if (req.query.active === "true") filter.isActive = true;

  const categories = await Category.find(filter)
    .populate("parent", "name slug level")
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: categories,
  });
});

// ── Get category tree (hierarchical) ─────────────────────────
exports.getCategoryTree = catchAsyncError(async (req, res, next) => {
  // Get all level-1 categories and recursively populate children
  const roots = await Category.find({ level: 1, isActive: true })
    .populate({
      path: "children",
      match: { isActive: true },
      options: { sort: { order: 1 } },
      populate: {
        path: "children",
        match: { isActive: true },
        options: { sort: { order: 1 } },
      },
    })
    .sort({ order: 1 });

  res.status(200).json({
    success: true,
    data: roots,
  });
});

// ── Create a new category ────────────────────────────────────
exports.createCategory = catchAsyncError(async (req, res, next) => {
  const { name, image, parent, level, description, order: catOrder } = req.body;

  if (!name) {
    return next(new ErrorHandler("Please provide a category name", 400));
  }

  // Validate parent if provided
  if (parent) {
    const parentCat = await Category.findById(parent);
    if (!parentCat) {
      return next(new ErrorHandler("Parent category not found", 404));
    }
    // Child level must be parent level + 1
    if (level && level !== parentCat.level + 1) {
      return next(new ErrorHandler(`Child level must be ${parentCat.level + 1} for this parent`, 400));
    }
  }

  const categoryData = {
    name: name.toLowerCase(),
    level: level || (parent ? 2 : 1),
    parent: parent || null,
    description: description || "",
    order: catOrder || 0,
  };

  // Upload image to cloudinary if provided
  if (image && image.startsWith("data:")) {
    const { public_id, url } = await cloudinary.uploader.upload(image, {
      folder: "categories",
    });
    categoryData.image = { public_id, url };
  }

  const category = await Category.create(categoryData);

  res.status(201).json({
    success: true,
    data: category,
  });
});

// ── Update a category ────────────────────────────────────────
exports.updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name, image, parent, level, description, order: catOrder, isActive } = req.body;

  let category = await Category.findById(id);
  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  const updateData = {};
  if (name) updateData.name = name.toLowerCase();
  if (description !== undefined) updateData.description = description;
  if (catOrder !== undefined) updateData.order = catOrder;
  if (isActive !== undefined) updateData.isActive = isActive;

  // Handle parent change (move in tree)
  if (parent !== undefined) {
    if (parent === null) {
      updateData.parent = null;
      updateData.level = 1;
    } else {
      // Prevent setting self as parent
      if (parent === id) {
        return next(new ErrorHandler("A category cannot be its own parent", 400));
      }
      const parentCat = await Category.findById(parent);
      if (!parentCat) {
        return next(new ErrorHandler("Parent category not found", 404));
      }
      updateData.parent = parent;
      updateData.level = level || parentCat.level + 1;
    }
  }

  // If new image is provided, upload to cloudinary and delete old one
  if (image && image.startsWith("data:")) {
    if (category.image && category.image.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }
    const { public_id, url } = await cloudinary.uploader.upload(image, {
      folder: "categories",
    });
    updateData.image = { public_id, url };
  }

  // Use save() to trigger slug regeneration if name changed
  if (updateData.name) {
    Object.assign(category, updateData);
    await category.save();
  } else {
    category = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// ── Delete a category ────────────────────────────────────────
exports.deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  // Check for children — prevent deleting a parent with children
  const childCount = await Category.countDocuments({ parent: id });
  if (childCount > 0) {
    return next(
      new ErrorHandler(
        `Cannot delete: this category has ${childCount} sub-categories. Delete or move them first.`,
        400
      )
    );
  }

  // Delete image from cloudinary
  if (category.image && category.image.public_id) {
    await cloudinary.uploader.destroy(category.image.public_id);
  }

  await Category.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
});
