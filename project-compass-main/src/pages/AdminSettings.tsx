import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Package, Users, ShoppingCart, Settings, BarChart3, Menu, X, Save,
  Bell, Globe, CreditCard, Shield, Mail, Truck, Tag, Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const sidebarLinks = [
  { label: "Dashboard", path: "/admin", icon: BarChart3 },
  { label: "Produits (PIM)", path: "/admin/produits", icon: Package },
  { label: "Clients (CRM)", path: "/admin/clients", icon: Users },
  { label: "Commandes", path: "/admin/commandes", icon: ShoppingCart },
  { label: "Promotions", path: "/admin/promotions", icon: Tag },
  { label: "Rapports", path: "/admin/rapports", icon: Megaphone },
  { label: "Paramètres", path: "/admin/parametres", icon: Settings },
];

export default function AdminSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const [notifOrders, setNotifOrders] = useState(true);
  const [notifStock, setNotifStock] = useState(true);
  const [notifNewClients, setNotifNewClients] = useState(false);
  const [notifAI, setNotifAI] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    toast({ title: "Paramètres sauvegardés", description: "Les modifications ont été enregistrées." });
  };

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
          <h1 className="font-display text-lg font-bold">Paramètres</h1>
        </header>

        <div className="p-4 sm:p-6 max-w-4xl">
          <Tabs defaultValue="general" className="space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-5 h-auto">
                <TabsTrigger value="general" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"><Globe className="h-4 w-4 hidden sm:block" />Général</TabsTrigger>
                <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"><Bell className="h-4 w-4 hidden sm:block" />Notifs</TabsTrigger>
                <TabsTrigger value="payment" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"><CreditCard className="h-4 w-4 hidden sm:block" />Paiement</TabsTrigger>
                <TabsTrigger value="shipping" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"><Truck className="h-4 w-4 hidden sm:block" />Livraison</TabsTrigger>
                <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"><Shield className="h-4 w-4 hidden sm:block" />Sécurité</TabsTrigger>
              </TabsList>
            </div>

            {/* General */}
            <TabsContent value="general">
              <div className="rounded-xl border border-border bg-card p-4 sm:p-6 shadow-card space-y-6">
                <h3 className="font-display font-semibold text-base sm:text-lg">Informations de la boutique</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Nom de la boutique</Label><Input defaultValue="Medikair Dentaire" /></div>
                  <div className="space-y-2"><Label>Email de contact</Label><Input defaultValue="contact@medikair.ma" type="email" /></div>
                  <div className="space-y-2"><Label>Téléphone</Label><Input defaultValue="+212 5 22 33 44 55" /></div>
                  <div className="space-y-2"><Label>Devise</Label>
                    <Select defaultValue="MAD"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MAD">MAD — Dirham marocain</SelectItem><SelectItem value="EUR">EUR — Euro</SelectItem><SelectItem value="USD">USD — Dollar</SelectItem></SelectContent></Select>
                  </div>
                  <div className="sm:col-span-2 space-y-2"><Label>Adresse</Label><Textarea defaultValue="Zone Industrielle, Lot 45, Casablanca 20000, Maroc" /></div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Mode maintenance</p>
                    <p className="text-sm text-muted-foreground">Désactive temporairement l'accès au site public</p>
                  </div>
                  <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                </div>
                <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />Sauvegarder</Button>
              </div>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-4">
                <h3 className="font-display font-semibold text-lg">Préférences de notification</h3>
                {[
                  { label: "Nouvelles commandes", desc: "Recevoir un email à chaque nouvelle commande", checked: notifOrders, onChange: setNotifOrders },
                  { label: "Alertes de stock", desc: "Notification quand un produit passe sous le seuil critique", checked: notifStock, onChange: setNotifStock },
                  { label: "Nouveaux clients", desc: "Notification à chaque inscription d'un nouveau praticien", checked: notifNewClients, onChange: setNotifNewClients },
                  { label: "Recommandations IA", desc: "Alertes sur les suggestions de l'IA (cross-sell, réassort)", checked: notifAI, onChange: setNotifAI },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div><p className="font-medium">{n.label}</p><p className="text-sm text-muted-foreground">{n.desc}</p></div>
                    <Switch checked={n.checked} onCheckedChange={n.onChange} />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label>Email pour les notifications</Label>
                  <Input defaultValue="admin@medikair.ma" type="email" />
                </div>
                <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />Sauvegarder</Button>
              </div>
            </TabsContent>

            {/* Payment */}
            <TabsContent value="payment">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-6">
                <h3 className="font-display font-semibold text-lg">Méthodes de paiement</h3>
                {[
                  { method: "Virement bancaire", desc: "Accepter les paiements par virement", enabled: true },
                  { method: "Carte bancaire (CMI)", desc: "Paiement en ligne par carte Visa/Mastercard", enabled: true },
                  { method: "Chèque", desc: "Paiement par chèque certifié", enabled: false },
                  { method: "Paiement à la livraison", desc: "Cash on delivery", enabled: false },
                ].map((p) => (
                  <div key={p.method} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div><p className="font-medium">{p.method}</p><p className="text-sm text-muted-foreground">{p.desc}</p></div>
                    <Switch defaultChecked={p.enabled} />
                  </div>
                ))}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>RIB / IBAN</Label><Input defaultValue="MA76 0001 2345 6789 0012 3456 789" /></div>
                  <div className="space-y-2"><Label>Banque</Label><Input defaultValue="Attijariwafa Bank" /></div>
                </div>
                <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />Sauvegarder</Button>
              </div>
            </TabsContent>

            {/* Shipping */}
            <TabsContent value="shipping">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-6">
                <h3 className="font-display font-semibold text-lg">Zones et tarifs de livraison</h3>
                <div className="space-y-3">
                  {[
                    { zone: "Casablanca & région", delay: "24h", price: "Gratuit > 500 MAD" },
                    { zone: "Rabat, Fès, Marrakech", delay: "48h", price: "50 MAD (gratuit > 1 000 MAD)" },
                    { zone: "Reste du Maroc", delay: "3-5 jours", price: "80 MAD (gratuit > 2 000 MAD)" },
                  ].map((z) => (
                    <div key={z.zone} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div>
                        <p className="font-medium">{z.zone}</p>
                        <p className="text-sm text-muted-foreground">Délai : {z.delay}</p>
                      </div>
                      <span className="text-sm font-medium">{z.price}</span>
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Transporteur par défaut</Label>
                    <Select defaultValue="amana"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="amana">Amana Express</SelectItem><SelectItem value="ctt">CTT Maroc</SelectItem><SelectItem value="dhl">DHL Express</SelectItem></SelectContent></Select>
                  </div>
                  <div className="space-y-2"><Label>Seuil livraison gratuite (MAD)</Label><Input defaultValue="500" type="number" /></div>
                </div>
                <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />Sauvegarder</Button>
              </div>
            </TabsContent>

            {/* Security */}
            <TabsContent value="security">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card space-y-6">
                <h3 className="font-display font-semibold text-lg">Sécurité & accès</h3>
                <div className="space-y-3">
                  {[
                    { label: "Authentification 2FA", desc: "Exiger la double authentification pour les admins", enabled: true },
                    { label: "Validation hiérarchique", desc: "Les commandes > 5 000 MAD nécessitent une approbation", enabled: true },
                    { label: "Journaux d'audit", desc: "Enregistrer toutes les actions admin", enabled: true },
                    { label: "Restriction IP", desc: "Limiter l'accès admin à certaines adresses IP", enabled: false },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div><p className="font-medium">{s.label}</p><p className="text-sm text-muted-foreground">{s.desc}</p></div>
                      <Switch defaultChecked={s.enabled} />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label>Seuil de validation hiérarchique (MAD)</Label>
                  <Input defaultValue="5000" type="number" />
                </div>
                <Button onClick={handleSave} className="gap-2"><Save className="h-4 w-4" />Sauvegarder</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
