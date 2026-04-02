import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';

const rankStyle = (rank) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-slate-300';
  if (rank === 3) return 'text-amber-600';
  return 'text-muted-foreground';
};

const RankIcon = ({ rank }) => {
  if (rank <= 3) return <Trophy className={`w-4 h-4 ${rankStyle(rank)}`} />;
  return <span className="text-sm font-mono text-muted-foreground w-4 text-center">{rank}</span>;
};

export default function LeaderboardTable({ rows, valueLabel, emptyMessage }) {
  if (rows.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">{emptyMessage}</div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <motion.div
          key={row.name}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`flex items-center gap-4 p-4 rounded-xl border ${
            i === 0
              ? 'bg-primary/10 border-primary/30'
              : 'bg-card border-border/50'
          }`}
        >
          <div className="flex items-center justify-center w-6 shrink-0">
            <RankIcon rank={i + 1} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{row.name}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-primary">{row.count}</p>
            <p className="text-xs text-muted-foreground">{valueLabel}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}