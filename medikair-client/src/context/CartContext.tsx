import { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from "react";
import { cartAPI } from "@/api";

export interface CartItem {
  productId: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  syncCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const isAuthenticated = () => !!localStorage.getItem("client_token");

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem("medikair_cart");
    return stored ? JSON.parse(stored) : [];
  });
  const synced = useRef(false);

  // Always persist to localStorage as fallback
  useEffect(() => {
    localStorage.setItem("medikair_cart", JSON.stringify(items));
  }, [items]);

  // Sync localStorage → server when user logs in
  const syncCart = useCallback(async () => {
    if (!isAuthenticated() || synced.current) return;
    synced.current = true;
    try {
      const localItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.qty,
      }));

      // Merge local cart with server
      if (localItems.length > 0) {
        await cartAPI.sync(localItems);
      }

      // Fetch merged cart from server
      const res = await cartAPI.get();
      const serverCart = res.data.data;
      if (serverCart?.items && Array.isArray(serverCart.items)) {
        const merged: CartItem[] = serverCart.items
          .filter((si: any) => si.product)
          .map((si: any) => ({
            productId: si.product._id || si.product,
            name: si.product.name || "",
            brand: si.product.brand || "",
            price: si.product.price || 0,
            image: si.product.images?.[0]?.url || "",
            qty: si.quantity,
          }));
        setItems(merged);
      }
    } catch (err) {
      console.error("Cart sync failed:", err);
    }
  }, [items]);

  // Auto-sync on mount if authenticated
  useEffect(() => {
    if (isAuthenticated() && !synced.current) {
      syncCart();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addItem = (item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...item, qty }];
    });
    // Fire-and-forget server add
    if (isAuthenticated()) {
      cartAPI.add(item.productId, qty).catch(() => {});
    }
  };

  const removeItem = (productId: string) => {
    // Find the server itemId before removing
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    // For server removal we just clear + re-sync (simpler than tracking server itemIds)
    if (isAuthenticated()) {
      // Re-sync: send current items minus the removed one
      const remaining = items.filter((i) => i.productId !== productId);
      cartAPI.clear().then(() => {
        if (remaining.length > 0) {
          cartAPI.sync(remaining.map((i) => ({ productId: i.productId, quantity: i.qty }))).catch(() => {});
        }
      }).catch(() => {});
    }
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    );
    // Server: just re-sync with latest quantities
    if (isAuthenticated()) {
      const updated = items.map((i) =>
        i.productId === productId ? { productId: i.productId, quantity: qty } : { productId: i.productId, quantity: i.qty }
      );
      cartAPI.clear().then(() => {
        cartAPI.sync(updated).catch(() => {});
      }).catch(() => {});
    }
  };

  const clearCart = () => {
    setItems([]);
    if (isAuthenticated()) {
      cartAPI.clear().catch(() => {});
    }
  };

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, syncCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
