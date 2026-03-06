import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, Package, Users, ShoppingCart, Settings, TrendingUp,
  ArrowUpRight, ArrowDownRight, DollarSign, Eye, Activity, Menu, X, Tag, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";

const sidebarLinks = [
  { label: "Dashboard", path: "/admin", icon: BarChart3 },
  { label: "Produits (PIM)", path: "/admin/produits", icon: Package },
  { label: "Clients (CRM)", path: "/admin/clients", icon: Users },
  { label: "Commandes", path: "/admin/commandes", icon: ShoppingCart },
  { label: "Promotions", path: "/admin/promotions", icon: Tag },
  { label: "Rapports", path: "/admin/rapports", icon: Megaphone },
  { label: "Paramètres", path: "/admin/parametres", icon: Settings },
];

const revenueData = [
  { month: "Sep", revenue: 42000 }, { month: "Oct", revenue: 55000 },
  { month: "Nov", revenue: 48000 }, { month: "Déc", revenue: 62000 },
  { month: "Jan", revenue: 58000 }, { month: "Fév", revenue: 71000 },
];

const categoryData = [
  { name: "Consommables", value: 35 }, { name: "Équipement", value: 25 },
  { name: "Implantologie", value: 20 }, { name: "Hygiène", value: 12 },
  { name: "Autre", value: 8 },
];

const pieColors = [
  "hsl(200 80% 22%)", "hsl(174 60% 40%)", "hsl(200 70% 30%)",
  "hsl(174 60% 55%)", "hsl(210 15% 65%)",
];

const topProducts = [
  { name: "Composite Nano-Hybride", sold: 342, revenue: "14 535 MAD" },
  { name: "Gants Nitrile", sold: 1200, revenue: "10 680 MAD" },
  { name: "Implant Conique Ti", sold: 89, revenue: "16 821 MAD" },
  { name: "Kit Fraises Diamantées", sold: 156, revenue: "5 304 MAD" },
];

const recentOrders = [
  { id: "CMD-0412", client: "Dr. Ahmed", total: "1 234 MAD", status: "Livré" },
  { id: "CMD-0411", client: "Dr. Fatima", total: "3 890 MAD", status: "En cours" },
  { id: "CMD-0410", client: "Dr. Youssef", total: "567 MAD", status: "En attente" },
  { id: "CMD-0409", client: "Dr. Sara", total: "2 100 MAD", status: "Livré" },
];

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:relative md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Package className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">Medikair <span className="text-xs font-normal opacity-60">Admin</span></span>
          <button className="ml-auto md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <Link to="/">
            <Button variant="outline" size="sm" className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent">
              ← Retour au site
            </Button>
          </Link>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-foreground/20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-6 backdrop-blur-lg">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold">Dashboard Analytics</h1>
        </header>

        <div className="p-4 sm:p-6">
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Revenu mensuel", value: "71 200 MAD", change: "+12.3%", up: true, icon: DollarSign },
              { label: "Commandes", value: "148", change: "+8.1%", up: true, icon: ShoppingCart },
              { label: "Nouveaux clients", value: "23", change: "+15.4%", up: true, icon: Users },
              { label: "Taux conversion IA", value: "34.2%", change: "-2.1%", up: false, icon: Activity },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{kpi.label}</span>
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 font-display text-2xl font-extrabold">{kpi.value}</p>
                <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${kpi.up ? "text-secondary" : "text-destructive"}`}>
                  {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {kpi.change} vs mois dernier
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card">
              <h3 className="font-display font-semibold text-sm sm:text-base">Évolution du revenu</h3>
              <div className="mt-4 h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 18% 89%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(210 15% 45%)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(210 15% 45%)" />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(174 60% 40%)" fill="hsl(174 60% 40% / 0.2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card">
              <h3 className="font-display font-semibold text-sm sm:text-base">Ventes par catégorie</h3>
              <div className="mt-4 h-48 sm:h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                      {categoryData.map((_, idx) => (
                        <Cell key={idx} fill={pieColors[idx]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card">
              <h3 className="font-display font-semibold text-sm sm:text-base">Top produits</h3>
              {/* Desktop table */}
              <table className="mt-4 w-full text-sm hidden sm:table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left text-muted-foreground font-medium">Produit</th>
                    <th className="pb-2 text-right text-muted-foreground font-medium">Vendus</th>
                    <th className="pb-2 text-right text-muted-foreground font-medium">Revenu</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p.name} className="border-b border-border last:border-0">
                      <td className="py-2.5 font-medium">{p.name}</td>
                      <td className="py-2.5 text-right text-muted-foreground">{p.sold}</td>
                      <td className="py-2.5 text-right font-semibold">{p.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile cards */}
              <div className="mt-3 space-y-2 sm:hidden">
                {topProducts.map((p) => (
                  <div key={p.name} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <div>
                      <p className="font-medium text-xs">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sold} vendus</p>
                    </div>
                    <span className="font-semibold text-xs">{p.revenue}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card">
              <h3 className="font-display font-semibold text-sm sm:text-base">Commandes récentes</h3>
              {/* Desktop table */}
              <table className="mt-4 w-full text-sm hidden sm:table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left text-muted-foreground font-medium">ID</th>
                    <th className="pb-2 text-left text-muted-foreground font-medium">Client</th>
                    <th className="pb-2 text-right text-muted-foreground font-medium">Total</th>
                    <th className="pb-2 text-right text-muted-foreground font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border last:border-0">
                      <td className="py-2.5 font-medium">{o.id}</td>
                      <td className="py-2.5 text-muted-foreground">{o.client}</td>
                      <td className="py-2.5 text-right font-semibold">{o.total}</td>
                      <td className="py-2.5 text-right">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          o.status === "Livré" ? "bg-accent text-accent-foreground" :
                          o.status === "En cours" ? "bg-secondary/10 text-secondary" :
                          "bg-muted text-muted-foreground"
                        }`}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile cards */}
              <div className="mt-3 space-y-2 sm:hidden">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                    <div>
                      <p className="font-mono font-semibold text-xs text-primary">{o.id}</p>
                      <p className="text-xs text-muted-foreground">{o.client}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-xs">{o.total}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        o.status === "Livré" ? "bg-accent text-accent-foreground" :
                        o.status === "En cours" ? "bg-secondary/10 text-secondary" :
                        "bg-muted text-muted-foreground"
                      }`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
