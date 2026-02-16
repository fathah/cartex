"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Spin } from "antd";
import { Search as SearchIcon, Sparkles } from "lucide-react";
import { getSearchRecommendations, searchProducts } from "@/actions/search";
import ProductCard from "@/components/store/product-card";

type Suggestion = { type: string; label: string; href: string };

const SearchClient = () => {
  const router = useRouter();
  const params = useSearchParams();
  const initialQuery = params.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(initialQuery);
  }, [initialQuery, fetchData]);

  useEffect(() => {
    const handle = setTimeout(() => {
      router.replace(`/search?q=${encodeURIComponent(query)}`);
      fetchData(query);
    }, 350);
    return () => clearTimeout(handle);
  }, [query, fetchData, router]);

  const onSubmit = (value: string) => {
    setQuery(value);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#f0f7f3_0%,#ffffff_45%,#f7f9fb_100%)]">
      <div className="container mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-700 mb-4">
            <Sparkles size={14} />
            Find your next favorite
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Search the store
          </h1>
          <p className="text-gray-500 max-w-2xl">
            Explore products, categories, and curated collections. Suggestions
            update as you type.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-10">
          <Input
            size="large"
            placeholder="Search perfumes, candles, room sprays..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onPressEnter={(e) => onSubmit((e.target as HTMLInputElement).value)}
            prefix={<SearchIcon size={18} className="text-gray-400" />}
            className="rounded-xl py-2"
          />

          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.slice(0, 8).map((s, idx) => (
              <button
                key={`${s.type}-${s.label}-${idx}`}
                onClick={() => router.push(s.href)}
                className="px-3 py-1.5 text-sm rounded-full border border-gray-200 text-gray-700 hover:bg-gray-900 hover:text-white transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {hasQuery ? "Results" : "Trending right now"}
          </h2>
          {hasQuery && (
            <span className="text-sm text-gray-500">
              {products.length} items found
            </span>
          )}
        </div>

        {loading ? (
          <div className="w-full flex items-center justify-center py-16">
            <Spin size="large" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-600">
            No results found. Try a different keyword or explore the suggested
            searches above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchClient;
