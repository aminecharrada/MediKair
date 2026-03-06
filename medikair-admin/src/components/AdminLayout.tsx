import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3, Package, Users, ShoppingCart, Settings, Menu, X, Tag,
  Megaphone, FolderTree, ImageIcon, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { label: "Dashboard", path: "/", icon: BarChart3 },
  { label: "Produits (PIM)", path: "/produits", icon: Package },
  { label: "Catégories", path: "/categories", icon: FolderTree },
  { label: "Clients (CRM)", path: "/clients", icon: Users },
  { label: "Commandes", path: "/commandes", icon: ShoppingCart },
  { label: "Promotions", path: "/promotions", icon: Tag },
  { label: "Hero Images", path: "/hero-images", icon: ImageIcon },
  { label: "Rapports", path: "/rapports", icon: Megaphone },
  { label: "Équipe Admin", path: "/admins", icon: ShieldCheck },
  { label: "Paramètres", path: "/parametres", icon: Settings },
];

interface AdminLayoutProps {
  title: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminLayout({ title, headerActions, children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Package className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold">
            Medikair <span className="text-xs font-normal opacity-60">Admin</span>
          </span>
          <button className="ml-auto md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="mt-4 space-y-1 px-3">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <a href="http://localhost:3000">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            >
              ← Retour au site
            </Button>
          </a>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 px-6 backdrop-blur-lg">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-lg font-bold">{title}</h1>
          {headerActions && <div className="ml-auto flex items-center gap-2">{headerActions}</div>}
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
