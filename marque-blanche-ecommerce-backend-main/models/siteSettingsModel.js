const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema({
    // ── Général ─────────────────────────────────────────────
    storeName: { type: String, default: "MediKair" },
    storeEmail: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    currency: { type: String, default: "TND" },
    address: { type: String, default: "" },
    maintenanceMode: { type: Boolean, default: false },

    // ── Notifications ───────────────────────────────────────
    notifyOrders: { type: Boolean, default: true },
    notifyStock: { type: Boolean, default: true },
    notifyNewClients: { type: Boolean, default: true },
    notifyAI: { type: Boolean, default: false },
    notificationEmail: { type: String, default: "" },

    // ── Paiement ────────────────────────────────────────────
    paymentMethods: {
        virement: { type: Boolean, default: true },
        carte: { type: Boolean, default: false },
        cheque: { type: Boolean, default: true },
        cod: { type: Boolean, default: true },
    },
    bankInfo: {
        rib: { type: String, default: "" },
        bank: { type: String, default: "" },
        iban: { type: String, default: "" },
    },

    // ── Livraison ───────────────────────────────────────────
    shippingZones: [
        {
            name: String,
            delay: String,
            price: Number,
        },
    ],
    defaultCarrier: { type: String, default: "Rapid Poste" },
    freeShippingThreshold: { type: Number, default: 500 },

    // ── Sécurité ────────────────────────────────────────────
    require2FA: { type: Boolean, default: false },
    hierarchicalValidation: { type: Boolean, default: false },
    validationThreshold: { type: Number, default: 5000 },
    auditLogs: { type: Boolean, default: true },
    ipRestriction: { type: Boolean, default: false },

    // ── Offer timer (existant) ──────────────────────────────
    offerTimerEnd: {
        type: Date,
        default: () => new Date(Date.now() + 48 * 60 * 60 * 1000),
    },

    admin: {
        type: mongoose.Schema.ObjectId,
        ref: "Admin",
    },
}, { timestamps: true });

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
