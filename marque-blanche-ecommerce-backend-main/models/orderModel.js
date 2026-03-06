const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // ── Auto-generated order reference (CDC §2.4) ─────────────
  orderNumber: {
    type: String,
    unique: true,
    // Auto-generated in pre-save: "MK-2025-00001"
  },

  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'Tunisie',
    },
    pinCode: {
      type: String,
      default: '',
    },
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
      },
    },
  ],
  client: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    required: true,
  },
  paymentInfo: {
    id: {
      type: String,
      default: 'COD',
    },
    status: {
      type: String,
      default: 'En attente',
    },
    method: {
      type: String,
      enum: ['cod', 'card', 'transfer', 'cheque'],
      default: 'cod',
    },
  },
  paidAt: {
    type: Date,
    required: false,
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    required: true,
    default: 'En attente',
  },
  deliveredAt: Date,

  // ── B2B Hierarchical validation (CDC §2.4) ────────────────
  validationStatus: {
    type: String,
    enum: ['auto-approved', 'pending-validation', 'approved', 'rejected'],
    default: 'auto-approved',
  },
  validatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    default: null,
  },
  validatedAt: Date,

  // ── Internal notes ────────────────────────────────────────
  notes: { type: String, default: '' },

  // ── Order source ──────────────────────────────────────────
  source: {
    type: String,
    enum: ['web', 'csv-import', 'reorder', 'api'],
    default: 'web',
  },

  // ── Status history for audit trail ────────────────────────
  statusHistory: [
    {
      status: String,
      date: { type: Date, default: Date.now },
      by: String, // admin email or "system"
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate orderNumber before save
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `MK-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  // Push initial status to history if new
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: this.orderStatus,
      date: new Date(),
      by: 'system',
    });
  }
  next();
});

// Index for client lookup & date sorting
orderSchema.index({ client: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
