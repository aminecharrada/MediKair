import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronDown, ChevronUp, RotateCcw, FileText, Truck, Clock, CheckCircle2, Loader2, Zap, ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ordersAPI } from "@/api";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
  product: string;
}

interface Order {
  _id: string;
  createdAt: string;
  totalPrice: number;
  orderStatus: string;
  orderNumber?: string;
  validationStatus?: string;
  orderItems: OrderItem[];
  shippingInfo?: { address?: string; city?: string };
  deliveredAt?: string;
  source?: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  "Delivered": { icon: CheckCircle2, color: "bg-accent text-accent-foreground" },
  "Livré": { icon: CheckCircle2, color: "bg-accent text-accent-foreground" },
  "delivered": { icon: CheckCircle2, color: "bg-accent text-accent-foreground" },
  "Shipped": { icon: Truck, color: "bg-secondary/10 text-secondary" },
  "En cours": { icon: Truck, color: "bg-secondary/10 text-secondary" },
  "shipped": { icon: Truck, color: "bg-secondary/10 text-secondary" },
  "Processing": { icon: Clock, color: "bg-muted text-muted-foreground" },
  "En attente": { icon: Clock, color: "bg-muted text-muted-foreground" },
  "confirmed": { icon: CheckCircle2, color: "bg-secondary/10 text-secondary" },
  "En attente de validation": { icon: ShieldAlert, color: "bg-amber-100 text-amber-700" },
  "Annulée": { icon: ShieldX, color: "bg-destructive/10 text-destructive" },
  "cancelled": { icon: ShieldX, color: "bg-destructive/10 text-destructive" },
};

const validationBadge: Record<string, { label: string; color: string }> = {
  "pending-validation": { label: "En attente de validation", color: "bg-amber-100 text-amber-700" },
  "approved": { label: "Validée", color: "bg-accent text-accent-foreground" },
  "rejected": { label: "Rejetée", color: "bg-destructive/10 text-destructive" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ordersAPI.getMyOrders();
        setOrders(res.data.orders || res.data.data || []);
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const reorder = (order: Order) => {
    order.orderItems.forEach((item) => {
      addItem({
        productId: item.product,
        name: item.name,
        brand: "",
        price: item.price,
        image: item.image,
      }, item.quantity);
    });
    toast({ title: "Articles ajoutés au panier", description: `${order.orderItems.length} article(s) ajoutés` });
  };

  const quickReorder = async (order: Order) => {
    setReordering(order._id);
    try {
      const res = await ordersAPI.reorder(order._id);
      const newOrder = res.data.data;
      toast({
        title: "Commande dupliquée",
        description: `Nouvelle commande ${newOrder?.orderNumber || ""} créée avec succès`,
      });
      // Refresh orders list
      const refreshRes = await ordersAPI.getMyOrders();
      setOrders(refreshRes.data.orders || refreshRes.data.data || []);
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.response?.data?.message || "Impossible de dupliquer la commande",
        variant: "destructive",
      });
    } finally {
      setReordering(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <Package className="h-5 w-5 text-secondary sm:h-6 sm:w-6" />
          <h1 className="font-display text-xl font-bold sm:text-2xl">Historique des commandes</h1>
        </div>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{orders.length} commande{orders.length > 1 ? "s" : ""} au total</p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center sm:py-20">
            <Package className="mx-auto h-10 w-10 text-muted-foreground/30 sm:h-12 sm:w-12" />
            <p className="mt-3 font-display text-base font-semibold sm:mt-4 sm:text-lg">Aucune commande</p>
            <p className="text-xs text-muted-foreground sm:text-sm">Vos commandes apparaîtront ici</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3 sm:mt-8 sm:space-y-4">
            {orders.map((order, i) => {
              const isOpen = expanded === order._id;
              const cfg = statusConfig[order.orderStatus] || statusConfig["En attente"];
              const statusColor = cfg?.color || "bg-muted text-muted-foreground";

              return (
                <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                  <button onClick={() => setExpanded(isOpen ? null : order._id)}
                    className="flex w-full items-center gap-2 p-3 text-left hover:bg-muted/30 transition-colors sm:gap-4 sm:p-5">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-display text-sm font-bold sm:text-base">{order.orderNumber || order._id.slice(-8).toUpperCase()}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:text-xs ${statusColor}`}>{order.orderStatus}</span>
                        {order.validationStatus && validationBadge[order.validationStatus] && (
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:text-xs ${validationBadge[order.validationStatus].color}`}>
                            {validationBadge[order.validationStatus].label}
                          </span>
                        )}
                        {order.source && order.source !== "web" && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:px-2.5 sm:text-xs">
                            {order.source === "csv-import" ? "CSV" : order.source === "reorder" ? "Recommande" : order.source}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-muted-foreground sm:mt-1 sm:text-sm">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")} · {order.orderItems.length} article{order.orderItems.length > 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="font-display text-sm font-extrabold whitespace-nowrap sm:text-lg">{order.totalPrice?.toFixed(2)} TND</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />}
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="border-t border-border p-3 sm:p-5">
                          <div className="space-y-2 sm:space-y-3">
                            {order.orderItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 sm:gap-3">
                                <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover sm:h-14 sm:w-14" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-xs truncate sm:text-sm">{item.name}</p>
                                  <p className="text-[10px] text-muted-foreground sm:text-xs">Qté: {item.quantity}</p>
                                </div>
                                <span className="font-semibold text-xs whitespace-nowrap sm:text-sm">{(item.price * item.quantity).toFixed(2)} TND</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 text-xs sm:mt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:pt-4 sm:text-sm">
                            {order.deliveredAt && (
                              <span className="text-muted-foreground">Livré le : <span className="font-medium text-foreground">{new Date(order.deliveredAt).toLocaleDateString("fr-FR")}</span></span>
                            )}
                            <div className="ml-auto flex flex-wrap gap-2">
                              <Button size="sm" variant="outline" onClick={() => reorder(order)}>
                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />Ajouter au panier
                              </Button>
                              <Button size="sm" className="bg-hero-gradient text-primary-foreground" disabled={reordering === order._id} onClick={() => quickReorder(order)}>
                                {reordering === order._id ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Zap className="mr-1.5 h-3.5 w-3.5" />}
                                Commande rapide
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
