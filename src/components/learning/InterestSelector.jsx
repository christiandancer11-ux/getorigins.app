import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'sports_cards', label: 'Sports Cards', icon: '⚾', desc: 'Baseball, Basketball, Football, Hockey, Soccer, Golf, UFC, WWE' },
  { id: 'tcg', label: 'Trading Card Games', icon: '🎮', desc: 'Pokémon, Magic, Yu-Gi-Oh!, One Piece, Lorcana' },
  { id: 'both', label: 'Both Sports & TCG', icon: '🎯', desc: 'Learn about all card types' }
];

const USE_CASES = [
  { id: 'collecting', label: 'Just Collecting', desc: 'Build a collection for enjoyment' },
  { id: 'collecting_selling', label: 'Collecting & Selling', desc: 'Collect and occasionally sell cards' },
  { id: 'flipping', label: 'Flipping Cards', desc: 'Buy low, sell high for profit' },
  { id: 'business', label: 'Build a Business', desc: 'Start a card dealing/flipping business' },
];

export default function InterestSelector({ onSelect }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState(null);
  const [useCase, setUseCase] = useState(null);

  const handleSubmit = () => {
    if (category && useCase) {
      onSelect({ category, useCase });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl rounded-2xl bg-card border border-border/50 p-8"
      >
        {/* Step 1: Select Category */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Welcome to the Learning Center</h2>
            </div>
            <p className="text-muted-foreground">What type of cards interest you?</p>

            <div className="space-y-3">
              {CATEGORIES.map(cat => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setCategory(cat.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    category === cat.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 bg-card hover:border-border'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{cat.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{cat.desc}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                onClick={() => setStep(2)}
                disabled={!category}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Use Case */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">What's Your Goal?</h2>
              <p className="text-muted-foreground">We'll customize your learning based on your goals</p>
            </div>

            <div className="space-y-3">
              {USE_CASES.map(uc => (
                <motion.button
                  key={uc.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => setUseCase(uc.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    useCase === uc.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 bg-card hover:border-border'
                  }`}
                >
                  <p className="font-semibold text-foreground">{uc.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{uc.desc}</p>
                </motion.button>
              ))}
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 border-border/50"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!useCase}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                Start Learning <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}