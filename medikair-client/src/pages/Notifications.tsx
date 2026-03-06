import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Package, AlertTriangle, Sparkles, Truck, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Notification {
  id: string;
  type: "restock" | "order" | "promo" | "delivery";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: "1", type: "restock", title: "Alerte réassort", message: "Votre stock de Gants Nitrile est estimé épuisé dans 5 jours. Recommandez maintenant pour éviter une rupture.", date: "Il y a 2h", read: false },
  { id: "2", type: "delivery", title: "Commande expédiée", message: "Votre commande CMD-2026-0412 a été expédiée. Livraison estimée : demain avant 18h.", date: "Il y a 5h", read: false },
  { id: "3", type: "promo", title: "Recommandation IA", message: "Basé sur votre historique, le Composite Universel Nano-Hybride est en promotion à -15%. Ne manquez pas cette offre !", date: "Hier", read: false },
  { id: "4", type: "order", title: "Commande confirmée", message: "Votre commande CMD-2026-0389 de 567.00 TND a été validée et est en cours de préparation.", date: "25 Jan", read: true },
  { id: "5", type: "restock", title: "Alerte réassort", message: "Les Limes Endodontiques NiTi sont de nouveau en stock ! Commandez avant épuisement.", date: "20 Jan", read: true },
  { id: "6", type: "promo", title: "Nouveauté catalogue", message: "Découvrez le nouvel Adhésif Dentaire BondMax — recommandé par notre IA pour votre spécialité.", date: "15 Jan", read: true },
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
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-secondary" />
            <div>
              <h1 className="font-display text-2xl font-bold">Notifications</h1>
              <p className="text-sm text-muted-foreground">{unread} non lue{unread > 1 ? "s" : ""}</p>
            </div>
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <Check className="mr-1.5 h-3.5 w-3.5" />Tout marquer comme lu
            </Button>
          )}
        </div>

        <div className="mt-8 space-y-3">
          {notifications.map((n, i) => {
            const config = typeConfig[n.type];
            return (
              <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                onClick={() => markRead(n.id)}
                className={`flex gap-4 rounded-xl border p-4 shadow-card cursor-pointer transition-colors ${
                  n.read ? "border-border bg-card" : "border-secondary/30 bg-secondary/5"
                }`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.color}`}>
                  <config.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-secondary" />}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{n.date}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); remove(n.id); }} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
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
