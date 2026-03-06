import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 items-center justify-center bg-hero-gradient lg:flex">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md px-12 text-primary-foreground"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="mt-8 font-display text-3xl font-bold">
            Bienvenue sur Medikair
          </h2>
          <p className="mt-4 text-primary-foreground/70 leading-relaxed">
            Accédez à plus de 5 000 références de matériel dentaire professionnel avec des recommandations personnalisées par IA.
          </p>
          <div className="mt-10 space-y-4">
            {["Recommandations IA personnalisées", "Commande rapide en 3 clics", "Livraison 24h"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-secondary" />
                <span className="text-sm text-primary-foreground/80">{f}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 lg:hidden mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-hero-gradient">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">
              Medi<span className="text-secondary">kair</span>
            </span>
          </Link>

          <h1 className="font-display text-2xl font-bold">
            {isRegister ? "Créer un compte professionnel" : "Se connecter"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister
              ? "Rejoignez plus de 1 200 praticiens sur Medikair"
              : "Accédez à votre espace praticien"}
          </p>

          <form className="mt-8 space-y-4" onSubmit={(e) => e.preventDefault()}>
            {isRegister && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" placeholder="Dr. Ahmed" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" placeholder="Bennani" className="mt-1.5" />
                </div>
              </div>
            )}
            {isRegister && (
              <div>
                <Label htmlFor="cabinet">Nom du cabinet / clinique</Label>
                <Input id="cabinet" placeholder="Cabinet Dentaire Fès Centre" className="mt-1.5" />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email professionnel</Label>
              <Input id="email" type="email" placeholder="dr.ahmed@cabinet.ma" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-hero-gradient text-primary-foreground hover:opacity-90 font-semibold">
              {isRegister ? "Créer mon compte" : "Se connecter"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? "Déjà inscrit ?" : "Pas encore de compte ?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="font-medium text-secondary hover:underline"
            >
              {isRegister ? "Se connecter" : "Créer un compte"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
