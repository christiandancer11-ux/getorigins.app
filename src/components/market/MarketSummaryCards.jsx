import React from 'react';
import { TrendingUp, ShoppingCart, Handshake, BarChart2 } from 'lucide-react';

function StatBubble({ label, value, sub, icon: Icon, accentClass }) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 flex flex-col gap-1">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 ${accentClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold font-display text-foreground">{value ?? '—'}</p>
      <p className="text-xs font-medium text-foreground">{label}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function MarketSummaryCards({ result, showTradesCount }) {
  const ebayAvg = result.ebay_avg != null ? `$${result.ebay_avg.toFixed(0)}` : null;
  const ptAvg = result.point130_avg != null ? `$${result.point130_avg.toFixed(0)}` : null;

  // Overall average across both platforms
  const vals = [result.ebay_avg, result.point130_avg].filter(v => v != null);
  const overallAvg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(0) : null;

  const ebayRange = result.ebay_low != null && result.ebay_high != null
    ? `$${result.ebay_low}–$${result.ebay_high}`
    : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatBubble
        label="Overall Avg"
        value={overallAvg ? `$${overallAvg}` : '—'}
        sub="Across all sources"
        icon={BarChart2}
        accentClass="bg-primary/10 text-primary"
      />
      <StatBubble
        label="eBay Avg"
        value={ebayAvg || '—'}
        sub={ebayRange || (result.ebay_sales_count ? `${result.ebay_sales_count} sales` : 'No data')}
        icon={ShoppingCart}
        accentClass="bg-blue-400/10 text-blue-400"
      />
      <StatBubble
        label="130point Avg"
        value={ptAvg || '—'}
        sub={result.point130_low != null && result.point130_high != null ? `$${result.point130_low}–$${result.point130_high}` : 'No data'}
        icon={TrendingUp}
        accentClass="bg-emerald-400/10 text-emerald-400"
      />
      <StatBubble
        label="Card Show Comps"
        value={showTradesCount > 0 ? showTradesCount : '0'}
        sub={showTradesCount > 0 ? 'In-person trades' : 'No trades logged yet'}
        icon={Handshake}
        accentClass="bg-amber-400/10 text-amber-400"
      />
    </div>
  );
}