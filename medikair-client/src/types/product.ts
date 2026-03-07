// ── Variation (for variable products) ─────────────────────────────
export interface ProductVariation {
  _id?: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  sku?: string;
  ean?: string;
}

// ── Regulatory / technical document ──────────────────────────────
export interface ProductDocument {
  _id?: string;
  name: string;
  type: "FDS" | "Manuel" | "Certificat CE" | "Fiche Technique" | "Autre";
  url: string;
}

// ── Embedded review ──────────────────────────────────────────────
export interface ProductReview {
  _id?: string;
  name: string;
  email: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

// Shared Product interface — matches backend API response shape
export interface Product {
  id: string;
  _id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  famille?: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: { public_id: string; url: string }[];
  rating: number;
  inStock: boolean;
  stock?: number;
  description: string;
  specs: Record<string, string>;
  badge?: string;
  featured?: boolean;
  numberOfReviews?: number;
  productType?: "simple" | "variable";
  variations?: ProductVariation[];
  documents?: ProductDocument[];
  reviews?: ProductReview[];
  refFabricant?: string;
  codeEAN?: string;
  normes?: string;
  discountPercentage?: number;
  isOffer?: boolean;
  shipping?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  image?: { public_id: string; url: string };
}

// Map category IDs to display labels and icons
export const categoryMeta: Record<string, { label: string; icon: string }> = {
  orthodontie: { label: "Orthodontie", icon: "🦷" },
  implantologie: { label: "Implantologie", icon: "🔩" },
  endodontie: { label: "Endodontie", icon: "🩺" },
  hygiene: { label: "Hygiène & Stérilisation", icon: "🧴" },
  consommables: { label: "Consommables", icon: "📦" },
  equipement: { label: "Équipement", icon: "⚙️" },
};
