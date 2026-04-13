import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCardPriceSummary } from '@/lib/db';
import { Search, TrendingUp } from 'lucide-react';

export default function MarketValue() {
  const [form, setForm] = useState({ card_name: '', set_name: '', year: '', card_number: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResults(null);
    setError(null);

    const { data, error } = await getCardPriceSummary(form);
    setLoading(false);

    if (error) {
      setError('Unable to fetch market comps. Please try again.');
      return;
    }

    setResults(data);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Market Value</h1>
              <p className="text-sm text-muted-foreground">Search recent logged trades to estimate value from Supabase-backed comps.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSearch} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Card Name / Player</label>
            <Input
              value={form.card_name}
              onChange={(e) => setField('card_name', e.target.value)}
              placeholder="e.g. Mike Trout"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Set Name</label>
            <Input
              value={form.set_name}
              onChange={(e) => setField('set_name', e.target.value)}
              placeholder="e.g. Topps Chrome"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Year</label>
            <Input
              value={form.year}
              onChange={(e) => setField('year', e.target.value)}
              placeholder="e.g. 2021"
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Card #</label>
            <Input
              value={form.card_number}
              onChange={(e) => setField('card_number', e.target.value)}
              placeholder="e.g. /150"
              className="bg-secondary border-border"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading ? 'Searching...' : 'Search Supabase Trades'}
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>

        <div className="mt-8 space-y-4">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {results ? (
            <div className="rounded-3xl border border-border/50 bg-secondary/30 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Results</p>
                  <h2 className="text-xl font-semibold text-foreground">{results.market_summary || 'Recent trade comps'}</h2>
                </div>
                {results.average_price != null && (
                  <div className="rounded-2xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                    Avg: ${results.average_price.toFixed(2)}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3 text-sm text-muted-foreground">
                <div className="rounded-2xl bg-background/80 p-4 border border-border/50">
                  <p className="font-semibold text-foreground">Low</p>
                  <p>{results.min_price != null ? `$${results.min_price.toFixed(2)}` : '—'}</p>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 border border-border/50">
                  <p className="font-semibold text-foreground">High</p>
                  <p>{results.max_price != null ? `$${results.max_price.toFixed(2)}` : '—'}</p>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 border border-border/50">
                  <p className="font-semibold text-foreground">Sales</p>
                  <p>{results.recent_sales?.length ?? 0}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 text-sm text-muted-foreground mt-4">
                <div className="rounded-2xl bg-background/80 p-4 border border-border/50">
                  <p className="font-semibold text-foreground">Median</p>
                  <p>{results.median_price != null ? `$${results.median_price.toFixed(2)}` : '—'}</p>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 border border-border/50">
                  <p className="font-semibold text-foreground">7d Trend</p>
                  <p>{results.trend_7d_pct != null ? `${results.trend_7d_pct >= 0 ? '+' : ''}${results.trend_7d_pct.toFixed(1)}%` : '—'}</p>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 border border-border/50">
                  <p className="font-semibold text-foreground">30d Trend</p>
                  <p>{results.trend_30d_pct != null ? `${results.trend_30d_pct >= 0 ? '+' : ''}${results.trend_30d_pct.toFixed(1)}%` : '—'}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-background/80 p-4 border border-border/50 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Price Volatility</p>
                  <p>{results.volatility_pct != null ? `${results.volatility_pct.toFixed(1)}%` : '—'}</p>
                </div>
                <div className="rounded-2xl bg-background/80 p-4 border border-border/50 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">Confidence</p>
                  <p>{results.confidence_score != null ? `${results.confidence_score}%` : '—'}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-background/80 border border-border/50 p-4">
                <p className="text-sm font-semibold text-foreground">Estimated next sale range</p>
                <p className="mt-1 text-base text-foreground">
                  {results.estimated_next_low != null && results.estimated_next_high != null
                    ? `$${results.estimated_next_low.toFixed(0)} - $${results.estimated_next_high.toFixed(0)}`
                    : 'Not enough data to estimate range'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {results.sample_size != null ? `Based on ${results.sample_size} Supabase trades` : 'Based on available trade comps'}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {results.recent_sales && results.recent_sales.length > 0 ? (
                  results.recent_sales.slice(0, 8).map((trade) => (
                    <div key={trade.id} className="rounded-2xl border border-border/50 bg-background/80 p-4">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <p className="font-semibold text-foreground">{trade.card_name || 'Unknown card'}</p>
                        <p className="font-semibold text-primary">${(trade.total_value || trade.price || 0).toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{trade.set_name || trade.brand || ''} • {trade.year || ''} {trade.card_number ? `• ${trade.card_number}` : ''}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-border/50 bg-background/80 p-4 text-sm text-muted-foreground">
                    No recent trade comps found for the entered criteria.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-border/50 bg-secondary/30 p-6 text-sm text-muted-foreground">
              Enter card details above and click search to use Supabase trade comps as a pricing fallback.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
