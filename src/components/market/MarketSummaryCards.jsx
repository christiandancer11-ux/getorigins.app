import React from 'react';
import { TrendingUp, ShoppingCart, Handshake, Award, Clock, Store } from 'lucide-react';

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
  const tcgVal = result.tcgplayer_market_price != null ? `$${result.tcgplayer_market_price.toFixed(2)}` : null;

  const ebayRange = result.ebay_low != null && result.ebay_high != null
    ? `$${result.ebay_low}–$${result.ebay_high}`
    : null;

  const hasTCG = tcgVal != null;

  return (
    <div className="space-y-3">
      {/* Main market data — eBay, 130point, Card Show */}
      <div className={`grid grid-cols-2 gap-3 ${hasTCG ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
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
        <StatBubble
          label="Card Show Comps"
          value={showTradesCount > 0 ? showTradesCount : '0'}
          sub={showTradesCount > 0 ? 'In-person Origins trades' : 'No trades logged yet'}
          icon={Handshake}
          accentClass="bg-primary/10 text-primary"
        />
        {hasTCG && (
          <StatBubble
            label="TCGPlayer Market"
            value={tcgVal}
            sub={result.tcgplayer_low != null ? `Low: $${result.tcgplayer_low.toFixed(2)}` : 'Verified dealers'}
            icon={Store}
            accentClass="bg-violet-400/10 text-violet-400"
          />
        )}
      </div>

      {/* PSA SMR — separate reference, only shown for PSA slabs */}
      {psaVal && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-400 font-semibold">PSA Price Guide (SMR)</p>
            <p className="text-sm text-muted-foreground">{result.psa_grade_used ? `Reference value for ${result.psa_grade_used}` : 'Reference only — not included in market averages'}</p>
          </div>
          <p className="text-xl font-bold text-amber-400 font-display shrink-0">{psaVal}</p>
        </div>
      )}
    </div>
  );
}