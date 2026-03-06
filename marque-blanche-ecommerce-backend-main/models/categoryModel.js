const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter category name"],
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
  image: {
    public_id: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
  },
  // ── Hierarchical levels (CDC §2.2) ─────────────────────────
  // 1 = catégorie, 2 = sous-catégorie, 3 = famille
  level: {
    type: Number,
    enum: [1, 2, 3],
    default: 1,
  },
  parent: {
    type: mongoose.Schema.ObjectId,
    ref: "Category",
    default: null,
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

// Auto-generate slug from name before save
categorySchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Index for child lookups
categorySchema.index({ parent: 1 });

// Virtual to populate children
categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent",
});

// Ensure virtuals are included in JSON/Object output
categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Category", categorySchema);
