import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package, Users, ShoppingCart, Settings, BarChart3, Menu, X,
  Tag, Plus, Percent, Calendar, Megaphone, ToggleLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const sidebarLinks = [
  { label: "Dashboard", path: "/admin", icon: BarChart3 },
  { label: "Produits (PIM)", path: "/admin/produits", icon: Package },
  { label: "Clients (CRM)", path: "/admin/clients", icon: Users },
  { label: "Commandes", path: "/admin/commandes", icon: ShoppingCart },
  { label: "Promotions", path: "/admin/promotions", icon: Tag },
  { label: "Rapports", path: "/admin/rapports", icon: Megaphone },
  { label: "Paramètres", path: "/admin/parametres", icon: Settings },
];

const promotions = [
  { id: 1, name: "Lancement Implants Coniques", type: "Pourcentage", value: "-15%", target: "Catégorie Implantologie", start: "01 Fév 2026", end: "28 Fév 2026", active: true, uses: 47 },
  { id: 2, name: "Fidélité Gold", type: "Montant fixe", value: "-200 MAD", target: "Clients avec +10 commandes", start: "01 Jan 2026", end: "31 Mar 2026", active: true, uses: 23 },
  { id: 3, name: "Pack Hygiène Printemps", type: "Bundle", value: "3+1 gratuit", target: "Gants + Masques + Désinfectant", start: "01 Mar 2026", end: "31 Mar 2026", active: false, uses: 0 },
  { id: 4, name: "Bienvenue Nouveau Client", type: "Pourcentage", value: "-10%", target: "Première commande", start: "Permanent", end: "—", active: true, uses: 156 },
  { id: 5, name: "Black Friday Dentaire", type: "Pourcentage", value: "-25%", target: "Tout le catalogue", start: "25 Nov 2025", end: "30 Nov 2025", active: false, uses: 312 },
];

export default function AdminPromotions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  const AddPromoForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="promo-name">Nom de la promotion *</Label>
          <Input id="promo-name" placeholder="Ex: Lancement Implants Coniques" />
        </div>
        <div className="space-y-2">
          <Label>Type de remise *</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Pourcentage</SelectItem>
              <SelectItem value="fixed">Montant fixe</SelectItem>
              <SelectItem value="bundle">Bundle (X+1 gratuit)</SelectItem>
              <SelectItem value="shipping">Livraison gratuite</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo-value">Valeur *</Label>
          <Input id="promo-value" placeholder="Ex: -15% ou -200 MAD" />
        </div>
        <div className="space-y-2">
          <Label>Cible *</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Appliquer à" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout le catalogue</SelectItem>
              <SelectItem value="category">Catégorie spécifique</SelectItem>
              <SelectItem value="product">Produit spécifique</SelectItem>
              <SelectItem value="first-order">Première commande</SelectItem>
              <SelectItem value="loyal">Clients fidèles (+10 cmd)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo-target-detail">Détail de la cible</Label>
          <Input id="promo-target-detail" placeholder="Ex: Catégorie Implantologie" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo-start">Date de début *</Label>
          <Input id="promo-start" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo-end">Date de fin *</Label>
          <Input id="promo-end" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo-code">Code promo (optionnel)</Label>
          <Input id="promo-code" placeholder="Ex: WELCOME10" className="uppercase" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="promo-max">Limite d'utilisations</Label>
          <Input id="promo-max" type="number" placeholder="Illimité" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="promo-desc">Description</Label>
        <Textarea id="promo-desc" placeholder="Description de l'offre pour les clients..." rows={2} />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <Label htmlFor="promo-active">Activer immédiatement</Label>
        <Switch id="promo-active" defaultChecked />
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Annuler</Button>
        <Button className="flex-1" onClick={() => setAddOpen(false)}>Créer la promotion</Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary"><Package className="h-4 w-4 text-sidebar-primary-foreground" /></div>
          <span className="font-display text-lg font-bold">Medikair <span className="text-xs font-normal opacity-60">Admin</span></span>
          <button className="ml-auto md:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {sidebarLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              location.pathname === link.path ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
            }`}><link.icon className="h-4 w-4" />{link.label}</Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <Link to="/"><Button variant="outline" size="sm" className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">← Retour au site</Button></Link>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-foreground/20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-6 backdrop-blur-lg">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}><Menu className="h-5 w-5" /></button>
          <h1 className="font-display text-lg font-bold">Promotions & Offres</h1>
          <div className="ml-auto"><Button size="sm" className="gap-2" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Nouvelle promotion</Button></div>
        </header>

        <div className="p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {[
              { label: "Promotions actives", value: promotions.filter(p => p.active).length.toString() },
              { label: "Utilisations totales", value: promotions.reduce((a, p) => a + p.uses, 0).toString() },
              { label: "Économies clients", value: "18 450 MAD" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-extrabold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {promotions.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                      {p.type === "Pourcentage" ? <Percent className="h-5 w-5 text-accent-foreground" /> :
                       p.type === "Bundle" ? <Package className="h-5 w-5 text-accent-foreground" /> :
                       <Tag className="h-5 w-5 text-accent-foreground" />}
                    </div>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.target}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />{p.start} → {p.end}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-primary">{p.value}</p>
                      <p className="text-xs text-muted-foreground">{p.uses} utilisations</p>
                    </div>
                    <Switch defaultChecked={p.active} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {isMobile ? (
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
            <SheetHeader><SheetTitle>Nouvelle promotion</SheetTitle></SheetHeader>
            <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)]"><AddPromoForm /></div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Nouvelle promotion</DialogTitle></DialogHeader>
            <AddPromoForm />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
