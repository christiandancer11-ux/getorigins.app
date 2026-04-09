import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Scan, TrendingUp, QrCode, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    icon: Scan,
    emoji: '📸',
    title: 'Scan your first card',
    description: 'Take a photo and AI instantly identifies the card, fills in all the details, and generates a QR code that travels with it forever.',
    cta: null,
  },
  {
    icon: QrCode,
    emoji: '🔗',
    title: 'Your card gets a permanent identity',
    description: 'Print the QR sticker, attach it to the card sleeve or slab. Every scan shows the card\'s full history — owners, value, and story.',
    cta: null,
  },
  {
    icon: TrendingUp,
    emoji: '📈',
    title: 'Track value & market signals',
    description: 'Get AI Buy/Hold/Sell signals on every card. Upgrade to Pro for live eBay comps, trending cards, price alerts, and more.',
    cta: { label: 'Register your first card', to: '/' },
  },
];

export default function OnboardingWalkthrough({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleClose = () => {
    localStorage.setItem('origins_onboarding_complete', 'true');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            key={step}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border/50 rounded-2xl w-full max-w-sm shadow-2xl p-7"
          >
            {/* Close */}
            <div className="flex justify-end mb-4">
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">{current.emoji}</div>
              <h2 className="font-display text-xl font-bold text-foreground mb-3">{current.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`}
                />
              ))}
            </div>

            {/* Actions */}
            {isLast && current.cta ? (
              <div className="space-y-2">
                <Link to={current.cta.to} onClick={handleClose} className="block">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                    {current.cta.label} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleClose} className="w-full text-muted-foreground">
                  I'll explore on my own
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setStep(step + 1)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}