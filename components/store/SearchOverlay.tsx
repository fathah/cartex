"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search as SearchIcon,
  X,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Spin } from "antd";
import { getSearchRecommendations, searchProducts } from "@/actions/search";
import { getMediaUrl } from "@/utils/media_url";
import Currency from "@/components/common/Currency";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type Suggestion = { type: string; label: string; href: string };

const SearchOverlay = ({ isOpen, onClose }: SearchOverlayProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);

  const hasQuery = useMemo(() => query.trim().length > 0, [query]);

  const fetchData = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const [results, recos] = await Promise.all([
        searchProducts(q),
        getSearchRecommendations(q),
      ]);
      setProducts(results.products || []);
      setSuggestions(recos.suggestions || []);
      if (!q && "popularCategories" in recos) {
        setPopularSearches((recos.popularCategories as string[]) || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchData(query);
    }
  }, [isOpen]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (query) {
        fetchData(query);
      } else {
        setProducts([]);
        setSuggestions([]);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [query, fetchData]);

  const handleSearch = (value: string) => {
    router.push(`/search?q=${encodeURIComponent(value)}`);
    onClose();
  };

  const handleProductClick = (slug: string) => {
    router.push(`/product/${slug}`);
    onClose();
  };

  // Prevent scrolling when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 bg-white z-[70] shadow-2xl rounded-b-3xl overflow-hidden max-h-[85vh] flex flex-col"
          >
            <div className="container mx-auto px-4 py-6 max-w-5xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 relative">
                  <SearchIcon
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={22}
                  />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search for products, categories..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
                    className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[calc(85vh-140px)] custom-scrollbar pr-2">
                {!hasQuery ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-8">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Sparkles size={14} /> Popular Searches
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {(popularSearches.length > 0
                          ? popularSearches
                          : [
                              "Perfume",
                              "Room Spray",
                              "Gift Set",
                              "Candles",
                              "Oud",
                            ]
                        ).map((term) => (
                          <button
                            key={term}
                            onClick={() => setQuery(term)}
                            className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-all hover:scale-105"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Could add recent searches or trending products here */}
                  </div>
                ) : (
                  <div className="pb-12">
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <Spin size="large" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Suggestions / Categories Column */}
                        <div className="lg:col-span-1 border-r border-gray-100 pr-6">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                            Suggestions
                          </h3>
                          {suggestions.length > 0 ? (
                            <ul className="space-y-2">
                              {suggestions.map((s, idx) => (
                                <li key={idx}>
                                  <button
                                    onClick={() => router.push(s.href)}
                                    className="flex items-center gap-2 w-full text-left text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-colors group"
                                  >
                                    <SearchIcon
                                      size={14}
                                      className="text-gray-400 group-hover:text-emerald-600"
                                    />
                                    <span className="flex-1 truncate">
                                      {s.label}
                                    </span>
                                    <ChevronRight
                                      size={14}
                                      className="opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity"
                                    />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-400 italic">
                              No direct matches found.
                            </p>
                          )}
                        </div>

                        {/* Products Grid */}
                        <div className="lg:col-span-3">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                              Products ({products.length})
                            </h3>
                            {products.length > 0 && (
                              <button
                                onClick={() => handleSearch(query)}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline"
                              >
                                View All Results <ArrowRight size={12} />
                              </button>
                            )}
                          </div>

                          {products.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                              {products.slice(0, 6).map((product) => (
                                <div
                                  key={product.id}
                                  className="group cursor-pointer"
                                  onClick={() =>
                                    handleProductClick(product.slug)
                                  }
                                >
                                  <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
                                    {product.mediaProducts?.[0]?.media?.url ? (
                                      <img
                                        src={getMediaUrl(
                                          product.mediaProducts[0].media.url,
                                        )}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                        <ImageIcon
                                          size={32}
                                          strokeWidth={1.5}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <h4 className="font-medium text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                                    {product.name}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    <Currency
                                      value={Number(
                                        product.variants[0]?.salePrice || 0,
                                      )}
                                    />
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-12 text-center text-gray-500">
                              <p>No products found matching "{query}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer / Quick Links if needed */}
              <div className="border-t border-gray-100 pt-4 mt-auto flex justify-end">
                <button
                  onClick={() => setQuery("")}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear Search
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
