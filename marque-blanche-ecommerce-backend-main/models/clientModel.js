const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Veuillez fournir un nom'],
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    minLength: [2, 'Le nom doit contenir au moins 2 caractères'],
  },
  email: {
    type: String,
    required: [true, 'Veuillez fournir un email'],
    unique: true,
    validate: [validator.isEmail, 'Veuillez fournir un email valide'],
  },
  password: {
    type: String,
    required: [true, 'Veuillez fournir un mot de passe'],
    minLength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false,
  },
  phone: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  cabinet: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },

  // ── B2B Role (CDC §2.1) ──────────────────────────────────
  role: {
    type: String,
    enum: ['dentiste', 'assistant', 'clinique', 'laboratoire'],
    default: 'dentiste',
  },

  // ── Structure professionnelle ─────────────────────────────
  structure: {
    type: { type: String, enum: ['cabinet', 'clinique', 'centre', 'hôpital'], default: 'cabinet' },
    name: { type: String, default: '' },
    siret: { type: String, default: '' },
    tvaIntracom: { type: String, default: '' },
    adressePro: { type: String, default: '' },
  },

  // ── Clinique multi-utilisateurs : parent account ──────────
  parentClient: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    default: null,
  },

  // ── Validation hiérarchique B2B ───────────────────────────
  validationRequired: { type: Boolean, default: false },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'Client',
    default: null,
  },

  // ── Favoris & préférences ─────────────────────────────────
  favorites: [{ type: mongoose.Schema.ObjectId, ref: 'Product' }],
  preferredPayment: {
    type: String,
    enum: ['cod', 'card', 'transfer', 'cheque'],
    default: 'cod',
  },

  // ── Notification preferences ──────────────────────────────
  notificationPrefs: {
    email: { type: Boolean, default: true },
    stock: { type: Boolean, default: true },
    promotions: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
  },

  // ── Segmentation IA (rempli par le module IA, Phase 10-11) ─
  segment: { type: String, default: '' },
  churnRisk: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
clientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Generate JWT token
clientSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id, role: 'client' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Compare passwords
clientSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Client', clientSchema);
