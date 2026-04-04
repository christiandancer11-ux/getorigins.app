import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Bump this version string whenever there are new updates to announce.
const CURRENT_VERSION = '2.1.0';
const STORAGE_KEY = 'origins_whats_new_seen';

const UPDATES = [
  {
    badge: '🆕 New',
    title: 'Pro Card Flipper — BGS Black Label',
    desc: 'AI now scans Beckett population reports to find cards with the best real-world odds of earning a BGS Black Label Pristine 10 — the rarest grade in the hobby.',
  },
  {
    badge: '🆕 New',
    title: 'Pro Card Flipper — Multi-Grader Analysis',
    desc: 'PSA, BGS, SGC & CGC population reports all analyzed in parallel. Find 80–95% grade-10 rate cards across all four major graders.',
  },
  {
    badge: '✨ Improved',
    title: 'AI Card Scanner',
    desc: 'Faster identification, better graded slab detection, and improved registry lookups for PSA and BGS certified cards.',
  },
  {
    badge: '✨ Improved',
    title: 'Market Value',
    desc: 'Live eBay + 130point comps now include broader search coverage and more accurate sold-price filtering.',
  },
];

export default function WhatsNewBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== CURRENT_VERSION) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, CURRENT_VERSION);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm"
        >
          <div className="bg-card border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border-b border-primary/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">What's New in Origins</span>
              </div>
              <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Top update always visible */}
            <div className="px-4 py-3">
              <div className="flex items-start gap-2 mb-1">
                <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2 py-0.5 shrink-0">{UPDATES[0].badge}</span>
              </div>
              <p className="text-sm font-semibold text-foreground">{UPDATES[0].title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{UPDATES[0].desc}</p>
            </div>

            {/* Expandable rest */}
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-2 space-y-3 border-t border-border/30 pt-3">
                    {UPDATES.slice(1).map((u, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-bold text-primary/80 bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5 shrink-0">{u.badge}</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{u.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{u.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/30">
              <button
                onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? 'Show less' : `+${UPDATES.length - 1} more updates`}
                <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
              </button>
              <Button size="sm" onClick={dismiss} className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-4">
                Got it
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}