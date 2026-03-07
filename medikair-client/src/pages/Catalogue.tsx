import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Loader2, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import { searchAPI, categoriesAPI, productsAPI } from "@/api";
import { categoryMeta } from "@/types/product";
import type { Product, Category } from "@/types/product";

const ITEMS_PER_PAGE = 12;
type SortKey = "newest" | "price_asc" | "price_desc" | "name" | "rating";

/* ── Facet-aware filter panel ─────────────────────────────────────── */
function FilterPanel({
  categories, brands, selectedCats, selectedBrands, toggleFilter,
  setSelectedCats, setSelectedBrands, activeFilters,
  priceRange, setPriceRange, maxPrice, inStockOnly, setInStockOnly, promoOnly, setPromoOnly,
  facetCounts,
}: {
  categories: Category[]; brands: string[];
  selectedCats: string[]; selectedBrands: string[];
  toggleFilter: (arr: string[], val: string, setter: (v: string[]) => void) => void;
  setSelectedCats: (v: string[]) => void; setSelectedBrands: (v: string[]) => void;
  activeFilters: number;
  priceRange: [number, number]; setPriceRange: (v: [number, number]) => void; maxPrice: number;
  inStockOnly: boolean; setInStockOnly: (v: boolean) => void;
  promoOnly: boolean; setPromoOnly: (v: boolean) => void;
  facetCounts: Record<string, Record<string, number>>;
}) {
  const catCounts = facetCounts.category || {};
  const brandCounts = facetCounts.brand || {};

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold">Catégories</h3>
        <div className="mt-3 space-y-2">
          {categories.map((cat) => {
            const meta = categoryMeta[cat.name] || { label: cat.name, icon: "📦" };
            const count = catCounts[cat.name];
            return (
              <label key={cat._id} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={selectedCats.includes(cat.name)} onCheckedChange={() => toggleFilter(selectedCats, cat.name, setSelectedCats)} />
                <span className="flex-1">{meta.icon} {meta.label}</span>
                {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
              </label>
            );
          })}
        </div>
      </div>
      {/* Brands */}
      <div>
        <h3 className="text-sm font-semibold">Marques</h3>
        <div className="mt-3 space-y-2">
          {brands.map((b) => {
            const count = brandCounts[b];
            return (
              <label key={b} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={selectedBrands.includes(b)} onCheckedChange={() => toggleFilter(selectedBrands, b, setSelectedBrands)} />
                <span className="flex-1">{b}</span>
                {count !== undefined && <span className="text-xs text-muted-foreground">({count})</span>}
              </label>
            );
          })}
        </div>
      </div>
      {/* Price range */}
      {maxPrice > 0 && (
        <div>
          <h3 className="text-sm font-semibold">Prix (TND)</h3>
          <Slider min={0} max={maxPrice} step={1} value={priceRange}
            onValueChange={(v) => setPriceRange(v as [number, number])} className="mt-3" />
          <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
            <span>{priceRange[0]} TND</span><span>{priceRange[1]} TND</span>
          </div>
        </div>
      )}
      {/* Stock & Promo toggles */}
      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={inStockOnly} onCheckedChange={(c) => setInStockOnly(!!c)} />
          <span>En stock uniquement</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={promoOnly} onCheckedChange={(c) => setPromoOnly(!!c)} />
          <span>En promotion</span>
        </label>
      </div>
      {activeFilters > 0 && (
        <Button variant="ghost" size="sm" onClick={() => {
          setSelectedCats([]); setSelectedBrands([]);
          setPriceRange([0, maxPrice]); setInStockOnly(false); setPromoOnly(false);
        }}>
          <X className="mr-1 h-3.5 w-3.5" /> Réinitialiser
        </Button>
      )}
    </div>
  );
}

/* ── Main catalogue page ──────────────────────────────────────────── */
export default function CataloguePage() {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "";
  const initialQuery = searchParams.get("q") || "";
  const initialBrand = searchParams.get("brand") || "";

  const [search, setSearch] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [selectedCats, setSelectedCats] = useState<string[]>(initialCat ? [initialCat] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [facetDistribution, setFacetDistribution] = useState<Record<string, Record<string, number>>>({});
  // Price range
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  // In-stock / promo
  const [inStockOnly, setInStockOnly] = useState(false);
  const [promoOnly, setPromoOnly] = useState(false);
  // Meilisearch available flag
  const [meiliAvailable, setMeiliAvailable] = useState(true);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounce search input
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Debounce price range changes
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>(priceRange);
  useEffect(() => {
    clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = setTimeout(() => setDebouncedPriceRange(priceRange), 400);
    return () => clearTimeout(priceDebounceRef.current);
  }, [priceRange]);

  // Fetch categories once
  useEffect(() => {
    categoriesAPI.getAll().then((res) => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  // ── Meilisearch-powered search ────────────────────────────────────
  useEffect(() => {
    const fetchMeili = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {
          q: debouncedSearch || "",
          page,
          limit: ITEMS_PER_PAGE,
          sort: sortBy,
        };
        if (selectedCats.length > 0) params.category = selectedCats.join(",");
        if (selectedBrands.length > 0) params.brand = selectedBrands.join(",");
        if (debouncedPriceRange[0] > 0) params.priceMin = debouncedPriceRange[0];
        if (debouncedPriceRange[1] < maxPrice) params.priceMax = debouncedPriceRange[1];
        if (inStockOnly) params.inStock = "true";
        if (promoOnly) params.isOffer = "true";

        const res = await searchAPI.search(params);
        const data = res.data;

        setProducts(data.hits || []);
        setTotalHits(data.totalHits || 0);
        setProcessingTime(data.processingTimeMs ?? null);
        setFacetDistribution(data.facetDistribution || {});
        setMeiliAvailable(true);

        // Update max price from facet stats if available
        if (data.facetStats?.price?.max) {
          const mp = Math.ceil(data.facetStats.price.max);
          if (mp > 0) {
            setMaxPrice(mp);
            setDebouncedPriceRange((prev) => [prev[0], prev[1] > mp || prev[1] === 10000 ? mp : prev[1]]);
            setPriceRange((prev) => [prev[0], prev[1] > mp || prev[1] === 10000 ? mp : prev[1]]);
          }
        }
      } catch {
        // Meilisearch unavailable — fallback to MongoDB
        setMeiliAvailable(false);
        try {
          const params: Record<string, any> = {};
          if (debouncedSearch) params.search = debouncedSearch;
          const prodRes = await productsAPI.getAll(params);
          const allProducts: Product[] = prodRes.data.data || [];
          setProducts(allProducts);
          setTotalHits(allProducts.length);
          if (allProducts.length > 0) {
            const mp = Math.ceil(Math.max(...allProducts.map((p) => p.price)));
            setMaxPrice(mp);
          }
        } catch (err) {
          console.error("Failed to load catalogue:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMeili();
  }, [debouncedSearch, page, sortBy, selectedCats, selectedBrands, debouncedPriceRange, inStockOnly, promoOnly, maxPrice]);

  // Extract brands from facet distribution for filter panel
  const brands = useMemo(() => {
    if (facetDistribution.brand) {
      return Object.keys(facetDistribution.brand).sort();
    }
    return [...new Set(products.map((p) => p.brand).filter(Boolean))].sort();
  }, [facetDistribution, products]);

  const toggleFilter = useCallback((arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  }, []);

  // If Meilisearch is down, do client-side post-filtering
  const displayProducts = useMemo(() => {
    if (meiliAvailable) return products; // Server already filtered
    let result = products.filter((p) => {
      const matchCat = selectedCats.length === 0 || selectedCats.includes(p.category);
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchStock = !inStockOnly || p.inStock;
      const matchPromo = !promoOnly || (p.discountPercentage && p.discountPercentage > 0) || p.isOffer || !!p.oldPrice;
      return matchCat && matchBrand && matchPrice && matchStock && matchPromo;
    });
    switch (sortBy) {
      case "price_asc": result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "name": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "rating": result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      default: break;
    }
    return result;
  }, [meiliAvailable, products, selectedCats, selectedBrands, priceRange, inStockOnly, promoOnly, sortBy]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [selectedCats, selectedBrands, debouncedPriceRange, inStockOnly, promoOnly, sortBy, debouncedSearch]);

  const totalPages = meiliAvailable
    ? Math.max(1, Math.ceil(totalHits / ITEMS_PER_PAGE))
    : Math.max(1, Math.ceil(displayProducts.length / ITEMS_PER_PAGE));
  const paginated = meiliAvailable
    ? displayProducts
    : displayProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeFilters = selectedCats.length + selectedBrands.length + (inStockOnly ? 1 : 0) + (promoOnly ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);
  const filterProps = {
    categories, brands, selectedCats, selectedBrands, toggleFilter, setSelectedCats, setSelectedBrands, activeFilters,
    priceRange, setPriceRange, maxPrice, inStockOnly, setInStockOnly, promoOnly, setPromoOnly,
    facetCounts: facetDistribution,
  };

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-xl font-bold sm:text-2xl">Catalogue</h1>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {meiliAvailable ? totalHits : displayProducts.length} produit{(meiliAvailable ? totalHits : displayProducts.length) > 1 ? "s" : ""}
              </p>
              {processingTime !== null && meiliAvailable && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <Zap className="h-3 w-3" />
                  {processingTime}ms
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <SearchBar
              expanded
              initialValue={search}
              onSearch={handleSearch}
              className="flex-1 sm:w-80"
            />
            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
              <SelectTrigger className="w-[150px] hidden sm:flex">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="name">Nom A-Z</SelectItem>
                <SelectItem value="rating">Meilleures notes</SelectItem>
              </SelectContent>
            </Select>
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

        {/* Mobile sort */}
        <div className="mt-3 sm:hidden">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
              <SelectItem value="name">Nom A-Z</SelectItem>
              <SelectItem value="rating">Meilleures notes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 flex gap-6">
          {/* Desktop filters sidebar */}
          <motion.aside initial={false} animate={{ width: showFilters ? 240 : 0, opacity: showFilters ? 1 : 0 }} className="hidden shrink-0 overflow-hidden md:block">
            <div className="w-60">
              <FilterPanel {...filterProps} />
            </div>
          </motion.aside>

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 font-display text-lg font-semibold">Aucun produit trouvé</p>
                <p className="text-sm text-muted-foreground">Essayez de modifier vos filtres ou votre recherche</p>
              </div>
            ) : (
              <>
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                  {paginated.map((p: any, i: number) => (
                    <motion.div key={p.id || p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-muted-foreground">…</span>}
                          <Button variant={p === page ? "default" : "outline"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p)}>
                            {p}
                          </Button>
                        </span>
                      ))}
                    <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
