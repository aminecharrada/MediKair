import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, ShoppingCart, Eye, Truck, Clock, CheckCircle, XCircle, Package,
  Filter, Download, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { ordersAPI } from "@/api";

type OrderStatus = "En attente" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

const statusConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  "En attente": { color: "bg-muted text-muted-foreground", icon: Clock, label: "En attente" },
  confirmed: { color: "bg-primary/10 text-primary", icon: CheckCircle, label: "Confirmée" },
  processing: { color: "bg-accent text-accent-foreground", icon: Package, label: "En préparation" },
  shipped: { color: "bg-secondary/15 text-secondary", icon: Truck, label: "Expédiée" },
  delivered: { color: "bg-secondary/20 text-secondary", icon: CheckCircle, label: "Livrée" },
  cancelled: { color: "bg-destructive/10 text-destructive", icon: XCircle, label: "Annulée" },
};

const statusFlow = ["En attente", "confirmed", "processing", "shipped", "delivered"];

function formatTND(n: number) {
  return n.toLocaleString("fr-TN") + " TND";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-TN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await ordersAPI.getAll(params);
      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Load orders error:", err);
      toast({ title: "Erreur", description: "Impossible de charger les commandes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      (o.orderNumber || "").toLowerCase().includes(q) ||
      (o._id || "").toLowerCase().includes(q) ||
      (o.client?.name || "").toLowerCase().includes(q)
    );
  });

  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
  const pendingCount = orders.filter((o) => o.orderStatus === "En attente").length;

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdating(true);
      await ordersAPI.updateStatus(id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, orderStatus: newStatus } : o))
      );
      if (selectedOrder?._id === id) {
        setSelectedOrder((prev: any) => prev ? { ...prev, orderStatus: newStatus } : null);
      }
      toast({ title: "Statut mis à jour", description: `→ ${statusConfig[newStatus]?.label || newStatus}` });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.response?.data?.message || "Mise à jour impossible", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleValidate = async (id: string) => {
    await handleStatusUpdate(id, "confirmed");
  };

  const exportCSV = () => {
    const header = "N°,Client,Email,Date,Total,Statut\n";
    const rows = filtered.map((o) =>
      `${o.orderNumber || o._id},${o.client?.name || "—"},${o.client?.email || "—"},${formatDate(o.createdAt)},${o.totalPrice},${statusConfig[o.orderStatus]?.label || o.orderStatus}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes_medikair_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Export CSV", description: `${filtered.length} commandes exportées` });
  };

  const getNextStatus = (current: string) => {
    const idx = statusFlow.indexOf(current);
    return idx >= 0 && idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
  };

  return (
    <AdminLayout
      title="Gestion des commandes"
      headerActions={
        <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
          <Download className="h-4 w-4" />Exporter CSV
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))
        ) : (
          [
            { label: "Total commandes", value: String(orders.length), sub: "" },
            { label: "En attente", value: String(pendingCount), sub: "à traiter" },
            { label: "Revenu total", value: formatTND(totalRevenue), sub: "" },
            { label: "Panier moyen", value: formatTND(Math.round(avgOrder)), sub: "par commande" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-extrabold">{s.value}</p>
              {s.sub && <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>}
            </motion.div>
          ))
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher par N° ou client..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="En attente">En attente</SelectItem>
            <SelectItem value="confirmed">Confirmée</SelectItem>
            <SelectItem value="processing">En préparation</SelectItem>
            <SelectItem value="shipped">Expédiée</SelectItem>
            <SelectItem value="delivered">Livrée</SelectItem>
            <SelectItem value="cancelled">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="rounded-xl border border-border bg-card shadow-card p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">N°</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => {
                  const cfg = statusConfig[o.orderStatus] || statusConfig["En attente"];
                  const StatusIcon = cfg.icon;
                  const next = getNextStatus(o.orderStatus);
                  return (
                    <motion.tr key={o._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                      className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-primary text-xs">
                        {o.orderNumber || o._id.slice(-8)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{o.client?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{o.client?.email || ""}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatTND(o.totalPrice)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3" />{cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(o)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {next && (
                          <Button variant="outline" size="sm" className="text-xs h-8" disabled={updating}
                            onClick={() => handleStatusUpdate(o._id, next)}>
                            {updating ? <Loader2 className="h-3 w-3 animate-spin" /> : `→ ${statusConfig[next]?.label}`}
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              Commande {selectedOrder?.orderNumber || selectedOrder?._id?.slice(-8)}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Client</p>
                  <p className="font-medium">{selectedOrder.client?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paiement</p>
                  <p className="font-medium">{selectedOrder.paymentInfo?.method || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Source</p>
                  <p className="font-medium capitalize">{selectedOrder.source || "web"}</p>
                </div>
                {selectedOrder.shippingInfo && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Adresse</p>
                    <p className="font-medium">
                      {selectedOrder.shippingInfo.address}, {selectedOrder.shippingInfo.city} {selectedOrder.shippingInfo.postalCode}
                    </p>
                  </div>
                )}
              </div>
              <div className="border-t border-border pt-3">
                <p className="font-semibold mb-2">Articles</p>
                <div className="space-y-2">
                  {selectedOrder.orderItems?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                      <span className="font-medium">{formatTND(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-border pt-2 mt-2">
                  <span className="text-sm text-muted-foreground">Sous-total</span>
                  <span className="text-sm">{formatTND(selectedOrder.itemsPrice || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Livraison</span>
                  <span className="text-sm">{formatTND(selectedOrder.shippingPrice || 0)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-border pt-2 mt-1">
                  <span>Total</span>
                  <span>{formatTND(selectedOrder.totalPrice)}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {selectedOrder.orderStatus === "En attente" && (
                  <Button className="flex-1" disabled={updating} onClick={() => handleValidate(selectedOrder._id)}>
                    {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Valider la commande
                  </Button>
                )}
                {getNextStatus(selectedOrder.orderStatus) && selectedOrder.orderStatus !== "En attente" && (
                  <Button variant="outline" className="flex-1" disabled={updating}
                    onClick={() => handleStatusUpdate(selectedOrder._id, getNextStatus(selectedOrder.orderStatus)!)}>
                    {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    → {statusConfig[getNextStatus(selectedOrder.orderStatus)!]?.label}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
