import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { promotionsAPI, aiAPI } from "@/api";
import { toast } from "sonner";
import type { Product } from "@/types/product";

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoName, setPromoName] = useState("");
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [crossSell, setCrossSell] = useState<Product[]>([]);

  // Fetch cross-sell recommendations when cart items change
  useEffect(() => {
    const fetchCrossSell = async () => {
      if (items.length === 0) {
        setCrossSell([]);
        return;
      }
      try {
        const productIds = items.map((item) => item.productId);
        const res = await aiAPI.getCrossSell(productIds, 4);
        setCrossSell(res.data?.recommendations || []);
      } catch {
        setCrossSell([]);
      }
    };
    fetchCrossSell();
  }, [items]);

  const shipping = subtotal > 500 ? 0 : 49;
  const total = Math.max(0, subtotal - promoDiscount + shipping);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    try {
      const res = await promotionsAPI.getActive();
      const promos = res.data.data || [];
      const matched = promos.find(
        (p: any) => p.code && p.code.toLowerCase() === promoCode.trim().toLowerCase()
      );
      if (!matched) {
        toast.error("Code promo invalide ou expiré");
        setPromoDiscount(0);
        setPromoName("");
      } else {
        let discount = 0;
        if (matched.type === "percentage") {
          discount = subtotal * (matched.discount / 100);
        } else if (matched.type === "fixed") {
          discount = matched.discount;
        }
        if (matched.minOrderAmount && subtotal < matched.minOrderAmount) {
          toast.error(`Montant minimum requis : ${matched.minOrderAmount} TND`);
          setPromoDiscount(0);
          setPromoName("");
        } else {
          setPromoDiscount(discount);
          setPromoName(matched.name);
          toast.success(`Code "${matched.code}" appliqué : -${matched.type === "percentage" ? matched.discount + "%" : matched.discount + " TND"}`);
        }
      }
    } catch {
      toast.error("Erreur lors de la vérification du code");
    } finally {
      setApplyingPromo(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <h1 className="font-display text-xl font-bold sm:text-2xl">Mon panier</h1>
        <p className="text-sm text-muted-foreground">{items.length} article{items.length > 1 ? "s" : ""}</p>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShoppingBag className="h-14 w-14 text-muted-foreground/30 sm:h-16 sm:w-16" />
            <p className="mt-4 font-display text-lg font-semibold">Votre panier est vide</p>
            <Link to="/catalogue">
              <Button className="mt-4">Explorer le catalogue</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:gap-8">
            {/* Items */}
            <div className="flex-1 space-y-3 sm:space-y-4">
              {items.map((item, i) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-card sm:gap-4 sm:p-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-20 sm:w-20"
                  />
                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground sm:text-xs">{item.brand}</p>
                        <Link to={`/produit/${item.productId}`} className="text-xs font-semibold hover:text-secondary transition-colors line-clamp-2 sm:text-sm">
                          {item.name}
                        </Link>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 rounded-lg border border-border sm:gap-2">
                        <button onClick={() => updateQty(item.productId, item.qty - 1)} className="p-1 text-muted-foreground hover:text-foreground transition-colors sm:p-1.5">
                          <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                        <span className="min-w-[20px] text-center text-xs font-medium sm:min-w-[24px] sm:text-sm">{item.qty}</span>
                        <button onClick={() => updateQty(item.productId, item.qty + 1)} className="p-1 text-muted-foreground hover:text-foreground transition-colors sm:p-1.5">
                          <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        </button>
                      </div>
                      <span className="font-display text-sm font-bold sm:text-base">
                        {(item.price * item.qty).toFixed(2)} TND
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:w-80">
              <div className="sticky top-20 rounded-xl border border-border bg-card p-5 shadow-card sm:p-6">
                <h2 className="font-display text-base font-bold sm:text-lg">Récapitulatif</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Sous-total</dt>
                    <dd className="font-medium">{subtotal.toFixed(2)} TND</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Livraison</dt>
                    <dd className="font-medium">{shipping === 0 ? "Gratuite" : `${shipping.toFixed(2)} TND`}</dd>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-secondary">
                      Livraison gratuite à partir de 500 TND
                    </p>
                  )}
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-destructive">
                      <dt className="text-sm">Promo ({promoName})</dt>
                      <dd className="text-sm font-medium">-{promoDiscount.toFixed(2)} TND</dd>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between">
                    <dt className="font-semibold">Total TTC</dt>
                    <dd className="font-display text-lg font-extrabold sm:text-xl">{total.toFixed(2)} TND</dd>
                  </div>
                </dl>
                {/* Promo code */}
                <div className="mt-4 flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Code promo" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                      className="pl-8 text-sm" onKeyDown={(e) => e.key === "Enter" && applyPromoCode()} />
                  </div>
                  <Button variant="outline" size="sm" onClick={applyPromoCode} disabled={applyingPromo || !promoCode.trim()}>
                    Appliquer
                  </Button>
                </div>
                <Link to="/checkout">
                  <Button className="mt-6 w-full bg-hero-gradient text-primary-foreground hover:opacity-90 font-semibold" size="lg">
                    Passer la commande
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/catalogue">
                  <Button variant="ghost" className="mt-2 w-full" size="sm">
                    Continuer mes achats
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Cross-sell: Frequently Bought Together */}
        {crossSell.length > 0 && items.length > 0 && (
          <section className="mt-8 sm:mt-12">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary sm:h-5 sm:w-5" />
              <h2 className="font-display text-base font-bold sm:text-lg">Souvent achetés ensemble</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Recommandés par l'IA MediKair</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-5 lg:grid-cols-4">
              {crossSell.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
