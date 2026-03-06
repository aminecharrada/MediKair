/**
 * migrate-phase2.js — Upgrade existing data for Phase 2 B2B models
 *
 * This script:
 * 1. Sets level=1 and generates slugs for existing categories
 * 2. Generates orderNumbers for existing orders + adds initial statusHistory
 * 3. Sets default B2B fields on existing clients
 * 4. Creates default SiteSettings (full model) if none exists
 *
 * Run: node migrate-phase2.js
 */

require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

async function migrate() {
  await connectDB();
  console.log("✅ Connected to DB\n");

  // ── 1. Categories: add level=1, slug, isActive ───────────
  const Category = require("./models/categoryModel");
  const categories = await Category.find({ level: { $exists: false } });
  if (categories.length > 0) {
    console.log(`📂 Migrating ${categories.length} categories...`);
    for (const cat of categories) {
      cat.level = 1;
      cat.isActive = true;
      cat.order = 0;
      // slug auto-generated in pre-save
      await cat.save();
      console.log(`  ✓ ${cat.name} → slug: ${cat.slug}`);
    }
  } else {
    console.log("📂 Categories: already migrated or none found.");
  }

  // ── 2. Orders: add orderNumber + statusHistory ────────────
  const Order = require("./models/orderModel");
  const orders = await Order.find({ orderNumber: { $exists: false } });
  if (orders.length > 0) {
    console.log(`\n📦 Migrating ${orders.length} orders...`);
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const year = new Date(order.createdAt).getFullYear();
      order.orderNumber = `MK-${year}-${String(i + 1).padStart(5, "0")}`;
      order.validationStatus = "auto-approved";
      order.source = "web";
      if (!order.statusHistory || order.statusHistory.length === 0) {
        order.statusHistory = [
          { status: order.orderStatus, date: order.createdAt, by: "system" },
        ];
      }
      await order.save();
      console.log(`  ✓ ${order.orderNumber}`);
    }
  } else {
    console.log("\n📦 Orders: already migrated or none found.");
  }

  // ── 3. Clients: set default B2B fields ────────────────────
  const Client = require("./models/clientModel");
  const clients = await Client.find({ role: { $exists: false } });
  if (clients.length > 0) {
    console.log(`\n👤 Migrating ${clients.length} clients...`);
    await Client.updateMany(
      { role: { $exists: false } },
      {
        $set: {
          role: "dentiste",
          validationRequired: false,
          favorites: [],
          preferredPayment: "cod",
          notificationPrefs: {
            email: true,
            stock: true,
            promotions: true,
            newsletter: false,
          },
          segment: "",
          churnRisk: 0,
          lastActivity: new Date(),
        },
      }
    );
    console.log(`  ✓ Updated ${clients.length} clients with B2B defaults`);
  } else {
    console.log("\n👤 Clients: already migrated or none found.");
  }

  // ── 4. SiteSettings: ensure full model ────────────────────
  const SiteSettings = require("./models/siteSettingsModel");
  const existing = await SiteSettings.findOne();
  if (existing) {
    // Add new fields with defaults if missing
    let needsSave = false;
    if (!existing.storeName) { existing.storeName = "MediKair"; needsSave = true; }
    if (existing.paymentMethods === undefined) {
      existing.paymentMethods = { virement: true, carte: false, cheque: true, cod: true };
      needsSave = true;
    }
    if (existing.freeShippingThreshold === undefined) {
      existing.freeShippingThreshold = 500;
      needsSave = true;
    }
    if (needsSave) {
      await existing.save();
      console.log("\n⚙️  SiteSettings: updated with new defaults");
    } else {
      console.log("\n⚙️  SiteSettings: already up to date");
    }
  } else {
    console.log("\n⚙️  SiteSettings: no existing document found (will be created on first access)");
  }

  // ── 5. Admin: update privilege enum ───────────────────────
  const Admin = require("./models/adminModel");
  const admins = await Admin.find();
  console.log(`\n🔑 Admins: ${admins.length} found`);
  for (const admin of admins) {
    // Ensure lastLogin and mfaEnabled exist
    let needsSave = false;
    if (admin.mfaEnabled === undefined) { admin.mfaEnabled = false; needsSave = true; }
    if (needsSave) {
      await admin.save();
      console.log(`  ✓ Updated admin: ${admin.email}`);
    }
  }

  console.log("\n🎉 Migration complete!");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration error:", err);
  process.exit(1);
});
