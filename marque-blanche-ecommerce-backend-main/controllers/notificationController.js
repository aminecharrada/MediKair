const Notification = require("../models/notificationModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncError = require("../middleware/CatchAsyncErrors");

// Get my notifications (client)
exports.getMyNotifications = catchAsyncError(async (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const filter = { client: req.user.id };
  if (req.query.unread === "true") filter.read = false;

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ client: req.user.id, read: false });
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// Mark one notification as read
exports.markAsRead = catchAsyncError(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    client: req.user.id,
  });

  if (!notification) {
    return next(new ErrorHandler("Notification introuvable", 404));
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// Mark all notifications as read
exports.markAllAsRead = catchAsyncError(async (req, res, next) => {
  await Notification.updateMany(
    { client: req.user.id, read: false },
    { $set: { read: true } }
  );

  res.status(200).json({
    success: true,
    message: "Toutes les notifications marquees comme lues",
  });
});

// Delete a notification
exports.deleteNotification = catchAsyncError(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    client: req.user.id,
  });

  if (!notification) {
    return next(new ErrorHandler("Notification introuvable", 404));
  }

  await Notification.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Notification supprimee",
  });
});

// Utility: create notification (used by other controllers)
exports.createNotification = async (clientId, type, title, message, link = "") => {
  try {
    return await Notification.create({ client: clientId, type, title, message, link });
  } catch (e) {
    console.error("Notification creation failed:", e.message);
    return null;
  }
};
