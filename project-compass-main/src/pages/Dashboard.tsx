import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Clock, TrendingUp, Sparkles, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";

const recentOrders = [
  { id: "CMD-2026-0412", date: "08 Fév 2026", total: "1 234.50 MAD", status: "Livré", items: 8 },
  { id: "CMD-2026-0389", date: "25 Jan 2026", total: "567.00 MAD", status: "En cours", items: 3 },
  { id: "CMD-2026-0341", date: "12 Jan 2026", total: "2 890.00 MAD", status: "Livré", items: 12 },
];

export default function DashboardPage() {
  const frequentProducts = products.slice(0, 4);
  const aiRecommended = products.slice(4, 8);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-xl font-bold sm:text-2xl">Bonjour, Dr. Ahmed 👋</h1>
          <p className="text-sm text-muted-foreground">Cabinet Dentaire Fès Centre</p>
        </motion.div>

        {/* Quick stats */}
        <div className="mt-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShoppingCart, label: "Commandes ce mois", value: "3", color: "bg-primary text-primary-foreground" },
            { icon: Package, label: "Produits commandés", value: "23", color: "bg-secondary text-secondary-foreground" },
            { icon: TrendingUp, label: "Dépenses du mois", value: "4 691 MAD", color: "bg-accent text-accent-foreground" },
            { icon: Clock, label: "Prochain réassort", value: "~5 jours", color: "bg-muted text-muted-foreground" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <p className="mt-2 font-display text-lg font-extrabold sm:text-2xl">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground sm:text-xs">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Orders */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold sm:text-lg">Dernières commandes</h2>
            <Link to="/commandes">
              <Button variant="ghost" size="sm">Voir tout <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            </Link>
          </div>

          {/* Desktop table */}
          <div className="mt-4 hidden sm:block overflow-hidden rounded-xl border border-border bg-card shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Commande</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Articles</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{order.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                    <td className="px-4 py-3 hidden md:table-cell">{order.items}</td>
                    <td className="px-4 py-3 font-semibold">{order.total}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.status === "Livré" ? "bg-accent text-accent-foreground" : "bg-secondary/10 text-secondary"
                      }`}>{order.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Commander à nouveau">
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-4 space-y-3 sm:hidden">
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold">{order.id}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    order.status === "Livré" ? "bg-accent text-accent-foreground" : "bg-secondary/10 text-secondary"
                  }`}>{order.status}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{order.date} · {order.items} articles</span>
                  <span className="font-semibold">{order.total}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Frequent Products */}
        <section className="mt-8">
          <h2 className="font-display text-base font-bold sm:text-lg">Vos produits fréquents</h2>
          <p className="text-xs text-muted-foreground sm:text-sm">Récommandez en un clic</p>
          <div className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
            {frequentProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>

        {/* AI Suggestions */}
        <section className="mt-8 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-secondary" />
            <h2 className="font-display text-base font-bold sm:text-lg">Suggestions IA pour vous</h2>
          </div>
          <p className="text-xs text-muted-foreground sm:text-sm">Basées sur votre historique et les tendances de praticiens similaires</p>
          <div className="mt-4 grid gap-3 grid-cols-2 lg:grid-cols-4">
            {aiRecommended.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
