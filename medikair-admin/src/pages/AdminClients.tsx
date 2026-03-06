import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search, Users, Mail, Phone, MapPin, Trash2, Eye, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { clientsAPI } from "@/api";

function formatTND(n: number) {
  return n.toLocaleString("fr-TN") + " TND";
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-TN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function AdminClients() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const loadClients = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter !== "all") params.role = roleFilter;
      const res = await clientsAPI.getAll(params);
      setClients(res.data.data || []);
    } catch (err) {
      console.error("Load clients error:", err);
      toast({ title: "Erreur", description: "Impossible de charger les clients", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [roleFilter]);

  const filtered = clients.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpentAll = clients.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const avgSpent = clients.length > 0 ? totalSpentAll / clients.length : 0;
  const activeCount = clients.filter((c) => c.orders > 0).length;

  const openDetail = async (id: string) => {
    try {
      setDetailLoading(true);
      const res = await clientsAPI.getById(id);
      setSelectedClient(res.data.data);
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible de charger le client", variant: "destructive" });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      await clientsAPI.delete(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Client supprimé" });
    } catch (err) {
      toast({ title: "Erreur", description: "Suppression impossible", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <AdminLayout title="CRM — Gestion des clients">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          ))
        ) : (
          [
            { label: "Total clients", value: String(clients.length) },
            { label: "Avec commandes", value: String(activeCount) },
            { label: "Panier moyen", value: formatTND(Math.round(avgSpent)) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-2xl font-extrabold">{s.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un client..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-48">
            <Users className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Rôle B2B" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les rôles</SelectItem>
            <SelectItem value="dentiste">Dentiste</SelectItem>
            <SelectItem value="assistant">Assistant(e)</SelectItem>
            <SelectItem value="clinique">Clinique</SelectItem>
            <SelectItem value="labo">Laboratoire</SelectItem>
            <SelectItem value="commercial">Commercial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client cards */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Aucun client trouvé</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="rounded-xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-display font-bold text-sm">
                  {c.name?.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{c.city || "—"}
                    {c.role && c.role !== "dentiste" && (
                      <span className="ml-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">{c.role}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground truncate"><Mail className="h-3.5 w-3.5 shrink-0" />{c.email}</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5 shrink-0" />{c.phone || "—"}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                <span className="text-muted-foreground">{c.orders} commandes</span>
                <span className="font-semibold">{formatTND(c.totalSpent || 0)}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openDetail(c.id)}>
                  <Eye className="h-3 w-3" />Détails
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 text-destructive hover:text-destructive">
                      {deleting === c.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce client ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Toutes les données de {c.name} seront supprimées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Client Detail Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Fiche client</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : selectedClient ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Nom</p><p className="font-medium">{selectedClient.name}</p></div>
                <div><p className="text-muted-foreground">Email</p><p className="font-medium">{selectedClient.email}</p></div>
                <div><p className="text-muted-foreground">Téléphone</p><p className="font-medium">{selectedClient.phone || "—"}</p></div>
                <div><p className="text-muted-foreground">Ville</p><p className="font-medium">{selectedClient.city || "—"}</p></div>
                <div><p className="text-muted-foreground">Cabinet</p><p className="font-medium">{selectedClient.cabinet || "—"}</p></div>
                <div><p className="text-muted-foreground">Rôle B2B</p><p className="font-medium capitalize">{selectedClient.role || "dentiste"}</p></div>
                <div><p className="text-muted-foreground">Total dépensé</p><p className="font-semibold">{formatTND(selectedClient.totalSpent || 0)}</p></div>
                <div><p className="text-muted-foreground">Commandes</p><p className="font-medium">{selectedClient.orderCount || 0}</p></div>
                {selectedClient.segment && (
                  <div><p className="text-muted-foreground">Segment</p><p className="font-medium capitalize">{selectedClient.segment}</p></div>
                )}
                {selectedClient.churnRisk != null && (
                  <div><p className="text-muted-foreground">Risque churn</p><p className="font-medium">{Math.round(selectedClient.churnRisk * 100)}%</p></div>
                )}
              </div>
              {selectedClient.structure?.type && (
                <div className="border-t border-border pt-3">
                  <p className="font-semibold mb-2 text-sm">Structure B2B</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><p className="text-muted-foreground">Type</p><p className="font-medium capitalize">{selectedClient.structure.type}</p></div>
                    {selectedClient.structure.name && <div><p className="text-muted-foreground">Nom</p><p className="font-medium">{selectedClient.structure.name}</p></div>}
                    {selectedClient.structure.siret && <div><p className="text-muted-foreground">SIRET</p><p className="font-medium">{selectedClient.structure.siret}</p></div>}
                  </div>
                </div>
              )}
              {selectedClient.recentOrders?.length > 0 && (
                <div className="border-t border-border pt-3">
                  <p className="font-semibold mb-2 text-sm">Dernières commandes</p>
                  <div className="space-y-2 text-sm">
                    {selectedClient.recentOrders.slice(0, 5).map((o: any) => (
                      <div key={o._id} className="flex justify-between">
                        <span className="text-muted-foreground">{formatDate(o.createdAt)} — {o.orderNumber || o._id.slice(-6)}</span>
                        <span className="font-medium">{formatTND(o.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
