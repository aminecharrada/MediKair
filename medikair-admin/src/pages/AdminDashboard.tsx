import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/AdminLayout";
import { reportsAPI } from "@/api";

const pieColors = [
  "hsl(200 80% 22%)", "hsl(174 60% 40%)", "hsl(200 70% 30%)",
  "hsl(174 60% 55%)", "hsl(210 15% 65%)", "hsl(200 60% 50%)",
  "hsl(174 40% 30%)", "hsl(210 25% 55%)",
];

const statusLabel: Record<string, string> = {
  "En attente": "En attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

function formatTND(n: number) {
  return n.toLocaleString("fr-TN") + " TND";
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, revRes, catRes, topRes] = await Promise.all([
          reportsAPI.getDashboard(),
          reportsAPI.getRevenue({ year: new Date().getFullYear() }),
          reportsAPI.getCategoryStats(),
          reportsAPI.getTopProducts({ limit: 5 }),
        ]);
        setDashboard(dashRes.data.data);
        setRevenueData(revRes.data.data || []);
        setCategoryData(
          (catRes.data.data || []).map((c: any) => ({
            name: c.category || "Non classé",
            value: c.count,
          }))
        );
        setTopProducts(topRes.data.data || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const kpis = dashboard
    ? [
        { label: "Revenu total", value: formatTND(dashboard.totalRevenue || 0), icon: DollarSign },
        { label: "Commandes", value: String(dashboard.totalOrders || 0), icon: ShoppingCart },
        { label: "Clients", value: String(dashboard.totalClients || 0), icon: Users },
        { label: "Taux IA", value: "—", icon: Activity },
      ]
    : [];

  return (
    <AdminLayout title="Dashboard Analytics">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))
          : kpis.map((kpi, i) => (
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
              </motion.div>
            ))}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display font-semibold">Évolution du revenu</h3>
          <div className="mt-4 h-64">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 18% 89%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(210 15% 45%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(210 15% 45%)" />
                  <Tooltip formatter={(v: number) => formatTND(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(174 60% 40%)" fill="hsl(174 60% 40% / 0.2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display font-semibold">Produits par catégorie</h3>
          <div className="mt-4 h-64 flex items-center justify-center">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                    labelLine={false}
                  >
                    {categoryData.map((_, idx) => (
                      <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display font-semibold">Top produits</h3>
          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucun produit vendu</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-muted-foreground font-medium">Produit</th>
                  <th className="pb-2 text-right text-muted-foreground font-medium">Vendus</th>
                  <th className="pb-2 text-right text-muted-foreground font-medium">Revenu</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p: any) => (
                  <tr key={p.id || p.name} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-medium">{p.name}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{p.quantity}</td>
                    <td className="py-2.5 text-right font-semibold">{formatTND(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display font-semibold">Commandes récentes</h3>
          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : !dashboard?.recentOrders?.length ? (
            <p className="mt-4 text-sm text-muted-foreground">Aucune commande</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-muted-foreground font-medium">N°</th>
                  <th className="pb-2 text-left text-muted-foreground font-medium">Client</th>
                  <th className="pb-2 text-right text-muted-foreground font-medium">Total</th>
                  <th className="pb-2 text-right text-muted-foreground font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentOrders.map((o: any) => (
                  <tr key={o._id} className="border-b border-border last:border-0">
                    <td className="py-2.5 font-mono font-medium text-xs">{o.orderNumber || o._id.slice(-6)}</td>
                    <td className="py-2.5 text-muted-foreground">{o.client?.name || "—"}</td>
                    <td className="py-2.5 text-right font-semibold">{formatTND(o.totalPrice)}</td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          o.orderStatus === "delivered"
                            ? "bg-accent text-accent-foreground"
                            : o.orderStatus === "confirmed" || o.orderStatus === "processing"
                            ? "bg-secondary/10 text-secondary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {statusLabel[o.orderStatus] || o.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
