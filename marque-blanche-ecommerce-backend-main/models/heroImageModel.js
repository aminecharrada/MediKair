const mongoose = require("mongoose");

const heroImageSchema = mongoose.Schema({
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  title: {
    type: String,
    default: "",
  },
  titleAr: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  subtitleAr: {
    type: String,
    default: "",
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("HeroImage", heroImageSchema);
