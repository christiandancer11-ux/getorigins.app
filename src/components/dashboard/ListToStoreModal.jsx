import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, ShoppingBag, ExternalLink, CheckCircle2, ChevronRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const STORE_CONFIG = [
  {
    key: 'ebay_store',
    label: 'eBay',
    icon: '🛒',
    baseUrl: 'https://www.ebay.com/usr/',
    listingBase: 'https://www.ebay.com/sell/listing',
    color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5',
    description: 'List directly on your eBay store',
    buildUrl: (user, card) => {
      const title = [card.year, card.name, card.set_name, card.card_number, card.grading_company && card.grade ? `${card.grading_company} ${card.grade}` : null].filter(Boolean).join(' ');
      return `https://www.ebay.com/sell/listing?listing_type=FixedPriceListing&title=${encodeURIComponent(title)}`;
    },
  },
  {
    key: 'fanatics_live',
    label: 'Fanatics Live',
    icon: '⚡',
    baseUrl: 'https://fanatics.live/',
    listingBase: 'https://fanatics.live/',
    color: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
    description: 'List on your Fanatics Live show',
    buildUrl: (user) => `https://fanatics.live/${user.fanatics_live || ''}`,
  },
  {
    key: 'whatnot',
    label: 'Whatnot',
    icon: '🔴',
    baseUrl: 'https://www.whatnot.com/user/',
    listingBase: 'https://www.whatnot.com/',
    color: 'text-red-400 border-red-400/30 bg-red-400/5',
    description: 'List on your Whatnot show',
    buildUrl: (user) => `https://www.whatnot.com/user/${user.whatnot || ''}`,
  },
];

export default function ListToStoreModal({ cards, onClose, user }) {
  const [selectedCardIds, setSelectedCardIds] = useState(new Set());
  const [selectedStore, setSelectedStore] = useState(null);
  const [step, setStep] = useState('select_cards'); // select_cards | select_store | confirm

  const linkedStores = STORE_CONFIG.filter(s => user?.[s.key]);

  const toggleCard = (id) => {
    setSelectedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCards = cards.filter(c => selectedCardIds.has(c.id));

  const handleContinue = () => {
    if (step === 'select_cards' && selectedCardIds.size > 0) setStep('select_store');
    else if (step === 'select_store' && selectedStore) setStep('confirm');
  };

  const handleList = () => {
    const store = STORE_CONFIG.find(s => s.key === selectedStore);
    if (!store) return;

    if (selectedCards.length === 1) {
      // Deep link with card info pre-filled where possible
      const url = store.buildUrl(user, selectedCards[0]);
      window.open(url, '_blank');
    } else {
      // For bulk, open the store dashboard
      const url = store.buildUrl(user, selectedCards[0]);
      window.open(url, '_blank');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="w-full max-w-lg bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground text-base">List to Your Store</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border/30 bg-secondary/20">
          {['select_cards', 'select_store', 'confirm'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${step === s ? 'text-primary' : ['select_store', 'confirm'].indexOf(s) < ['select_cards', 'select_store', 'confirm'].indexOf(step) ? 'text-green-400' : 'text-muted-foreground'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s ? 'bg-primary text-primary-foreground' : ['select_store', 'confirm'].indexOf(s) < ['select_cards', 'select_store', 'confirm'].indexOf(step) ? 'bg-green-400/20 text-green-400' : 'bg-secondary text-muted-foreground'}`}>
                  {i + 1}
                </div>
                <span className="hidden sm:inline">{s === 'select_cards' ? 'Select Cards' : s === 'select_store' ? 'Choose Store' : 'Confirm'}</span>
              </div>
              {i < 2 && <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* Step 1: Select Cards */}
            {step === 'select_cards' && (
              <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs text-muted-foreground mb-4">Select which cards you want to list for sale.</p>
                <div className="space-y-2">
                  {cards.map(card => {
                    const checked = selectedCardIds.has(card.id);
                    return (
                      <button
                        key={card.id}
                        onClick={() => toggleCard(card.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${checked ? 'border-primary/40 bg-primary/5' : 'border-border/40 bg-secondary/20 hover:border-border/60'}`}
                      >
                        {card.image_url
                          ? <img src={card.image_url} alt={card.name} className="w-10 h-14 object-cover rounded-lg shrink-0 border border-border/30" />
                          : <div className="w-10 h-14 rounded-lg bg-muted/40 border border-border/30 shrink-0 flex items-center justify-center text-lg">🃏</div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{card.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{[card.year, card.set_name].filter(Boolean).join(' · ')}</p>
                          {card.grading_company && card.grade && (
                            <p className="text-xs text-amber-400 font-medium mt-0.5">{card.grading_company} {card.grade}</p>
                          )}
                          {card.estimated_value > 0 && (
                            <p className="text-xs text-primary font-semibold mt-0.5">${card.estimated_value.toLocaleString()}</p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                          {checked && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Select Store */}
            {step === 'select_store' && (
              <motion.div key="store" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-xs text-muted-foreground mb-4">Where would you like to list {selectedCardIds.size} card{selectedCardIds.size !== 1 ? 's' : ''}?</p>
                <div className="space-y-3">
                  {linkedStores.map(store => (
                    <button
                      key={store.key}
                      onClick={() => setSelectedStore(store.key)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${selectedStore === store.key ? `border-primary/50 bg-primary/5` : `border-border/40 hover:border-border/60 bg-secondary/20`}`}
                    >
                      <span className="text-2xl">{store.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm">{store.label}</p>
                        <p className="text-xs text-muted-foreground">{store.description}</p>
                        <p className="text-xs text-primary mt-0.5 truncate">{store.baseUrl}{user[store.key]}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${selectedStore === store.key ? 'border-primary bg-primary' : 'border-muted-foreground/40'}`}>
                        {selectedStore === store.key && <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {(() => {
                  const store = STORE_CONFIG.find(s => s.key === selectedStore);
                  return (
                    <div className="space-y-4">
                      <div className={`rounded-xl border p-4 ${store.color}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{store.icon}</span>
                          <div>
                            <p className="font-semibold text-foreground">{store.label}</p>
                            <p className="text-xs text-muted-foreground">{store.baseUrl}{user[store.key]}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-2">Cards to list ({selectedCards.length}):</p>
                        <div className="space-y-2">
                          {selectedCards.map(card => (
                            <div key={card.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border/30">
                              {card.image_url
                                ? <img src={card.image_url} alt={card.name} className="w-8 h-11 object-cover rounded border border-border/30 shrink-0" />
                                : <div className="w-8 h-11 rounded bg-muted/40 shrink-0" />
                              }
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{card.name}</p>
                                <p className="text-xs text-muted-foreground">{[card.year, card.set_name, card.grading_company && card.grade ? `${card.grading_company} ${card.grade}` : null].filter(Boolean).join(' · ')}</p>
                              </div>
                              {card.estimated_value > 0 && <span className="text-xs font-semibold text-primary shrink-0">${card.estimated_value.toLocaleString()}</span>}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-xl bg-secondary/30 border border-border/30 p-3 text-xs text-muted-foreground">
                        <p>You'll be taken to <strong className="text-foreground">{store.label}</strong> to complete the listing. Card details have been pre-filled where supported. Pricing and shipping are set on the platform.</p>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-border/40">
          {step !== 'select_cards' && (
            <Button
              variant="outline"
              className="border-border/50"
              onClick={() => setStep(step === 'confirm' ? 'select_store' : 'select_cards')}
            >
              Back
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" className="border-border/50" onClick={onClose}>Cancel</Button>
          {step !== 'confirm' ? (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
              onClick={handleContinue}
              disabled={(step === 'select_cards' && selectedCardIds.size === 0) || (step === 'select_store' && !selectedStore)}
            >
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
              onClick={handleList}
            >
              <ExternalLink className="w-4 h-4" />
              List Now
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}