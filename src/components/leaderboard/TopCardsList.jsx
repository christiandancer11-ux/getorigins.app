import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, CreditCard } from 'lucide-react';

const rankStyle = (rank) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-slate-300';
  if (rank === 3) return 'text-amber-600';
  return 'text-muted-foreground';
};

export default function TopCardsList({ cards, valueKey, valueLabel, emptyMessage }) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">{emptyMessage}</div>
    );
  }

  return (
    <div className="space-y-2">
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Link
            to={`/cards/${card.id}`}
            className={`flex items-center gap-4 p-4 rounded-xl border hover:border-primary/30 transition-colors ${
              i === 0
                ? 'bg-primary/10 border-primary/30'
                : 'bg-card border-border/50'
            }`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-6 shrink-0">
              {i < 3 ? (
                <Trophy className={`w-4 h-4 ${rankStyle(i + 1)}`} />
              ) : (
                <span className="text-sm font-mono text-muted-foreground">{i + 1}</span>
              )}
            </div>

            {/* Card image or placeholder */}
            {card.image_url ? (
              <img src={card.image_url} alt={card.name} className="w-10 h-14 object-cover rounded-md shrink-0" />
            ) : (
              <div className="w-10 h-14 rounded-md bg-secondary border border-border/50 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{card.name}</p>
              {card.set_name && (
                <p className="text-xs text-muted-foreground truncate">{card.set_name}{card.year ? ` · ${card.year}` : ''}</p>
              )}
            </div>

            {/* Count */}
            <div className="text-right shrink-0">
              <p className="font-bold text-primary">{card[valueKey] || 0}</p>
              <p className="text-xs text-muted-foreground">{valueLabel}</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}