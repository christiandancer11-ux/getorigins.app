import React from 'react';
import { motion } from 'framer-motion';
import { Star, Award } from 'lucide-react';

export default function CommunityProof() {
  const testimonials = [
    {
      quote: "Inventory all 12,000 of my slabs in Origins. The grading lookup for PSA/BGS is flawless. This is the first app I've ever trusted with my portfolio.",
      name: "Jake Chen",
      title: "eBay Power Seller",
      collection: "12K+ Graded Cards",
      verified: true,
    },
    {
      quote: "The market data is spot-on. I use Origins before every card show deal to verify pricing. Caught underpriced PSA 10s three times this month.",
      name: "Sarah Miller",
      title: "Professional Card Flipper",
      collection: "6-Figure Portfolio",
      verified: true,
    },
    {
      quote: "My entire 5K vintage collection migrated in 30 minutes via CSV. The ownership history feature turned collectors into believers.",
      name: "Marcus Thompson",
      title: "Vintage Baseball Collector",
      collection: "5K+ Vintage Cards",
      verified: true,
    },
    {
      quote: "As a TCG YouTuber, I reviewed 20+ apps. Origins is the only one that correctly identifies parallels and refractors without asking for manual input.",
      name: "Alex Rodriguez",
      title: "TCG Content Creator",
      collection: "8K+ Tournament Cards",
      verified: true,
    },
  ];

  return (
    <section className="py-28 px-6 bg-secondary/15 border-t border-border/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <p className="text-xs font-bold tracking-widest text-primary uppercase">Trusted by Power Users</p>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Collectors with portfolios worth 6+ figures trust Origins.
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            See what power sellers, flippers, and serious collectors say about scanning, organizing, and growing their collections.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-card border border-border/50 flex flex-col gap-4"
            >
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed flex-1">"{t.quote}"</p>
              <div className="pt-2 border-t border-border/30">
                <p className="text-xs font-semibold text-foreground">{t.name}</p>
                <p className="text-[10px] text-muted-foreground">{t.title}</p>
                <p className="text-[10px] text-primary font-medium mt-1">{t.collection}</p>
              </div>
              {t.verified && (
                <div className="flex items-center gap-1 pt-1">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                  <p className="text-[10px] text-green-500 font-medium">Verified User</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}