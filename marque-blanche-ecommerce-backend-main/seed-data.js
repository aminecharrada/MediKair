require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Category = require('./models/categoryModel');

const categories = [
  { name: "orthodontie", image: { public_id: "cat_orthodontie", url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=400&fit=crop" }},
  { name: "implantologie", image: { public_id: "cat_implantologie", url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=400&fit=crop" }},
  { name: "endodontie", image: { public_id: "cat_endodontie", url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop" }},
  { name: "hygiene", image: { public_id: "cat_hygiene", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop" }},
  { name: "consommables", image: { public_id: "cat_consommables", url: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=400&fit=crop" }},
  { name: "equipement", image: { public_id: "cat_equipement", url: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=400&h=400&fit=crop" }},
];

const products = [
  {
    name: "Composite Universel Nano-Hybride",
    brand: "DentaPro",
    category: "consommables",
    subcategory: "Composites",
    price: 42.50,
    oldPrice: 49.90,
    images: [{ public_id: "medikair/composite_nano", url: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=400&fit=crop" }],
    rating: 4.8,
    stock: 150,
    inStock: true,
    featured: true,
    description: "Composite nano-hybride universel pour restaurations antérieures et postérieures. Excellente polissabilité et résistance mécanique.",
    specs: new Map([["Teinte", "A2"], ["Conditionnement", "Seringue 4g"], ["Norme", "ISO 4049"], ["Polymérisation", "Light-cure"]]),
    badge: "Promo",
  },
  {
    name: "Kit Fraises Diamantées FG",
    brand: "MediDrill",
    category: "consommables",
    subcategory: "Fraises",
    price: 34.00,
    images: [{ public_id: "medikair/fraises_fg", url: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop" }],
    rating: 4.6,
    stock: 200,
    inStock: true,
    featured: true,
    description: "Kit de 10 fraises diamantées turbine FG, grain moyen. Idéal pour la préparation cavitaire.",
    specs: new Map([["Quantité", "10 pcs"], ["Grain", "Moyen"], ["Tige", "FG 1.6mm"], ["Matériau", "Diamant naturel"]]),
  },
  {
    name: "Autoclave Classe B 18L",
    brand: "SterilMax",
    category: "equipement",
    subcategory: "Stérilisation",
    price: 3890.00,
    oldPrice: 4250.00,
    images: [{ public_id: "medikair/autoclave_b18", url: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=400&h=400&fit=crop" }],
    rating: 4.9,
    stock: 12,
    inStock: true,
    featured: true,
    description: "Autoclave classe B avec séchage sous vide. 18 litres, cycles programmables, imprimante intégrée.",
    specs: new Map([["Capacité", "18L"], ["Classe", "B (EN 13060)"], ["Cycles", "6 programmes"], ["Écran", "LCD tactile"]]),
    badge: "Best-seller",
  },
  {
    name: "Gants Nitrile Non Poudrés",
    brand: "SafeHand",
    category: "hygiene",
    subcategory: "Protection",
    price: 8.90,
    images: [{ public_id: "medikair/gants_nitrile", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop" }],
    rating: 4.5,
    stock: 500,
    inStock: true,
    featured: true,
    description: "Gants d'examen en nitrile non poudrés. Boîte de 100. Excellente sensibilité tactile.",
    specs: new Map([["Taille", "M"], ["Quantité", "100/boîte"], ["Matériau", "Nitrile"], ["Norme", "EN 455"]]),
  },
  {
    name: "Implant Conique Ti Grade 5",
    brand: "ImplantPro",
    category: "implantologie",
    subcategory: "Implants",
    price: 189.00,
    images: [{ public_id: "medikair/implant_conique", url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=400&fit=crop" }],
    rating: 4.9,
    stock: 80,
    inStock: true,
    featured: false,
    description: "Implant conique en titane grade 5 avec surface SLA. Connexion interne hexagonale.",
    specs: new Map([["Diamètre", "4.0mm"], ["Longueur", "10mm"], ["Surface", "SLA"], ["Connexion", "Hex interne"]]),
    badge: "Nouveau",
  },
  {
    name: "Limes Endodontiques NiTi Rotatives",
    brand: "EndoFlex",
    category: "endodontie",
    subcategory: "Limes",
    price: 62.00,
    images: [{ public_id: "medikair/limes_niti", url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop" }],
    rating: 4.7,
    stock: 0,
    inStock: false,
    featured: false,
    description: "Limes rotatives en nickel-titane avec mémoire de forme. Séquence de 6 instruments.",
    specs: new Map([["Séquence", "6 limes"], ["Alliage", "NiTi CM Wire"], ["Conicité", ".04 - .06"], ["ISO", "15-40"]]),
  },
  {
    name: "Brackets Métalliques MBT",
    brand: "OrthoLine",
    category: "orthodontie",
    subcategory: "Brackets",
    price: 78.00,
    images: [{ public_id: "medikair/brackets_mbt", url: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=400&fit=crop" }],
    rating: 4.4,
    stock: 60,
    inStock: true,
    featured: false,
    description: "Brackets métalliques prescription MBT .022. Kit complet 5-5 supérieur et inférieur.",
    specs: new Map([["Prescription", "MBT"], ["Slot", ".022"], ["Kit", "20 brackets"], ["Base", "Micro-gravée"]]),
  },
  {
    name: "Adhésif Dentaire Light-Cure",
    brand: "BondMax",
    category: "consommables",
    subcategory: "Adhésifs",
    price: 56.00,
    oldPrice: 65.00,
    images: [{ public_id: "medikair/adhesif_lc", url: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop" }],
    rating: 4.7,
    stock: 90,
    inStock: true,
    featured: false,
    description: "Adhésif universel mono-composant. Compatible avec tous les substrats dentaires.",
    specs: new Map([["Type", "Universel"], ["Conditionnement", "Flacon 5ml"], ["Polymérisation", "Light-cure"], ["Mode", "Etch & Rinse / Self-etch"]]),
    badge: "IA Recommandé",
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB');

    // Get admin for product ownership
    const Admin = require('./models/adminModel');
    const admin = await Admin.findOne();
    if (!admin) {
      console.error('❌ No admin found. Run seed-admin.js first.');
      process.exit(1);
    }
    console.log(`📋 Using admin: ${admin.email} (${admin._id})`);

    // Seed categories
    await Category.deleteMany({});
    const createdCats = await Category.insertMany(categories);
    console.log(`✅ ${createdCats.length} categories seeded`);

    // Seed products with admin reference
    await Product.deleteMany({});
    const productsWithAdmin = products.map(p => ({ ...p, admin: admin._id }));
    const createdProducts = await Product.insertMany(productsWithAdmin);
    console.log(`✅ ${createdProducts.length} products seeded`);

    // Print summary
    console.log('\n📊 Database Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    createdProducts.forEach(p => {
      console.log(`  ${p.inStock ? '🟢' : '🔴'} ${p.name} — ${p.price} TND [${p.category}]`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seed();
