import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, ShoppingCart, Star, Sparkles, Truck, ShieldCheck, Loader2,
  Heart, Minus, Plus, FileText, ChevronLeft, ChevronRight, Send, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { productsAPI, reviewsAPI, favoritesAPI, aiAPI } from "@/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Product, ProductReview } from "@/types/product";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [upSell, setUpSell] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Image gallery
  const [imgIndex, setImgIndex] = useState(0);
  // Quantity
  const [qty, setQty] = useState(1);
  // Variations
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  // Reviews
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  // Favorites
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      setImgIndex(0);
      setQty(1);
      setSelectedAttrs({});
      try {
        const [res, revRes] = await Promise.all([
          productsAPI.getById(id),
          reviewsAPI.getForProduct(id).catch(() => ({ data: { data: [] } })),
        ]);
        const prod = res.data.data || res.data.product;
        setProduct(prod);
        setReviews(revRes.data.data || []);

        // AI-powered similar products + up-sell
        const productId = prod.id || prod._id;
        try {
          const [simRes, upRes] = await Promise.all([
            aiAPI.getSimilar(productId, 4).catch(() => null),
            aiAPI.getUpSell(productId, 3).catch(() => null),
          ]);
          if (simRes?.data?.recommendations?.length) {
            setRelated(simRes.data.recommendations);
          } else {
            // Fallback: same category
            const relRes = await productsAPI.getAll({ category: prod.category });
            setRelated(
              (relRes.data.data || []).filter((p: Product) => (p.id || p._id) !== id).slice(0, 4)
            );
          }
          if (upRes?.data?.recommendations?.length) {
            setUpSell(upRes.data.recommendations);
          }
        } catch {
          // Fallback: same category
          if (prod?.category) {
            const relRes = await productsAPI.getAll({ category: prod.category });
            setRelated(
              (relRes.data.data || []).filter((p: Product) => (p.id || p._id) !== id).slice(0, 4)
            );
          }
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Check if product is in favorites
  useEffect(() => {
    if (user?.favorites && id) {
      setIsFav(user.favorites.some((f: any) => (f._id || f.id || f) === id));
    }
  }, [user, id]);

  const images = product?.images?.length ? product.images : product?.image ? [{ url: product.image, public_id: "" }] : [];

  // Variation helpers
  const isVariable = product?.productType === "variable" && (product.variations?.length ?? 0) > 0;
  const attrKeys = isVariable
    ? [...new Set(product!.variations!.flatMap((v) => Object.keys(v.attributes)))]
    : [];
  const attrOptions: Record<string, string[]> = {};
  attrKeys.forEach((k) => {
    attrOptions[k] = [...new Set(product!.variations!.map((v) => v.attributes[k]).filter(Boolean))];
  });
  const matchedVariation = isVariable
    ? product!.variations!.find((v) =>
        attrKeys.every((k) => v.attributes[k] === selectedAttrs[k])
      )
    : null;

  const effectivePrice = matchedVariation ? matchedVariation.price : product?.price ?? 0;
  const effectiveStock = matchedVariation ? matchedVariation.stock : product?.stock ?? 0;
  const canAdd = isVariable ? !!matchedVariation && matchedVariation.stock > 0 : (product?.inStock ?? false);

  const handleAddToCart = () => {
    if (!product || !canAdd) return;
    const varLabel = matchedVariation
      ? " — " + Object.values(matchedVariation.attributes).join(" / ")
      : "";
    addItem(
      {
        productId: (product.id || product._id) + (matchedVariation?._id ?? ""),
        name: product.name + varLabel,
        brand: product.brand,
        price: effectivePrice,
        image: images[0]?.url || "",
      },
      qty
    );
    toast({ title: "Ajouté au panier", description: `${product.name}${varLabel} × ${qty}` });
  };

  const toggleFav = useCallback(async () => {
    if (!user || !id) {
      toast({ title: "Connectez-vous pour ajouter aux favoris" });
      return;
    }
    try {
      await favoritesAPI.toggle(id);
      setIsFav((p) => !p);
      await refreshUser();
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier les favoris", variant: "destructive" });
    }
  }, [user, id, refreshUser, toast]);

  const submitReview = async () => {
    if (!user || !id || !reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      await reviewsAPI.create({
        productId: id,
        rating: reviewRating,
        comment: reviewText.trim(),
        name: user.name,
        email: user.email,
      });
      toast({ title: "Avis envoyé !" });
      setReviewText("");
      setReviewRating(5);
      const revRes = await reviewsAPI.getForProduct(id);
      setReviews(revRes.data.data || []);
      // Refresh product to update rating
      const prodRes = await productsAPI.getById(id);
      setProduct(prodRes.data.data || prodRes.data.product);
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer l'avis", variant: "destructive" });
    } finally {
      setSubmittingReview(false);
    }
  };

  // Stars helper
  const StarRow = ({ rating, size = 14 }: { rating: number; size?: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={s <= rating ? "fill-secondary text-secondary" : "text-muted-foreground/30"} style={{ width: size, height: size }} />
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-32">
          <h1 className="font-display text-2xl font-bold">Produit non trouvé</h1>
          <Link to="/catalogue"><Button variant="outline" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Retour au catalogue</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const specs = product.specs && typeof product.specs === "object" ? Object.entries(product.specs) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <Link to="/catalogue" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors sm:text-sm">
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Retour au catalogue
        </Link>

        <div className="mt-4 grid gap-6 sm:mt-6 lg:grid-cols-2 lg:gap-10">
          {/* ── Image Gallery ─────────────────────────────────── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="relative overflow-hidden rounded-xl border border-border bg-muted sm:rounded-2xl">
              <img
                src={images[imgIndex]?.url || ""}
                alt={product.name}
                className="h-full w-full object-cover aspect-square"
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/60 p-1.5 backdrop-blur-sm hover:bg-background/80 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/60 p-1.5 backdrop-blur-sm hover:bg-background/80 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setImgIndex(i)}
                    className={`shrink-0 h-16 w-16 rounded-lg border-2 overflow-hidden transition-colors sm:h-20 sm:w-20 ${i === imgIndex ? "border-secondary" : "border-border"}`}>
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Product Info ──────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-xs font-medium text-secondary sm:text-sm">{product.brand}</p>
            <h1 className="mt-1 font-display text-xl font-bold sm:text-2xl md:text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap sm:mt-3">
              <div className="flex items-center gap-1">
                <StarRow rating={Math.round(product.rating)} size={14} />
                <span className="text-xs font-semibold sm:text-sm">{product.rating?.toFixed(1)}</span>
                <span className="text-[10px] text-muted-foreground sm:text-xs">({product.numberOfReviews || 0} avis)</span>
              </div>
              {product.subcategory && <span className="text-[10px] text-muted-foreground sm:text-xs">• {product.subcategory}</span>}
              <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-medium sm:text-xs ${canAdd ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"}`}>
                {canAdd ? "En stock" : "Rupture"}
              </span>
            </div>

            {/* Price */}
            <div className="mt-4 sm:mt-6">
              <span className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">{effectivePrice.toFixed(2)} TND</span>
              {product.oldPrice && <span className="ml-2 text-sm text-muted-foreground line-through sm:ml-3 sm:text-lg">{product.oldPrice.toFixed(2)} TND</span>}
              {product.discountPercentage ? <span className="ml-2 rounded bg-destructive/10 px-1.5 py-0.5 text-xs font-semibold text-destructive">-{product.discountPercentage}%</span> : null}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:mt-4 sm:text-sm">{product.description}</p>

            {/* ── Variation Selectors ───────────────────────────── */}
            {isVariable && attrKeys.length > 0 && (
              <div className="mt-4 space-y-3 sm:mt-6">
                {attrKeys.map((key) => (
                  <div key={key}>
                    <label className="text-xs font-semibold sm:text-sm">{key}</label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {attrOptions[key].map((val) => (
                        <button key={val} onClick={() => setSelectedAttrs((p) => ({ ...p, [key]: val }))}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${selectedAttrs[key] === val ? "border-secondary bg-secondary/10 text-secondary" : "border-border hover:border-secondary/40"}`}>
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {matchedVariation && (
                  <p className="text-xs text-muted-foreground">
                    Stock : {matchedVariation.stock} · SKU : {matchedVariation.sku || "—"}
                  </p>
                )}
              </div>
            )}

            {/* ── Quantity + Add to Cart + Favorite ─────────────── */}
            <div className="mt-5 flex items-center gap-3 sm:mt-8">
              <div className="flex items-center rounded-lg border border-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-2.5 py-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[2.5rem] text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(effectiveStock || 999, q + 1))} className="px-2.5 py-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button size="lg" className="flex-1 bg-hero-gradient text-primary-foreground hover:opacity-90 font-semibold sm:flex-none"
                disabled={!canAdd} onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ajouter au panier
              </Button>
              <Button size="icon" variant="outline" className="h-10 w-10 shrink-0" onClick={toggleFav}>
                <Heart className={`h-5 w-5 transition-colors ${isFav ? "fill-destructive text-destructive" : ""}`} />
              </Button>
            </div>

            {/* Specs */}
            {specs.length > 0 && (
              <div className="mt-4 rounded-xl border border-border bg-muted/50 p-3 sm:mt-6 sm:p-4">
                <h3 className="text-xs font-semibold sm:text-sm">Spécifications techniques</h3>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:mt-3 sm:gap-x-6 sm:gap-y-2 sm:text-sm">
                  {specs.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* ── Documents réglementaires ──────────────────────── */}
            {product.documents && product.documents.length > 0 && (
              <div className="mt-4 rounded-xl border border-border bg-muted/50 p-3 sm:mt-6 sm:p-4">
                <h3 className="text-xs font-semibold sm:text-sm">Documents réglementaires</h3>
                <ul className="mt-2 space-y-1.5">
                  {product.documents.map((doc, i) => (
                    <li key={i}>
                      <a href={doc.url} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 text-xs text-secondary hover:underline sm:text-sm">
                        <FileText className="h-3.5 w-3.5" />
                        {doc.name} <span className="text-muted-foreground">({doc.type})</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground sm:text-xs"><Truck className="h-4 w-4 text-secondary" /> Livraison 24h</div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground sm:text-xs"><ShieldCheck className="h-4 w-4 text-secondary" /> Certifié CE/ISO</div>
            </div>
          </motion.div>
        </div>

        {/* ── Reviews Section ────────────────────────────────── */}
        <section className="mt-10 sm:mt-16">
          <h2 className="font-display text-base font-bold sm:text-xl">Avis clients ({reviews.length})</h2>

          {/* Review Form */}
          {user ? (
            <div className="mt-4 rounded-xl border border-border bg-card p-4 sm:p-6">
              <h3 className="text-sm font-semibold">Laisser un avis</h3>
              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star className={`h-5 w-5 transition-colors ${s <= reviewRating ? "fill-secondary text-secondary" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
              <Textarea placeholder="Partagez votre expérience…" value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="mt-3" rows={3} />
              <Button size="sm" className="mt-3" disabled={!reviewText.trim() || submittingReview} onClick={submitReview}>
                {submittingReview ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-2 h-3.5 w-3.5" />}
                Envoyer
              </Button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              <Link to="/login" className="text-secondary hover:underline">Connectez-vous</Link> pour laisser un avis.
            </p>
          )}

          {/* Existing Reviews */}
          {reviews.length > 0 ? (
            <div className="mt-4 space-y-3">
              {reviews.map((rev, i) => (
                <div key={rev._id || i} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{rev.name}</span>
                    <StarRow rating={rev.rating} size={12} />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{rev.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Aucun avis pour le moment.</p>
          )}
        </section>

        {/* AI-Powered Similar Products */}
        {related.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary sm:h-5 sm:w-5" />
              <h2 className="font-display text-base font-bold sm:text-xl">Produits similaires</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Recommandés par l'IA MediKair</p>
            <div className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-4 sm:mt-6 sm:gap-5">
              {related.map((p) => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Up-sell: Premium Alternatives */}
        {upSell.length > 0 && (
          <section className="mt-8 sm:mt-12">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary sm:h-5 sm:w-5" />
              <h2 className="font-display text-base font-bold sm:text-xl">Version premium</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Alternatives de gamme supérieure</p>
            <div className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-3 sm:mt-6 sm:gap-5">
              {upSell.map((p) => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
