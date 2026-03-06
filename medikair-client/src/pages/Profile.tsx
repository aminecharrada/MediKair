import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Heart, Settings, Save, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { productsAPI } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types/product";

const tabs = [
  { id: "info", label: "Informations", icon: User },
  { id: "addresses", label: "Adresses", icon: MapPin },
  { id: "favorites", label: "Favoris", icon: Heart },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("info");
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    cabinet: user?.cabinet || "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        cabinet: user.cabinet || "",
      });
    }
  }, [user]);

  useEffect(() => {
    productsAPI.getAll().then((res) => {
      setProducts((res.data.data || []).slice(0, 3));
    }).catch(() => {});
  }, []);

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

  const initials = user ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() : "?";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hero-gradient text-primary-foreground font-display text-base font-bold sm:h-16 sm:w-16 sm:text-xl">{initials}</div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold truncate sm:text-2xl">{user ? `${user.firstName} ${user.lastName}` : "Mon profil"}</h1>
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
                <div><label className="text-xs font-medium sm:text-sm">Prénom</label><Input className="mt-1" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
                <div><label className="text-xs font-medium sm:text-sm">Nom</label><Input className="mt-1" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
                <div><label className="text-xs font-medium sm:text-sm">Email</label><Input className="mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div><label className="text-xs font-medium sm:text-sm">Téléphone</label><Input className="mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="sm:col-span-2"><label className="text-xs font-medium sm:text-sm">Nom du cabinet</label><Input className="mt-1" value={form.cabinet} onChange={(e) => setForm({ ...form, cabinet: e.target.value })} /></div>
              </div>
              <Button className="mt-4 w-full bg-hero-gradient text-primary-foreground sm:mt-6 sm:w-auto" onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />{saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </motion.div>
          )}

          {tab === "addresses" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-3 sm:space-y-4">
              <p className="text-xs text-muted-foreground sm:text-sm">Les adresses seront disponibles lors de la prochaine commande.</p>
              <Button variant="outline" className="w-full"><Plus className="mr-2 h-4 w-4" />Ajouter une adresse</Button>
            </motion.div>
          )}

          {tab === "favorites" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                  {products.map((p) => <ProductCard key={p.id || p._id} product={p} />)}
                </div>
              ) : (
                <p className="py-16 text-center text-muted-foreground">Aucun favori pour le moment</p>
              )}
            </motion.div>
          )}

          {tab === "settings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
              <h2 className="font-display text-sm font-bold sm:text-base">Préférences</h2>
              <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
                {[
                  { label: "Notifications par email", desc: "Recevoir les confirmations de commande et alertes stock" },
                  { label: "Suggestions IA", desc: "Recevoir des recommandations personnalisées" },
                  { label: "Newsletter", desc: "Recevoir les offres promotionnelles et nouveautés" },
                ].map((pref) => (
                  <label key={pref.label} className="flex items-center justify-between rounded-lg border border-border p-3 sm:p-4">
                    <div className="mr-3">
                      <p className="font-medium text-xs sm:text-sm">{pref.label}</p>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">{pref.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-secondary" />
                  </label>
                ))}
              </div>
              <div className="mt-4 border-t border-border pt-4 sm:mt-6 sm:pt-6">
                <h3 className="font-medium text-xs text-destructive sm:text-sm">Zone dangereuse</h3>
                <Button variant="outline" size="sm" className="mt-3 border-destructive text-destructive hover:bg-destructive/10">Supprimer mon compte</Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
