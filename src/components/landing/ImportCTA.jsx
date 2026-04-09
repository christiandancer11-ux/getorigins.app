import React from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImportCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="p-8 rounded-2xl bg-card border border-border/50"
    >
      <div className="flex gap-6 items-start sm:items-center flex-col sm:flex-row">
        <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-2">Moving from another app?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Already have a spreadsheet or collection in TCGPlayer, Dex, or PriceCharting? Import your CSV in seconds — no manual re-entry needed.
          </p>
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
        </div>
      </div>
    </motion.div>
  );
}