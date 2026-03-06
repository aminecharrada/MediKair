import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Star, Sparkles, Truck, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { productsAPI } from "@/api";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types/product";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await productsAPI.getById(id);
        const prod = res.data.data || res.data.product;
        setProduct(prod);

        // Fetch related products from same category
        if (prod?.category) {
          const relRes = await productsAPI.getAll({ category: prod.category });
          const allRelated = (relRes.data.data || []).filter(
            (p: Product) => (p.id || p._id) !== id
          );
          setRelated(allRelated.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id || product._id || "",
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image || product.images?.[0]?.url || "",
    });
    toast({ title: "Ajouté au panier", description: product.name });
  };

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

  const productImage = product.image || product.images?.[0]?.url || "";
  const specs = product.specs && typeof product.specs === "object" ? Object.entries(product.specs) : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <Link to="/catalogue" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors sm:text-sm">
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Retour au catalogue
        </Link>

        <div className="mt-4 grid gap-6 sm:mt-6 lg:grid-cols-2 lg:gap-10">
          {/* Image */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="overflow-hidden rounded-xl border border-border bg-muted sm:rounded-2xl">
            <img src={productImage} alt={product.name} className="h-full w-full object-cover aspect-square" />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <p className="text-xs font-medium text-secondary sm:text-sm">{product.brand}</p>
            <h1 className="mt-1 font-display text-xl font-bold sm:text-2xl md:text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap sm:mt-3">
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-secondary text-secondary sm:h-4 sm:w-4" />
                <span className="text-xs font-semibold sm:text-sm">{product.rating}</span>
              </div>
              {product.subcategory && <span className="text-[10px] text-muted-foreground sm:text-xs">• {product.subcategory}</span>}
              <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-medium sm:text-xs ${product.inStock ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"}`}>
                {product.inStock ? "En stock" : "Rupture"}
              </span>
            </div>

            <div className="mt-4 sm:mt-6">
              <span className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">{product.price.toFixed(2)} TND</span>
              {product.oldPrice && <span className="ml-2 text-sm text-muted-foreground line-through sm:ml-3 sm:text-lg">{product.oldPrice.toFixed(2)} TND</span>}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:mt-4 sm:text-sm">{product.description}</p>

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

            {/* Actions */}
            <div className="mt-5 flex gap-3 sm:mt-8">
              <Button size="lg" className="flex-1 bg-hero-gradient text-primary-foreground hover:opacity-90 font-semibold sm:flex-none"
                disabled={!product.inStock} onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ajouter au panier
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground sm:text-xs"><Truck className="h-4 w-4 text-secondary" /> Livraison 24h</div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground sm:text-xs"><ShieldCheck className="h-4 w-4 text-secondary" /> Certifié CE/ISO</div>
            </div>
          </motion.div>
        </div>

        {/* Recommendations */}
        {related.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary sm:h-5 sm:w-5" />
              <h2 className="font-display text-base font-bold sm:text-xl">Produits similaires</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Produits de la même catégorie</p>
            <div className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-4 sm:mt-6 sm:gap-5">
              {related.map((p) => (
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
