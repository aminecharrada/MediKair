const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncError = require('../middleware/CatchAsyncErrors');
const cloudinary = require('../config/cloudinary');

exports.uploadImage = catchAsyncError(async (req, res, next) => {
  const { image } = req.body;
  if (!image) {
    return next(new ErrorHandler('Invalid request', 400));
  }
  const { public_id, url } = await cloudinary.uploader.upload(image, {
    folder: 'profile-images',
  });
  res.status(200).json({
    success: true,
    data: {
      public_id,
      url,
    },
  });
});

// Upload document (PDF, etc.) to Cloudinary as raw resource
exports.uploadDocument = catchAsyncError(async (req, res, next) => {
  const { document, fileName } = req.body;
  if (!document) {
    return next(new ErrorHandler('Invalid request - no document provided', 400));
  }
  const result = await cloudinary.uploader.upload(document, {
    folder: 'medikair-documents',
    resource_type: 'raw',
    public_id: fileName ? fileName.replace(/\.[^/.]+$/, '') : undefined,
  });
  res.status(200).json({
    success: true,
    data: {
      public_id: result.public_id,
      url: result.secure_url || result.url,
    },
  });
});
