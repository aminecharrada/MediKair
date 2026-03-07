import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Package, AlertTriangle, Sparkles, Truck, Check, Trash2, Loader2, Cpu, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notificationsAPI } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Notification {
  _id: string;
  type: "order" | "stock" | "promo" | "delivery" | "system" | "ai-suggestion";
  title: string;
  message: string;
  read: boolean;
  link: string;
  createdAt: string;
}

const typeConfig: Record<string, { icon: any; color: string }> = {
  stock: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
  order: { icon: Package, color: "bg-accent text-accent-foreground" },
  promo: { icon: Sparkles, color: "bg-secondary/10 text-secondary" },
  delivery: { icon: Truck, color: "bg-primary/10 text-primary" },
  system: { icon: Info, color: "bg-muted text-muted-foreground" },
  "ai-suggestion": { icon: Cpu, color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const fetchNotifs = async () => {
      try {
        const res = await notificationsAPI.getAll({ limit: 50 });
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, [user, navigate]);

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const markRead = async (id: string) => {
    const n = notifications.find((n) => n._id === id);
    if (n?.read) return;
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) { console.error(err); }
  };

  const remove = async (id: string) => {
    try {
      await notificationsAPI.delete(id);
      const removed = notifications.find((n) => n._id === id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (removed && !removed.read) setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-secondary" />
            <div>
              <h1 className="font-display text-2xl font-bold">Notifications</h1>
              <p className="text-sm text-muted-foreground">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <Check className="mr-1.5 h-3.5 w-3.5" />Tout marquer comme lu
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 font-display text-lg font-semibold">Aucune notification</p>
            <p className="text-sm text-muted-foreground">Vous serez notifié des mises à jour de vos commandes et alertes stock.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {notifications.map((n, i) => {
              const config = typeConfig[n.type] || typeConfig.system;
              return (
                <motion.div key={n._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  onClick={() => markRead(n._id)}
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
                    <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); remove(n._id); }} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
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
