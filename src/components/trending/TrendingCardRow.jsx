import React from 'react';
import { TrendingUp, TrendingDown, Minus, Flame, Bell } from 'lucide-react';
import WatchlistButton from '@/components/trending/WatchlistButton';

const trendIcon = (trend) => {
  if (trend === 'up')   return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
};

const heatColor = (score) => {
  if (score >= 90) return 'text-red-400';
  if (score >= 75) return 'text-orange-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-muted-foreground';
};

export default function TrendingCardRow({ card, highlight, onClick, onSetAlert, userEmail }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 transition-colors ${highlight ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/30'}`}
    >
      {/* Rank */}
      <div className="w-8 text-center shrink-0">
        {card.rank <= 3 ? (
          <span className="text-lg">{card.rank === 1 ? '🥇' : card.rank === 2 ? '🥈' : '🥉'}</span>
        ) : (
          <span className="text-xs font-bold text-muted-foreground">#{card.rank}</span>
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-foreground truncate">{card.player_or_name}</p>
          {card.heat_score >= 90 && <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {[card.year, card.set_name, card.variant].filter(Boolean).join(' · ')}
        </p>
        <p className="text-xs text-muted-foreground/70 truncate mt-0.5 italic">{card.why_hot}</p>
      </div>

      {/* Watchlist + Alert buttons */}
      <div className="flex items-center gap-1 shrink-0">
        {userEmail && (
          <WatchlistButton card={card} userEmail={userEmail} />
        )}
        {onSetAlert && (
          <button
            onClick={(e) => { e.stopPropagation(); onSetAlert(card); }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Set Price Alert"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Value + trend */}
      <div className="text-right shrink-0 cursor-pointer" onClick={onClick}>
        <div className="flex items-center gap-1 justify-end">
          {trendIcon(card.trend)}
          <span className="text-sm font-bold text-foreground">
            ${card.estimated_value_avg?.toLocaleString() || '—'}
          </span>
        </div>
        {(card.estimated_value_low || card.estimated_value_high) && (
          <p className="text-xs text-muted-foreground">
            ${card.estimated_value_low || 0} – ${card.estimated_value_high || 0}
          </p>
        )}
        <div className={`text-xs font-semibold mt-0.5 ${heatColor(card.heat_score)}`}>
          {card.heat_score}° heat
        </div>
      </div>
    </div>
  );
}