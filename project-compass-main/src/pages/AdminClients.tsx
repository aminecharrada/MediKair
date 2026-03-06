import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Package, Search, Users, Mail, Phone, MapPin, BarChart3, ShoppingCart, Settings, Menu, X, Tag, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const sidebarLinks = [
  { label: "Dashboard", path: "/admin", icon: BarChart3 },
  { label: "Produits (PIM)", path: "/admin/produits", icon: Package },
  { label: "Clients (CRM)", path: "/admin/clients", icon: Users },
  { label: "Commandes", path: "/admin/commandes", icon: ShoppingCart },
  { label: "Promotions", path: "/admin/promotions", icon: Tag },
  { label: "Rapports", path: "/admin/rapports", icon: Megaphone },
  { label: "Paramètres", path: "/admin/parametres", icon: Settings },
];

const clients = [
  { id: "1", name: "Dr. Ahmed Benali", email: "ahmed@cabinet-fes.ma", phone: "+212 6 12 34 56 78", city: "Fès", orders: 24, totalSpent: "45 200 MAD", lastOrder: "08 Fév 2026" },
  { id: "2", name: "Dr. Fatima Zahra", email: "fatima@dentaire-casa.ma", phone: "+212 6 98 76 54 32", city: "Casablanca", orders: 18, totalSpent: "32 100 MAD", lastOrder: "02 Fév 2026" },
  { id: "3", name: "Dr. Youssef Amrani", email: "youssef@smile-rabat.ma", phone: "+212 6 55 44 33 22", city: "Rabat", orders: 31, totalSpent: "67 890 MAD", lastOrder: "10 Fév 2026" },
  { id: "4", name: "Dr. Sara Idrissi", email: "sara@dental-marrakech.ma", phone: "+212 6 11 22 33 44", city: "Marrakech", orders: 12, totalSpent: "18 450 MAD", lastOrder: "28 Jan 2026" },
  { id: "5", name: "Dr. Karim Tazi", email: "karim@ortho-tanger.ma", phone: "+212 6 77 88 99 00", city: "Tanger", orders: 9, totalSpent: "12 300 MAD", lastOrder: "15 Jan 2026" },
];

export default function AdminClients() {
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase())
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
              link.path === "/admin/clients" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
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
          <h1 className="font-display text-lg font-bold">CRM — Gestion des clients</h1>
        </header>

        <div className="p-4 sm:p-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {[
              { label: "Total clients", value: "1 247" },
              { label: "Actifs ce mois", value: "342" },
              { label: "Valeur moyenne", value: "2 890 MAD" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-extrabold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher un client..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-display font-bold text-sm">
                    {c.name.split(" ").slice(1).map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{c.city}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5 text-sm">
                  <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" />{c.email}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" />{c.phone}</p>
                </div>
                <div className="mt-4 flex justify-between border-t border-border pt-3 text-xs">
                  <span className="text-muted-foreground">{c.orders} commandes</span>
                  <span className="font-semibold">{c.totalSpent}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
