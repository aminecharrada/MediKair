/**
 * Bulk-sync all MongoDB products → Meilisearch index.
 * Usage:  node sync-meilisearch.js
 *
 * Reads all products from MongoDB, transforms them, and indexes
 * them into Meilisearch in batches.  Safe to re-run at any time.
 */
require("dotenv").config();

const connectToDb = require("./config/db");
const Product = require("./models/productModel");
const { getIndex, configureIndex, transformProduct } = require("./config/meilisearch");

const BATCH_SIZE = 500;

async function sync() {
  console.log("🔄 Connecting to MongoDB…");
  await connectToDb();

  console.log("🔧 Configuring Meilisearch index…");
  await configureIndex();

  const index = getIndex();

  const totalProducts = await Product.countDocuments();
  console.log(`📦 Found ${totalProducts} products in MongoDB`);

  if (totalProducts === 0) {
    console.log("Nothing to sync – exiting.");
    process.exit(0);
  }

  let offset = 0;
  let indexed = 0;

  while (offset < totalProducts) {
    const batch = await Product.find()
      .skip(offset)
      .limit(BATCH_SIZE)
      .lean();

    const docs = batch.map(transformProduct);
    const { taskUid } = await index.addDocuments(docs);
    indexed += docs.length;
    console.log(`  ↳ Indexed ${indexed}/${totalProducts}  (task ${taskUid})`);
    offset += BATCH_SIZE;
  }

  console.log("✅ Sync complete! Waiting for Meilisearch to finish processing…");

  // Wait a bit for tasks to settle
  await new Promise((r) => setTimeout(r, 2000));

  const stats = await index.getStats();
  console.log(`📊 Index stats: ${stats.numberOfDocuments} documents indexed`);
  process.exit(0);
}

sync().catch((err) => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
