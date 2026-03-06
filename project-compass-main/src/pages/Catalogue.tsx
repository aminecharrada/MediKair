import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/products";

const brands = [...new Set(products.map((p) => p.brand))];

function FilterPanel({
  selectedCats, selectedBrands, toggleFilter, setSelectedCats, setSelectedBrands, activeFilters
}: {
  selectedCats: string[]; selectedBrands: string[];
  toggleFilter: (arr: string[], val: string, setter: (v: string[]) => void) => void;
  setSelectedCats: (v: string[]) => void; setSelectedBrands: (v: string[]) => void;
  activeFilters: number;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Catégories</h3>
        <div className="mt-3 space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={selectedCats.includes(cat.id)} onCheckedChange={() => toggleFilter(selectedCats, cat.id, setSelectedCats)} />
              <span>{cat.icon} {cat.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold">Marques</h3>
        <div className="mt-3 space-y-2">
          {brands.map((b) => (
            <label key={b} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={selectedBrands.includes(b)} onCheckedChange={() => toggleFilter(selectedBrands, b, setSelectedBrands)} />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </div>
      {activeFilters > 0 && (
        <Button variant="ghost" size="sm" onClick={() => { setSelectedCats([]); setSelectedBrands([]); }}>
          <X className="mr-1 h-3.5 w-3.5" /> Réinitialiser
        </Button>
      )}
    </div>
  );
}

export default function CataloguePage() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "";

  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCat ? [initialCat] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCats.length === 0 || selectedCats.includes(p.category);
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      return matchSearch && matchCat && matchBrand;
    });
  }, [search, selectedCats, selectedBrands]);

  const activeFilters = selectedCats.length + selectedBrands.length;

  const filterProps = { selectedCats, selectedBrands, toggleFilter, setSelectedCats, setSelectedBrands, activeFilters };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-xl font-bold sm:text-2xl">Catalogue</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} produit{filtered.length > 1 ? "s" : ""}</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {/* Desktop filter toggle */}
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="relative hidden md:flex">
              <SlidersHorizontal className="mr-1.5 h-4 w-4" />Filtres
              {activeFilters > 0 && (
                <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">{activeFilters}</span>
              )}
            </Button>
            {/* Mobile filter sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative md:hidden">
                  <SlidersHorizontal className="mr-1.5 h-4 w-4" />Filtres
                  {activeFilters > 0 && (
                    <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">{activeFilters}</span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-6">
                <SheetHeader>
                  <SheetTitle className="font-display">Filtres</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel {...filterProps} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="mt-6 flex gap-6">
          {/* Desktop filters sidebar */}
          <motion.aside initial={false} animate={{ width: showFilters ? 240 : 0, opacity: showFilters ? 1 : 0 }} className="hidden shrink-0 overflow-hidden md:block">
            <div className="w-60">
              <FilterPanel {...filterProps} />
            </div>
          </motion.aside>

          {/* Products grid */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 font-display text-lg font-semibold">Aucun produit trouvé</p>
                <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                {filtered.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
