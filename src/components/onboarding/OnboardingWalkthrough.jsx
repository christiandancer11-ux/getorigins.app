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
    title: 'Register Cards with AI',
    description: 'Snap a photo of any card — front and back. Our AI instantly identifies it, fills in all details, and generates a unique QR code sticker. Works with graded slabs too.',
    icon: '📸',
    isPremium: false,
  },
  {
    title: 'Video Message Timeline',
    description: 'Leave a personal video message on your card — a story, memory, or greeting for the next owner. Every owner adds to the history as the card changes hands.',
    icon: '🎬',
    isPremium: false,
  },
  {
    title: 'Analytics & Leaderboard',
    description: 'Track how many times your cards are scanned, unique visitors, and engagement. Compete on the leaderboard and build your reputation as a top collector.',
    icon: '📊',
    isPremium: false,
  },
  {
    title: 'BOLO Alerts (Free)',
    description: 'Be on the Lookout — verified dealers and shop owners can report stolen cards. Get notified when thefts happen near you to protect the hobby.',
    icon: '⚠️',
    isPremium: false,
  },
  {
    title: 'Origins Pro — Market Value',
    description: '(Pro) Search any card and instantly pull live eBay sold listings, 130point.com comps, and community trade data. Or snap a photo with the AI Card Scanner to get a price on the spot.',
    icon: '💰',
    isPremium: true,
  },
  {
    title: 'Origins Pro — Card Show Trades',
    description: '(Pro) Log real in-person card show deals. AI verifies fair market value in seconds — so you always know if you\'re getting a good deal or leaving money on the table.',
    icon: '🎪',
    isPremium: true,
  },
  {
    title: 'Origins Pro — Trending Top 100',
    description: '(Pro) See which cards are hottest right now — Baseball, Basketball, Football, Pokémon, MTG, and more. Refreshed regularly with live market signals.',
    icon: '🔥',
    isPremium: true,
  },
  {
    title: 'Origins Pro — Price Alerts',
    description: '(Pro) Set buy-below or sell-above price targets on any card. Get email alerts the moment the market moves to your price.',
    icon: '🔔',
    isPremium: true,
  },
  {
    title: 'Origins Pro — Pro Card Flipper',
    description: '(Pro) NEW — AI scans PSA, BGS, SGC & CGC population reports to find cards with 80–95% odds of grading a perfect 10. Also spots BGS Black Label Pristine candidates — the rarest grade in the hobby.',
    icon: '⭐',
    isPremium: true,
  },
  {
    title: 'Ready to Start?',
    description: 'Register your first card, explore the market, or upgrade to Pro to unlock every feature. Everything starts with a single scan.',
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