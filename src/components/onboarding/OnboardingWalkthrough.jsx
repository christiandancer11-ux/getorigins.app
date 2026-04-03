import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X, Crown } from 'lucide-react';

const WALKTHROUGH_STEPS = [
  {
    title: 'Welcome to Origins',
    description: 'Track your sports card collection, see what your cards are worth, and connect with other collectors.',
    icon: '🎴',
    isPremium: false,
  },
  {
    title: 'Build Your Collection',
    description: 'Register your cards with unique QR codes. Track ownership history, add video messages, and build your card\'s story over time.',
    icon: '📸',
    isPremium: false,
  },
  {
    title: 'Card Analytics',
    description: 'View scan counts, visitor metrics, and how often your cards are being discovered by the community.',
    icon: '📊',
    isPremium: false,
  },
  {
    title: 'Leaderboard',
    description: 'See top collectors ranked by engagement. Compete for visibility and build your reputation.',
    icon: '🏆',
    isPremium: false,
  },
  {
    title: 'Price Alerts (Free)',
    description: 'Get notified when specific cards drop below or rise above your target price on the market.',
    icon: '🔔',
    isPremium: false,
  },
  {
    title: 'Origins Pro Bundle',
    description: 'Unlock premium features: live market data, trending cards, card show deal tracking, and more.',
    icon: '👑',
    isPremium: true,
  },
  {
    title: 'Card Show Deals',
    description: '(Pro) Log and verify trades at card shows. Get market comparables instantly and track deal profitability.',
    icon: '🎪',
    isPremium: true,
  },
  {
    title: 'Trending & Market Data',
    description: '(Pro) See which cards are trending, market prices, and investment opportunities in real-time.',
    icon: '📈',
    isPremium: true,
  },
  {
    title: 'BOLO Alerts',
    description: '(Verified dealers only) Report stolen cards and get notified when thefts happen near you.',
    icon: '⚠️',
    isPremium: false,
  },
  {
    title: 'Ready to Start?',
    description: 'You\'re all set! Explore the app, register your first card, or upgrade to Pro for premium features.',
    icon: '🚀',
    isPremium: false,
  },
];

export default function OnboardingWalkthrough({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const step = WALKTHROUGH_STEPS[currentStep];
  const isLastStep = currentStep === WALKTHROUGH_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem('origins_onboarding_complete', 'true');
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border/50 rounded-2xl max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-border/30">
              <div>
                <div className="text-4xl mb-2">{step.icon}</div>
                <h2 className="font-display text-xl font-bold text-foreground">{step.title}</h2>
              </div>
              <button
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 min-h-32 flex flex-col">
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {step.description}
              </p>
              {step.isPremium && (
                <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Premium Feature</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-3 border-t border-border/30">
              <div className="flex gap-1 mb-3">
                {WALKTHROUGH_STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full flex-1 transition-all ${
                      i <= currentStep ? 'bg-primary' : 'bg-border'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Step {currentStep + 1} of {WALKTHROUGH_STEPS.length}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-6 border-t border-border/30">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              <Button variant="ghost" onClick={handleSkip} className="flex-1">
                Skip
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                {isLastStep ? 'Get Started' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}