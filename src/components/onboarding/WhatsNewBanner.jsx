import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

const CURRENT_VERSION = '4.0.0';
const STORAGE_KEY = 'origins_whats_new_seen';

export default function WhatsNewBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (seen !== CURRENT_VERSION) {
      const timer = setTimeout(() => setVisible(true), 1500);
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
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-sm"
        >
          <div className="bg-card border border-primary/30 rounded-xl shadow-lg shadow-primary/10 px-4 py-3 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground">New: AI Buy/Hold/Sell Signals</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                Every card now shows an AI market signal. Check your dashboard to see them in action.
              </p>
            </div>
            <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}