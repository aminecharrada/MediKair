const mongoose = require("mongoose");

// ── Variation schema for variable products (SKUs) ────────────────────
const variationSchema = mongoose.Schema({
  attributes: {
    type: Map,
    of: String,
    default: {},
    // e.g. { "Taille": "M", "Couleur": "Bleu" }
  },
  price: {
    type: Number,
    required: [true, "Le prix de la variation est requis"],
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  sku: {
    type: String,
    default: "",
  },
  ean: {
    type: String,
    default: "",
  },
});

// ── Technical document schema ────────────────────────────────────────
const documentSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "FDS",             // Fiche de Données de Sécurité
      "Manuel",          // Manuel d'utilisation
      "Certificat CE",   // Certificat CE
      "Fiche Technique", // Fiche technique
      "Autre",
    ],
    default: "Autre",
  },
  url: { type: String, required: true },
  public_id: { type: String, default: "" },
});

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Veuillez entrer le nom du produit"],
  },
  description: {
    type: String,
    default: "",
  },
  brand: {
    type: String,
    default: "",
  },

  // ── Pricing (used for "Simple" products) ───────────────────────────
  price: {
    type: Number,
    required: [true, "Veuillez entrer le prix du produit"],
  },
  oldPrice: {
    type: Number,
    default: null,
  },

  rating: {
    type: Number,
    default: 0,
  },

  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],

  // ── 3-Level Taxonomy ───────────────────────────────────────────────
  category: {
    type: String,
    required: [true, "Veuillez entrer la catégorie du produit"],
  },
  subcategory: {
    type: String,
    default: "",
  },
  famille: {
    type: String,
    default: "",
  },

  // ── Inventory & Identifiers ────────────────────────────────────────
  stock: {
    type: Number,
    required: [true, "Veuillez entrer le stock du produit"],
    min: 0,
    default: 0,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  refFabricant: {
    type: String,
    default: "",
  },
  codeEAN: {
    type: String,
    default: "",
  },
  normes: {
    type: String,
    default: "",
    // e.g. "ISO 13485, CE 0297"
  },

  // ── Product type: simple vs variable ───────────────────────────────
  productType: {
    type: String,
    enum: ["simple", "variable"],
    default: "simple",
  },
  variations: [variationSchema],

  // ── Technical documents (FDS, manuals, CE certs) ───────────────────
  documents: [documentSchema],

  specs: {
    type: Map,
    of: String,
    default: {},
  },
  badge: {
    type: String,
    default: "",
  },
  numberOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  shipping: {
    type: Boolean,
    default: false,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  isOffer: {
    type: Boolean,
    default: false,
  },
  admin: {
    type: mongoose.Schema.ObjectId,
    ref: "Admin",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-compute inStock from stock quantity before saving
productSchema.pre("save", function (next) {
  if (this.productType === "variable" && this.variations.length > 0) {
    const totalVariationStock = this.variations.reduce((sum, v) => sum + (v.stock || 0), 0);
    this.inStock = totalVariationStock > 0;
    this.stock = totalVariationStock;
  } else {
    this.inStock = this.stock > 0;
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
