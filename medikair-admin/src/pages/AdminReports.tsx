import { useState, useEffect } from "react";
import {
  Download, TrendingUp, FileText, Brain, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/AdminLayout";
import { reportsAPI } from "@/api";

function formatTND(n: number) {
  return n.toLocaleString("fr-TN") + " TND";
}

export default function AdminReports() {
  const [period, setPeriod] = useState("6m");
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [categoryPerf, setCategoryPerf] = useState<any[]>([]);
  const [aiMetrics, setAiMetrics] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const year = new Date().getFullYear();
        const [revRes, catRes, aiRes] = await Promise.all([
          reportsAPI.getRevenue({ year }),
          reportsAPI.getCategoryStats(),
          reportsAPI.getAIMetrics().catch(() => ({ data: { data: null } })),
        ]);

        // Revenue data from the API: { month, revenue, orders }
        const revData = revRes.data.data || [];
        // Filter based on period
        const monthsToShow = period === "1m" ? 1 : period === "3m" ? 3 : period === "6m" ? 6 : 12;
        const currentMonth = new Date().getMonth();
        const sliced = revData.filter((_: any, i: number) => {
          if (monthsToShow >= 12) return true;
          return i > currentMonth - monthsToShow && i <= currentMonth;
        });
        setRevenueData(sliced.length > 0 ? sliced : revData);

        setCategoryPerf(catRes.data.data || []);
        setAiMetrics(aiRes.data.data);
      } catch (err) {
        console.error("Reports load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  const aiCards = aiMetrics
    ? [
        { label: "Clients segmentés", value: `${aiMetrics.segmentationRate}%` },
        { label: "Risque churn élevé", value: String(aiMetrics.highChurnRisk || 0) },
        { label: "Recommandations", value: String(aiMetrics.recommendations || 0) },
        { label: "IA activée", value: aiMetrics.aiEnabled ? "Oui" : "Non" },
      ]
    : [
        { label: "Clients segmentés", value: "—" },
        { label: "Risque churn élevé", value: "—" },
        { label: "Recommandations", value: "—" },
        { label: "IA activée", value: "Non" },
      ];

  return (
    <AdminLayout
      title="Rapports & Analytique"
      headerActions={
        <>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Dernier mois</SelectItem>
              <SelectItem value="3m">3 derniers mois</SelectItem>
              <SelectItem value="6m">6 derniers mois</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-2"><Download className="h-4 w-4" />Export PDF</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* AI Performance */}
        <div>
          <h3 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />Performance IA
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))
              : aiCards.map((m) => (
                  <div key={m.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
                    <p className="text-sm text-muted-foreground">{m.label}</p>
                    <p className="mt-1 font-display text-2xl font-extrabold">{m.value}</p>
                  </div>
                ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />Évolution des ventes
            </h3>
            <div className="mt-4 h-64">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : revenueData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Aucune donnée</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 18% 89%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => v} />
                    <Area type="monotone" dataKey="orders" stroke="hsl(174 60% 40%)" fill="hsl(174 60% 40% / 0.2)" strokeWidth={2} name="Commandes" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />Revenu par mois
            </h3>
            <div className="mt-4 h-64">
              {loading ? (
                <Skeleton className="h-full w-full" />
              ) : revenueData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Aucune donnée</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 18% 89%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => formatTND(v)} />
                    <Bar dataKey="revenue" fill="hsl(200 80% 22%)" radius={[4, 4, 0, 0]} name="Revenu" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Category Performance */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display font-semibold flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4" />Répartition par catégorie
          </h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : categoryPerf.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune donnée</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground">Catégorie</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Produits</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryPerf.map((c: any) => (
                    <tr key={c.category} className="border-b border-border last:border-0">
                      <td className="py-3 font-medium">{c.category || "Non classé"}</td>
                      <td className="py-3 text-right text-muted-foreground">{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
