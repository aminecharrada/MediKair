import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Package, AlertTriangle, Sparkles, Truck, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Notification {
  id: string; type: "restock" | "order" | "promo" | "delivery";
  title: string; message: string; date: string; read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", type: "restock", title: "Alerte réassort", message: "Votre stock de Gants Nitrile est estimé épuisé dans 5 jours.", date: "Il y a 2h", read: false },
  { id: "2", type: "delivery", title: "Commande expédiée", message: "CMD-2026-0412 expédiée. Livraison estimée demain avant 18h.", date: "Il y a 5h", read: false },
  { id: "3", type: "promo", title: "Recommandation IA", message: "Composite Universel en promotion -15%. Ne manquez pas !", date: "Hier", read: false },
  { id: "4", type: "order", title: "Commande confirmée", message: "CMD-2026-0389 de 567.00 MAD validée et en préparation.", date: "25 Jan", read: true },
  { id: "5", type: "restock", title: "Alerte réassort", message: "Limes Endodontiques NiTi de nouveau en stock !", date: "20 Jan", read: true },
  { id: "6", type: "promo", title: "Nouveauté catalogue", message: "Découvrez l'Adhésif BondMax — recommandé par l'IA.", date: "15 Jan", read: true },
];

const typeConfig = {
  restock: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  order: { icon: Package, color: "bg-accent text-accent-foreground" },
  promo: { icon: Sparkles, color: "bg-secondary/10 text-secondary" },
  delivery: { icon: Truck, color: "bg-primary/10 text-primary" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const remove = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-6 md:py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Bell className="h-5 w-5 text-secondary sm:h-6 sm:w-6" />
            <div>
              <h1 className="font-display text-xl font-bold sm:text-2xl">Notifications</h1>
              <p className="text-xs text-muted-foreground sm:text-sm">{unread} non lue{unread > 1 ? "s" : ""}</p>
            </div>
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="text-xs sm:text-sm">
              <Check className="mr-1 h-3.5 w-3.5" />
              <span className="hidden sm:inline">Tout marquer comme lu</span>
              <span className="sm:hidden">Tout lu</span>
            </Button>
          )}
        </div>

        <div className="mt-6 space-y-2 sm:mt-8 sm:space-y-3">
          {notifications.map((n, i) => {
            const config = typeConfig[n.type];
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => markRead(n.id)}
                className={`flex gap-3 rounded-xl border p-3 shadow-card cursor-pointer transition-colors sm:gap-4 sm:p-4 ${
                  n.read ? "border-border bg-card" : "border-secondary/30 bg-secondary/5"
                }`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 ${config.color}`}>
                  <config.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-xs sm:text-sm">{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-secondary sm:h-2 sm:w-2" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 sm:text-sm sm:line-clamp-none">{n.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">{n.date}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); remove(n.id); }} className="shrink-0 self-start text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
