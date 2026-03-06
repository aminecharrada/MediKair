const mongoose = require("mongoose");

const platformReviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
    },
    rating: {
      type: Number,
      required: [true, "Please enter a rating"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Please enter a comment"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformReview", platformReviewSchema);
