import React, { useState } from 'react';
import { X, DollarSign, Loader2, ArrowRightLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function MarkSoldModal({ card, onClose, onDone }) {
  const [status, setStatus] = useState('sold');
  const [value, setValue] = useState(card.estimated_value || '');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.Card.update(card.id, {
      status,
      sold_traded_date: new Date().toISOString(),
      sold_traded_value: value ? parseFloat(value) : undefined,
      sold_traded_notes: notes || undefined,
    });
    setSaving(false);
    onDone?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card border border-border/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/30">
          <h2 className="font-semibold text-foreground text-sm">Mark as Sold / Traded</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            This will move <span className="text-foreground font-medium">{card.name}</span> out of your active collection.
          </p>

          {/* Type picker */}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setStatus('sold')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${status === 'sold' ? 'bg-emerald-400/10 border-emerald-400/40 text-emerald-400' : 'bg-secondary/40 border-border/40 text-muted-foreground'}`}>
              <ShoppingBag className="w-4 h-4" />Sold
            </button>
            <button type="button" onClick={() => setStatus('traded')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${status === 'traded' ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-secondary/40 border-border/40 text-muted-foreground'}`}>
              <ArrowRightLeft className="w-4 h-4" />Traded
            </button>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {status === 'sold' ? 'Sale Price ($)' : 'Trade Value ($)'} <span className="opacity-60">— optional</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="number" min="0" step="0.01"
                className="w-full bg-secondary/40 border border-border/40 rounded-lg pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="0.00"
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes <span className="opacity-60">— optional</span></label>
            <input
              className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              placeholder="e.g. Traded at Dallas show"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground h-10">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : `Mark as ${status === 'sold' ? 'Sold' : 'Traded'}`}
          </Button>
        </form>
      </div>
    </div>
  );
}