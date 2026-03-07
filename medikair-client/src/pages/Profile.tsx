import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Heart, Settings, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { favoritesAPI, notifPrefsAPI, authAPI } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import type { Product } from "@/types/product";

const tabs = [
  { id: "info", label: "Informations", icon: User },
  { id: "addresses", label: "Adresses", icon: MapPin },
  { id: "favorites", label: "Favoris", icon: Heart },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export default function ProfilePage() {
  const { user, updateProfile, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("info");
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Notification prefs state
  const [notifPrefs, setNotifPrefs] = useState({
    email: true,
    stock: true,
    promotions: true,
    newsletter: false,
  });

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    cabinet: user?.cabinet || "",
    city: user?.city || "",
    address: user?.address || "",
  });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    setForm({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      cabinet: user.cabinet || "",
      city: user.city || "",
      address: user.address || "",
    });
    if (user.notificationPrefs) {
      setNotifPrefs(user.notificationPrefs);
    }
  }, [user, navigate]);

  // Fetch real favorites
  useEffect(() => {
    if (tab === "favorites" && user) {
      setFavLoading(true);
      favoritesAPI.get().then((res) => {
        setFavorites(res.data.data || []);
      }).catch(() => {}).finally(() => setFavLoading(false));
    }
  }, [tab, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      toast({ title: "Profil mis à jour" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Échec de la mise à jour", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleNotifPrefChange = async (key: keyof typeof notifPrefs, value: boolean) => {
    const newPrefs = { ...notifPrefs, [key]: value };
    setNotifPrefs(newPrefs);
    try {
      await notifPrefsAPI.update({ [key]: value });
    } catch (err) {
      setNotifPrefs(notifPrefs); // revert
      toast({ title: "Erreur", description: "Préférence non sauvegardée", variant: "destructive" });
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      await favoritesAPI.toggle(productId);
      setFavorites((prev) => prev.filter((p: any) => (p._id || p.id) !== productId));
      toast({ title: "Retiré des favoris" });
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDeleteAccount = async () => {
    // placeholder for now — needs backend endpoint
    toast({ title: "Fonctionnalité à venir", description: "La suppression de compte sera disponible prochainement." });
  };

  const initials = user ? (user.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "?") : "?";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hero-gradient text-primary-foreground font-display text-base font-bold sm:h-16 sm:w-16 sm:text-xl">{initials}</div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold truncate sm:text-2xl">{user?.name || "Mon profil"}</h1>
            <p className="text-xs text-muted-foreground truncate sm:text-sm">{user?.cabinet && `${user.cabinet} · `}{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 -mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:mt-8 sm:px-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:py-3 sm:text-sm ${
                tab === t.id ? "border-secondary text-secondary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <t.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /><span className="hidden sm:inline">{t.label}</span><span className="sm:hidden">{t.label.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 sm:mt-6">
          {tab === "info" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
              <h2 className="font-display text-sm font-bold sm:text-base">Informations personnelles</h2>
              <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2"><label className="text-xs font-medium sm:text-sm">Nom complet</label><Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><label className="text-xs font-medium sm:text-sm">Email</label><Input className="mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><label className="text-xs font-medium sm:text-sm">Téléphone</label><Input className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><label className="text-xs font-medium sm:text-sm">Cabinet / Clinique</label><Input className="mt-1" value={form.cabinet} onChange={(e) => setForm({ ...form, cabinet: e.target.value })} /></div>
                <div><label className="text-xs font-medium sm:text-sm">Ville</label><Input className="mt-1" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Tunis, Sousse..." /></div>
                <div className="sm:col-span-2"><label className="text-xs font-medium sm:text-sm">Adresse</label><Input className="mt-1" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rue, quartier, code postal" /></div>
              </div>
              <Button className="mt-4 w-full bg-hero-gradient text-primary-foreground sm:mt-6 sm:w-auto" onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />{saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </motion.div>
          )}

          {tab === "addresses" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-3 sm:space-y-4">
              {form.address ? (
                <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user?.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{form.address}</p>
                      {form.city && <p className="text-sm text-muted-foreground">{form.city}</p>}
                      {form.phone && <p className="text-xs text-muted-foreground mt-1">Tél: {form.phone}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <MapPin className="mx-auto h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-3 font-medium text-sm">Aucune adresse enregistrée</p>
                  <p className="text-xs text-muted-foreground mt-1">Ajoutez votre adresse dans l'onglet "Informations"</p>
                </div>
              )}
            </motion.div>
          )}

          {tab === "favorites" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {favLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : favorites.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                  {favorites.map((p: any) => (
                    <div key={p._id || p.id} className="relative">
                      <ProductCard product={p} />
                      <button
                        onClick={() => handleRemoveFavorite(p._id || p.id)}
                        className="absolute top-2 right-2 z-10 rounded-full bg-background/80 p-1.5 text-destructive hover:bg-background transition-colors shadow-sm"
                        title="Retirer des favoris"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Heart className="mx-auto h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-3 font-medium text-sm">Aucun favori pour le moment</p>
                  <p className="text-xs text-muted-foreground mt-1">Cliquez sur le ♥ d'un produit pour l'ajouter à vos favoris</p>
                </div>
              )}
            </motion.div>
          )}

          {tab === "settings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
              <h2 className="font-display text-sm font-bold sm:text-base">Préférences de notifications</h2>
              <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
                {([
                  { key: "email" as const, label: "Notifications par email", desc: "Recevoir les confirmations de commande et alertes" },
                  { key: "stock" as const, label: "Alertes de stock", desc: "Être notifié quand un produit est bientôt épuisé" },
                  { key: "promotions" as const, label: "Promotions", desc: "Recevoir les offres et recommandations IA" },
                  { key: "newsletter" as const, label: "Newsletter", desc: "Recevoir les nouveautés et actualités dentaires" },
                ]).map((pref) => (
                  <label key={pref.key} className="flex items-center justify-between rounded-lg border border-border p-3 sm:p-4">
                    <div className="mr-3">
                      <p className="font-medium text-xs sm:text-sm">{pref.label}</p>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">{pref.desc}</p>
                    </div>
                    <Switch checked={notifPrefs[pref.key]} onCheckedChange={(v) => handleNotifPrefChange(pref.key, v)} />
                  </label>
                ))}
              </div>
              <div className="mt-4 border-t border-border pt-4 sm:mt-6 sm:pt-6">
                <h3 className="font-medium text-xs text-destructive sm:text-sm">Zone dangereuse</h3>
                <Button variant="outline" size="sm" className="mt-3 border-destructive text-destructive hover:bg-destructive/10" onClick={handleDeleteAccount}>Supprimer mon compte</Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
