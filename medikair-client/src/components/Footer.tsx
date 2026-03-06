import { Package } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hero-gradient">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">
                Medi<span className="text-secondary">kair</span>
              </span>
            </Link>
            <p className="mt-3 text-xs text-muted-foreground sm:text-sm">
              Votre partenaire de confiance pour l'approvisionnement en matériel dentaire professionnel.
            </p>
          </div>
          <div>
            <h4 className="font-display text-xs font-semibold sm:text-sm">Catalogue</h4>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground sm:mt-3 sm:space-y-2 sm:text-sm">
              <li><Link to="/catalogue" className="hover:text-foreground transition-colors">Orthodontie</Link></li>
              <li><Link to="/catalogue" className="hover:text-foreground transition-colors">Implantologie</Link></li>
              <li><Link to="/catalogue" className="hover:text-foreground transition-colors">Endodontie</Link></li>
              <li><Link to="/catalogue" className="hover:text-foreground transition-colors">Hygiène</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xs font-semibold sm:text-sm">Support</h4>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground sm:mt-3 sm:space-y-2 sm:text-sm">
              <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Livraison</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xs font-semibold sm:text-sm">Légal</h4>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground sm:mt-3 sm:space-y-2 sm:text-sm">
              <li><a href="#" className="hover:text-foreground transition-colors">CGV</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Confidentialité</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Mentions légales</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-5 text-center text-[10px] text-muted-foreground sm:mt-10 sm:pt-6 sm:text-xs">
          © 2026 Medikair.com — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
