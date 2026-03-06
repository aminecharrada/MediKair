import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, ArrowLeftRight, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products, Product } from "@/data/products";

export default function ComparatorPage() {
  const [selected, setSelected] = useState<Product[]>([products[0], products[4]]);
  const [showPicker, setShowPicker] = useState(false);

  const addProduct = (p: Product) => {
    if (selected.length < 3 && !selected.find((s) => s.id === p.id)) {
      setSelected([...selected, p]);
    }
    setShowPicker(false);
  };

  const removeProduct = (id: string) => setSelected(selected.filter((p) => p.id !== id));
  const allSpecKeys = Array.from(new Set(selected.flatMap((p) => Object.keys(p.specs))));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="h-5 w-5 text-secondary sm:h-6 sm:w-6" />
          <div>
            <h1 className="font-display text-xl font-bold sm:text-2xl">Comparateur</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Comparez jusqu'à 3 produits côte à côte</p>
          </div>
        </div>

        {/* Mobile: stacked cards view */}
        <div className="mt-6 sm:hidden">
          {/* Product selector cards */}
          <div className="grid grid-cols-2 gap-3">
            {selected.map((p) => (
              <div key={p.id} className="relative rounded-xl border border-border bg-card p-3 shadow-card text-center">
                <button onClick={() => removeProduct(p.id)} className="absolute right-2 top-2 text-muted-foreground hover:text-destructive">
                  <X className="h-3.5 w-3.5" />
                </button>
                <img src={p.image} alt={p.name} className="mx-auto h-16 w-16 rounded-lg object-cover" />
                <p className="mt-2 text-[10px] text-muted-foreground">{p.brand}</p>
                <p className="font-semibold text-xs line-clamp-2">{p.name}</p>
                <p className="mt-1 font-display text-sm font-extrabold text-secondary">{p.price.toFixed(2)} MAD</p>
              </div>
            ))}
            {selected.length < 3 && (
              <button onClick={() => setShowPicker(true)}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-border bg-muted/30 p-3 text-muted-foreground hover:border-secondary/40 hover:text-secondary transition-colors">
                <Plus className="h-6 w-6" />
                <span className="text-xs font-medium">Ajouter</span>
              </button>
            )}
          </div>

          {/* Mobile comparison rows */}
          <div className="mt-4 rounded-xl border border-border bg-card shadow-card overflow-hidden">
            {["Note", "Disponibilité", "Catégorie", ...allSpecKeys].map((key) => (
              <div key={key} className="border-b border-border last:border-0">
                <div className="bg-muted/50 px-3 py-2 text-xs font-medium">{key}</div>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${selected.length}, 1fr)` }}>
                  {selected.map((p) => (
                    <div key={p.id} className="px-3 py-2 text-center text-xs border-r border-border last:border-0">
                      {key === "Note" && `⭐ ${p.rating}/5`}
                      {key === "Disponibilité" && (p.inStock
                        ? <span className="text-secondary flex items-center justify-center gap-1"><Check className="h-3 w-3" />En stock</span>
                        : <span className="text-destructive flex items-center justify-center gap-1"><Minus className="h-3 w-3" />Rupture</span>
                      )}
                      {key === "Catégorie" && <span className="capitalize">{p.category}</span>}
                      {!["Note", "Disponibilité", "Catégorie"].includes(key) && (
                        <span className="text-muted-foreground">{p.specs[key] || "—"}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: table view */}
        <div className="mt-8 hidden sm:block overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${Math.max(selected.length, 1)}, 1fr)${selected.length < 3 ? " 160px" : ""}` }}>
              <div />
              {selected.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="relative rounded-xl border border-border bg-card p-4 shadow-card text-center">
                  <button onClick={() => removeProduct(p.id)} className="absolute right-2 top-2 text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                  <img src={p.image} alt={p.name} className="mx-auto h-24 w-24 rounded-lg object-cover" />
                  <p className="mt-3 text-xs text-muted-foreground">{p.brand}</p>
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="mt-2 font-display text-xl font-extrabold text-secondary">{p.price.toFixed(2)} MAD</p>
                  {p.badge && <span className="mt-2 inline-block rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">{p.badge}</span>}
                </motion.div>
              ))}
              {selected.length < 3 && (
                <button onClick={() => setShowPicker(true)}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 text-muted-foreground hover:border-secondary/40 hover:text-secondary transition-colors">
                  <Plus className="h-8 w-8" />
                  <span className="text-sm font-medium">Ajouter</span>
                </button>
              )}
            </div>

            <div className="mt-6 rounded-xl border border-border bg-card shadow-card overflow-hidden">
              {["Note", "Disponibilité", "Catégorie", ...allSpecKeys].map((key) => (
                <div key={key} className="grid border-b border-border last:border-0" style={{ gridTemplateColumns: `200px repeat(${selected.length}, 1fr)` }}>
                  <div className="px-4 py-3 font-medium text-sm bg-muted/50">{key}</div>
                  {selected.map((p) => (
                    <div key={p.id} className="px-4 py-3 text-sm text-center">
                      {key === "Note" && `⭐ ${p.rating}/5`}
                      {key === "Disponibilité" && (p.inStock
                        ? <span className="text-secondary flex items-center justify-center gap-1"><Check className="h-4 w-4" />En stock</span>
                        : <span className="text-destructive flex items-center justify-center gap-1"><Minus className="h-4 w-4" />Rupture</span>
                      )}
                      {key === "Catégorie" && <span className="capitalize">{p.category}</span>}
                      {!["Note", "Disponibilité", "Catégorie"].includes(key) && (
                        <span className="text-muted-foreground">{p.specs[key] || "—"}</span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product picker modal */}
        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-foreground/20" onClick={() => setShowPicker(false)}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[80vh] w-full overflow-y-auto rounded-t-2xl border border-border bg-card p-5 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-6">
              <h3 className="font-display text-base font-bold sm:text-lg">Choisir un produit</h3>
              <div className="mt-4 space-y-2">
                {products.filter((p) => !selected.find((s) => s.id === p.id)).map((p) => (
                  <button key={p.id} onClick={() => addProduct(p)}
                    className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left hover:border-secondary/40 transition-colors">
                    <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium sm:text-sm truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">{p.brand} · {p.price.toFixed(2)} MAD</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
