const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.ObjectId,
    ref: "Client",
    required: true,
  },
  type: {
    type: String,
    enum: ["order", "stock", "promo", "delivery", "system", "ai-suggestion"],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast client-specific queries sorted by date
notificationSchema.index({ client: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
