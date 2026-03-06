import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronDown, ChevronUp, RotateCcw, FileText, Truck, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { products } from "@/data/products";

const orders = [
  {
    id: "CMD-2026-0412", date: "08 Fév 2026", total: "1 234.50 MAD", status: "Livré",
    items: [{ product: products[0], qty: 10 }, { product: products[3], qty: 20 }],
    tracking: "MA123456789", deliveredAt: "10 Fév 2026",
  },
  {
    id: "CMD-2026-0389", date: "25 Jan 2026", total: "567.00 MAD", status: "En cours",
    items: [{ product: products[1], qty: 5 }],
    tracking: "MA987654321", deliveredAt: null,
  },
  {
    id: "CMD-2026-0341", date: "12 Jan 2026", total: "2 890.00 MAD", status: "Livré",
    items: [{ product: products[2], qty: 1 }, { product: products[4], qty: 3 }],
    tracking: "MA555666777", deliveredAt: "15 Jan 2026",
  },
  {
    id: "CMD-2025-1298", date: "28 Déc 2025", total: "445.00 MAD", status: "Livré",
    items: [{ product: products[5], qty: 2 }, { product: products[7], qty: 3 }],
    tracking: "MA112233445", deliveredAt: "31 Déc 2025",
  },
];

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string }> = {
  "Livré": { icon: CheckCircle2, color: "bg-accent text-accent-foreground" },
  "En cours": { icon: Truck, color: "bg-secondary/10 text-secondary" },
  "En attente": { icon: Clock, color: "bg-muted text-muted-foreground" },
};

export default function OrdersPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-secondary sm:h-6 sm:w-6" />
          <h1 className="font-display text-xl font-bold sm:text-2xl">Historique des commandes</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} commandes au total</p>

        <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
          {orders.map((order, i) => {
            const isOpen = expanded === order.id;
            const statusColor = statusConfig[order.status]?.color || "bg-muted text-muted-foreground";

            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors sm:gap-4 sm:p-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm font-bold sm:text-base">{order.id}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium sm:text-xs ${statusColor}`}>{order.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{order.date} · {order.items.length} article{order.items.length > 1 ? "s" : ""}</p>
                  </div>
                  <span className="font-display text-sm font-extrabold sm:text-lg">{order.total}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="border-t border-border p-4 sm:p-5">
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.product.id} className="flex items-center gap-3">
                              <img src={item.product.image} alt={item.product.name} className="h-12 w-12 rounded-lg object-cover sm:h-14 sm:w-14" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs sm:text-sm truncate">{item.product.name}</p>
                                <p className="text-[10px] text-muted-foreground sm:text-xs">{item.product.brand} · Qté: {item.qty}</p>
                              </div>
                              <span className="font-semibold text-xs sm:text-sm whitespace-nowrap">{(item.product.price * item.qty).toFixed(2)} MAD</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center">
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm">
                            {order.tracking && (
                              <span className="text-muted-foreground">Suivi : <span className="font-medium text-foreground">{order.tracking}</span></span>
                            )}
                            {order.deliveredAt && (
                              <span className="text-muted-foreground">Livré le : <span className="font-medium text-foreground">{order.deliveredAt}</span></span>
                            )}
                          </div>
                          <div className="flex gap-2 sm:ml-auto">
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm"><FileText className="mr-1.5 h-3.5 w-3.5" />Facture</Button>
                            <Button size="sm" className="flex-1 sm:flex-none bg-hero-gradient text-primary-foreground text-xs sm:text-sm"><RotateCcw className="mr-1.5 h-3.5 w-3.5" />Recommander</Button>
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
      </div>
      <Footer />
    </div>
  );
}
