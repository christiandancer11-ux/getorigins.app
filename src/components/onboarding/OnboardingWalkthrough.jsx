import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X, Crown } from 'lucide-react';

const WALKTHROUGH_STEPS = [
  {
    title: 'Welcome to Origins',
    description: 'The ultimate platform for card collectors — register your cards, track their story, discover market values, and connect with the community.',
    icon: '🎴',
    isPremium: false,
  },
  {
    title: 'AI Card Scanner',
    description: 'Snap a photo — AI identifies the card, auto-fills details, and generates a unique QR code sticker for the back. Works with graded slabs too.',
    icon: '📸',
    isPremium: false,
  },
  {
    title: 'Video Messages',
    description: 'Record personal messages and videos that travel with the card from owner to owner. Build a living history.',
    icon: '🎬',
    isPremium: false,
  },
  {
    title: 'Social Network',
    description: 'Follow collectors, discover their collections, and see new cards in your personalized feed. React and comment to engage.',
    icon: '👥',
    isPremium: false,
  },
  {
    title: 'Analytics Dashboard',
    description: 'Track scans, visitor engagement, and performance metrics across your collection. See your ranking on the leaderboard.',
    icon: '📊',
    isPremium: false,
  },
  {
    title: 'BOLO Stolen Card Alerts',
    description: 'Get notified of stolen cards reported by verified dealers near your location. Help protect the hobby.',
    icon: '⚠️',
    isPremium: false,
  },
  {
    title: 'Origins Pro — Market Value',
    description: 'Real-time eBay sold prices, 130point comps, and community trade data. Get accurate valuations on the spot.',
    icon: '💰',
    isPremium: true,
  },
  {
    title: 'Origins Pro — Card Show Trades',
    description: 'Log real in-person deals with AI-verified fair market values. Never overpay at a show again.',
    icon: '🎪',
    isPremium: true,
  },
  {
    title: 'Origins Pro — Trending Top 100',
    description: 'See the hottest cards trending now across Baseball, Basketball, Football, Pokémon, MTG, and more.',
    icon: '🔥',
    isPremium: true,
  },
  {
    title: 'Origins Pro — Price Alerts',
    description: 'Set buy-below or sell-above targets and get email alerts when the market hits your price.',
    icon: '🔔',
    isPremium: true,
  },
  {
    title: 'Origins Pro — Pro Card Flipper',
    description: 'Find PSA/BGS/SGC/CGC cards with 80–95% odds of a perfect 10. Spot BGS Black Label Pristine candidates.',
    icon: '⭐',
    isPremium: true,
  },
  {
    title: 'Ready to Start?',
    description: 'Register your first card and explore the community. Upgrade to Origins Pro to unlock every advanced feature.',
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
    if (currentStep > 0) setCurrentStep(currentStep - 1);
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
              <button onClick={handleSkip} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 min-h-32 flex flex-col">
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{step.description}</p>
              {step.isPremium && (
                <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Crown className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Origins Pro Feature — $14.99/mo</span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-3 border-t border-border/30">
              <div className="flex gap-1 mb-3">
                {WALKTHROUGH_STEPS.map((_, i) => (
                  <motion.div
                    key={i}
                    className={`h-1.5 rounded-full flex-1 transition-all ${i <= currentStep ? 'bg-primary' : 'bg-border'}`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center">Step {currentStep + 1} of {WALKTHROUGH_STEPS.length}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 p-6 border-t border-border/30">
              <Button variant="outline" onClick={handlePrev} disabled={currentStep === 0} className="gap-2">
                <ChevronLeft className="w-4 h-4" />Back
              </Button>
              <Button variant="ghost" onClick={handleSkip} className="flex-1">Skip</Button>
              <Button onClick={handleNext} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
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