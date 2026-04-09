import React, { useMemo, useState } from 'react';
import { DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

const SORT_OPTIONS = [
  { id: 'value-high', label: 'Highest Value' },
  { id: 'value-low', label: 'Lowest Value' },
  { id: 'name-a', label: 'Name (A-Z)' },
  { id: 'newest', label: 'Newest First' },
];

export default function CardValueBreakdown({ cards }) {
  const [sortBy, setSortBy] = useState('value-high');
  const [searchTerm, setSearchTerm] = useState('');

  const owned = cards.filter(c => !c.status || c.status === 'owned');
  
  const totalValue = useMemo(() => owned.reduce((sum, c) => sum + (c.estimated_value || 0), 0), [owned]);

  const sortedCards = useMemo(() => {
    let filtered = owned.filter(c => 
      (c.estimated_value || c.price_paid) && 
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       c.set_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    switch (sortBy) {
      case 'value-high':
        return filtered.sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0));
      case 'value-low':
        return filtered.sort((a, b) => (a.estimated_value || 0) - (b.estimated_value || 0));
      case 'name-a':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      default:
        return filtered;
    }
  }, [owned, sortBy, searchTerm]);

  const cardsWithValue = owned.filter(c => c.estimated_value > 0).length;
  const avgValue = cardsWithValue > 0 ? totalValue / cardsWithValue : 0;
  
  const totalPricePaid = owned.reduce((sum, c) => sum + (c.price_paid || 0), 0);
  const gainLoss = totalValue - totalPricePaid;
  const gainLossPercent = totalPricePaid > 0 ? (gainLoss / totalPricePaid) * 100 : 0;
  const gainLossColor = gainLoss >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="space-y-4">
      {/* Header with totals */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-5"
      >
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Portfolio Value</p>
            <p className="text-3xl font-bold text-foreground">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Price Paid</p>
            <p className="text-3xl font-bold text-muted-foreground">${totalPricePaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-primary/30">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Gain / Loss</p>
            <p className={`text-2xl font-bold ${gainLossColor}`}>
              {gainLoss >= 0 ? '+' : ''}{gainLoss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <p className={`text-xs mt-1 ${gainLossColor}`}>{gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Cards Valued</p>
            <p className="text-2xl font-bold text-primary">{cardsWithValue}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Average Value</p>
            <p className="text-2xl font-bold text-amber-400">${avgValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <Input
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 rounded-md border border-border bg-secondary text-foreground text-sm"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Cards list */}
      {sortedCards.length === 0 ? (
        <div className="rounded-xl bg-card border border-border/40 p-8 text-center">
          <p className="text-sm text-muted-foreground">No valued cards found. Add estimated values to your cards to see them here.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card border border-border/40 overflow-hidden"
        >
          <div className="divide-y divide-border/40 max-h-[600px] overflow-y-auto">
            {sortedCards.slice(0, 50).map((card, index) => {
              const percentage = totalValue > 0 ? ((card.estimated_value || 0) / totalValue) * 100 : 0;
              return (
                <div
                  key={card.id}
                  className="p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                     {/* Card image/thumbnail */}
                     {card.image_url && (
                       <div className="w-14 h-20 rounded-lg overflow-hidden border border-border/40 shrink-0">
                         <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                       </div>
                     )}

                     {/* Card details */}
                     <div className="flex-1 min-w-0">
                       <p className="font-semibold text-foreground truncate">{card.name}</p>
                       <p className="text-xs text-muted-foreground mt-1">
                         {card.set_name && <>{card.set_name}</> }
                         {card.year && <> • {card.year}</>}
                         {card.rarity && <> • {card.rarity.replace('_', ' ')}</>}
                       </p>

                       {/* Percentage bar */}
                       <div className="mt-2 flex items-center gap-2">
                         <div className="flex-1 h-2 rounded-full bg-secondary/60 overflow-hidden">
                           <div
                             className="h-full bg-primary rounded-full transition-all"
                             style={{ width: `${percentage}%` }}
                           />
                         </div>
                         <span className="text-[10px] text-muted-foreground w-10 text-right">{percentage.toFixed(1)}%</span>
                       </div>
                     </div>

                     {/* Value & Gain/Loss */}
                     <div className="text-right shrink-0">
                       <p className="text-lg font-bold text-primary">${(card.estimated_value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                       {card.price_paid ? (
                         <div className="mt-1 text-[10px]">
                           <p className="text-muted-foreground">Paid: ${card.price_paid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                           <p className={card.estimated_value - card.price_paid >= 0 ? 'text-green-400' : 'text-red-400'}>
                             {card.estimated_value - card.price_paid >= 0 ? '+' : ''}{(card.estimated_value - card.price_paid).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                           </p>
                         </div>
                       ) : (
                         <p className="text-[10px] text-muted-foreground mt-1">{percentage.toFixed(1)}% of total</p>
                       )}
                     </div>
                   </div>
                  </div>
              );
            })}
            {sortedCards.length > 50 && (
              <div className="p-3 text-center text-xs text-muted-foreground bg-secondary/20">
                Showing 50 of {sortedCards.length} cards · Scroll to see more
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}