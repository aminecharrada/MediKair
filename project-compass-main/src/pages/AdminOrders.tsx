import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package, Search, Users, ShoppingCart, Settings, BarChart3, Menu, X,
  Eye, Truck, Clock, CheckCircle, XCircle, Filter, Download, ChevronDown,
  Tag, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const sidebarLinks = [
  { label: "Dashboard", path: "/admin", icon: BarChart3 },
  { label: "Produits (PIM)", path: "/admin/produits", icon: Package },
  { label: "Clients (CRM)", path: "/admin/clients", icon: Users },
  { label: "Commandes", path: "/admin/commandes", icon: ShoppingCart },
  { label: "Promotions", path: "/admin/promotions", icon: Tag },
  { label: "Rapports", path: "/admin/rapports", icon: Megaphone },
  { label: "Paramètres", path: "/admin/parametres", icon: Settings },
];

type OrderStatus = "En attente" | "Confirmée" | "En préparation" | "Expédiée" | "Livrée" | "Annulée";

const statusConfig: Record<OrderStatus, { color: string; icon: typeof Clock }> = {
  "En attente": { color: "bg-muted text-muted-foreground", icon: Clock },
  "Confirmée": { color: "bg-primary/10 text-primary", icon: CheckCircle },
  "En préparation": { color: "bg-accent text-accent-foreground", icon: Package },
  "Expédiée": { color: "bg-secondary/15 text-secondary", icon: Truck },
  "Livrée": { color: "bg-secondary/20 text-secondary", icon: CheckCircle },
  "Annulée": { color: "bg-destructive/10 text-destructive", icon: XCircle },
};

const orders = [
  { id: "CMD-0425", client: "Dr. Ahmed Benali", email: "ahmed@cabinet-fes.ma", date: "14 Fév 2026", total: "4 560 MAD", status: "En attente" as OrderStatus, items: [
    { name: "Composite Nano-Hybride A2", qty: 5, price: "425 MAD" },
    { name: "Gants Nitrile M", qty: 10, price: "89 MAD" },
    { name: "Adhésif Dentaire Universal", qty: 3, price: "312 MAD" },
  ], address: "12 Rue Atlas, Fès 30000", payment: "Virement bancaire", validated: false },
  { id: "CMD-0424", client: "Dr. Fatima Zahra", email: "fatima@dentaire-casa.ma", date: "13 Fév 2026", total: "12 340 MAD", status: "Confirmée" as OrderStatus, items: [
    { name: "Implant Conique Ti Ø4.0", qty: 4, price: "1 890 MAD" },
    { name: "Kit Chirurgical Implanto", qty: 1, price: "3 200 MAD" },
  ], address: "45 Bd Anfa, Casablanca 20000", payment: "Carte bancaire", validated: true },
  { id: "CMD-0423", client: "Dr. Youssef Amrani", email: "youssef@smile-rabat.ma", date: "12 Fév 2026", total: "2 890 MAD", status: "En préparation" as OrderStatus, items: [
    { name: "Fraises Diamantées Kit", qty: 2, price: "340 MAD" },
    { name: "Résine Provisoire", qty: 6, price: "198 MAD" },
  ], address: "78 Av Mohammed V, Rabat 10000", payment: "Virement bancaire", validated: true },
  { id: "CMD-0422", client: "Dr. Sara Idrissi", email: "sara@dental-marrakech.ma", date: "11 Fév 2026", total: "8 750 MAD", status: "Expédiée" as OrderStatus, items: [
    { name: "Autoclave Classe B", qty: 1, price: "8 200 MAD" },
    { name: "Indicateurs Bio", qty: 2, price: "275 MAD" },
  ], address: "23 Rue Liberté, Marrakech 40000", payment: "Carte bancaire", validated: true },
  { id: "CMD-0421", client: "Dr. Karim Tazi", email: "karim@ortho-tanger.ma", date: "10 Fév 2026", total: "1 430 MAD", status: "Livrée" as OrderStatus, items: [
    { name: "Brackets Métalliques", qty: 20, price: "45 MAD" },
    { name: "Fils NiTi 016", qty: 10, price: "53 MAD" },
  ], address: "9 Rue Mexique, Tanger 90000", payment: "Virement bancaire", validated: true },
  { id: "CMD-0420", client: "Dr. Nadia Belmahi", email: "nadia@smile-agadir.ma", date: "09 Fév 2026", total: "560 MAD", status: "Annulée" as OrderStatus, items: [
    { name: "Masques FFP2", qty: 5, price: "112 MAD" },
  ], address: "56 Av Hassan II, Agadir 80000", payment: "Carte bancaire", validated: false },
  { id: "CMD-0419", client: "Dr. Ahmed Benali", email: "ahmed@cabinet-fes.ma", date: "08 Fév 2026", total: "3 200 MAD", status: "Livrée" as OrderStatus, items: [
    { name: "Ciment Verre Ionomère", qty: 8, price: "245 MAD" },
    { name: "Matrice Sectionnelle", qty: 3, price: "153 MAD" },
  ], address: "12 Rue Atlas, Fès 30000", payment: "Virement bancaire", validated: true },
];

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);
  const location = useLocation();

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: "Total commandes", value: orders.length.toString(), sub: "ce mois" },
    { label: "En attente validation", value: orders.filter(o => o.status === "En attente").length.toString(), sub: "à traiter" },
    { label: "Revenu total", value: "33 730 MAD", sub: "+18% vs mois dernier" },
    { label: "Panier moyen", value: "4 819 MAD", sub: "par commande" },
  ];

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
          <h1 className="font-display text-lg font-bold">Gestion des commandes</h1>
          <div className="ml-auto">
            <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /><span className="hidden sm:inline">Exporter CSV</span></Button>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-extrabold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par ID ou client..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Filtrer par statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="En attente">En attente</SelectItem>
                <SelectItem value="Confirmée">Confirmée</SelectItem>
                <SelectItem value="En préparation">En préparation</SelectItem>
                <SelectItem value="Expédiée">Expédiée</SelectItem>
                <SelectItem value="Livrée">Livrée</SelectItem>
                <SelectItem value="Annulée">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table - Desktop */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Statut</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Validation</th>
                    <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, i) => {
                    const StatusIcon = statusConfig[o.status].icon;
                    return (
                      <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-primary">{o.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{o.client}</p>
                          <p className="text-xs text-muted-foreground">{o.email}</p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                        <td className="px-4 py-3 text-right font-semibold">{o.total}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[o.status].color}`}>
                            <StatusIcon className="h-3 w-3" />{o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {o.validated ? (
                            <Badge variant="secondary" className="bg-secondary/15 text-secondary border-0">Validée</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">En attente</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(o)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orders Cards - Mobile */}
          <div className="space-y-3 md:hidden">
            {filtered.map((o, i) => {
              const StatusIcon = statusConfig[o.status].icon;
              return (
                <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-border bg-card p-4 shadow-card" onClick={() => setSelectedOrder(o)}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-sm text-primary">{o.id}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig[o.status].color}`}>
                      <StatusIcon className="h-3 w-3" />{o.status}
                    </span>
                  </div>
                  <p className="mt-2 font-medium text-sm">{o.client}</p>
                  <p className="text-xs text-muted-foreground">{o.date}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <span className="font-semibold text-sm">{o.total}</span>
                    {o.validated ? (
                      <Badge variant="secondary" className="bg-secondary/15 text-secondary border-0 text-[10px]">Validée</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-[10px]">En attente</Badge>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Détail commande {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Client</p><p className="font-medium">{selectedOrder.client}</p></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium">{selectedOrder.date}</p></div>
                <div><p className="text-muted-foreground">Paiement</p><p className="font-medium">{selectedOrder.payment}</p></div>
                <div><p className="text-muted-foreground">Adresse</p><p className="font-medium">{selectedOrder.address}</p></div>
              </div>
              <div className="border-t border-border pt-3">
                <p className="font-semibold mb-2">Articles</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.name} className="flex justify-between text-sm">
                      <span>{item.name} <span className="text-muted-foreground">×{item.qty}</span></span>
                      <span className="font-medium">{item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2 font-semibold">
                  <span>Total</span><span>{selectedOrder.total}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {!selectedOrder.validated && <Button className="flex-1">Valider la commande</Button>}
                <Button variant="outline" className="flex-1">Mettre à jour le statut</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
