const { MeiliSearch } = require("meilisearch");

const MEILI_HOST = process.env.MEILI_HOST || "http://127.0.0.1:7700";
const MEILI_API_KEY = process.env.MEILI_API_KEY || ""; // empty for local dev

const meili = new MeiliSearch({
  host: MEILI_HOST,
  apiKey: MEILI_API_KEY,
});

const INDEX_NAME = "products";

// ── Medical / Dental Synonyms ────────────────────────────────────────
const MEDICAL_SYNONYMS = {
  // Materials
  composite: ["résine", "resine", "filling"],
  céramique: ["ceramique", "ceramic", "porcelaine", "porcelain"],
  zircone: ["zirconia", "zircon"],
  titane: ["titanium"],
  // Instruments
  fraise: ["bur", "foret"],
  détartreur: ["scaler", "detartreur"],
  turbine: ["handpiece", "contre-angle"],
  seringue: ["syringe"],
  // Procedures
  endodontie: ["endo", "canal", "root canal"],
  orthodontie: ["ortho", "orthodontics"],
  implant: ["implantologie", "implantology"],
  prothèse: ["prothese", "prosthesis", "crown", "couronne"],
  // Products
  gants: ["gloves", "gant"],
  masque: ["mask", "masques"],
  ciment: ["cement", "scellement"],
  adhésif: ["adhesif", "bonding", "adhesive"],
  empreinte: ["impression", "alginate"],
  stérilisation: ["sterilisation", "autoclave"],
  // General
  dentaire: ["dental"],
  médical: ["medical", "médecin"],
  chirurgical: ["surgical", "chirurgie"],
};

/**
 * Configure the Meilisearch products index with searchable attributes,
 * filterable attributes, sortable attributes, typo tolerance & synonyms.
 */
async function configureIndex() {
  try {
    // Create or get index
    await meili.createIndex(INDEX_NAME, { primaryKey: "id" }).catch(() => {});
    const index = meili.index(INDEX_NAME);

    // Searchable attributes — order matters (higher = more relevant)
    await index.updateSearchableAttributes([
      "name",
      "refFabricant",
      "codeEAN",
      "brand",
      "description",
      "category",
      "subcategory",
      "famille",
      "normes",
      "specsText",       // flattened specs map
      "productType",
    ]);

    // Filterable for faceted search
    await index.updateFilterableAttributes([
      "brand",
      "category",
      "subcategory",
      "famille",
      "price",
      "inStock",
      "isOffer",
      "discountPercentage",
      "rating",
      "productType",
      "badge",
      "featured",
    ]);

    // Sortable
    await index.updateSortableAttributes([
      "price",
      "rating",
      "name",
      "createdAt",
    ]);

    // Typo tolerance (enabled by default, but let's be explicit)
    await index.updateTypoTolerance({
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 4,
        twoTypos: 8,
      },
    });

    // Medical synonyms
    await index.updateSynonyms(MEDICAL_SYNONYMS);

    // Ranking rules — default + custom
    await index.updateRankingRules([
      "words",
      "typo",
      "proximity",
      "attribute",
      "sort",
      "exactness",
    ]);

    // Pagination: allow up to 1000 results
    await index.updatePagination({ maxTotalHits: 1000 });

    console.log("✅ Meilisearch index configured successfully");
    return index;
  } catch (err) {
    console.error("⚠️  Meilisearch configuration failed:", err.message);
    return null;
  }
}

/**
 * Transform a Mongoose product document into a flat object for Meilisearch.
 */
function transformProduct(product) {
  const doc = product.toObject ? product.toObject() : product;

  // Flatten specs Map → "key: value, key: value"
  let specsText = "";
  if (doc.specs) {
    const entries = doc.specs instanceof Map
      ? [...doc.specs.entries()]
      : Object.entries(doc.specs);
    specsText = entries.map(([k, v]) => `${k}: ${v}`).join(", ");
  }

  return {
    id: doc._id.toString(),
    name: doc.name || "",
    description: doc.description || "",
    brand: doc.brand || "",
    category: doc.category || "",
    subcategory: doc.subcategory || "",
    famille: doc.famille || "",
    refFabricant: doc.refFabricant || "",
    codeEAN: doc.codeEAN || "",
    normes: doc.normes || "",
    productType: doc.productType || "",
    badge: doc.badge || "",
    specsText,
    price: doc.price || 0,
    oldPrice: doc.oldPrice || null,
    stock: doc.stock || 0,
    inStock: !!doc.inStock,
    rating: doc.rating || 0,
    numberOfReviews: doc.numberOfReviews || 0,
    discountPercentage: doc.discountPercentage || 0,
    isOffer: !!doc.isOffer,
    featured: !!doc.featured,
    image: doc.images && doc.images[0] ? doc.images[0].url : "",
    images: (doc.images || []).map((img) => ({ url: img.url, public_id: img.public_id })),
    createdAt: doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now(),
  };
}

/**
 * Get the Meilisearch client instance.
 */
function getClient() {
  return meili;
}

/**
 * Get the products index.
 */
function getIndex() {
  return meili.index(INDEX_NAME);
}

module.exports = {
  getClient,
  getIndex,
  configureIndex,
  transformProduct,
  INDEX_NAME,
  MEDICAL_SYNONYMS,
};
