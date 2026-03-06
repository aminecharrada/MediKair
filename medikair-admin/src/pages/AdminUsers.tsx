import { useState, useEffect } from "react";
import {
  ShieldCheck, Plus, Trash2, Loader2, UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminAuthAPI } from "@/api";
import AdminLayout from "@/components/AdminLayout";

interface Admin {
  id: string;
  name: string;
  email: string;
  privilege: string;
}

const PRIVILEGE_LABELS: Record<string, string> = {
  super: "Super Admin",
  moderate: "Modérateur",
  low: "Accès limité",
};

const PRIVILEGE_COLORS: Record<string, string> = {
  super: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  moderate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  low: "bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400",
};

export default function AdminUsers() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAdmins = async () => {
    try {
      const me = await adminAuthAPI.getMe();
      setCurrentAdminId(me.data.data?.id || null);
      const res = await adminAuthAPI.getAll();
      setAdmins(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await adminAuthAPI.delete(id);
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      toast({ title: "Admin supprimé" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.response?.data?.message || "Suppression échouée", variant: "destructive" });
    }
  };

  const handlePrivilegeChange = async (id: string, privilege: string) => {
    try {
      await adminAuthAPI.updatePrivilege(id, privilege);
      setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, privilege } : a));
      toast({ title: "Privilège mis à jour" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.response?.data?.message || "Mise à jour échouée", variant: "destructive" });
    }
  };

  /* ── Add Form ────────────────────────────────────────────── */
  const AddForm = ({ onClose }: { onClose: () => void }) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [privilege, setPrivilege] = useState("low");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
      if (!name || !email || !password) {
        toast({ title: "Remplissez tous les champs", variant: "destructive" });
        return;
      }
      setSaving(true);
      try {
        await adminAuthAPI.register({ name, email, password, privilege });
        toast({ title: "Admin créé" });
        onClose();
        fetchAdmins();
      } catch (err: any) {
        toast({ title: "Erreur", description: err.response?.data?.message || "Création échouée", variant: "destructive" });
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nom complet *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" />
        </div>
        <div className="space-y-2">
          <Label>Email *</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@medikair.com" />
        </div>
        <div className="space-y-2">
          <Label>Mot de passe *</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="space-y-2">
          <Label>Privilège</Label>
          <Select value={privilege} onValueChange={setPrivilege}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="super">Super Admin</SelectItem>
              <SelectItem value="moderate">Modérateur</SelectItem>
              <SelectItem value="low">Accès limité</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            Créer
          </Button>
        </div>
      </div>
    );
  };

  return (
    <AdminLayout
      title="Équipe Admin"
      headerActions={
        <Button size="sm" className="gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />Nouvel admin
        </Button>
      }
    >
      <div>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Total admins</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{admins.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Super Admins</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{admins.filter((a) => a.privilege === "super").length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Modérateurs</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{admins.filter((a) => a.privilege === "moderate").length}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : admins.length === 0 ? (
          <div className="py-20 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 font-display text-lg font-semibold">Aucun admin</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nom</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Privilège</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {admins.map((admin) => {
                  const isSelf = admin.id === currentAdminId;
                  return (
                    <tr key={admin.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {admin.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        {admin.name}
                        {isSelf && <Badge variant="secondary" className="text-[10px]">Vous</Badge>}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{admin.email}</td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIVILEGE_COLORS[admin.privilege] || ""}`}>
                            {PRIVILEGE_LABELS[admin.privilege] || admin.privilege}
                          </span>
                        ) : (
                          <Select value={admin.privilege} onValueChange={(v) => handlePrivilegeChange(admin.id, v)}>
                            <SelectTrigger className="h-7 w-36 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="super">Super Admin</SelectItem>
                              <SelectItem value="moderate">Modérateur</SelectItem>
                              <SelectItem value="low">Accès limité</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isSelf && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer cet admin ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {admin.name} ({admin.email}) sera supprimé définitivement.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(admin.id)} className="bg-destructive text-destructive-foreground">
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Nouvel administrateur</DialogTitle></DialogHeader>
          <AddForm onClose={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
