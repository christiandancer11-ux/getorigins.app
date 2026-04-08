import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';

const SPORTS_CARDS = [
  { id: 'baseball', label: 'Baseball', icon: '⚾' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'football', label: 'Football', icon: '🏈' },
  { id: 'hockey', label: 'Hockey', icon: '🏒' },
  { id: 'soccer', label: 'Soccer', icon: '⚽' },
  { id: 'golf', label: 'Golf', icon: '⛳' },
  { id: 'ufc', label: 'UFC', icon: '🥊' },
  { id: 'wwe', label: 'WWE', icon: '🎭' },
];

const TCG_CARDS = [
  { id: 'pokemon', label: 'Pokémon', icon: '🔴' },
  { id: 'magic_the_gathering', label: 'Magic: The Gathering', icon: '✨' },
  { id: 'yugioh', label: 'Yu-Gi-Oh!', icon: '⚡' },
  { id: 'one_piece', label: 'One Piece', icon: '🏴‍☠️' },
  { id: 'lorcana', label: 'Disney Lorcana', icon: '👑' },
];

const USE_CASES = [
  { id: 'collecting', label: 'Just Collecting', desc: 'Build a collection for enjoyment' },
  { id: 'collecting_selling', label: 'Collecting & Selling', desc: 'Collect and occasionally sell cards' },
  { id: 'flipping', label: 'Flipping Cards', desc: 'Buy low, sell high for profit' },
  { id: 'business', label: 'Build a Business', desc: 'Start a card dealing/flipping business' },
];

export default function InterestSelector({ onSelect }) {
  const [step, setStep] = useState(1);
  const [cardInterests, setCardInterests] = useState([]);
  const [useCase, setUseCase] = useState(null);

  const toggleCardInterest = (id) => {
    if (cardInterests.includes(id)) {
      setCardInterests(cardInterests.filter(c => c !== id));
    } else {
      setCardInterests([...cardInterests, id]);
    }
  };

  const handleSubmit = () => {
    if (cardInterests.length > 0 && useCase) {
      onSelect({ cardInterests, useCase });
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
        {/* Step 1: Select Cards */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Welcome to the Learning Center</h2>
            </div>
            <p className="text-muted-foreground">What types of cards are you interested in learning about?</p>

            <div className="space-y-6">
              {/* Sports Cards */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Sports Cards</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SPORTS_CARDS.map(card => (
                    <motion.button
                      key={card.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => toggleCardInterest(card.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        cardInterests.includes(card.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 bg-card hover:border-border'
                      }`}
                    >
                      <div className="text-2xl mb-2">{card.icon}</div>
                      <p className="text-xs font-semibold text-foreground">{card.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* TCG Cards */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Trading Card Games</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {TCG_CARDS.map(card => (
                    <motion.button
                      key={card.id}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => toggleCardInterest(card.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        cardInterests.includes(card.id)
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 bg-card hover:border-border'
                      }`}
                    >
                      <div className="text-2xl mb-2">{card.icon}</div>
                      <p className="text-xs font-semibold text-foreground">{card.label}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button
                onClick={() => setStep(2)}
                disabled={cardInterests.length === 0}
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
              <p className="text-muted-foreground">We'll customize your learning path based on your goals</p>
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
                Create My Learning Path <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}