import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Database } from 'lucide-react';

export default function DataTransparency() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="p-8 rounded-2xl bg-card border border-border/50"
    >
      <h3 className="text-lg font-bold text-foreground mb-6">Transparent Market Data</h3>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Data Sources</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              eBay Sold Listings, TCGPlayer Market Price, Heritage Auctions, Cardmarket, and 130point.com verified comps.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Update Frequency</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Market prices refresh every 15 minutes. Population reports update daily.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Professional Grade</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The same comps used by professional dealers, flippers, and investors.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}