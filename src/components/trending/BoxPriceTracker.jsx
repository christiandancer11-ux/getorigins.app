import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader2, ExternalLink, ChevronDown, ChevronUp, ShoppingCart, Tag, RefreshCw } from 'lucide-react';
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

// MSRP-only card
function MsrpCard({ product }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-border/40 rounded-xl bg-card overflow-hidden">
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className="text-xs border-primary/30 text-primary/80 shrink-0">
                {PRODUCT_TYPE_LABELS[product.product_type] || 'Box'}
              </Badge>
              {product.is_upcoming && (
                <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30 shrink-0">Upcoming</Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground leading-tight">{product.product_name}</p>
            {product.release_date && (
              <p className="text-xs text-muted-foreground mt-0.5">Release: {product.release_date}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-bold text-primary">
              {product.msrp ? `$${product.msrp.toFixed(2)}` : 'N/A'}
            </div>
            <div className="text-xs text-muted-foreground">MSRP</div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Less info' : 'More info'}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="px-4 py-3 space-y-1">
              {product.cards_per_box && <p className="text-xs text-muted-foreground">📦 {product.cards_per_box}</p>}
              {product.notable_hits && <p className="text-xs text-muted-foreground">✨ {product.notable_hits}</p>}
              {product.market_note && <p className="text-xs text-foreground/70 italic">{product.market_note}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Lowest price card
function LowestPriceCard({ product }) {
  const [expanded, setExpanded] = useState(false);
  const aboveMsrp = product.cheapest_price > product.msrp;
  const savings = product.msrp && product.cheapest_price
    ? Math.round(((product.msrp - product.cheapest_price) / product.msrp) * 100)
    : 0;

  return (
    <div className="border border-border/40 rounded-xl bg-card overflow-hidden">
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className="text-xs border-primary/30 text-primary/80 shrink-0">
                {PRODUCT_TYPE_LABELS[product.product_type] || 'Box'}
              </Badge>
              {product.is_upcoming && (
                <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30 shrink-0">Upcoming</Badge>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground leading-tight">{product.product_name}</p>
          </div>
          <div className="text-right shrink-0">
            {product.cheapest_price && (
              <div className={`text-xl font-bold ${aboveMsrp ? 'text-amber-400' : 'text-green-400'}`}>
                ${product.cheapest_price.toFixed(2)}
              </div>
            )}
            {product.msrp && (
              <div className="text-xs text-muted-foreground line-through">${product.msrp.toFixed(2)}</div>
            )}
            {savings > 0 && <div className="text-xs text-green-400 font-medium">{savings}% off</div>}
            {aboveMsrp && <div className="text-xs text-amber-400 font-medium">Above MSRP</div>}
          </div>
        </div>

        {/* Best deal highlight */}
        {product.cheapest_seller && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <ShoppingCart className="w-3.5 h-3.5 text-green-400 shrink-0" />
            <span className="text-xs text-green-400 font-medium flex-1">{product.cheapest_seller}</span>
            {product.cheapest_free_shipping && <span className="text-xs text-green-300">Free Ship</span>}
            {product.cheapest_seller_url && (
              <a href={product.cheapest_seller_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                <ExternalLink className="w-3.5 h-3.5 text-green-400 hover:text-green-300" />
              </a>
            )}
          </div>
        )}

        {product.sellers?.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-2 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide' : 'Compare'} all sellers ({product.sellers.length})
          </button>
        )}
      </div>

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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// mode: 'new_msrp' | 'lowest_box'
export default function BoxPriceTracker({ category, mode }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const isMsrpMode = mode === 'new_msrp';

  const fetchData = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('fetchBoxPrices', { category });
    if (res.data && !res.data.error) {
      setData(res.data);
    }
    setLoading(false);
  };

  // Auto-fetch when category or mode changes
  useEffect(() => {
    setData(null);
    fetchData();
  }, [category]);

  const header = isMsrpMode
    ? { icon: Tag, title: 'New Product MSRP', sub: 'Official retail prices for newest releases' }
    : { icon: Package, title: 'Lowest Box Prices', sub: 'Cheapest online prices across all retailers' };

  const Icon = header.icon;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-display font-bold text-foreground">{header.title}</h2>
            <p className="text-xs text-muted-foreground">{header.sub}</p>
          </div>
        </div>
        {!loading && data && (
          <button onClick={fetchData} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">
            {isMsrpMode ? 'Loading newest product releases…' : 'Scanning retailers for best prices…'}
          </p>
        </div>
      )}

      {data && !loading && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          {data.products?.length > 0 ? (
            data.products.map((product, i) =>
              isMsrpMode
                ? <MsrpCard key={i} product={product} />
                : <LowestPriceCard key={i} product={product} />
            )
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No data found for this category.</p>
          )}
          <p className="text-xs text-muted-foreground text-center pt-1">
            Updated {data.generated_at ? new Date(data.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'} · Verify prices before purchasing
          </p>
        </motion.div>
      )}
    </div>
  );
}