import React from 'react';
import { Button } from '@/components/ui/button';
import { TrendingUp, Loader2, RefreshCw, AlertCircle, ChevronDown, ChevronUp, Clock, Zap } from 'lucide-react';

export default function FlipOpportunitiesList() {
  // TODO: Migrate flip opportunities to Supabase
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-bold text-foreground">Flip Opportunities</h3>
        </div>
        <Button variant="outline" size="sm" disabled>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="text-center py-8">
        <p className="text-muted-foreground">Flip opportunities are temporarily unavailable during migration.</p>
      </div>
    </div>
  );
}
  const [expanded, setExpanded] = useState(false);
  const gainPct = card.potential_gain_pct ? Math.round(card.potential_gain_pct) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left px-4 py-4 flex items-center gap-3"
      >
        {/* Rank */}
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary">#{card.rank}</span>
        </div>

        {/* Card info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm">{SPORT_EMOJI[card.sport_or_tcg] || '🃏'}</span>
            <p className="text-sm font-semibold text-foreground truncate">{card.card_name}</p>
          </div>
          <p className="text-xs text-muted-foreground truncate">{[card.year, card.set_name].filter(Boolean).join(' · ')}</p>
        </div>

        {/* Gain badge */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {gainPct != null && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
              +{gainPct}%
            </span>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
              {/* Price row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Buy Around</p>
                  <p className="text-sm font-bold text-foreground">${card.current_buy_price?.toLocaleString() ?? '—'}</p>
                </div>
                <div className="rounded-lg bg-emerald-400/5 border border-emerald-400/20 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Sell Target</p>
                  <p className="text-sm font-bold text-emerald-400">${card.target_sell_price?.toLocaleString() ?? '—'}</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Gain</p>
                  <p className="text-sm font-bold text-primary">+{gainPct ?? '?'}%</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {card.risk_level && (
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RISK_COLORS[card.risk_level] || RISK_COLORS.medium}`}>
                    {card.risk_level} risk
                  </span>
                )}
                {card.time_horizon && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground">
                    <Clock className="w-3 h-3" />{HORIZON_LABEL[card.time_horizon] || card.time_horizon}
                  </span>
                )}
              </div>

              {card.buy_reason && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Why It's Undervalued</p>
                  <p className="text-sm text-foreground leading-relaxed">{card.buy_reason}</p>
                </div>
              )}
              {card.sell_catalyst && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1"><Zap className="w-3 h-3 text-primary" />Sell Catalyst</p>
                  <p className="text-sm text-foreground leading-relaxed">{card.sell_catalyst}</p>
                </div>
              )}
              {card.data_source && (
                <p className="text-xs text-muted-foreground">Source: {card.data_source}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FlipOpportunitiesList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke('getFlipOpportunities', {});
    if (res.data?.error) setError(res.data.error);
    else setData(res.data);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Description */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
        <p className="text-sm text-foreground/90 leading-relaxed">
          <span className="font-semibold text-primary">AI scans eBay, 130point, PSA/BGS price guides, and Origins community trades</span> to find the top 10 cards currently trading below market value with strong upside catalysts.
        </p>
      </div>

      {/* Load button */}
      {!data && !loading && (
        <Button onClick={fetchData} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <TrendingUp className="w-4 h-4" />Find Top 10 Flip Opportunities
        </Button>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground mb-1">Analyzing flip opportunities...</p>
            <p className="text-sm text-muted-foreground">Cross-referencing eBay, 130point, price guides & Origins trades</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Top 10 Flip Opportunities</h2>
              <p className="text-xs text-muted-foreground">
                Updated {data.generated_at ? new Date(data.generated_at).toLocaleString() : '—'}
              </p>
            </div>
            <button onClick={fetchData} className="text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {data.summary && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3 flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/90">{data.summary}</p>
            </div>
          )}

          <div className="space-y-3">
            {(data.opportunities || []).map((card, i) => (
              <FlipCard key={i} card={card} index={i} />
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Data sourced from eBay, 130point.com, PSA/BGS price guides, and Origins community trades. Not financial advice.
          </p>
        </div>
      )}
    </div>
  );
}