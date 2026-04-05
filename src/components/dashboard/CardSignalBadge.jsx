import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CONFIG = {
  buy: {
    label: 'BUY',
    icon: TrendingUp,
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  hold: {
    label: 'HOLD',
    icon: Minus,
    className: 'bg-amber-400/20 text-amber-400 border-amber-400/30',
  },
  sell: {
    label: 'SELL',
    icon: TrendingDown,
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

export default function CardSignalBadge({ signal, reason, size = 'sm' }) {
  if (!signal) return null;
  const cfg = CONFIG[signal];
  if (!cfg) return null;
  const Icon = cfg.icon;

  return (
    <div className="relative group/signal">
      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-bold ${cfg.className}`}>
        <Icon className="w-2.5 h-2.5" />
        {cfg.label}
      </div>
      {/* Tooltip */}
      {reason && (
        <div className="absolute bottom-full left-0 mb-1.5 w-48 p-2 rounded-lg bg-card border border-border/80 shadow-xl text-xs text-muted-foreground opacity-0 group-hover/signal:opacity-100 transition-opacity duration-200 pointer-events-none z-50 leading-snug">
          {reason}
        </div>
      )}
    </div>
  );
}