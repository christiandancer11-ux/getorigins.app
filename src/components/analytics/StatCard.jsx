import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sub, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl bg-card border border-border/50 p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground font-display">{value}</p>
      <p className="text-sm text-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}