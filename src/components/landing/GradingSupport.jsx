import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Shield } from 'lucide-react';

export default function GradingSupport() {
  const gradingCompanies = [
    { name: 'PSA', logo: '🏆' },
    { name: 'BGS / Beckett', logo: '🎖️' },
    { name: 'SGC', logo: '⭐' },
    { name: 'CGC', logo: '🔐' },
    { name: 'HGA', logo: '💎' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="p-8 rounded-2xl bg-primary/5 border border-primary/20"
    >
      <div className="flex items-start gap-4 mb-6">
        <Shield className="w-6 h-6 text-primary shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Full Grading Support</h3>
          <p className="text-sm text-muted-foreground">
            Instant lookup for graded slabs from all major grading companies. Raw or graded—Origins handles both with complete accuracy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {gradingCompanies.map(company => (
          <div key={company.name} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border border-border/50">
            <span className="text-2xl">{company.logo}</span>
            <p className="text-xs font-semibold text-foreground text-center">{company.name}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {[
          'Automatic PSA/BGS certification number lookup',
          'Population reports synced in real-time',
          'Grade-specific market pricing (PSA 10 vs PSA 9 vs Raw)',
        ].map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">{feature}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}