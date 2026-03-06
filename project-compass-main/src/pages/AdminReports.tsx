import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Package, Users, ShoppingCart, Settings, BarChart3, Menu, X,
  Tag, Megaphone, Download, TrendingUp, FileText, Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
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

const salesData = [
  { month: "Sep", ventes: 42, revenu: 42000 }, { month: "Oct", ventes: 55, revenu: 55000 },
  { month: "Nov", ventes: 68, revenu: 48000 }, { month: "Déc", ventes: 74, revenu: 62000 },
  { month: "Jan", ventes: 61, revenu: 58000 }, { month: "Fév", ventes: 82, revenu: 71000 },
];

const aiMetrics = [
  { label: "Recommandations générées", value: "2 340" },
  { label: "Taux d'acceptation", value: "34.2%" },
  { label: "Cross-sell réussis", value: "412" },
  { label: "Revenu attribué à l'IA", value: "24 500 MAD" },
];

const categoryPerf = [
  { cat: "Consommables", ventes: 520, revenu: "156 000 MAD", growth: "+12%" },
  { cat: "Implantologie", ventes: 89, revenu: "168 210 MAD", growth: "+23%" },
  { cat: "Équipement", ventes: 34, revenu: "245 000 MAD", growth: "+5%" },
  { cat: "Hygiène", ventes: 890, revenu: "45 780 MAD", growth: "+8%" },
  { cat: "Orthodontie", ventes: 156, revenu: "67 340 MAD", growth: "+18%" },
];

export default function AdminReports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("6m");
  const location = useLocation();

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
          <h1 className="font-display text-lg font-bold">Rapports & Analytique</h1>
          <div className="ml-auto flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-28 sm:w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Dernier mois</SelectItem>
                <SelectItem value="3m">3 derniers mois</SelectItem>
                <SelectItem value="6m">6 derniers mois</SelectItem>
                <SelectItem value="1y">1 an</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" /><span className="hidden sm:inline">Export PDF</span></Button>
          </div>
        </header>

        <div className="p-4 sm:p-6 space-y-6">
          {/* AI Performance */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><Brain className="h-5 w-5 text-primary" />Performance IA</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {aiMetrics.map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
                  <p className="text-sm text-muted-foreground">{m.label}</p>
                  <p className="mt-1 font-display text-2xl font-extrabold">{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sales Chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display font-semibold flex items-center gap-2"><TrendingUp className="h-4 w-4" />Évolution des ventes</h3>
              <div className="mt-4 h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 18% 89%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="ventes" stroke="hsl(174 60% 40%)" fill="hsl(174 60% 40% / 0.2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-display font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4" />Revenu par mois</h3>
              <div className="mt-4 h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 18% 89%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="revenu" fill="hsl(200 80% 22%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Performance */}
          <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-card">
            <h3 className="font-display font-semibold flex items-center gap-2 mb-4 text-sm sm:text-base"><FileText className="h-4 w-4" />Performance par catégorie</h3>
            {/* Desktop table */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Catégorie</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Ventes</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Revenu</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Croissance</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryPerf.map((c) => (
                    <tr key={c.cat} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium">{c.cat}</td>
                      <td className="py-3 text-right text-muted-foreground">{c.ventes}</td>
                      <td className="py-3 text-right font-semibold">{c.revenu}</td>
                      <td className="py-3 text-right text-secondary font-medium">{c.growth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="space-y-2 sm:hidden">
              {categoryPerf.map((c) => (
                <div key={c.cat} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="font-medium text-sm">{c.cat}</p>
                    <p className="text-xs text-muted-foreground">{c.ventes} ventes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{c.revenu}</p>
                    <p className="text-xs text-secondary font-medium">{c.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
