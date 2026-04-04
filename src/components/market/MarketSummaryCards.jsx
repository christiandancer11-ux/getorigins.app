import React from 'react';
import { TrendingUp, ShoppingCart, Handshake, Award, Clock } from 'lucide-react';

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
  const ebayAvg24h = result.ebay_avg_24h != null ? `$${result.ebay_avg_24h.toFixed(0)}` : null;
  const ebayAvg = result.ebay_avg != null ? `$${result.ebay_avg.toFixed(0)}` : null;
  const ptAvg = result.point130_avg != null ? `$${result.point130_avg.toFixed(0)}` : null;
  const psaVal = result.psa_value != null ? `$${result.psa_value.toFixed(0)}` : null;

  const ebayRange = result.ebay_low != null && result.ebay_high != null
    ? `$${result.ebay_low}–$${result.ebay_high}`
    : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatBubble
          label="PSA Value"
          value={psaVal || '—'}
          sub={result.psa_grade_used ? `PSA Price Guide · ${result.psa_grade_used}` : 'PSA SMR'}
          icon={Award}
          accentClass="bg-amber-400/10 text-amber-400"
        />
        <StatBubble
          label="eBay Avg (24h)"
          value={ebayAvg24h || (ebayAvg || '—')}
          sub={ebayAvg24h ? 'Last 24 hours' : (ebayRange || (result.ebay_sales_count ? `${result.ebay_sales_count} sales` : 'No data'))}
          icon={Clock}
          accentClass="bg-blue-400/10 text-blue-400"
        />
        <StatBubble
          label="130point Avg"
          value={ptAvg || '—'}
          sub={result.point130_low != null && result.point130_high != null ? `$${result.point130_low}–$${result.point130_high}` : 'Verified sales'}
          icon={TrendingUp}
          accentClass="bg-emerald-400/10 text-emerald-400"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
        <StatBubble
          label="Card Show Comps"
          value={showTradesCount > 0 ? showTradesCount : '0'}
          sub={showTradesCount > 0 ? 'In-person Origins trades' : 'No trades logged yet'}
          icon={Handshake}
          accentClass="bg-primary/10 text-primary"
        />
      </div>
    </div>
  );
}