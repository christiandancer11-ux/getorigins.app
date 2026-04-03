import React, { useState } from 'react';
import { X, Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const SPORTS = [
  { value: 'baseball', label: 'Baseball' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'football', label: 'Football' },
  { value: 'hockey', label: 'Hockey' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'pokemon', label: 'Pokémon' },
  { value: 'magic_the_gathering', label: 'MTG' },
  { value: 'yugioh', label: 'Yu-Gi-Oh!' },
  { value: 'other', label: 'Other' },
];

export default function SetAlertModal({ onClose, onCreated, prefill = {} }) {
  const [form, setForm] = useState({
    card_name: prefill.player_or_name || prefill.card_name || '',
    set_name: prefill.set_name || '',
    year: prefill.year || '',
    variant: prefill.variant || '',
    sport: prefill.sport || 'football',
    alert_type: 'buy_below',
    target_price: '',
    notify_email: true,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.card_name || !form.target_price) return;
    setSaving(true);
    const user = await base44.auth.me();
    await base44.entities.PriceAlert.create({
      ...form,
      target_price: parseFloat(form.target_price),
      user_email: user.email,
      status: 'active',
    });
    setSaving(false);
    onCreated?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground">Set Price Alert</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Card Name *</label>
            <input
              className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              placeholder="e.g. Patrick Mahomes"
              value={form.card_name}
              onChange={e => set('card_name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Set</label>
              <input
                className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="e.g. Prizm"
                value={form.set_name}
                onChange={e => set('set_name', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Year</label>
              <input
                className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="e.g. 2020"
                value={form.year}
                onChange={e => set('year', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Variant / Grade</label>
              <input
                className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="e.g. PSA 10"
                value={form.variant}
                onChange={e => set('variant', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sport / TCG</label>
              <select
                className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
                value={form.sport}
                onChange={e => set('sport', e.target.value)}
              >
                {SPORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Alert Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => set('alert_type', 'buy_below')}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${form.alert_type === 'buy_below' ? 'bg-emerald-400/10 border-emerald-400/50 text-emerald-400' : 'bg-secondary/40 border-border/40 text-muted-foreground'}`}
              >
                🟢 Buy Below
              </button>
              <button
                type="button"
                onClick={() => set('alert_type', 'sell_above')}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${form.alert_type === 'sell_above' ? 'bg-red-400/10 border-red-400/50 text-red-400' : 'bg-secondary/40 border-border/40 text-muted-foreground'}`}
              >
                🔴 Sell Above
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Target Price ($) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              placeholder="e.g. 150.00"
              value={form.target_price}
              onChange={e => set('target_price', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes (optional)</label>
            <input
              className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              placeholder="e.g. Holding until PSA pop drops"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notify_email"
              checked={form.notify_email}
              onChange={e => set('notify_email', e.target.checked)}
              className="accent-primary"
            />
            <label htmlFor="notify_email" className="text-xs text-muted-foreground cursor-pointer">
              Email me when this alert triggers
            </label>
          </div>

          <Button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground h-10">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Set Alert'}
          </Button>
        </form>
      </div>
    </div>
  );
}