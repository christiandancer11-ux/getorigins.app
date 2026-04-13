import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ShoppingBag, ArrowRightLeft, RotateCcw, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { legacyApi } from '@/api/apiClient';

export default function SoldTradedGrid({ cards, onRestored }) {
  const [restoring, setRestoring] = React.useState(null);

  const handleRestore = async (card) => {
    setRestoring(card.id);
    await legacyApi.entities.Card.update(card.id, {
      status: 'owned',
      sold_traded_date: null,
      sold_traded_value: null,
      sold_traded_notes: null,
    });
    setRestoring(null);
    onRestored?.();
  };

  if (!cards.length) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">Sold / Traded</h2>
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{cards.length}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-5">These cards are no longer in your active collection and don't count toward your total value.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => (
          <motion.div key={card.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <div className="rounded-2xl bg-card border border-border/40 overflow-hidden opacity-70 hover:opacity-90 transition-opacity">
              <Link to={`/cards/${card.id}`}>
                <div className="aspect-[3/4] bg-muted/20 relative overflow-hidden">
                  {card.image_url ? (
                    <img src={card.image_url} alt={card.name} className="w-full h-full object-cover grayscale" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary/50 to-muted/50">
                      <QrCode className="w-10 h-10 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${card.status === 'sold' ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                      {card.status === 'sold' ? <ShoppingBag className="w-2.5 h-2.5" /> : <ArrowRightLeft className="w-2.5 h-2.5" />}
                      {card.status === 'sold' ? 'Sold' : 'Traded'}
                    </div>
                  </div>
                </div>
              </Link>
              <div className="p-3">
                <p className="font-semibold text-foreground text-xs mb-0.5 truncate">{card.name}</p>
                {card.sold_traded_value && (
                  <p className="text-xs text-muted-foreground mb-0.5">${card.sold_traded_value.toLocaleString()}</p>
                )}
                {card.sold_traded_notes && (
                  <p className="text-[10px] text-muted-foreground/60 italic truncate mb-1">{card.sold_traded_notes}</p>
                )}
                <button
                  onClick={() => handleRestore(card)}
                  disabled={restoring === card.id}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors"
                >
                  {restoring === card.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                  Move back to collection
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

