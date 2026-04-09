import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const RANK_STYLES = {
  1: { trophy: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', badge: '🥇' },
  2: { trophy: 'text-slate-300',  bg: 'bg-slate-300/10 border-slate-300/30',  badge: '🥈' },
  3: { trophy: 'text-amber-600',  bg: 'bg-amber-600/10 border-amber-600/30',  badge: '🥉' },
};

export default function CollectorRow({ collector, rank, valueLabel, index, formatValue }) {
  const style = RANK_STYLES[rank];
  const isTop3 = rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
        isTop3 ? style.bg : 'bg-card border-border/50 hover:border-border'
      }`}
    >
      {/* Rank */}
      <div className="w-8 flex items-center justify-center shrink-0">
        {isTop3
          ? <span className="text-xl">{style.badge}</span>
          : <span className="text-sm font-mono font-bold text-muted-foreground">{rank}</span>
        }
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted/40 border border-border/50 shrink-0">
        {collector.avatar_url
          ? <img src={collector.avatar_url} alt={collector.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/collector/${encodeURIComponent(collector.email)}`} className="font-semibold text-foreground truncate hover:text-primary transition-colors block">
          {collector.name}
        </Link>
        {collector.cardCount != null && (
          <p className="text-xs text-muted-foreground">{collector.cardCount} card{collector.cardCount !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <p className={`text-xl font-bold font-display ${isTop3 ? 'text-primary' : 'text-foreground'}`}>
          {formatValue ? formatValue(collector.score) : collector.score.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">{valueLabel}</p>
      </div>
    </motion.div>
  );
}