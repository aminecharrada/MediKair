import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.inStock) return;
    addItem({
      productId: product.id || product._id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
    });
    toast.success(`${product.name} ajouté au panier`);
  };

  return (
    <Link
      to={`/produit/${product.id || product._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all hover:shadow-card-hover"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.badge && (
          <span className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold sm:left-3 sm:top-3 sm:px-2 sm:text-xs ${
            product.badge === "Promo"
              ? "bg-destructive text-destructive-foreground"
              : product.badge === "IA Recommandé"
              ? "bg-secondary text-secondary-foreground"
              : "bg-primary text-primary-foreground"
          }`}>
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:px-3 sm:py-1 sm:text-sm">
              Rupture de stock
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="text-[10px] font-medium text-muted-foreground sm:text-xs">{product.brand}</p>
        <h3 className="mt-0.5 text-xs font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-secondary transition-colors sm:mt-1 sm:text-sm">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-1 sm:mt-2">
          <Star className="h-3 w-3 fill-secondary text-secondary sm:h-3.5 sm:w-3.5" />
          <span className="text-[10px] font-medium text-foreground sm:text-xs">{product.rating}</span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-2 sm:pt-3">
          <div>
            <span className="font-display text-sm font-bold text-foreground sm:text-lg">
              {product.price.toFixed(2)} TND
            </span>
            {product.oldPrice && (
              <span className="ml-1 text-[10px] text-muted-foreground line-through sm:ml-2 sm:text-xs">
                {product.oldPrice.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7 shrink-0 sm:h-8 sm:w-8"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
