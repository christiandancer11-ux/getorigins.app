import React from 'react';
import { Info, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DataSourcesBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="p-5 rounded-xl bg-primary/5 border border-primary/20 flex gap-3"
    >
      <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">Transparent Market Data</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Powered by real-time eBay "Sold" listings, 130point.com comps, and TCGPlayer market prices—updated every 15 minutes.
        </p>
      </div>
    </motion.div>
  );
}