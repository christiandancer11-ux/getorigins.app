import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader2, ExternalLink, ChevronDown, ChevronUp, ShoppingCart, Tag, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { legacyApi } from '@/api/apiClient';

const PRODUCT_TYPE_LABELS = {
  hobby_box: 'Hobby Box',
  blaster_box: 'Blaster Box',
  jumbo_box: 'Jumbo Box',
  booster_box: 'Booster Box',
  elite_box: 'Elite Box',
  set_box: 'Set Box',
  tin: 'Tin',
  bundle: 'Bundle',
  other: 'Box/Set',
};

function ProductCard({ product }) {
  const [expanded, setExpanded] = useState(false);

  const aboveMsrp = product.cheapest_price && product.msrp && product.cheapest_price > product.msrp;
  const savings = product.msrp && product.cheapest_price && !aboveMsrp
    ? Math.round(((product.msrp - product.cheapest_price) / product.msrp) * 100)
    : 0;

  return (
    <div className="border border-border/40 rounded-xl bg-card overflow-hidden">
      <div className="px-4 py-3">
        {/* Top row: name + badges */}
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className="text-xs border-primary/30 text-primary/80 shrink-0">
                {PRODUCT_TYPE_LABELS[product.product_type] || 'Box'}
              </Badge>
            </div>
            <p className="text-sm font-semibold text-foreground leading-tight">{product.product_name}</p>
            {product.release_date && (
              <p className="text-xs text-muted-foreground mt-0.5">
                📅 Released: {product.release_date}
              </p>
            )}
          </div>
        </div>

        {/* MSRP + Best Price row */}
        <div className="flex items-stretch gap-3 mt-2">
          {/* MSRP block */}
          <div className="flex-1 bg-secondary/30 rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground mb-0.5">MSRP</p>
            <p className="text-base font-bold text-foreground">
              {product.msrp ? `$${product.msrp.toFixed(2)}` : '—'}
            </p>
          </div>

          {/* Best Price block */}
          <div className={`flex-1 rounded-lg px-3 py-2 text-center border ${aboveMsrp ? 'bg-amber-500/10 border-amber-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
            <p className="text-xs text-muted-foreground mb-0.5">Best Price</p>
            <p className={`text-base font-bold ${aboveMsrp ? 'text-amber-400' : 'text-green-400'}`}>
              {product.cheapest_price ? `$${product.cheapest_price.toFixed(2)}` : '—'}
            </p>
            {savings > 0 && <p className="text-xs text-green-400">{savings}% off</p>}
            {aboveMsrp && <p className="text-xs text-amber-400">Above MSRP</p>}
          </div>
        </div>

        {/* Best seller highlight */}
        {product.cheapest_seller && (
          <div className="flex items-center gap-2 mt-2 px-2 py-1.5 rounded-lg bg-secondary/30">
            <ShoppingCart className="w-3.5 h-3.5 text-green-400 shrink-0" />
            <span className="text-xs text-foreground flex-1">{product.cheapest_seller}</span>
            {product.cheapest_free_shipping && (
              <span className="text-xs text-green-300">Free Ship</span>
            )}
            {product.cheapest_seller_url ? (
              <a 
                href={product.cheapest_seller_url} 
                target="_blank" 
                rel="noopener noreferrer"
                title={`Search ${product.cheapest_seller} for this product`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
              </a>
            ) : (
              <span className="text-xs text-muted-foreground/50">No link</span>
            )}
          </div>
        )}

        {/* Expand toggle */}
        {product.sellers?.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide' : 'Compare'} all sellers ({product.sellers.length})
          </button>
        )}
      </div>

      {/* Expanded seller comparison */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="px-4 py-3 space-y-1.5">
              {product.sellers
                .slice()
                .sort((a, b) => (a.price || 999) - (b.price || 999))
                .map((seller, i) => (
                  <div key={i} className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${i === 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-secondary/30'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      {i === 0 && <Tag className="w-3 h-3 text-green-400 shrink-0" />}
                      <span className="text-sm text-foreground truncate">{seller.name}</span>
                      {seller.free_shipping && <span className="text-xs text-green-300 shrink-0">Free Ship</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                       <span className={`text-sm font-semibold ${i === 0 ? 'text-green-400' : 'text-foreground'}`}>
                         ${seller.price?.toFixed(2) ?? '—'}
                       </span>
                       {seller.url ? (
                         <a 
                           href={seller.url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           title={`Search ${seller.name} for this product`}
                         >
                           <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                         </a>
                       ) : (
                         <span className="text-xs text-muted-foreground/30">—</span>
                       )}
                     </div>
                  </div>
                ))}

              {/* Extra product info */}
              {(product.cards_per_box || product.notable_hits || product.market_note) && (
                <div className="pt-2 mt-1 border-t border-border/20 space-y-1">
                  {product.cards_per_box && <p className="text-xs text-muted-foreground">📦 {product.cards_per_box}</p>}
                  {product.notable_hits && <p className="text-xs text-muted-foreground">✨ {product.notable_hits}</p>}
                  {product.market_note && <p className="text-xs text-foreground/60 italic">{product.market_note}</p>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BoxPriceTracker({ category }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (signal) => {
    setLoading(true);
    setData(null);
    try {
      const res = await legacyApi.functions.invoke('fetchBoxPrices', { category }, { signal });
      if (res.data && !res.data.error) {
        setData(res.data);
      }
    } catch (e) {
      if (e?.code === 'ERR_CANCELED' || e?.name === 'AbortError' || e?.message === 'Request aborted') return;
      throw e;
    }
    setLoading(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [category]);

  // Sort by release date descending (newest first)
  const sortedProducts = data?.products
    ? [...data.products].sort((a, b) => {
        const dateA = a.release_date && a.release_date !== 'Available Now' ? new Date(a.release_date) : new Date(0);
        const dateB = b.release_date && b.release_date !== 'Available Now' ? new Date(b.release_date) : new Date(0);
        return dateB - dateA;
      })
    : [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-foreground">New Releases</h2>
            <p className="text-xs text-muted-foreground">In-stock only · best online price</p>
          </div>
        </div>
        {!loading && data && (
          <button onClick={() => fetchData()} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Finding newest releases &amp; best prices…</p>
        </div>
      )}

      {data && !loading && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {sortedProducts.length > 0 ? (
            sortedProducts.map((product, i) => (
              <ProductCard key={i} product={product} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No release data found for this category.</p>
          )}
          <p className="text-xs text-muted-foreground text-center pt-1">
            Updated {data.generated_at ? new Date(data.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} · Verify prices before purchasing
          </p>
        </motion.div>
      )}
    </div>
  );
}

