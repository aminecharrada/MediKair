import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Search, Plus, Edit, Trash2, Eye, Filter, X, Menu, BarChart3, Users, ShoppingCart, Settings, Tag, Megaphone, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { products, categories } from "@/data/products";

const sidebarLinks = [
  { label: "Dashboard", path: "/admin", icon: BarChart3 },
  { label: "Produits (PIM)", path: "/admin/produits", icon: Package },
  { label: "Clients (CRM)", path: "/admin/clients", icon: Users },
  { label: "Commandes", path: "/admin/commandes", icon: ShoppingCart },
  { label: "Promotions", path: "/admin/promotions", icon: Tag },
  { label: "Rapports", path: "/admin/rapports", icon: Megaphone },
  { label: "Paramètres", path: "/admin/parametres", icon: Settings },
];

export default function AdminProducts() {
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const isMobile = useIsMobile();

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const AddProductForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="prod-name">Nom du produit *</Label>
          <Input id="prod-name" placeholder="Ex: Composite Nano-Hybride" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prod-brand">Marque *</Label>
          <Input id="prod-brand" placeholder="Ex: DentaPro" />
        </div>
        <div className="space-y-2">
          <Label>Catégorie *</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="prod-sub">Sous-catégorie</Label>
          <Input id="prod-sub" placeholder="Ex: Composites" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prod-price">Prix (MAD) *</Label>
          <Input id="prod-price" type="number" placeholder="0.00" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prod-old">Ancien prix (MAD)</Label>
          <Input id="prod-old" type="number" placeholder="Optionnel" />
        </div>
        <div className="space-y-2">
          <Label>Badge</Label>
          <Select>
            <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              <SelectItem value="Nouveau">Nouveau</SelectItem>
              <SelectItem value="Promo">Promo</SelectItem>
              <SelectItem value="Best-seller">Best-seller</SelectItem>
              <SelectItem value="IA Recommandé">IA Recommandé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="prod-desc">Description</Label>
        <Textarea id="prod-desc" placeholder="Description détaillée du produit..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Image du produit</Label>
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
          <div className="space-y-1">
            <Image className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Cliquer pour uploader</p>
            <p className="text-xs text-muted-foreground">PNG, JPG jusqu'à 5MB</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <Label htmlFor="prod-stock">En stock</Label>
        <Switch id="prod-stock" defaultChecked />
      </div>
      <div className="space-y-2">
        <Label>Spécifications</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {["Spec 1", "Spec 2"].map((_, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder="Clé" className="flex-1" />
              <Input placeholder="Valeur" className="flex-1" />
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full mt-1"><Plus className="mr-1 h-3 w-3" />Ajouter une spec</Button>
      </div>
      <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Annuler</Button>
        <Button className="flex-1" onClick={() => setAddOpen(false)}>Enregistrer le produit</Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Package className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">Medikair <span className="text-xs font-normal opacity-60">Admin</span></span>
          <button className="ml-auto md:hidden" onClick={() => setSidebarOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {sidebarLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              link.path === "/admin/produits" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
            }`}>
              <link.icon className="h-4 w-4" />{link.label}
            </Link>
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
          <h1 className="font-display text-lg font-bold">Gestion des produits (PIM)</h1>
          <Button size="sm" className="ml-auto bg-hero-gradient text-primary-foreground" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Ajouter un produit
          </Button>
        </header>

        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher un produit..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="default"><Filter className="mr-1.5 h-4 w-4" />Filtrer</Button>
          </div>

          {/* Desktop table */}
          <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-card hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Produit</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Marque</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Catégorie</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Prix</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Stock</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.brand}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{p.price.toFixed(2)} MAD</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.inStock ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"}`}>
                        {p.inStock ? "En stock" : "Rupture"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-4 space-y-3 md:hidden">
            {filtered.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium shrink-0 ${p.inStock ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"}`}>
                    {p.inStock ? "En stock" : "Rupture"}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] text-accent-foreground">{p.category}</span>
                  <span className="font-semibold text-sm">{p.price.toFixed(2)} MAD</span>
                </div>
                <div className="mt-2 flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Product Modal - Sheet on mobile, Dialog on desktop */}
      {isMobile ? (
        <Sheet open={addOpen} onOpenChange={setAddOpen}>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
            <SheetHeader><SheetTitle>Ajouter un produit</SheetTitle></SheetHeader>
            <div className="mt-4 overflow-y-auto h-[calc(90vh-80px)]"><AddProductForm /></div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Ajouter un produit</DialogTitle></DialogHeader>
            <AddProductForm />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
