import { useState, useEffect, useRef } from "react";
import {
  ImageIcon, Plus, Edit, Trash2, Loader2, GripVertical, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { heroAPI } from "@/api";
import AdminLayout from "@/components/AdminLayout";

interface HeroImage {
  _id: string;
  image: { public_id: string; url: string };
  title: string;
  subtitle: string;
  order: number;
  isActive: boolean;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function AdminHeroImages() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<HeroImage | null>(null);
  const { toast } = useToast();

  const fetchImages = async () => {
    try {
      const res = await heroAPI.getAll();
      setImages(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await heroAPI.delete(id);
      setImages((prev) => prev.filter((i) => i._id !== id));
      toast({ title: "Image supprimée" });
    } catch (err) {
      toast({ title: "Erreur", description: "Suppression échouée", variant: "destructive" });
    }
  };

  const handleToggle = async (item: HeroImage) => {
    try {
      await heroAPI.update(item._id, { isActive: !item.isActive });
      setImages((prev) => prev.map((i) => i._id === item._id ? { ...i, isActive: !i.isActive } : i));
    } catch (err) {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  /* ── Form ───────────────────────────────────────────────────── */
  const HeroForm = ({ initial, onClose }: { initial?: HeroImage | null; onClose: () => void }) => {
    const isEdit = !!initial;
    const [title, setTitle] = useState(initial?.title || "");
    const [subtitle, setSubtitle] = useState(initial?.subtitle || "");
    const [order, setOrder] = useState(String(initial?.order || 0));
    const [isActive, setIsActive] = useState(initial?.isActive ?? true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initial?.image?.url || null);
    const [saving, setSaving] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
    };

    const handleSubmit = async () => {
      if (!isEdit && !imageFile) {
        toast({ title: "Veuillez sélectionner une image", variant: "destructive" });
        return;
      }
      setSaving(true);
      try {
        const payload: any = {
          title,
          subtitle,
          order: Number(order),
          isActive,
        };

        if (imageFile) {
          payload.image = await fileToBase64(imageFile);
        }

        if (isEdit && initial) {
          await heroAPI.update(initial._id, payload);
          toast({ title: "Image mise à jour" });
        } else {
          await heroAPI.create(payload);
          toast({ title: "Image créée" });
        }
        onClose();
        fetchImages();
      } catch (err: any) {
        toast({ title: "Erreur", description: err.response?.data?.message || "Sauvegarde échouée", variant: "destructive" });
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        {/* Image upload */}
        <div className="space-y-2">
          <Label>Image {!isEdit && "*"}</Label>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          <div
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-32 w-full rounded-lg object-cover" />
            ) : (
              <div className="space-y-1 py-4">
                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Cliquer pour uploader</p>
              </div>
            )}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre principal" />
          </div>
          <div className="space-y-2">
            <Label>Sous-titre</Label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Sous-titre" />
          </div>
          <div className="space-y-2">
            <Label>Ordre d'affichage</Label>
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

  const activeCount = images.filter((i) => i.isActive).length;

  return (
    <AdminLayout
      title="Hero Images"
      headerActions={
        <Button size="sm" className="gap-2" onClick={() => { setEditItem(null); setFormOpen(true); }}>
          <Plus className="h-4 w-4" />Nouvelle image
        </Button>
      }
    >
      <div>
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Total images</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{images.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Actives</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{activeCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Inactives</p>
            <p className="mt-1 font-display text-2xl font-extrabold">{images.length - activeCount}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : images.length === 0 ? (
          <div className="py-20 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-4 font-display text-lg font-semibold">Aucune hero image</p>
            <p className="text-sm text-muted-foreground">Ajoutez votre première image</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((item) => (
              <div key={item._id} className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
                <div className="relative aspect-[16/7]">
                  <img src={item.image.url} alt={item.title} className="w-full h-full object-cover" />
                  {!item.isActive && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm text-destructive font-medium">Inactive</span>
                    </div>
                  )}
                  <span className="absolute top-2 left-2 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium">
                    #{item.order}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm truncate">{item.title || "Sans titre"}</p>
                  {item.subtitle && <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>}
                  <div className="mt-3 flex items-center justify-between">
                    <Switch checked={item.isActive} onCheckedChange={() => handleToggle(item)} />
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditItem(item)}>
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
                            <AlertDialogTitle>Supprimer cette image ?</AlertDialogTitle>
                            <AlertDialogDescription>L'image sera supprimée définitivement.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item._id)} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nouvelle hero image</DialogTitle></DialogHeader>
          <HeroForm onClose={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Modifier l'image</DialogTitle></DialogHeader>
          <HeroForm initial={editItem} onClose={() => setEditItem(null)} />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
