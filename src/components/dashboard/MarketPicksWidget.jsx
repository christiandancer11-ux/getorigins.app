import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, Minus, Zap, Lock, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SportBadge from '@/components/shared/SportBadge';
import { formatDistanceToNow } from 'date-fns';

const PICK_CONFIG = {
  buy:  { label: 'BUY',  icon: TrendingUp,   bg: 'bg-green-500/10 border-green-500/25', badge: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-400' },
  hold: { label: 'HOLD', icon: Minus,         bg: 'bg-amber-400/10 border-amber-400/25', badge: 'bg-amber-400/20 text-amber-400 border-amber-400/30', dot: 'bg-amber-400' },
  sell: { label: 'SELL', icon: TrendingDown,  bg: 'bg-red-500/10 border-red-500/25',     badge: 'bg-red-500/20 text-red-400 border-red-500/30',     dot: 'bg-red-400' },
};

function PickCard({ pick }) {
  const cfg = PICK_CONFIG[pick.pick_type];
  const Icon = cfg.icon;
  const upside = pick.price_target && pick.estimated_price
    ? (((pick.price_target - pick.estimated_price) / pick.estimated_price) * 100).toFixed(0)
    : null;

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} flex flex-col gap-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold ${cfg.badge}`}>
          <Icon className="w-3.5 h-3.5" />
          {cfg.label}
        </div>
        {pick.confidence && (
          <span className="text-[10px] text-muted-foreground capitalize">{pick.confidence} confidence</span>
        )}
      </div>

      <div>
        <p className="font-semibold text-foreground text-sm leading-tight">{pick.card_name}</p>
        <p className="text-xs text-muted-foreground">{[pick.year, pick.set_name].filter(Boolean).join(' · ')}</p>
        {pick.variant && <p className="text-xs text-muted-foreground">{pick.variant}</p>}
      </div>

      <div className="flex items-center gap-3">
        {pick.sport && <SportBadge sport={pick.sport} />}
        {pick.estimated_price > 0 && (
          <span className="text-xs font-medium text-foreground">${pick.estimated_price.toLocaleString()}</span>
        )}
        {upside !== null && pick.pick_type !== 'hold' && (
          <span className={`text-xs font-bold ${pick.pick_type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
            {pick.pick_type === 'buy' ? '▲' : '▼'} {Math.abs(upside)}% target
          </span>
        )}
      </div>

      {pick.reasoning && (
        <p className="text-xs text-muted-foreground leading-snug border-t border-border/30 pt-2">{pick.reasoning}</p>
      )}
    </div>
  );
}

export default function MarketPicksWidget({ isPro }) {
  const { data: picks = [], isLoading, dataUpdatedAt } = useQuery({
    queryKey: ['market-picks'],
    queryFn: () => base44.entities.MarketPick.list(),
    staleTime: 10 * 60 * 1000,
  });

  const buyPick  = picks.find(p => p.pick_type === 'buy');
  const holdPick = picks.find(p => p.pick_type === 'hold');
  const sellPick = picks.find(p => p.pick_type === 'sell');

  const generatedAt = buyPick?.generated_at ? new Date(buyPick.generated_at) : null;

  return (
    <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="font-semibold text-foreground text-sm">AI Market Picks</span>
          <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-1.5 py-0.5">PRO</span>
        </div>
        {generatedAt && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            Updated {formatDistanceToNow(generatedAt, { addSuffix: true })}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="grid sm:grid-cols-3 gap-3">
            {[0,1,2].map(i => (
              <div key={i} className="rounded-xl border border-border/40 p-4 animate-pulse bg-muted/10 h-36" />
            ))}
          </div>
        ) : picks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Picks are being generated — check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            {buyPick  && <PickCard pick={buyPick} />}
            {holdPick && <PickCard pick={holdPick} />}
            {sellPick && <PickCard pick={sellPick} />}
          </div>
        )}

        {!isPro && (
          <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              🔒 Pro subscribers get picks updated 6× daily with deeper AI analysis.
            </p>
            <Link to="/pricing">
              <Button size="sm" variant="outline" className="shrink-0 text-xs border-primary/30 text-primary hover:bg-primary/10">
                Upgrade
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}