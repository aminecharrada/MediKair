const mongoose = require('mongoose');

// Tiered pricing row: minQty → discountPercent
const tierSchema = new mongoose.Schema(
  {
    minQty: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
  },
  { _id: false }
);

// Bundle rule: buy X of a product/category → get Y free
const bundleRuleSchema = new mongoose.Schema(
  {
    buyQty: { type: Number, required: true },
    buyTarget: { type: String, default: '' },       // product name or category
    buyTargetType: { type: String, enum: ['product', 'category'], default: 'category' },
    getQty: { type: Number, required: true },
    getTarget: { type: String, default: '' },        // what is offered (defaults to same)
  },
  { _id: false }
);

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Veuillez fournir un nom de promotion'],
  },

  // ── Offer type (Rule Engine) ────────────────────────────────────
  offerType: {
    type: String,
    enum: ['simple', 'volume', 'bundle'],
    default: 'simple',
  },

  // ── Simple discount fields ──────────────────────────────────────
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'bogo', 'freeShipping'],
    default: 'percentage',
  },
  discount: {
    type: Number,
    default: 0,
  },

  // ── Volume / tiered pricing ─────────────────────────────────────
  tiers: [tierSchema],

  // ── Bundle / BOGO ───────────────────────────────────────────────
  bundleRule: bundleRuleSchema,

  // ── Targeting (B2B advanced) ────────────────────────────────────
  segmentClient: {
    type: String,
    default: '',
  },
  typeStructure: {
    type: String,
    default: '',
  },
  groupeSpecifique: {
    type: String,
    default: '',
  },

  code: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
  ],
  categories: [
    {
      type: String,
    },
  ],
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  maxUses: {
    type: Number,
    default: 0,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: 'Admin',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Promotion', promotionSchema);
