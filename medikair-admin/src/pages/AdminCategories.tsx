import { useState, useEffect } from "react";
import {
  FolderTree, Plus, Edit, Trash2, Loader2, ChevronRight, ChevronDown, ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { categoriesAPI, uploadAPI } from "@/api";
import AdminLayout from "@/components/AdminLayout";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: { public_id: string; url: string };
  level: 1 | 2 | 3;
  parent: string | null;
  order: number;
  isActive: boolean;
  children?: Category[];
}

const LEVEL_LABELS: Record<number, string> = { 1: "Catégorie", 2: "Sous-catégorie", 3: "Famille" };
const LEVEL_COLORS: Record<number, string> = {
  1: "bg-primary/10 text-primary",
  2: "bg-accent text-accent-foreground",
  3: "bg-muted text-muted-foreground",
};

export default function AdminCategories() {
  const [tree, setTree] = useState<Category[]>([]);
  const [flatList, setFlatList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [treeRes, allRes] = await Promise.all([
        categoriesAPI.getTree(),
        categoriesAPI.getAll(),
      ]);
      setTree(treeRes.data.data || []);
      setFlatList(allRes.data.data || allRes.data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await categoriesAPI.delete(id);
      toast({ title: "Catégorie supprimée" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.response?.data?.message || "Suppression échouée", variant: "destructive" });
    }
  };

  /* ── Category Form ──────────────────────────────────────────── */
  const CategoryForm = ({ initial, onClose }: { initial?: Category | null; onClose: () => void }) => {
    const isEdit = !!initial;
    const [name, setName] = useState(initial?.name || "");
    const [description, setDescription] = useState(initial?.description || "");
    const [level, setLevel] = useState<string>(String(initial?.level || 1));
    const [parent, setParent] = useState(initial?.parent || "");
    const [order, setOrder] = useState(String(initial?.order || 0));
    const [isActive, setIsActive] = useState(initial?.isActive ?? true);
    const [saving, setSaving] = useState(false);

    // Filter parents: level 2 → parent must be level 1, level 3 → parent must be level 2
    const parentOptions = flatList.filter((c) => {
      const lvl = Number(level);
      if (lvl === 1) return false;
      return c.level === lvl - 1;
    });

    const handleSubmit = async () => {
      if (!name) return;
      setSaving(true);
      try {
        const payload: any = {
          name,
          description,
          level: Number(level),
          parent: Number(level) === 1 ? null : parent || null,
          order: Number(order),
          isActive,
        };

        if (isEdit && initial) {
          await categoriesAPI.update(initial._id, payload);
          toast({ title: "Catégorie mise à jour" });
        } else {
          await categoriesAPI.create(payload);
          toast({ title: "Catégorie créée" });
        }
        onClose();
        fetchData();
      } catch (err: any) {
        toast({ title: "Erreur", description: err.response?.data?.message || "Sauvegarde échouée", variant: "destructive" });
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Nom *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Implantologie" />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Niveau</Label>
            <Select value={level} onValueChange={(v) => { setLevel(v); setParent(""); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 — Catégorie</SelectItem>
                <SelectItem value="2">2 — Sous-catégorie</SelectItem>
                <SelectItem value="3">3 — Famille</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {Number(level) > 1 && (
            <div className="space-y-2">
              <Label>Parent</Label>
              <Select value={parent} onValueChange={setParent}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {parentOptions.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Ordre</Label>
            <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <Label>Active</Label>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
            {isEdit ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </div>
    );
  };

  /* ── Tree Node ──────────────────────────────────────────────── */
  const TreeNode = ({ cat, depth = 0 }: { cat: Category; depth?: number }) => {
    const hasChildren = cat.children && cat.children.length > 0;
    const isOpen = expanded.has(cat._id);

    return (
      <div>
        <div
          className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 hover:bg-muted/30 transition-colors"
          style={{ marginLeft: depth * 24 }}
        >
          {hasChildren ? (
            <button onClick={() => toggleExpand(cat._id)} className="p-0.5">
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-5" />
          )}
          {cat.image?.url ? (
            <img src={cat.image.url} alt={cat.name} className="h-8 w-8 rounded object-cover" />
          ) : (
            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
              <FolderTree className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{cat.name}</p>
            {cat.description && <p className="text-xs text-muted-foreground truncate">{cat.description}</p>}
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${LEVEL_COLORS[cat.level] || ""}`}>
            {LEVEL_LABELS[cat.level] || `Niveau ${cat.level}`}
          </span>
          {!cat.isActive && (
            <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive">Inactive</span>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditCat(cat)}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer "{cat.name}" ?</AlertDialogTitle>
                <AlertDialogDescription>
                  {hasChildren
                    ? "Attention : les sous-catégories enfants seront aussi affectées."
                    : "Cette action est irréversible."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDelete(cat._id)} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {hasChildren && isOpen && (
          <div className="mt-1 space-y-1">
            {cat.children!.map((child) => (
              <TreeNode key={child._id} cat={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout
      title="Gestion des catégories"
      headerActions={
        <Button size="sm" className="gap-2" onClick={() => { setEditCat(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />Nouvelle catégorie
        </Button>
      }
    >
      <div>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Total catégories</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{flatList.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Catégories racines</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{tree.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Niveaux actifs</p>
            <p className="mt-1 font-display text-2xl font-extrabold">
              {new Set(flatList.map((c) => c.level)).size}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : tree.length === 0 ? (
          <div className="py-20 text-center">
            <FolderTree className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 font-display text-lg font-semibold">Aucune catégorie</p>
            <p className="text-sm text-muted-foreground">Créez votre première catégorie</p>
          </div>
        ) : (
          <div className="space-y-1">
            {tree.map((cat) => (
              <TreeNode key={cat._id} cat={cat} />
            ))}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nouvelle catégorie</DialogTitle></DialogHeader>
          <CategoryForm onClose={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCat} onOpenChange={(open) => !open && setEditCat(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Modifier la catégorie</DialogTitle></DialogHeader>
          <CategoryForm initial={editCat} onClose={() => setEditCat(null)} />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
