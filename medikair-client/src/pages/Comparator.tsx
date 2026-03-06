import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, X, ArrowLeftRight, Check, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { productsAPI } from "@/api";
import type { Product } from "@/types/product";

export default function ComparatorPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productsAPI.getAll();
        const data = res.data.data || [];
        setAllProducts(data);
        // Pre-select first two products if available
        if (data.length >= 2) {
          setSelected([data[0], data[1]]);
        } else if (data.length === 1) {
          setSelected([data[0]]);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getId = (p: Product) => p.id || p._id || "";

  const addProduct = (p: Product) => {
    if (selected.length < 3 && !selected.find((s) => getId(s) === getId(p))) {
      setSelected([...selected, p]);
    }
    setShowPicker(false);
  };

  const removeProduct = (id: string) => setSelected(selected.filter((p) => getId(p) !== id));

  const allSpecKeys = Array.from(
    new Set(selected.flatMap((p) => (p.specs && typeof p.specs === "object" ? Object.keys(p.specs) : [])))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <ArrowLeftRight className="h-5 w-5 text-secondary sm:h-6 sm:w-6" />
          <div>
            <h1 className="font-display text-xl font-bold sm:text-2xl">Comparateur de produits</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Comparez jusqu'à 3 produits côte à côte</p>
          </div>
        </div>

        {/* Mobile stacked cards view */}
        <div className="mt-5 space-y-4 sm:hidden">
          <div className="grid grid-cols-2 gap-3">
            {selected.map((p, i) => {
              const pImage = p.image || p.images?.[0]?.url || "";
              return (
                <motion.div key={getId(p)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="relative rounded-xl border border-border bg-card p-3 shadow-card text-center">
                  <button onClick={() => removeProduct(getId(p))} className="absolute right-1.5 top-1.5 text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <img src={pImage} alt={p.name} className="mx-auto h-16 w-16 rounded-lg object-cover" />
                  <p className="mt-2 text-[10px] text-muted-foreground">{p.brand}</p>
                  <p className="font-semibold text-xs truncate">{p.name}</p>
                  <p className="mt-1 font-display text-sm font-extrabold text-secondary">{p.price.toFixed(2)} TND</p>
                  {p.badge && <span className="mt-1 inline-block rounded-full bg-secondary/10 px-1.5 py-0.5 text-[10px] font-medium text-secondary">{p.badge}</span>}
                </motion.div>
              );
            })}
            {selected.length < 3 && (
              <button onClick={() => setShowPicker(true)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/30 p-3 text-muted-foreground hover:border-secondary/40 hover:text-secondary transition-colors">
                <Plus className="h-6 w-6" />
                <span className="text-xs font-medium">Ajouter</span>
              </button>
            )}
          </div>
          {/* Mobile comparison rows */}
          {selected.length > 0 && (
            <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden divide-y divide-border">
              {[{ label: "Note", render: (p: Product) => `⭐ ${p.rating}/5` },
                { label: "Disponibilité", render: (p: Product) => p.inStock ? "✅ En stock" : "❌ Rupture" },
                { label: "Catégorie", render: (p: Product) => p.category || "—" },
                ...allSpecKeys.map((key) => ({ label: key, render: (p: Product) => (p.specs && typeof p.specs === "object" ? (p.specs as Record<string, string>)[key] || "—" : "—") })),
              ].map((row) => (
                <div key={row.label} className="p-3">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1">{row.label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.map((p) => (
                      <p key={getId(p)} className="text-xs text-center">{row.render(p)}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop table view */}
        <div className="mt-8 hidden overflow-x-auto sm:block">
          <div className="min-w-[600px]">
            {/* Product headers */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${Math.max(selected.length, 1)}, 1fr)${selected.length < 3 ? " 160px" : ""}` }}>
              <div />
              {selected.map((p, i) => {
                const pImage = p.image || p.images?.[0]?.url || "";
                return (
                  <motion.div key={getId(p)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="relative rounded-xl border border-border bg-card p-4 shadow-card text-center">
                    <button onClick={() => removeProduct(getId(p))} className="absolute right-2 top-2 text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                    <img src={pImage} alt={p.name} className="mx-auto h-24 w-24 rounded-lg object-cover" />
                    <p className="mt-3 text-xs text-muted-foreground">{p.brand}</p>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="mt-2 font-display text-xl font-extrabold text-secondary">{p.price.toFixed(2)} TND</p>
                    {p.badge && <span className="mt-2 inline-block rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">{p.badge}</span>}
                  </motion.div>
                );
              })}
              {selected.length < 3 && (
                <button onClick={() => setShowPicker(true)}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 text-muted-foreground hover:border-secondary/40 hover:text-secondary transition-colors">
                  <Plus className="h-8 w-8" />
                  <span className="text-sm font-medium">Ajouter</span>
                </button>
              )}
            </div>

            {/* Comparison rows */}
            {selected.length > 0 && (
              <div className="mt-6 rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <div className="grid border-b border-border" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
                  <div className="px-4 py-3 font-medium text-sm bg-muted/50">Note</div>
                  {selected.map((p) => <div key={getId(p)} className="px-4 py-3 text-sm text-center">⭐ {p.rating}/5</div>)}
                </div>
                <div className="grid border-b border-border" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
                  <div className="px-4 py-3 font-medium text-sm bg-muted/50">Disponibilité</div>
                  {selected.map((p) => (
                    <div key={getId(p)} className="px-4 py-3 text-sm text-center">
                      {p.inStock ? <span className="text-secondary flex items-center justify-center gap-1"><Check className="h-4 w-4" />En stock</span>
                        : <span className="text-destructive flex items-center justify-center gap-1"><Minus className="h-4 w-4" />Rupture</span>}
                    </div>
                  ))}
                </div>
                <div className="grid border-b border-border" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
                  <div className="px-4 py-3 font-medium text-sm bg-muted/50">Catégorie</div>
                  {selected.map((p) => <div key={getId(p)} className="px-4 py-3 text-sm text-center capitalize">{p.category}</div>)}
                </div>
                {allSpecKeys.map((key) => (
                  <div key={key} className="grid border-b border-border last:border-0" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
                    <div className="px-4 py-3 font-medium text-sm bg-muted/50">{key}</div>
                    {selected.map((p) => (
                      <div key={getId(p)} className="px-4 py-3 text-sm text-center text-muted-foreground">
                        {p.specs && typeof p.specs === "object" ? (p.specs as Record<string, string>)[key] || "—" : "—"}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product picker modal */}
        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 sm:items-center" onClick={() => setShowPicker(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-4 shadow-xl sm:rounded-2xl sm:p-6">
              <h3 className="font-display text-base font-bold sm:text-lg">Choisir un produit</h3>
              <div className="mt-3 space-y-2 sm:mt-4">
                {allProducts.filter((p) => !selected.find((s) => getId(s) === getId(p))).map((p) => {
                  const pImage = p.image || p.images?.[0]?.url || "";
                  return (
                    <button key={getId(p)} onClick={() => addProduct(p)}
                      className="flex w-full items-center gap-2 rounded-lg border border-border p-2.5 text-left hover:border-secondary/40 transition-colors sm:gap-3 sm:p-3">
                      <img src={pImage} alt={p.name} className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate sm:text-sm">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground sm:text-xs">{p.brand} · {p.price.toFixed(2)} TND</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
