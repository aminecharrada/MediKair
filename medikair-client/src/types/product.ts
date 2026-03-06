// Shared Product interface — matches backend API response shape
export interface Product {
  id: string;
  _id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
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
