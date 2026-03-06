const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/CatchAsyncErrors");
const cloudinary = require("../config/cloudinary");

// Create a new product
exports.createProduct = catchAsyncError(async (req, res, next) => {
  req.body.admin = req.user.id;
  let images = req.body.images;
  if (images && Array.isArray(images)) {
    let newImages = [];
    for (let i = 0; i < images.length; i++) {
      const { public_id, url } = await cloudinary.uploader.upload(images[i], {
        folder: "medikair",
      });
      newImages.push({ public_id, url });
    }
    req.body.images = [...newImages];
  }

  if (req.body.specs && typeof req.body.specs === "object" && !(req.body.specs instanceof Map)) {
    req.body.specs = new Map(Object.entries(req.body.specs));
  }

  // Convert variation attribute maps
  if (req.body.variations && Array.isArray(req.body.variations)) {
    req.body.variations = req.body.variations.map((v) => ({
      ...v,
      attributes: v.attributes && typeof v.attributes === "object" && !(v.attributes instanceof Map)
        ? new Map(Object.entries(v.attributes))
        : v.attributes,
    }));
  }

  // Auto-compute inStock from stock
  if (req.body.stock !== undefined) {
    req.body.inStock = Number(req.body.stock) > 0;
  }

  const product = await Product.create(req.body);
  res.status(201).json({
    success: true,
    data: product,
  });
});

// Update product
exports.updateProduct = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("Produit non trouvé", 400));
  }
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Produit non trouvé", 404));
  }
  let images = req.body.images;
  if (images && Array.isArray(images)) {
    let newImages = [];
    for (let i = 0; i < images.length; i++) {
      if (typeof images[i] === "string") {
        const { public_id, url } = await cloudinary.uploader.upload(images[i], {
          folder: "medikair",
        });
        newImages.push({ public_id, url });
      } else {
        newImages.push(images[i]);
      }
    }
    req.body.images = [...newImages];
  }

  if (req.body.specs && typeof req.body.specs === "object" && !(req.body.specs instanceof Map)) {
    req.body.specs = new Map(Object.entries(req.body.specs));
  }

  // Convert variation attribute maps
  if (req.body.variations && Array.isArray(req.body.variations)) {
    req.body.variations = req.body.variations.map((v) => ({
      ...v,
      attributes: v.attributes && typeof v.attributes === "object" && !(v.attributes instanceof Map)
        ? new Map(Object.entries(v.attributes))
        : v.attributes,
    }));
  }

  // Auto-compute inStock from stock
  if (req.body.stock !== undefined) {
    req.body.inStock = Number(req.body.stock) > 0;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: product,
  });
});

// Delete product
exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("Produit non trouvé", 400));
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Produit non trouvé", 404));
  }
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.uploader.destroy(product.images[i].public_id);
  }
  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "Produit supprimé",
  });
});

// Get all products (admin)
exports.getAllProducts = catchAsyncError(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  const data = products.map((item) => ({
    id: item._id,
    _id: item._id,
    name: item.name,
    brand: item.brand,
    price: item.price,
    oldPrice: item.oldPrice,
    image: item.images[0]?.url || "",
    images: item.images,
    description: item.description,
    category: item.category,
    subcategory: item.subcategory,
    famille: item.famille || "",
    stock: item.stock,
    inStock: item.inStock,
    refFabricant: item.refFabricant || "",
    codeEAN: item.codeEAN || "",
    normes: item.normes || "",
    productType: item.productType || "simple",
    variations: item.variations ? item.variations.map((v) => ({
      ...v.toObject(),
      attributes: v.attributes ? Object.fromEntries(v.attributes) : {},
    })) : [],
    documents: item.documents || [],
    shipping: item.shipping,
    featured: item.featured,
    rating: item.rating,
    numberOfReviews: item.numberOfReviews,
    discountPercentage: item.discountPercentage,
    isOffer: item.isOffer,
    badge: item.badge,
    specs: item.specs ? Object.fromEntries(item.specs) : {},
  }));
  res.status(200).json({ success: true, data });
});

// Get all products (public client with search/filter)
exports.getAllProductsFromClient = catchAsyncError(async (req, res) => {
  const { category, search, featured } = req.query;
  let filter = {};
  if (category) filter.category = category;
  if (featured === "true") filter.featured = true;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  const products = await Product.find(filter).sort({ createdAt: -1 });
  const data = products.map((item) => ({
    id: item._id,
    _id: item._id,
    name: item.name,
    brand: item.brand,
    price: item.price,
    oldPrice: item.oldPrice,
    image: item.images[0]?.url || "",
    images: item.images,
    description: item.description,
    category: item.category,
    subcategory: item.subcategory,
    famille: item.famille || "",
    stock: item.stock,
    inStock: item.inStock,
    refFabricant: item.refFabricant || "",
    codeEAN: item.codeEAN || "",
    normes: item.normes || "",
    productType: item.productType || "simple",
    variations: item.variations ? item.variations.map((v) => ({
      ...v.toObject(),
      attributes: v.attributes ? Object.fromEntries(v.attributes) : {},
    })) : [],
    documents: item.documents || [],
    shipping: item.shipping,
    featured: item.featured,
    rating: item.rating,
    numberOfReviews: item.numberOfReviews,
    discountPercentage: item.discountPercentage,
    isOffer: item.isOffer,
    badge: item.badge,
    specs: item.specs ? Object.fromEntries(item.specs) : {},
  }));
  res.status(200).json({ success: true, data });
});

// Get single product
exports.getSingleProduct = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("Produit non trouvé", 400));
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Produit non trouvé", 404));
  }
  const productObj = product.toObject();
  res.status(200).json({
    success: true,
    data: {
      ...productObj,
      id: product._id,
      image: product.images[0]?.url || "",
      specs: product.specs ? Object.fromEntries(product.specs) : {},
      variations: product.variations ? product.variations.map((v) => ({
        ...v.toObject(),
        attributes: v.attributes ? Object.fromEntries(v.attributes) : {},
      })) : [],
      documents: product.documents || [],
    },
  });
});

// Create product review
exports.createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId, name, email } = req.body;
  if (!rating || !comment || !productId || !name || !email) {
    return next(new ErrorHandler("Requête invalide", 400));
  }
  const review = { name, email, rating: Number(rating), comment };
  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorHandler("Produit non trouvé", 404));
  }
  const isReviewed = product.reviews.some((rev) => rev.email === email);
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.email === email) {
        rev.name = name;
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    product.reviews.push(review);
    product.numberOfReviews = product.reviews.length;
  }
  let avg = 0;
  product.reviews.forEach((rev) => { avg += rev.rating; });
  product.rating = avg / product.reviews.length;
  await product.save({ validateBeforeSave: false });
  res.status(200).json({ success: true, message: "Avis ajouté" });
});

// Get all reviews for a product
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("Produit non trouvé", 400));
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Produit non trouvé", 404));
  }
  res.status(200).json({ success: true, data: product.reviews });
});

// Get all reviews across all products (admin)
exports.getAllProductReviews = catchAsyncError(async (req, res, next) => {
  const products = await Product.find({});
  const allReviews = [];
  products.forEach((product) => {
    if (product.reviews && product.reviews.length > 0) {
      product.reviews.forEach((review) => {
        allReviews.push({
          _id: review._id,
          name: review.name,
          email: review.email,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt || product.createdAt,
          productId: product._id,
          productName: product.name,
        });
      });
    }
  });
  allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.status(200).json({ success: true, reviews: allReviews });
});

// Delete product review
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  if (!req.params.id) {
    return next(new ErrorHandler("Produit non trouvé", 400));
  }
  const { reviewId } = req.body;
  if (!reviewId) {
    return next(new ErrorHandler("Avis non trouvé", 400));
  }
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Produit non trouvé", 404));
  }
  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== reviewId.toString()
  );
  let avg = 0;
  reviews.forEach((rev) => { avg += rev.rating; });
  const rating = reviews.length > 0 ? avg / reviews.length : 0;
  await Product.findByIdAndUpdate(req.params.id, {
    rating,
    numberOfReviews: reviews.length,
    reviews,
  }, { new: true, runValidators: true });
  res.status(200).json({ success: true, message: "Avis supprimé" });
});
