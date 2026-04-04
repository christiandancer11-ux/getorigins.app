import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Bump this version string whenever there are new updates to announce.
const CURRENT_VERSION = '3.0.0';
const STORAGE_KEY = 'origins_whats_new_seen';

const UPDATES = [
  {
    badge: '🆕 New',
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    title: 'Social Network & Collections Feed',
    desc: 'Follow collectors, view their collections, and see new cards they add in your personalized feed. Friends-only content — your collections are private unless you share.',
  },
  {
    badge: '🆕 New',
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    title: 'Reactions & Comments',
    desc: 'React with emojis (🔥💎⭐🤩👏) and leave comments on cards your friends add. Build community and engage with the collectors you follow.',
  },
  {
    badge: '🆕 New',
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    title: 'Notification Preferences',
    desc: 'Opt-in to get email notifications when friends add new cards, react to your cards, or comment on your collection.',
  },
  {
    badge: '✨ Improved',
    badgeColor: 'text-primary bg-primary/10 border-primary/20',
    title: 'Collector Profiles',
    desc: 'View full card collections, favorite categories, and verified collector badges on public profiles. Profile reactions show collector appreciation.',
  },
];

export default function WhatsNewBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== CURRENT_VERSION) {
      const timer = setTimeout(() => setVisible(true), 1000);
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-primary/30 rounded-2xl shadow-2xl shadow-primary/10 w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-primary/10 border-b border-primary/20">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">What's New in Origins</span>
              </div>
              <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Updates list */}
            <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {UPDATES.map((u, i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    <span className={`text-[11px] font-bold border rounded-full px-2 py-0.5 ${u.badgeColor}`}>{u.badge}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{u.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{u.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border/30 flex justify-end">
              <Button onClick={dismiss} className="bg-primary text-primary-foreground hover:bg-primary/90 px-6">
                Got it!
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}