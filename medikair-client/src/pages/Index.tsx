import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Truck, ShieldCheck, Sparkles, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { categoryMeta } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import heroImage from "@/assets/hero-dental.jpg";
import { useEffect, useState } from "react";
import { productsAPI, categoriesAPI } from "@/api";
import type { Product, Category } from "@/types/product";

const stats = [
  { value: "5 000+", label: "Références" },
  { value: "1 200+", label: "Praticiens" },
  { value: "24h", label: "Livraison" },
  { value: "98%", label: "Satisfaction" },
];

const Index = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          productsAPI.getAll({ featured: true }),
          categoriesAPI.getAll(),
        ]);
        setFeatured((prodRes.data.data || []).slice(0, 4));
        setCategories(catRes.data.data || []);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Cabinet dentaire moderne" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-hero-gradient opacity-85" />
        </div>
        <div className="container relative mx-auto px-4 py-16 sm:py-24 md:py-36">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium text-primary-foreground">
              <Sparkles className="h-3 w-3" /> Recommandations IA intégrées
            </span>
            <h1 className="mt-5 font-display text-2xl font-extrabold leading-tight text-primary-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              Matériel dentaire<br /><span className="opacity-80">intelligent & accessible</span>
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-primary-foreground/80 sm:mt-5 sm:text-base md:text-lg">
              La plateforme B2B qui comprend vos besoins. Commandez vos consommables en 3 clics grâce à notre assistant d'approvisionnement intelligent.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3">
              <Link to="/catalogue">
                <Button size="lg" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold sm:w-auto">
                  Explorer le catalogue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto">
                  Créer un compte pro
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-8 sm:gap-6 sm:py-10 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center">
              <div className="font-display text-2xl font-extrabold text-foreground sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-10 sm:py-16">
        <h2 className="font-display text-xl font-bold sm:text-2xl">Parcourir par spécialité</h2>
        <p className="mt-1 text-sm text-muted-foreground">Trouvez rapidement ce dont vous avez besoin</p>
        <div className="mt-6 grid grid-cols-3 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-6">
          {categories.map((cat, i) => {
            const meta = categoryMeta[cat.name] || { label: cat.name, icon: "📦" };
            return (
              <motion.div key={cat._id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
                <Link to={`/catalogue?cat=${cat.name}`} className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-card transition-all hover:shadow-card-hover hover:border-secondary/40 sm:gap-3 sm:p-5">
                  <span className="text-2xl sm:text-3xl">{meta.icon}</span>
                  <span className="text-center text-[10px] font-medium text-foreground group-hover:text-secondary transition-colors sm:text-sm">{meta.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-10 sm:py-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold sm:text-2xl">Produits populaires</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sélectionnés par notre IA selon les tendances</p>
            </div>
            <Link to="/catalogue">
              <Button variant="outline" size="sm">Voir tout <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="mt-6 grid gap-3 grid-cols-2 sm:mt-8 sm:gap-5 lg:grid-cols-4">
              {featured.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust Bar */}
      <section className="container mx-auto px-4 py-10 sm:py-16">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            { icon: Truck, title: "Livraison 24h", desc: "Livraison express sur toute la Tunisie pour les commandes avant 14h." },
            { icon: ShieldCheck, title: "Produits certifiés", desc: "Tous nos produits respectent les normes CE et ISO en vigueur." },
            { icon: Star, title: "Support dédié", desc: "Une équipe de spécialistes à votre écoute du lundi au vendredi." },
          ].map((item, i) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="flex gap-3 rounded-xl border border-border bg-card p-4 shadow-card sm:gap-4 sm:p-6">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent sm:h-11 sm:w-11">
                <item.icon className="h-4 w-4 text-accent-foreground sm:h-5 sm:w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold sm:text-base">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
