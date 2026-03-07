import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Loader2, ArrowRight, Tag, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchAPI } from "@/api";
import { motion, AnimatePresence } from "framer-motion";

interface Suggestion {
  id: string;
  name: string;
  brand: string;
  category: string;
  refFabricant?: string;
  codeEAN?: string;
  price: number;
  image: string;
  inStock: boolean;
  _formatted?: {
    name?: string;
    brand?: string;
  };
}

interface SearchBarProps {
  /** If true, renders a full-width version (for Catalogue page) */
  expanded?: boolean;
  /** Called when user submits a search (Enter or click "See all") */
  onSearch?: (query: string) => void;
  /** Initial value for the input */
  initialValue?: string;
  className?: string;
}

export default function SearchBar({ expanded = false, onSearch, initialValue = "", className = "" }: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync initial value
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounced suggest
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSuggestions([]);
      setCategories([]);
      setBrands([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await searchAPI.suggest(q);
      const data = res.data;
      setSuggestions(data.suggestions || []);
      setCategories(data.categories || []);
      setBrands(data.brands || []);
      setOpen(true);
      setSelectedIndex(-1);
    } catch {
      // Fallback: if Meilisearch is down, just close suggestions
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length >= 1) {
      debounceRef.current = setTimeout(() => fetchSuggestions(query), 250);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    const total = suggestions.length + categories.length + brands.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % (total + 1)); // +1 for "see all"
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + total + 1) % (total + 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        goToProduct(suggestions[selectedIndex]);
      } else {
        submitSearch();
      }
    }
  };

  const submitSearch = () => {
    setOpen(false);
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/catalogue?q=${encodeURIComponent(query)}`);
    }
  };

  const goToProduct = (s: Suggestion) => {
    setOpen(false);
    navigate(`/produit/${s.id}`);
  };

  const searchByCategory = (cat: string) => {
    setOpen(false);
    navigate(`/catalogue?cat=${encodeURIComponent(cat)}`);
  };

  const searchByBrand = (b: string) => {
    setOpen(false);
    navigate(`/catalogue?q=${encodeURIComponent(query)}&brand=${encodeURIComponent(b)}`);
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND" }).format(n);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 1 && suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher par nom, référence, code EAN…"
          className={`pl-9 pr-10 ${expanded ? "h-11 text-base" : "h-9"}`}
        />
        {loading && (
          <Loader2 className="absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {query && (
          <button
            onClick={() => { setQuery(""); setSuggestions([]); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (suggestions.length > 0 || categories.length > 0 || brands.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[420px] overflow-auto rounded-lg border border-border bg-popover shadow-xl"
          >
            {/* Product suggestions */}
            {suggestions.length > 0 && (
              <div className="p-2">
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Produits
                </p>
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => goToProduct(s)}
                    className={`flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent ${
                      selectedIndex === i ? "bg-accent" : ""
                    }`}
                  >
                    {s.image ? (
                      <img src={s.image} alt="" className="h-10 w-10 rounded-md object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <Search className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm font-medium"
                        dangerouslySetInnerHTML={{
                          __html: s._formatted?.name || s.name,
                        }}
                      />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: s._formatted?.brand || s.brand,
                          }}
                        />
                        {s.refFabricant && (
                          <>
                            <span>·</span>
                            <span>Réf: {s.refFabricant}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-secondary">
                        {formatPrice(s.price)}
                      </p>
                      {!s.inStock && (
                        <Badge variant="outline" className="text-[10px]">
                          Rupture
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Category suggestions */}
            {categories.length > 0 && (
              <div className="border-t border-border p-2">
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Catégories
                </p>
                <div className="flex flex-wrap gap-1.5 px-2 py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => searchByCategory(cat)}
                      className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent/80"
                    >
                      <Layers className="h-3 w-3" />
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Brand suggestions */}
            {brands.length > 0 && (
              <div className="border-t border-border p-2">
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Marques
                </p>
                <div className="flex flex-wrap gap-1.5 px-2 py-1">
                  {brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => searchByBrand(b)}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary transition-colors hover:bg-secondary/20"
                    >
                      <Tag className="h-3 w-3" />
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* See all results */}
            <div className="border-t border-border p-2">
              <button
                onClick={submitSearch}
                className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-secondary transition-colors hover:bg-accent"
              >
                Voir tous les résultats pour « {query} »
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
