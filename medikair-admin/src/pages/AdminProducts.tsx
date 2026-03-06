import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Package, Search, Plus, Edit, Trash2, Eye, Filter, X,
  Loader2, Image, FileText, Layers, ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { productsAPI, categoriesAPI, uploadAPI } from "@/api";
import AdminLayout from "@/components/AdminLayout";

interface Product {
  _id: string;
  id?: string;
  name: string;
  brand: string;
  category: string;
  subcategory?: string;
  famille?: string;
  price: number;
  oldPrice?: number;
  inStock: boolean;
  stock?: number;
  image?: string;
  images?: { url: string; public_id?: string }[];
  productType?: "simple" | "variable";
  refFabricant?: string;
  codeEAN?: string;
  normes?: string;
  badge?: string;
  description?: string;
  specs?: Record<string, string>;
  documents?: DocFile[];
  variations?: Variation[];
  createdAt?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Variation {
  attributes: Record<string, string>;
  price: number;
  stock: number;
  sku: string;
  ean: string;
}

interface DocFile {
  name: string;
  type: string;
  url: string;
  public_id: string;
}

const DOCUMENT_TYPES = ["FDS", "Manuel", "Certificat CE", "Fiche Technique", "Autre"] as const;

const BADGE_OPTIONS = [
  { value: "none", label: "Aucun" },
  { value: "Nouveau", label: "Nouveau" },
  { value: "Promo", label: "Promo" },
  { value: "Best-seller", label: "Best-seller" },
  { value: "IA Recommandé", label: "IA Recommandé" },
];

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      const res = await productsAPI.getAll();
      setProducts(res.data.data || res.data.products || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    categoriesAPI.getAll().then((res) => {
      setCategories(res.data.data || res.data.categories || []);
    }).catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await productsAPI.delete(id);
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== id));
      toast({ title: "Produit supprimé" });
    } catch (err) {
      console.error("Delete failed:", err);
      toast({ title: "Erreur", description: "Suppression échouée", variant: "destructive" });
    }
  };

  const handleEditOpen = async (id: string) => {
    try {
      const res = await productsAPI.getById(id);
      const p = res.data.data || res.data.product || res.data;
      setEditProduct(p);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger le produit", variant: "destructive" });
    }
  };

  const handleViewOpen = async (id: string) => {
    try {
      const res = await productsAPI.getById(id);
      const p = res.data.data || res.data.product || res.data;
      setViewProduct(p);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger le produit", variant: "destructive" });
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === "all" || p.category === filterCategory;
    const matchStock =
      filterStock === "all" ? true :
      filterStock === "inStock" ? p.inStock :
      !p.inStock;
    return matchSearch && matchCategory && matchStock;
  });

  /* ── Add/Edit Product Form (PIM B2B – Tabbed) ────────────────────── */
  const ProductForm = ({ initial, onClose }: { initial?: Product | null; onClose: () => void }) => {
    const isEdit = !!initial;
    const [formData, setFormData] = useState({
      name: initial?.name || "",
      brand: initial?.brand || "",
      category: initial?.category || "",
      subcategory: initial?.subcategory || "",
      famille: initial?.famille || "",
      price: initial?.price?.toString() || "",
      oldPrice: initial?.oldPrice?.toString() || "",
      badge: initial?.badge || "",
      description: initial?.description || "",
      stock: initial?.stock?.toString() || "0",
      refFabricant: initial?.refFabricant || "",
      codeEAN: initial?.codeEAN || "",
      normes: initial?.normes || "",
      productType: (initial?.productType || "simple") as "simple" | "variable",
    });
    const [variations, setVariations] = useState<Variation[]>(initial?.variations || []);
    const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
      initial?.specs ? Object.entries(initial.specs).map(([key, value]) => ({ key, value })) : [{ key: "", value: "" }]
    );
    const [documents, setDocuments] = useState<DocFile[]>(initial?.documents || []);
    const [docUploading, setDocUploading] = useState(false);
    const [pendingDocType, setPendingDocType] = useState<string>("FDS");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
      initial?.images?.[0]?.url || initial?.image || null
    );
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const docRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState("general");

    const set = (field: string, value: any) =>
      setFormData((prev) => ({ ...prev, [field]: value }));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    };

    /* ── Document upload ───────────────────────────────────── */
    const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setDocUploading(true);
      try {
        const base64 = await fileToBase64(file);
        const res = await uploadAPI.uploadDocument(base64, file.name);
        const data = res.data.data;
        setDocuments((prev) => [
          ...prev,
          {
            name: file.name,
            type: pendingDocType,
            url: data.url,
            public_id: data.public_id,
          },
        ]);
      } catch (err) {
        console.error("Document upload failed:", err);
      } finally {
        setDocUploading(false);
        if (docRef.current) docRef.current.value = "";
      }
    };

    const removeDoc = (idx: number) =>
      setDocuments((prev) => prev.filter((_, i) => i !== idx));

    /* ── Variations helpers ─────────────────────────────────── */
    const addVariation = () =>
      setVariations((prev) => [
        ...prev,
        { attributes: { "": "" }, price: 0, stock: 0, sku: "", ean: "" },
      ]);

    const updateVariation = (idx: number, field: keyof Variation, value: any) =>
      setVariations((prev) => {
        const copy = [...prev];
        (copy[idx] as any)[field] = value;
        return copy;
      });

    const updateVariationAttr = (
      idx: number,
      oldKey: string,
      newKey: string | null,
      newValue: string | null
    ) =>
      setVariations((prev) => {
        const copy = [...prev];
        const attrs = { ...copy[idx].attributes };
        if (newKey !== null && newKey !== oldKey) {
          const val = attrs[oldKey];
          delete attrs[oldKey];
          attrs[newKey] = val;
        }
        if (newValue !== null) {
          const key = newKey !== null ? newKey : oldKey;
          attrs[key] = newValue;
        }
        copy[idx] = { ...copy[idx], attributes: attrs };
        return copy;
      });

    const removeVariation = (idx: number) =>
      setVariations((prev) => prev.filter((_, i) => i !== idx));

    /* ── Submit ──────────────────────────────────────────────── */
    const handleSubmit = async () => {
      if (!formData.name || !formData.brand) return;
      if (formData.productType === "simple" && !formData.price) return;
      setSaving(true);
      try {
        // Upload image if new file selected
        let imageUrl = "";
        if (imageFile) {
          const base64 = await fileToBase64(imageFile);
          const upRes = await uploadAPI.uploadImageBase64(base64);
          imageUrl = upRes.data?.data?.url || upRes.data?.url || "";
        }

        const specsObj: Record<string, string> = {};
        specs.forEach((s) => {
          if (s.key.trim()) specsObj[s.key.trim()] = s.value.trim();
        });

        const cleanVariations = variations.map((v) => ({
          attributes: Object.fromEntries(
            Object.entries(v.attributes).filter(([k]) => k.trim())
          ),
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          sku: v.sku.trim(),
          ean: v.ean.trim(),
        }));

        const payload: any = {
          name: formData.name,
          brand: formData.brand,
          category: formData.category || undefined,
          subcategory: formData.subcategory || undefined,
          famille: formData.famille || undefined,
          description: formData.description || undefined,
          badge: formData.badge && formData.badge !== "none" ? formData.badge : undefined,
          productType: formData.productType,
          refFabricant: formData.refFabricant || undefined,
          codeEAN: formData.codeEAN || undefined,
          normes: formData.normes || undefined,
          specs: Object.keys(specsObj).length > 0 ? specsObj : undefined,
          documents: documents.length > 0 ? documents : undefined,
        };

        if (imageUrl) {
          payload.images = [{ url: imageUrl }];
        }

        if (formData.productType === "simple") {
          payload.price = Number(formData.price);
          payload.oldPrice = formData.oldPrice ? Number(formData.oldPrice) : undefined;
          payload.stock = Number(formData.stock) || 0;
        } else {
          payload.variations = cleanVariations;
        }

        if (isEdit && initial) {
          await productsAPI.update(initial._id || initial.id!, payload);
          toast({ title: "Produit mis à jour" });
        } else {
          await productsAPI.create(payload);
          toast({ title: "Produit créé" });
        }
        onClose();
        fetchProducts();
      } catch (err) {
        console.error("Failed to save product:", err);
        toast({ title: "Erreur", description: "Sauvegarde échouée", variant: "destructive" });
      } finally {
        setSaving(false);
      }
    };

    /* ────────────────────────── Render ──────────────────────── */
    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="text-xs sm:text-sm gap-1">
              <Layers className="h-3.5 w-3.5 hidden sm:inline" />Général
            </TabsTrigger>
            <TabsTrigger value="stock" className="text-xs sm:text-sm gap-1">
              <Package className="h-3.5 w-3.5 hidden sm:inline" />Stock
            </TabsTrigger>
            <TabsTrigger value="media" className="text-xs sm:text-sm gap-1">
              <Image className="h-3.5 w-3.5 hidden sm:inline" />Médias
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs sm:text-sm gap-1">
              <ClipboardList className="h-3.5 w-3.5 hidden sm:inline" />Specs
            </TabsTrigger>
          </TabsList>

          {/* ═══ TAB 1 — Général ═══════════════════════════════ */}
          <TabsContent value="general" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="prod-name">Nom du produit *</Label>
                <Input
                  id="prod-name"
                  placeholder="Ex: Composite Nano-Hybride"
                  value={formData.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prod-brand">Marque *</Label>
                <Input
                  id="prod-brand"
                  placeholder="Ex: DentaPro"
                  value={formData.brand}
                  onChange={(e) => set("brand", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Badge</Label>
                <Select value={formData.badge} onValueChange={(v) => set("badge", v)}>
                  <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                  <SelectContent>
                    {BADGE_OPTIONS.map((b) => (
                      <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 3-level taxonomy */}
            <div className="rounded-lg border border-border p-4 space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">Taxonomie produit</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Catégorie *</Label>
                  <Select value={formData.category} onValueChange={(v) => set("category", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-sub">Sous-catégorie</Label>
                  <Input
                    id="prod-sub"
                    placeholder="Ex: Composites"
                    value={formData.subcategory}
                    onChange={(e) => set("subcategory", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prod-famille">Famille</Label>
                  <Input
                    id="prod-famille"
                    placeholder="Ex: Nano-Hybride"
                    value={formData.famille}
                    onChange={(e) => set("famille", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea
                id="prod-desc"
                placeholder="Description détaillée du produit…"
                rows={3}
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>
          </TabsContent>

          {/* ═══ TAB 2 — Variations & Stock ════════════════════ */}
          <TabsContent value="stock" className="mt-4 space-y-4">
            {/* Product type selector */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <Label>Type de produit</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={formData.productType === "simple" ? "default" : "outline"}
                  size="sm"
                  onClick={() => set("productType", "simple")}
                >
                  Produit simple
                </Button>
                <Button
                  type="button"
                  variant={formData.productType === "variable" ? "default" : "outline"}
                  size="sm"
                  onClick={() => set("productType", "variable")}
                >
                  Produit variable
                </Button>
              </div>
            </div>

            {formData.productType === "simple" ? (
              /* ── Simple product fields ──────────────────── */
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="prod-price">Prix (TND) *</Label>
                    <Input
                      id="prod-price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => set("price", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-old">Ancien prix (TND)</Label>
                    <Input
                      id="prod-old"
                      type="number"
                      placeholder="Optionnel"
                      value={formData.oldPrice}
                      onChange={(e) => set("oldPrice", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prod-stock">Quantité en stock</Label>
                    <Input
                      id="prod-stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => set("stock", e.target.value)}
                    />
                  </div>
                </div>

                {/* Identifiers */}
                <div className="rounded-lg border border-border p-4 space-y-4">
                  <p className="text-sm font-semibold text-muted-foreground">Identifiants & Normes</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="prod-ref">Référence Fabricant</Label>
                      <Input
                        id="prod-ref"
                        placeholder="Ex: REF-12345"
                        value={formData.refFabricant}
                        onChange={(e) => set("refFabricant", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prod-ean">Code EAN</Label>
                      <Input
                        id="prod-ean"
                        placeholder="Ex: 3760123456789"
                        value={formData.codeEAN}
                        onChange={(e) => set("codeEAN", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="prod-normes">Normes ISO / CE</Label>
                      <Input
                        id="prod-normes"
                        placeholder="Ex: ISO 13485, CE 0123"
                        value={formData.normes}
                        onChange={(e) => set("normes", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ── Variable product: Variations table ─────── */
              <div className="space-y-4">
                {/* Shared identifiers for variable products */}
                <div className="rounded-lg border border-border p-4 space-y-4">
                  <p className="text-sm font-semibold text-muted-foreground">Identifiants communs</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="prod-ref-v">Référence Fabricant</Label>
                      <Input
                        id="prod-ref-v"
                        placeholder="Ex: REF-12345"
                        value={formData.refFabricant}
                        onChange={(e) => set("refFabricant", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prod-normes-v">Normes ISO / CE</Label>
                      <Input
                        id="prod-normes-v"
                        placeholder="Ex: ISO 13485, CE 0123"
                        value={formData.normes}
                        onChange={(e) => set("normes", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Variations table */}
                <div className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-muted-foreground">
                      Variations ({variations.length})
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariation}
                    >
                      <Plus className="mr-1 h-3 w-3" />Ajouter
                    </Button>
                  </div>

                  {variations.length === 0 && (
                    <p className="text-xs text-muted-foreground py-4 text-center">
                      Aucune variation. Cliquez « Ajouter » pour créer une déclinaison.
                    </p>
                  )}

                  <div className="space-y-3">
                    {variations.map((v, idx) => {
                      const attrEntries = Object.entries(v.attributes);
                      return (
                        <div
                          key={idx}
                          className="rounded-lg border border-dashed border-border bg-muted/20 p-3 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Variation #{idx + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive"
                              onClick={() => removeVariation(idx)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Attributes */}
                          <div className="space-y-2">
                            <Label className="text-xs">Attributs (ex: Taille, Couleur)</Label>
                            {attrEntries.map(([key, val], ai) => (
                              <div key={ai} className="flex gap-2">
                                <Input
                                  placeholder="Clé"
                                  className="flex-1 h-8 text-xs"
                                  value={key}
                                  onChange={(e) =>
                                    updateVariationAttr(idx, key, e.target.value, null)
                                  }
                                />
                                <Input
                                  placeholder="Valeur"
                                  className="flex-1 h-8 text-xs"
                                  value={val}
                                  onChange={(e) =>
                                    updateVariationAttr(idx, key, null, e.target.value)
                                  }
                                />
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs w-full"
                              onClick={() =>
                                updateVariation(idx, "attributes", {
                                  ...v.attributes,
                                  "": "",
                                })
                              }
                            >
                              + Attribut
                            </Button>
                          </div>

                          {/* Price / Stock / SKU / EAN */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="space-y-1">
                              <Label className="text-[10px]">Prix (TND)</Label>
                              <Input
                                type="number"
                                className="h-8 text-xs"
                                value={v.price || ""}
                                onChange={(e) =>
                                  updateVariation(idx, "price", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">Stock</Label>
                              <Input
                                type="number"
                                className="h-8 text-xs"
                                min="0"
                                value={v.stock || ""}
                                onChange={(e) =>
                                  updateVariation(idx, "stock", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">SKU</Label>
                              <Input
                                className="h-8 text-xs"
                                placeholder="SKU-001"
                                value={v.sku}
                                onChange={(e) =>
                                  updateVariation(idx, "sku", e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px]">EAN</Label>
                              <Input
                                className="h-8 text-xs"
                                placeholder="3760..."
                                value={v.ean}
                                onChange={(e) =>
                                  updateVariation(idx, "ean", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ═══ TAB 3 — Images & Documents ════════════════════ */}
          <TabsContent value="media" className="mt-4 space-y-6">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>Image du produit</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                ) : (
                  <div className="space-y-1">
                    <Image className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Cliquer pour uploader
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG jusqu'à 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Regulatory documents */}
            <div className="rounded-lg border border-border p-4 space-y-4">
              <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" /> Documents réglementaires
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Type de document</Label>
                  <Select value={pendingDocType} onValueChange={setPendingDocType}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <input
                    ref={docRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleDocUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    disabled={docUploading}
                    onClick={() => docRef.current?.click()}
                  >
                    {docUploading ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <FileText className="mr-1 h-3 w-3" />
                    )}
                    {docUploading ? "Upload…" : "Choisir un fichier"}
                  </Button>
                </div>
              </div>

              {/* Uploaded documents list */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-border bg-background p-2.5"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{doc.name}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.type}</p>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline shrink-0"
                      >
                        Voir
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive shrink-0"
                        onClick={() => removeDoc(i)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {documents.length === 0 && (
                <p className="text-xs text-muted-foreground py-2 text-center">
                  Aucun document ajouté. Uploadez des FDS, manuels ou certificats CE.
                </p>
              )}
            </div>
          </TabsContent>

          {/* ═══ TAB 4 — Spécifications ════════════════════════ */}
          <TabsContent value="specs" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Spécifications techniques</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {specs.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Clé (ex: Matériau)"
                      className="flex-1"
                      value={s.key}
                      onChange={(e) => {
                        const ns = [...specs];
                        ns[i].key = e.target.value;
                        setSpecs(ns);
                      }}
                    />
                    <Input
                      placeholder="Valeur"
                      className="flex-1"
                      value={s.value}
                      onChange={(e) => {
                        const ns = [...specs];
                        ns[i].value = e.target.value;
                        setSpecs(ns);
                      }}
                    />
                    {specs.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0 text-destructive"
                        onClick={() => setSpecs(specs.filter((_, j) => j !== i))}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-1"
                onClick={() => setSpecs([...specs, { key: "", value: "" }])}
              >
                <Plus className="mr-1 h-3 w-3" />Ajouter une spécification
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Actions ────────────────────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-border">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            className="flex-1"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                {isEdit ? "Mise à jour…" : "Enregistrement…"}
              </>
            ) : (
              isEdit ? "Mettre à jour" : "Enregistrer le produit"
            )}
          </Button>
        </div>
      </div>
    );
  };

  const formatTND = (n: number) => `${n.toLocaleString("fr-TN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND`;

  return (
    <AdminLayout
      title="Gestion des produits (PIM)"
      headerActions={
        <Button size="sm" className="bg-hero-gradient text-primary-foreground" onClick={() => setAddOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Ajouter un produit
        </Button>
      }
    >
      <div>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un produit..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button variant="outline" size="default" onClick={() => setFilterOpen(!filterOpen)}>
            <Filter className="mr-1.5 h-4 w-4" />Filtrer
          </Button>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="mt-3 rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5 min-w-[160px]">
                <Label className="text-xs">Catégorie</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 min-w-[160px]">
                <Label className="text-xs">Stock</Label>
                <Select value={filterStock} onValueChange={setFilterStock}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="inStock">En stock</SelectItem>
                    <SelectItem value="outOfStock">Rupture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFilterCategory("all"); setFilterStock("all"); }}>
                <X className="mr-1 h-3.5 w-3.5" />Réinitialiser
              </Button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 font-display text-lg font-semibold">Aucun produit trouvé</p>
            <p className="text-sm text-muted-foreground">Ajustez vos filtres ou ajoutez un produit</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-card hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produit</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Marque</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Catégorie</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Prix</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Stock</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const pImage = p.image || p.images?.[0]?.url || "";
                    const pid = p._id || p.id || "";
                    return (
                      <motion.tr key={pid} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {pImage ? <img src={pImage} alt={p.name} className="h-10 w-10 rounded-lg object-cover" /> :
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>}
                            <div>
                              <span className="font-medium">{p.name}</span>
                              {p.badge && <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{p.badge}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.brand}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{p.category}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">{formatTND(p.price)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.inStock ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"}`}>
                            {p.inStock ? `En stock${p.stock ? ` (${p.stock})` : ""}` : "Rupture"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewOpen(pid)}><Eye className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditOpen(pid)}><Edit className="h-3.5 w-3.5" /></Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
                                  <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(pid)} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="mt-4 space-y-3 md:hidden">
              {filtered.map((p, i) => {
                const pImage = p.image || p.images?.[0]?.url || "";
                const pid = p._id || p.id || "";
                return (
                  <motion.div key={pid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="rounded-xl border border-border bg-card p-4 shadow-card">
                    <div className="flex items-center gap-3">
                      {pImage ? <img src={pImage} alt={p.name} className="h-12 w-12 rounded-lg object-cover" /> :
                        <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${p.inStock ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"}`}>
                        {p.inStock ? "En stock" : "Rupture"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">{p.category}</span>
                      <span className="font-semibold text-sm">{formatTND(p.price)}</span>
                    </div>
                    <div className="mt-2 flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewOpen(pid)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditOpen(pid)}><Edit className="h-3.5 w-3.5" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce produit ?</AlertDialogTitle>
                            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(pid)} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* View Product Dialog */}
      <Dialog open={!!viewProduct} onOpenChange={(open) => !open && setViewProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewProduct?.name}</DialogTitle></DialogHeader>
          {viewProduct && (
            <div className="space-y-4">
              {(viewProduct.images?.[0]?.url || viewProduct.image) && (
                <img src={viewProduct.images?.[0]?.url || viewProduct.image} alt={viewProduct.name}
                  className="w-full max-h-64 object-contain rounded-lg bg-muted" />
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div><p className="text-xs text-muted-foreground">Marque</p><p className="font-medium">{viewProduct.brand}</p></div>
                <div><p className="text-xs text-muted-foreground">Catégorie</p><p className="font-medium">{viewProduct.category}{viewProduct.subcategory ? ` > ${viewProduct.subcategory}` : ""}{viewProduct.famille ? ` > ${viewProduct.famille}` : ""}</p></div>
                <div><p className="text-xs text-muted-foreground">Prix</p><p className="font-medium">{formatTND(viewProduct.price)}{viewProduct.oldPrice ? <span className="ml-2 line-through text-muted-foreground text-sm">{formatTND(viewProduct.oldPrice)}</span> : ""}</p></div>
                <div><p className="text-xs text-muted-foreground">Stock</p><p className="font-medium">{viewProduct.inStock ? `En stock (${viewProduct.stock || "—"})` : "Rupture"}</p></div>
                {viewProduct.badge && <div><p className="text-xs text-muted-foreground">Badge</p><p className="font-medium">{viewProduct.badge}</p></div>}
                {viewProduct.productType && <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium">{viewProduct.productType}</p></div>}
                {viewProduct.refFabricant && <div><p className="text-xs text-muted-foreground">Réf. Fabricant</p><p className="font-medium">{viewProduct.refFabricant}</p></div>}
                {viewProduct.codeEAN && <div><p className="text-xs text-muted-foreground">Code EAN</p><p className="font-medium">{viewProduct.codeEAN}</p></div>}
                {viewProduct.normes && <div><p className="text-xs text-muted-foreground">Normes</p><p className="font-medium">{viewProduct.normes}</p></div>}
              </div>
              {viewProduct.description && (
                <div><p className="text-xs text-muted-foreground mb-1">Description</p><p className="text-sm">{viewProduct.description}</p></div>
              )}
              {viewProduct.specs && Object.keys(viewProduct.specs).length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Spécifications</p>
                  <div className="grid gap-1">
                    {Object.entries(viewProduct.specs).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm border-b border-border py-1">
                        <span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewProduct.variations && viewProduct.variations.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Variations ({viewProduct.variations.length})</p>
                  <div className="space-y-2">
                    {viewProduct.variations.map((v, i) => (
                      <div key={i} className="rounded-lg border border-border p-3 text-sm">
                        <div className="flex flex-wrap gap-2 mb-1">
                          {Object.entries(v.attributes).map(([k, val]) => (
                            <span key={k} className="rounded-full bg-muted px-2 py-0.5 text-xs">{k}: {val}</span>
                          ))}
                        </div>
                        <div className="flex gap-4 text-muted-foreground">
                          <span>Prix: {formatTND(v.price)}</span>
                          <span>Stock: {v.stock}</span>
                          {v.sku && <span>SKU: {v.sku}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewProduct.documents && viewProduct.documents.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Documents</p>
                  <div className="space-y-1">
                    {viewProduct.documents.map((d, i) => (
                      <a key={i} href={d.url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-border p-2 hover:bg-muted/50 transition-colors">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{d.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{d.type}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      {isMobile ? (
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
            <SheetHeader><SheetTitle>Ajouter un produit</SheetTitle></SheetHeader>
            <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)]"><ProductForm onClose={() => setAddOpen(false)} /></div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Ajouter un produit</DialogTitle></DialogHeader>
            <ProductForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Product Modal */}
      {isMobile ? (
        <Sheet open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
            <SheetHeader><SheetTitle>Modifier le produit</SheetTitle></SheetHeader>
            <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)]">
              <ProductForm initial={editProduct} onClose={() => setEditProduct(null)} />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Modifier le produit</DialogTitle></DialogHeader>
            <ProductForm initial={editProduct} onClose={() => setEditProduct(null)} />
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
