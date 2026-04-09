import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle } from 'lucide-react';

export default function SetProgressViz() {
  const exampleSets = [
    { name: '2023 Topps Chrome Football', collected: 185, total: 250, pct: 74 },
    { name: '2024 Prizm Basketball', collected: 42, total: 100, pct: 42 },
    { name: 'PSA 10 Graded Vintage', collected: 23, total: 50, pct: 46 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Visualize Your Progress</h3>
          <p className="text-sm text-muted-foreground">See exactly what you need to finish your sets.</p>
        </div>
      </div>

      <div className="space-y-5">
        {exampleSets.map((set, i) => (
          <div key={i} className="p-5 rounded-xl bg-card border border-border/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-foreground">{set.name}</p>
              <span className="text-xs font-bold text-primary">{set.pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary/30 overflow-hidden mb-2">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${set.pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {set.collected} / {set.total} cards <span className="text-primary font-semibold">{set.total - set.collected} left</span>
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-3">
        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Origins shows you gaps in your collection and suggests where to find missing cards to complete your sets.
        </p>
      </div>
    </motion.div>
  );
}