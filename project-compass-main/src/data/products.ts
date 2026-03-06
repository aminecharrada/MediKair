export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number;
  inStock: boolean;
  description: string;
  specs: Record<string, string>;
  badge?: string;
}

export const categories = [
  { id: "orthodontie", label: "Orthodontie", icon: "🦷" },
  { id: "implantologie", label: "Implantologie", icon: "🔩" },
  { id: "endodontie", label: "Endodontie", icon: "🩺" },
  { id: "hygiene", label: "Hygiène & Stérilisation", icon: "🧴" },
  { id: "consommables", label: "Consommables", icon: "📦" },
  { id: "equipement", label: "Équipement", icon: "⚙️" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Composite Universel Nano-Hybride",
    brand: "DentaPro",
    category: "consommables",
    subcategory: "Composites",
    price: 42.50,
    oldPrice: 49.90,
    image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=400&fit=crop",
    rating: 4.8,
    inStock: true,
    description: "Composite nano-hybride universel pour restaurations antérieures et postérieures. Excellente polissabilité et résistance mécanique.",
    specs: { "Teinte": "A2", "Conditionnement": "Seringue 4g", "Norme": "ISO 4049", "Polymérisation": "Light-cure" },
    badge: "Promo",
  },
  {
    id: "2",
    name: "Kit Fraises Diamantées FG",
    brand: "MediDrill",
    category: "consommables",
    subcategory: "Fraises",
    price: 34.00,
    image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop",
    rating: 4.6,
    inStock: true,
    description: "Kit de 10 fraises diamantées turbine FG, grain moyen. Idéal pour la préparation cavitaire.",
    specs: { "Quantité": "10 pcs", "Grain": "Moyen", "Tige": "FG 1.6mm", "Matériau": "Diamant naturel" },
  },
  {
    id: "3",
    name: "Autoclave Classe B 18L",
    brand: "SterilMax",
    category: "equipement",
    subcategory: "Stérilisation",
    price: 3890.00,
    oldPrice: 4250.00,
    image: "https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=400&h=400&fit=crop",
    rating: 4.9,
    inStock: true,
    description: "Autoclave classe B avec séchage sous vide. 18 litres, cycles programmables, imprimante intégrée.",
    specs: { "Capacité": "18L", "Classe": "B (EN 13060)", "Cycles": "6 programmes", "Écran": "LCD tactile" },
    badge: "Best-seller",
  },
  {
    id: "4",
    name: "Gants Nitrile Non Poudrés",
    brand: "SafeHand",
    category: "hygiene",
    subcategory: "Protection",
    price: 8.90,
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop",
    rating: 4.5,
    inStock: true,
    description: "Gants d'examen en nitrile non poudrés. Boîte de 100. Excellente sensibilité tactile.",
    specs: { "Taille": "M", "Quantité": "100/boîte", "Matériau": "Nitrile", "Norme": "EN 455" },
  },
  {
    id: "5",
    name: "Implant Conique Ti Grade 5",
    brand: "ImplantPro",
    category: "implantologie",
    subcategory: "Implants",
    price: 189.00,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=400&fit=crop",
    rating: 4.9,
    inStock: true,
    description: "Implant conique en titane grade 5 avec surface SLA. Connexion interne hexagonale.",
    specs: { "Diamètre": "4.0mm", "Longueur": "10mm", "Surface": "SLA", "Connexion": "Hex interne" },
    badge: "Nouveau",
  },
  {
    id: "6",
    name: "Limes Endodontiques NiTi Rotatives",
    brand: "EndoFlex",
    category: "endodontie",
    subcategory: "Limes",
    price: 62.00,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop",
    rating: 4.7,
    inStock: false,
    description: "Limes rotatives en nickel-titane avec mémoire de forme. Séquence de 6 instruments.",
    specs: { "Séquence": "6 limes", "Alliage": "NiTi CM Wire", "Conicité": ".04 - .06", "ISO": "15-40" },
  },
  {
    id: "7",
    name: "Brackets Métalliques MBT",
    brand: "OrthoLine",
    category: "orthodontie",
    subcategory: "Brackets",
    price: 78.00,
    image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=400&fit=crop",
    rating: 4.4,
    inStock: true,
    description: "Brackets métalliques prescription MBT .022. Kit complet 5-5 supérieur et inférieur.",
    specs: { "Prescription": "MBT", "Slot": ".022", "Kit": "20 brackets", "Base": "Micro-gravée" },
  },
  {
    id: "8",
    name: "Adhésif Dentaire Light-Cure",
    brand: "BondMax",
    category: "consommables",
    subcategory: "Adhésifs",
    price: 56.00,
    oldPrice: 65.00,
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop",
    rating: 4.7,
    inStock: true,
    description: "Adhésif universel mono-composant. Compatible avec tous les substrats dentaires.",
    specs: { "Type": "Universel", "Conditionnement": "Flacon 5ml", "Polymérisation": "Light-cure", "Mode": "Etch & Rinse / Self-etch" },
    badge: "IA Recommandé",
  },
];
