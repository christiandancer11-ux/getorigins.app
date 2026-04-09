import React, { useState } from 'react';
import { Flame, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';

export default function TrendingLegend() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border/40 bg-secondary/20 mb-4 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
      >
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">How to read these cards</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-border/30 pt-3">
          {/* Buzz Score */}
          <div className="flex items-start gap-2.5">
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <Flame className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Buzz Score (0–100)</p>
              <p className="text-muted-foreground leading-relaxed">How hot this card is right now based on search volume, recent sales, and collector interest. 90+ = on fire.</p>
            </div>
          </div>

          {/* Price trend */}
          <div className="flex items-start gap-2.5">
            <div className="flex items-center gap-2 shrink-0 mt-0.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              <Minus className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Price Trend Arrow</p>
              <p className="text-muted-foreground leading-relaxed">Green ↑ = price rising · Red ↓ = price falling · Dash = holding steady.</p>
            </div>
          </div>

          {/* Market value */}
          <div className="flex items-start gap-2.5">
            <span className="text-sm font-bold text-foreground shrink-0 mt-0.5">$</span>
            <div>
              <p className="font-semibold text-foreground">Market Value</p>
              <p className="text-muted-foreground leading-relaxed">Average recent sold price on eBay and major platforms. The range below it shows low–high sold prices.</p>
            </div>
          </div>

          {/* Why hot */}
          <div className="flex items-start gap-2.5">
            <span className="text-sm italic text-muted-foreground shrink-0 mt-0.5">"</span>
            <div>
              <p className="font-semibold text-foreground">Why It's Trending</p>
              <p className="text-muted-foreground leading-relaxed">A short AI-generated reason explaining what's driving collector interest right now.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}