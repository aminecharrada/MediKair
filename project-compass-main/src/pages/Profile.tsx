import { useState } from "react";
import { motion } from "framer-motion";
import { User, MapPin, Heart, Settings, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const tabs = [
  { id: "info", label: "Info", fullLabel: "Informations", icon: User },
  { id: "addresses", label: "Adresses", fullLabel: "Adresses", icon: MapPin },
  { id: "favorites", label: "Favoris", fullLabel: "Favoris", icon: Heart },
  { id: "settings", label: "Réglages", fullLabel: "Paramètres", icon: Settings },
];

const addresses = [
  { id: "1", label: "Cabinet principal", address: "123 Avenue Hassan II, Fès 30000", phone: "+212 6 12 34 56 78", default: true },
  { id: "2", label: "Clinique annexe", address: "45 Rue Ibn Sina, Fès 30050", phone: "+212 6 98 76 54 32", default: false },
];

export default function ProfilePage() {
  const [tab, setTab] = useState("info");
  const favorites = products.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hero-gradient text-primary-foreground font-display text-base font-bold sm:h-16 sm:w-16 sm:text-xl">AB</div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-bold sm:text-2xl">Dr. Ahmed Benali</h1>
            <p className="text-xs text-muted-foreground truncate sm:text-sm">Cabinet Dentaire Fès Centre · ahmed@cabinet-fes.ma</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border -mx-4 px-4 sm:mt-8 sm:mx-0 sm:px-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:py-3 sm:text-sm ${
                tab === t.id ? "border-secondary text-secondary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              <t.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:hidden">{t.label}</span>
              <span className="hidden sm:inline">{t.fullLabel}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 sm:mt-6">
          {tab === "info" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl rounded-xl border border-border bg-card p-4 shadow-card sm:p-6">
              <h2 className="font-display text-sm font-bold sm:text-base">Informations personnelles</h2>
              <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 sm:grid-cols-2">
                <div><label className="text-xs font-medium sm:text-sm">Nom complet</label><Input className="mt-1" defaultValue="Dr. Ahmed Benali" /></div>
                <div><label className="text-xs font-medium sm:text-sm">Email</label><Input className="mt-1" defaultValue="ahmed@cabinet-fes.ma" /></div>
                <div><label className="text-xs font-medium sm:text-sm">Téléphone</label><Input className="mt-1" defaultValue="+212 6 12 34 56 78" /></div>
                <div><label className="text-xs font-medium sm:text-sm">Spécialité</label><Input className="mt-1" defaultValue="Dentisterie générale" /></div>
                <div className="sm:col-span-2"><label className="text-xs font-medium sm:text-sm">Nom du cabinet</label><Input className="mt-1" defaultValue="Cabinet Dentaire Fès Centre" /></div>
                <div><label className="text-xs font-medium sm:text-sm">ICE</label><Input className="mt-1" defaultValue="001234567000089" /></div>
                <div><label className="text-xs font-medium sm:text-sm">N° CNSS</label><Input className="mt-1" defaultValue="12345678" /></div>
              </div>
              <Button className="mt-4 w-full bg-hero-gradient text-primary-foreground sm:mt-6 sm:w-auto"><Save className="mr-2 h-4 w-4" />Enregistrer</Button>
            </motion.div>
          )}

          {tab === "addresses" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl space-y-3 sm:space-y-4">
              {addresses.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:gap-4 sm:p-5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-secondary sm:h-5 sm:w-5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{a.label}</p>
                      {a.default && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground sm:text-xs">Par défaut</span>}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{a.address}</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">{a.phone}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button variant="outline" className="w-full"><Plus className="mr-2 h-4 w-4" />Ajouter une adresse</Button>
            </motion.div>
          )}

          {tab === "favorites" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {favorites.length > 0 ? (
                <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
                  {favorites.map((p) => <ProductCard key={p.id} product={p} />)}
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
                  { label: "Notifications par email", desc: "Confirmations de commande et alertes stock" },
                  { label: "Suggestions IA", desc: "Recommandations personnalisées" },
                  { label: "Newsletter", desc: "Offres promotionnelles et nouveautés" },
                ].map((pref) => (
                  <label key={pref.label} className="flex items-center justify-between rounded-lg border border-border p-3 sm:p-4">
                    <div className="mr-3">
                      <p className="font-medium text-xs sm:text-sm">{pref.label}</p>
                      <p className="text-[10px] text-muted-foreground sm:text-xs">{pref.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="h-4 w-4 shrink-0 accent-secondary" />
                  </label>
                ))}
              </div>
              <div className="mt-5 border-t border-border pt-5 sm:mt-6 sm:pt-6">
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
