import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Package, ShoppingCart, Clock, TrendingUp, Sparkles, ArrowRight, RotateCcw, Loader2, FileSpreadsheet, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { productsAPI, ordersAPI, aiAPI } from "@/api";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/product";

interface OrderItem {
  product?: string;
  name?: string;
  quantity?: number;
}

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  orderStatus: string;
  orderItems: OrderItem[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [aiRecommended, setAiRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          productsAPI.getAll(),
          ordersAPI.getMyOrders().catch(() => ({ data: { data: [] } })),
        ]);
        setProducts(prodRes.data.data || []);
        setOrders(orderRes.data.orders || orderRes.data.data || []);

        // Fetch AI hybrid recommendations
        if (user?._id || user?.id) {
          try {
            const clientId = user._id || user.id;
            const aiRes = await aiAPI.getHybrid(clientId, undefined, 4);
            if (aiRes.data?.recommendations?.length) {
              setAiRecommended(aiRes.data.recommendations);
            }
          } catch {
            // AI service unavailable — fallback below in useMemo
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const recentOrders = orders.slice(0, 3);

  // Compute frequent products from order history
  const frequentProducts = useMemo(() => {
    const freq: Record<string, number> = {};
    orders.forEach((o) => {
      o.orderItems?.forEach((item) => {
        const pid = item.product || "";
        if (pid) freq[pid] = (freq[pid] || 0) + (item.quantity || 1);
      });
    });
    const sortedIds = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([id]) => id);
    const matched: Product[] = [];
    for (const id of sortedIds) {
      const p = products.find((pr) => (pr.id || pr._id) === id);
      if (p) matched.push(p);
      if (matched.length >= 4) break;
    }
    // Fallback: if not enough order data, show featured/popular
    if (matched.length < 4) {
      for (const p of products) {
        if (!matched.some((m) => (m.id || m._id) === (p.id || p._id))) {
          matched.push(p);
          if (matched.length >= 4) break;
        }
      }
    }
    return matched;
  }, [products, orders]);

  // AI suggestions fallback: products NOT in frequent list (used if AI service call fails)
  const aiFallback = useMemo(() => {
    if (aiRecommended.length > 0) return aiRecommended;
    const freqIds = new Set(frequentProducts.map((p) => p.id || p._id));
    return products.filter((p) => !freqIds.has(p.id || p._id)).slice(0, 4);
  }, [products, frequentProducts, aiRecommended]);

  const thisMonthOrders = orders.filter((o) => {
    const d = new Date(o.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthSpend = thisMonthOrders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  const totalItems = thisMonthOrders.reduce((s, o) => s + (o.orderItems?.length || 0), 0);

  const userName = user?.name || "Utilisateur";
  const cabinetName = user?.cabinet || "";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 md:py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-xl font-bold sm:text-2xl">Bonjour, {userName} 👋</h1>
          {cabinetName && <p className="text-xs text-muted-foreground sm:text-sm">{cabinetName}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/import-csv">
              <Button variant="outline" size="sm">
                <Upload className="mr-1.5 h-3.5 w-3.5" /> Import CSV
              </Button>
            </Link>
            <Link to="/commandes">
              <Button variant="outline" size="sm">
                <Package className="mr-1.5 h-3.5 w-3.5" /> Mes commandes
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">
          {[
            { icon: ShoppingCart, label: "Commandes ce mois", value: String(thisMonthOrders.length), color: "bg-primary text-primary-foreground" },
            { icon: Package, label: "Produits commandés", value: String(totalItems), color: "bg-secondary text-secondary-foreground" },
            { icon: TrendingUp, label: "Dépenses du mois", value: `${monthSpend.toFixed(0)} TND`, color: "bg-accent text-accent-foreground" },
            { icon: Clock, label: "Total commandes", value: String(orders.length), color: "bg-muted text-muted-foreground" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-3 shadow-card sm:p-5">
              <div className={`inline-flex h-7 w-7 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${stat.color}`}>
                <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <p className="mt-2 font-display text-lg font-extrabold sm:mt-3 sm:text-2xl">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <section className="mt-6 sm:mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold sm:text-lg">Dernières commandes</h2>
            <Link to="/commandes"><Button variant="ghost" size="sm">Voir tout <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : recentOrders.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucune commande pour le moment.</p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-card sm:mt-4">
              {/* Mobile card view */}
              <div className="divide-y divide-border sm:hidden">
                {recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="text-xs font-medium">{order._id.slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("fr-FR")} · {order.orderItems?.length || 0} article(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold">{order.totalPrice?.toFixed(2)} TND</p>
                      <span className={`inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        order.orderStatus === "Delivered" || order.orderStatus === "Livré"
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary/10 text-secondary"
                      }`}>{order.orderStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop table view */}
              <table className="hidden w-full text-sm sm:table">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commande</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Articles</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{order._id.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{new Date(order.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="px-4 py-3 hidden md:table-cell">{order.orderItems?.length || 0}</td>
                      <td className="px-4 py-3 font-semibold">{order.totalPrice?.toFixed(2)} TND</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.orderStatus === "Delivered" || order.orderStatus === "Livré"
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary/10 text-secondary"
                        }`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Frequent Products — computed from order history */}
        {!loading && frequentProducts.length > 0 && (
          <section className="mt-6 sm:mt-10">
            <h2 className="font-display text-base font-bold sm:text-lg">Vos produits fréquents</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">Basés sur votre historique de commandes</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-5 lg:grid-cols-4">
              {frequentProducts.map((p) => (
                <ProductCard key={p.id || p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* AI Suggestions */}
        {!loading && aiFallback.length > 0 && (
          <section className="mt-6 mb-6 sm:mt-10 sm:mb-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary sm:h-5 sm:w-5" />
              <h2 className="font-display text-base font-bold sm:text-lg">Suggestions pour vous</h2>
            </div>
            <p className="text-xs text-muted-foreground sm:text-sm">Recommandations personnalisées par l'IA MediKair</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:gap-5 lg:grid-cols-4">
              {aiFallback.map((p) => (
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
