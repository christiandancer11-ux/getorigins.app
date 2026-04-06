import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader2, ExternalLink, ChevronDown, ChevronUp, ShoppingCart, Tag, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';

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
  const savings = product.msrp && product.cheapest_price
    ? Math.round(((product.msrp - product.cheapest_price) / product.msrp) * 100)
    : 0;
  const aboveMsrp = product.cheapest_price > product.msrp;

  return (
    <div className="border border-border/40 rounded-xl bg-card overflow-hidden">
      {/* Main row */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className="text-xs border-primary/30 text-primary/80 shrink-0">
                {PRODUCT_TYPE_LABELS[product.product_type] || 'Box'}
              </Badge>
              {product.is_upcoming && (
                <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30 shrink-0">
                  Upcoming
                </Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground leading-tight">{product.product_name}</p>
            {product.release_date && (
              <p className="text-xs text-muted-foreground mt-0.5">{product.release_date}</p>
            )}
          </div>

          {/* Price column */}
          <div className="text-right shrink-0">
            {product.cheapest_price && (
              <div className={`text-lg font-bold ${aboveMsrp ? 'text-amber-400' : 'text-green-400'}`}>
                ${product.cheapest_price.toFixed(2)}
              </div>
            )}
            {product.msrp && (
              <div className="text-xs text-muted-foreground">
                MSRP: ${product.msrp.toFixed(2)}
              </div>
            )}
            {savings > 0 && (
              <div className="text-xs text-green-400 font-medium">{savings}% off MSRP</div>
            )}
            {aboveMsrp && (
              <div className="text-xs text-amber-400 font-medium">Above MSRP</div>
            )}
          </div>
        </div>

        {/* Best deal row */}
        {product.cheapest_seller && (
          <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <ShoppingCart className="w-3.5 h-3.5 text-green-400 shrink-0" />
            <span className="text-xs text-green-400 font-medium">Best Price: {product.cheapest_seller}</span>
            {product.cheapest_free_shipping && (
              <span className="text-xs text-green-300 ml-auto">Free Ship</span>
            )}
            {product.cheapest_seller_url && (
              <a
                href={product.cheapest_seller_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5 text-green-400 hover:text-green-300" />
              </a>
            )}
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Hide' : 'View'} all sellers ({product.sellers?.length || 0})
        </button>
      </div>

      {/* Expanded sellers */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="px-4 py-3 space-y-2">
              {/* Seller comparison */}
              {product.sellers && product.sellers.length > 0 ? (
                <>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Price Comparison</p>
                  {product.sellers
                    .slice()
                    .sort((a, b) => (a.price || 999) - (b.price || 999))
                    .map((seller, i) => (
                      <div key={i} className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${i === 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-secondary/30'}`}>
                        <div className="flex items-center gap-2">
                          {i === 0 && <Tag className="w-3 h-3 text-green-400" />}
                          <span className="text-sm text-foreground">{seller.name}</span>
                          {seller.free_shipping && <span className="text-xs text-green-300">Free Ship</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${i === 0 ? 'text-green-400' : 'text-foreground'}`}>
                            ${seller.price?.toFixed(2) ?? '—'}
                          </span>
                          {seller.url && (
                            <a href={seller.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No seller data available.</p>
              )}

              {/* Additional info */}
              <div className="pt-2 space-y-1 border-t border-border/20 mt-2">
                {product.cards_per_box && (
                  <p className="text-xs text-muted-foreground">📦 {product.cards_per_box}</p>
                )}
                {product.notable_hits && (
                  <p className="text-xs text-muted-foreground">✨ {product.notable_hits}</p>
                )}
                {product.market_note && (
                  <p className="text-xs text-foreground/70 italic">{product.market_note}</p>
                )}
              </div>
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
  const [loaded, setLoaded] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('fetchBoxPrices', { category });
    if (res.data && !res.data.error) {
      setData(res.data);
    }
    setLoading(false);
    setLoaded(true);
  };

  const handleRefresh = async () => {
    setData(null);
    await fetchData();
  };

  // Auto-load on mount
  React.useEffect(() => {
    setData(null);
    setLoaded(false);
  }, [category]);

  return (
    <div className="mt-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Package className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-foreground">New Box Releases</h2>
            <p className="text-xs text-muted-foreground">MSRP & cheapest online prices</p>
          </div>
        </div>
        {loaded && !loading && (
          <button onClick={handleRefresh} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {!loaded && !loading && (
        <Button
          variant="outline"
          onClick={fetchData}
          className="w-full gap-2 border-dashed border-primary/30 text-primary hover:bg-primary/10"
        >
          <Package className="w-4 h-4" />
          Load Box Prices & Best Deals
        </Button>
      )}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Scanning retailers for best prices…</p>
        </div>
      )}

      {data && !loading && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {data.products?.length > 0 ? (
            data.products.map((product, i) => (
              <ProductCard key={i} product={product} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No box data found for this category.</p>
          )}
          <p className="text-xs text-muted-foreground text-center pt-1">
            Prices updated {data.generated_at ? new Date(data.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} · Always verify before purchasing
          </p>
        </motion.div>
      )}
    </div>
  );
}