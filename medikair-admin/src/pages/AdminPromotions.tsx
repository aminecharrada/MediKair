import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package, Users, ShoppingCart, Settings,
  Tag, Plus, Percent, Calendar, Loader2, Trash2, Gift, Layers, Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { promotionsAPI, categoriesAPI, productsAPI } from "@/api";
import AdminLayout from "@/components/AdminLayout";

interface Promotion {
  _id: string;
  name: string;
  offerType: "simple" | "volume" | "bundle";
  type?: string;
  value: string;
  target: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  uses?: number;
  code?: string;
  description?: string;
  discount?: number;
  tiers?: { minQty: number; discountPercent: number }[];
  bundleRule?: {
    buyQty: number;
    buyTarget: string;
    buyTargetType: "product" | "category";
    getQty: number;
    getTarget: string;
  };
  segmentClient?: string;
  typeStructure?: string;
  groupeSpecifique?: string;
}

interface Category { _id: string; name: string; }
interface Product { _id: string; name: string; }
interface Tier { minQty: string; discountPercent: string; }

const OFFER_TYPES = [
  { value: "simple", label: "Remise Simple", desc: "Pourcentage ou montant fixe sur le panier" },
  { value: "volume", label: "Remise sur quantité (Volume)", desc: "Paliers de remise selon la quantité" },
  { value: "bundle", label: "Offre Bundle (BOGO / 3+1)", desc: "Achetez X, obtenez Y offert" },
] as const;

const SEGMENTS = ["Premium", "Chasseurs de promos", "Nouveaux clients", "Fidèles", "Inactifs"] as const;
const STRUCTURES = ["Cabinet", "Clinique", "Laboratoire", "Hôpital", "Pharmacie", "Université"] as const;

const sidebarLinks: never[] = []; // unused, kept for TS
export default function AdminPromotions() {
  const [addOpen, setAddOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const fetchPromotions = async () => {
    try {
      const res = await promotionsAPI.getAll();
      setPromotions(res.data.data || res.data.promotions || []);
    } catch (err) {
      console.error("Failed to load promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
    categoriesAPI.getAll().then((res) => {
      setCategories(res.data.data || res.data.categories || []);
    }).catch(() => {});
    productsAPI.getAll().then((res) => {
      setProducts((res.data.data || res.data.products || []).map((p: any) => ({ _id: p._id || p.id, name: p.name })));
    }).catch(() => {});
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await promotionsAPI.toggle(id);
      setPromotions((prev) => prev.map((p) => p._id === id ? { ...p, active: !p.active } : p));
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await promotionsAPI.delete(id);
      setPromotions((prev) => prev.filter((p) => p._id !== id));
      toast({ title: "Promotion supprimée" });
    } catch (err) {
      console.error("Delete failed:", err);
      toast({ title: "Erreur", description: "Suppression échouée", variant: "destructive" });
    }
  };

  const activeCount = promotions.filter((p) => p.active).length;
  const totalUses = promotions.reduce((a, p) => a + (p.uses || 0), 0);

  /* ── Add/Edit Promotion Form — Rule Engine B2B ──────────────────── */
  const PromoForm = ({ initial, onClose }: { initial?: Promotion | null; onClose: () => void }) => {
    const isEdit = !!initial;
    const [activeTab, setActiveTab] = useState("offer");
    const [offerType, setOfferType] = useState<"simple" | "volume" | "bundle">(initial?.offerType || "simple");

    // Simple discount
    const [discountType, setDiscountType] = useState<"percentage" | "fixed" | "freeShipping">(
      (initial?.type as any) || "percentage"
    );
    const [discountValue, setDiscountValue] = useState(initial?.discount?.toString() || "");

    // Volume tiers
    const [tiers, setTiers] = useState<Tier[]>(
      initial?.tiers?.map((t) => ({ minQty: String(t.minQty), discountPercent: String(t.discountPercent) })) || [{ minQty: "", discountPercent: "" }]
    );

    // Bundle rule
    const [bundleBuyQty, setBundleBuyQty] = useState(initial?.bundleRule?.buyQty?.toString() || "3");
    const [bundleBuyTarget, setBundleBuyTarget] = useState(initial?.bundleRule?.buyTarget || "");
    const [bundleBuyTargetType, setBundleBuyTargetType] = useState<"product" | "category">(initial?.bundleRule?.buyTargetType || "category");
    const [bundleGetQty, setBundleGetQty] = useState(initial?.bundleRule?.getQty?.toString() || "1");
    const [bundleGetTarget, setBundleGetTarget] = useState(initial?.bundleRule?.getTarget || "");

    // Targeting
    const [segmentClient, setSegmentClient] = useState(initial?.segmentClient || "");
    const [typeStructure, setTypeStructure] = useState(initial?.typeStructure || "");
    const [groupeSpecifique, setGroupeSpecifique] = useState(initial?.groupeSpecifique || "");

    // Common
    const [name, setName] = useState(initial?.name || "");
    const [description, setDescription] = useState(initial?.description || "");
    const [code, setCode] = useState(initial?.code || "");
    const [startDate, setStartDate] = useState(initial?.startDate?.slice(0, 10) || "");
    const [endDate, setEndDate] = useState(initial?.endDate?.slice(0, 10) || "");
    const [maxUses, setMaxUses] = useState("");
    const [isActive, setIsActive] = useState(initial?.active ?? true);
    const [saving, setSaving] = useState(false);

    /* ── helpers ──────────────────────────────────────────── */
    const addTier = () => setTiers((t) => [...t, { minQty: "", discountPercent: "" }]);
    const removeTier = (i: number) => setTiers((t) => t.filter((_, j) => j !== i));
    const updateTier = (i: number, field: keyof Tier, val: string) =>
      setTiers((t) => { const c = [...t]; c[i] = { ...c[i], [field]: val }; return c; });

    /* ── submit ───────────────────────────────────────────── */
    const handleSubmit = async () => {
      if (!name || !startDate || !endDate) return;
      setSaving(true);
      try {
        const payload: Record<string, any> = {
          name,
          offerType,
          description: description || undefined,
          code: code || undefined,
          startDate,
          endDate,
          maxUses: maxUses ? Number(maxUses) : undefined,
          isActive: isActive,
          segmentClient: segmentClient || undefined,
          typeStructure: typeStructure || undefined,
          groupeSpecifique: groupeSpecifique || undefined,
        };

        if (offerType === "simple") {
          payload.type = discountType;
          payload.discount = discountType === "freeShipping" ? 0 : Number(discountValue) || 0;
        } else if (offerType === "volume") {
          payload.type = "percentage";
          payload.tiers = tiers
            .filter((t) => t.minQty && t.discountPercent)
            .map((t) => ({ minQty: Number(t.minQty), discountPercent: Number(t.discountPercent) }));
        } else if (offerType === "bundle") {
          payload.type = "bogo";
          payload.bundleRule = {
            buyQty: Number(bundleBuyQty) || 3,
            buyTarget: bundleBuyTarget,
            buyTargetType: bundleBuyTargetType,
            getQty: Number(bundleGetQty) || 1,
            getTarget: bundleGetTarget,
          };
        }

        if (isEdit && initial) {
          await promotionsAPI.update(initial._id, payload);
          toast({ title: "Promotion mise à jour" });
        } else {
          await promotionsAPI.create(payload);
          toast({ title: "Promotion créée" });
        }
        onClose();
        fetchPromotions();
      } catch (err) {
        console.error("Failed to save promotion:", err);
        toast({ title: "Erreur", description: "Sauvegarde échouée", variant: "destructive" });
      } finally {
        setSaving(false);
      }
    };

    /* ── render ───────────────────────────────────────────── */
    return (
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="offer" className="text-xs sm:text-sm gap-1">
              <Tag className="h-3.5 w-3.5 hidden sm:inline" />Offre
            </TabsTrigger>
            <TabsTrigger value="targeting" className="text-xs sm:text-sm gap-1">
              <Users className="h-3.5 w-3.5 hidden sm:inline" />Ciblage
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs sm:text-sm gap-1">
              <Settings className="h-3.5 w-3.5 hidden sm:inline" />Paramètres
            </TabsTrigger>
          </TabsList>

          {/* ═══ TAB 1 — Offre ═══════════════════════════════════ */}
          <TabsContent value="offer" className="mt-4 space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="promo-name">Nom de la promotion *</Label>
              <Input
                id="promo-name"
                placeholder="Ex: 3+1 Offert — Implants Coniques"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Offer type selector */}
            <div className="space-y-2">
              <Label>Type d'offre *</Label>
              <div className="grid gap-2">
                {OFFER_TYPES.map((ot) => (
                  <button
                    key={ot.value}
                    type="button"
                    onClick={() => setOfferType(ot.value)}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                      offerType === ot.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      offerType === ot.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {ot.value === "simple" ? <Percent className="h-4 w-4" /> :
                       ot.value === "volume" ? <Layers className="h-4 w-4" /> :
                       <Gift className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{ot.label}</p>
                      <p className="text-xs text-muted-foreground">{ot.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Conditional sections based on offer type ──────── */}

            {/* SIMPLE */}
            {offerType === "simple" && (
              <div className="rounded-lg border border-border p-4 space-y-4">
                <p className="text-sm font-semibold text-muted-foreground">Remise simple</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Type de remise</Label>
                    <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                        <SelectItem value="fixed">Montant fixe (TND)</SelectItem>
                        <SelectItem value="freeShipping">Livraison gratuite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {discountType !== "freeShipping" && (
                    <div className="space-y-2">
                      <Label htmlFor="promo-discount">
                        Valeur {discountType === "percentage" ? "(%)" : "(TND)"} *
                      </Label>
                      <Input
                        id="promo-discount"
                        type="number"
                        placeholder={discountType === "percentage" ? "Ex: 15" : "Ex: 200"}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VOLUME / TIERED */}
            {offerType === "volume" && (
              <div className="rounded-lg border border-border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Paliers de remise ({tiers.length})
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={addTier}>
                    <Plus className="mr-1 h-3 w-3" />Ajouter un palier
                  </Button>
                </div>

                {/* Header row (desktop) */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_40px] gap-2 text-xs font-medium text-muted-foreground px-1">
                  <span>Quantité minimale</span>
                  <span>Remise (%)</span>
                  <span></span>
                </div>

                {tiers.map((tier, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-2 items-end">
                    <div className="space-y-1 sm:space-y-0">
                      <Label className="text-xs sm:hidden">Qté min</Label>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Ex: 5"
                        className="h-9"
                        value={tier.minQty}
                        onChange={(e) => updateTier(i, "minQty", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1 sm:space-y-0">
                      <Label className="text-xs sm:hidden">Remise %</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Ex: 10"
                        className="h-9"
                        value={tier.discountPercent}
                        onChange={(e) => updateTier(i, "discountPercent", e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive"
                      disabled={tiers.length <= 1}
                      onClick={() => removeTier(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                {tiers.length > 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    Exemple : ≥5 → -10%, ≥10 → -15%, ≥20 → -25%
                  </p>
                )}
              </div>
            )}

            {/* BUNDLE / BOGO */}
            {offerType === "bundle" && (
              <div className="rounded-lg border border-border p-4 space-y-4">
                <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Gift className="h-4 w-4" /> Constructeur d'offre Bundle
                </p>

                {/* Sentence builder UX */}
                <div className="rounded-lg bg-muted/30 p-4 space-y-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    Pour l'achat de{" "}
                    <Input
                      type="number"
                      min="1"
                      className="inline-block w-16 h-8 mx-1 text-center font-bold"
                      value={bundleBuyQty}
                      onChange={(e) => setBundleBuyQty(e.target.value)}
                    />{" "}
                    article(s) de{" "}
                    <Select value={bundleBuyTargetType} onValueChange={(v: any) => { setBundleBuyTargetType(v); setBundleBuyTarget(""); }}>
                      <SelectTrigger className="inline-flex w-auto h-8 mx-1 min-w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="category">la catégorie</SelectItem>
                        <SelectItem value="product">le produit</SelectItem>
                      </SelectContent>
                    </Select>{" "}
                    <Select value={bundleBuyTarget} onValueChange={setBundleBuyTarget}>
                      <SelectTrigger className="inline-flex w-auto h-8 mx-1 min-w-[140px]">
                        <SelectValue placeholder="Sélectionner…" />
                      </SelectTrigger>
                      <SelectContent>
                        {bundleBuyTargetType === "category"
                          ? categories.map((c) => <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>)
                          : products.map((p) => <SelectItem key={p._id} value={p.name}>{p.name}</SelectItem>)
                        }
                      </SelectContent>
                    </Select>
                    , offrir{" "}
                    <Input
                      type="number"
                      min="1"
                      className="inline-block w-16 h-8 mx-1 text-center font-bold"
                      value={bundleGetQty}
                      onChange={(e) => setBundleGetQty(e.target.value)}
                    />{" "}
                    article(s)
                    <span className="ml-1 font-semibold text-primary">gratuit(s)</span>.
                  </p>
                </div>

                {/* Optional: specify which product is offered */}
                <div className="space-y-2">
                  <Label htmlFor="bundle-get-target" className="text-xs text-muted-foreground">
                    Produit offert (optionnel — laissez vide pour le même article)
                  </Label>
                  <Select value={bundleGetTarget} onValueChange={setBundleGetTarget}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Même article que la condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">Même article</SelectItem>
                      {products.map((p) => <SelectItem key={p._id} value={p.name}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ═══ TAB 2 — Ciblage avancé (Section 5.1) ═══════════ */}
          <TabsContent value="targeting" className="mt-4 space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">Ciblage avancé B2B</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Segment Client (IA)</Label>
                  <Select value={segmentClient} onValueChange={setSegmentClient}>
                    <SelectTrigger><SelectValue placeholder="Tous les segments" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">Tous les segments</SelectItem>
                      {SEGMENTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type de structure</Label>
                  <Select value={typeStructure} onValueChange={setTypeStructure}>
                    <SelectTrigger><SelectValue placeholder="Toutes les structures" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">Toutes les structures</SelectItem>
                      {STRUCTURES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="promo-groupe">Groupe spécifique</Label>
                  <Input
                    id="promo-groupe"
                    placeholder="Ex: Groupe dentaire AZUR, CHU Tunis…"
                    value={groupeSpecifique}
                    onChange={(e) => setGroupeSpecifique(e.target.value)}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Nommez un groupe de clients ou un établissement précis pour limiter l'offre.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══ TAB 3 — Paramètres ══════════════════════════════ */}
          <TabsContent value="settings" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="promo-start">Date de début *</Label>
                <Input
                  id="promo-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-end">Date de fin *</Label>
                <Input
                  id="promo-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-code">Code promo (optionnel)</Label>
                <Input
                  id="promo-code"
                  placeholder="Ex: WELCOME10"
                  className="uppercase"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="promo-max">Limite d'utilisations</Label>
                <Input
                  id="promo-max"
                  type="number"
                  placeholder="Illimité"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-desc">Description</Label>
              <Textarea
                id="promo-desc"
                placeholder="Description visible pour les clients…"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="promo-active">Activer immédiatement</Label>
              <Switch id="promo-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </TabsContent>
        </Tabs>

        {/* ── Actions ────────────────────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{isEdit ? "Mise à jour…" : "Création…"}</>
            ) : (
              isEdit ? "Mettre à jour" : "Créer la promotion"
            )}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout
      title="Promotions & Offres"
      headerActions={
        <Button size="sm" className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />Nouvelle promotion
        </Button>
      }
    >
      <div>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          {[
            { label: "Promotions actives", value: String(activeCount) },
            { label: "Utilisations totales", value: String(totalUses) },
            { label: "Total promotions", value: String(promotions.length) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-extrabold">{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : promotions.length === 0 ? (
          <div className="py-20 text-center">
            <Tag className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 font-display text-lg font-semibold">Aucune promotion</p>
            <p className="text-sm text-muted-foreground">Créez votre première promotion</p>
          </div>
        ) : (
          <div className="space-y-4">
            {promotions.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      {p.offerType === "bundle" ? <Gift className="h-5 w-5 text-accent-foreground" /> :
                       p.offerType === "volume" ? <Layers className="h-5 w-5 text-accent-foreground" /> :
                       <Percent className="h-5 w-5 text-accent-foreground" />}
                    </div>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.target || "—"}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {p.startDate ? new Date(p.startDate).toLocaleDateString("fr-FR") : "—"} → {p.endDate ? new Date(p.endDate).toLocaleDateString("fr-FR") : "—"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-primary">{p.value}</p>
                      <p className="text-xs text-muted-foreground">{p.uses || 0} utilisations</p>
                    </div>
                    <Switch checked={p.active} onCheckedChange={() => handleToggle(p._id)} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingPromo(p)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer cette promotion ?</AlertDialogTitle>
                          <AlertDialogDescription>Cette action est irréversible. La promotion "{p.name}" sera définitivement supprimée.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(p._id)} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Promotion Modal */}
      {isMobile ? (
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
            <SheetHeader><SheetTitle>Nouvelle promotion</SheetTitle></SheetHeader>
            <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)]"><PromoForm onClose={() => setAddOpen(false)} /></div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Nouvelle promotion</DialogTitle></DialogHeader>
            <PromoForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Promotion Modal */}
      {isMobile ? (
        <Sheet open={!!editingPromo} onOpenChange={(open) => !open && setEditingPromo(null)}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
            <SheetHeader><SheetTitle>Modifier la promotion</SheetTitle></SheetHeader>
            <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)]">
              <PromoForm initial={editingPromo} onClose={() => setEditingPromo(null)} />
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={!!editingPromo} onOpenChange={(open) => !open && setEditingPromo(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Modifier la promotion</DialogTitle></DialogHeader>
            <PromoForm initial={editingPromo} onClose={() => setEditingPromo(null)} />
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
