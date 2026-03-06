import { useState, useEffect } from "react";
import {
  Save, Bell, Globe, CreditCard, Shield, Truck, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { settingsAPI } from "@/api";

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await settingsAPI.get();
        setSettings(res.data.settings);
      } catch (err) {
        console.error("Settings load error:", err);
        toast({ title: "Erreur", description: "Impossible de charger les paramètres", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const update = (path: string, value: any) => {
    setSettings((prev: any) => {
      if (!prev) return prev;
      const keys = path.split(".");
      const clone = JSON.parse(JSON.stringify(prev));
      let obj = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return clone;
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      const res = await settingsAPI.update(settings);
      setSettings(res.data.settings);
      toast({ title: "Paramètres sauvegardés", description: "Les modifications ont été enregistrées." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.response?.data?.message || "Sauvegarde échouée", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Paramètres">
        <div className="max-w-4xl space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (!settings) {
    return (
      <AdminLayout title="Paramètres">
        <p className="text-muted-foreground">Impossible de charger les paramètres.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Paramètres">
      <div className="max-w-4xl">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="general" className="gap-1.5 text-xs sm:text-sm"><Globe className="h-4 w-4 hidden sm:block" />Général</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm"><Bell className="h-4 w-4 hidden sm:block" />Notifications</TabsTrigger>
            <TabsTrigger value="payment" className="gap-1.5 text-xs sm:text-sm"><CreditCard className="h-4 w-4 hidden sm:block" />Paiement</TabsTrigger>
            <TabsTrigger value="shipping" className="gap-1.5 text-xs sm:text-sm"><Truck className="h-4 w-4 hidden sm:block" />Livraison</TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm"><Shield className="h-4 w-4 hidden sm:block" />Sécurité</TabsTrigger>
          </TabsList>

          {/* General */}
          <TabsContent value="general">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-6">
              <h3 className="font-display font-semibold text-lg">Informations de la boutique</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nom de la boutique</Label>
                  <Input value={settings.storeName || ""} onChange={(e) => update("storeName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email de contact</Label>
                  <Input value={settings.storeEmail || ""} onChange={(e) => update("storeEmail", e.target.value)} type="email" />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input value={settings.storePhone || ""} onChange={(e) => update("storePhone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Select value="TND" disabled>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="TND">TND — Dinar tunisien</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>Adresse</Label>
                  <Textarea value={settings.address || ""} onChange={(e) => update("address", e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">Mode maintenance</p>
                  <p className="text-sm text-muted-foreground">Désactive temporairement l'accès au site public</p>
                </div>
                <Switch checked={settings.maintenanceMode || false} onCheckedChange={(v) => update("maintenanceMode", v)} />
              </div>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
              <h3 className="font-display font-semibold text-lg">Préférences de notification</h3>
              {[
                { key: "notifyOrders", label: "Nouvelles commandes", desc: "Recevoir un email à chaque nouvelle commande" },
                { key: "notifyStock", label: "Alertes de stock", desc: "Notification quand un produit passe sous le seuil critique" },
                { key: "notifyNewClients", label: "Nouveaux clients", desc: "Notification à chaque inscription d'un nouveau praticien" },
                { key: "notifyAI", label: "Recommandations IA", desc: "Alertes sur les suggestions de l'IA (cross-sell, réassort)" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div><p className="font-medium">{n.label}</p><p className="text-sm text-muted-foreground">{n.desc}</p></div>
                  <Switch checked={settings[n.key] || false} onCheckedChange={(v) => update(n.key, v)} />
                </div>
              ))}
              <div className="space-y-2">
                <Label>Email pour les notifications</Label>
                <Input value={settings.notificationEmail || ""} onChange={(e) => update("notificationEmail", e.target.value)} type="email" />
              </div>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Payment */}
          <TabsContent value="payment">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-6">
              <h3 className="font-display font-semibold text-lg">Méthodes de paiement</h3>
              {[
                { key: "virement", method: "Virement bancaire", desc: "Accepter les paiements par virement" },
                { key: "carte", method: "Carte bancaire", desc: "Paiement en ligne par carte Visa/Mastercard" },
                { key: "cheque", method: "Chèque", desc: "Paiement par chèque certifié" },
                { key: "cod", method: "Paiement à la livraison", desc: "Cash on delivery" },
              ].map((p) => (
                <div key={p.key} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div><p className="font-medium">{p.method}</p><p className="text-sm text-muted-foreground">{p.desc}</p></div>
                  <Switch
                    checked={settings.paymentMethods?.[p.key] || false}
                    onCheckedChange={(v) => update(`paymentMethods.${p.key}`, v)}
                  />
                </div>
              ))}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>RIB / IBAN</Label>
                  <Input value={settings.bankInfo?.rib || ""} onChange={(e) => update("bankInfo.rib", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Banque</Label>
                  <Input value={settings.bankInfo?.bank || ""} onChange={(e) => update("bankInfo.bank", e.target.value)} />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Shipping */}
          <TabsContent value="shipping">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-6">
              <h3 className="font-display font-semibold text-lg">Zones et tarifs de livraison</h3>
              <div className="space-y-3">
                {(settings.shippingZones || []).map((z: any, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">{z.name}</p>
                      <p className="text-sm text-muted-foreground">Délai : {z.delay}</p>
                    </div>
                    <span className="text-sm font-medium">{z.price} TND</span>
                  </div>
                ))}
                {(!settings.shippingZones || settings.shippingZones.length === 0) && (
                  <p className="text-sm text-muted-foreground">Aucune zone configurée</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Transporteur par défaut</Label>
                  <Select value={settings.defaultCarrier || "Rapid Poste"} onValueChange={(v) => update("defaultCarrier", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rapid Poste">Rapid Poste</SelectItem>
                      <SelectItem value="Aramex Tunisie">Aramex Tunisie</SelectItem>
                      <SelectItem value="DHL Express">DHL Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Seuil livraison gratuite (TND)</Label>
                  <Input
                    type="number"
                    value={settings.freeShippingThreshold || 500}
                    onChange={(e) => update("freeShippingThreshold", Number(e.target.value))}
                  />
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Sauvegarder
              </Button>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-6">
              <h3 className="font-display font-semibold text-lg">Sécurité & accès</h3>
              <div className="space-y-3">
                {[
                  { key: "require2FA", label: "Authentification 2FA", desc: "Exiger la double authentification pour les admins" },
                  { key: "hierarchicalValidation", label: "Validation hiérarchique", desc: "Les commandes > seuil nécessitent une approbation" },
                  { key: "auditLogs", label: "Journaux d'audit", desc: "Enregistrer toutes les actions admin" },
                  { key: "ipRestriction", label: "Restriction IP", desc: "Limiter l'accès admin à certaines adresses IP" },
                ].map((s) => (
                  <div key={s.key} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div><p className="font-medium">{s.label}</p><p className="text-sm text-muted-foreground">{s.desc}</p></div>
                    <Switch checked={settings[s.key] || false} onCheckedChange={(v) => update(s.key, v)} />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Seuil de validation hiérarchique (TND)</Label>
                <Input
                  type="number"
                  value={settings.validationThreshold || 5000}
                  onChange={(e) => update("validationThreshold", Number(e.target.value))}
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Sauvegarder
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
