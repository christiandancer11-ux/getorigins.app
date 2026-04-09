import React, { useState } from 'react';
import { X, DollarSign, Loader2, ArrowRightLeft, ShoppingBag, Search, TrendingUp, ShieldCheck, AlertTriangle, XCircle, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

function getVerification(value, comps) {
  if (!comps || !value) return null;
  const marketRef = comps.ebay_avg ?? comps.point130_avg ?? null;
  if (!marketRef || marketRef === 0) return null;
  const tv = parseFloat(value);
  if (isNaN(tv) || tv <= 0) return null;
  const pct = (tv / marketRef) * 100;
  return { pct: Math.round(pct), marketRef, tv, passes: pct >= 70 && pct <= 100 };
}

export default function MarkSoldModal({ card, onClose, onDone }) {
  const [status, setStatus] = useState('sold');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [venue, setVenue] = useState(''); // card_show or in_person
  const [eventName, setEventName] = useState('');
  const [saving, setSaving] = useState(false);
  const [fetchingComps, setFetchingComps] = useState(false);
  const [comps, setComps] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const verification = getVerification(value, comps);

  const handleFetchComps = async () => {
    setFetchingComps(true);
    setComps(null);
    setSubmitError(null);
    const res = await base44.functions.invoke('fetchCardComps', {
      card_name: card.name,
      set_name: card.set_name,
      year: card.year,
      condition: 'raw',
    });
    setComps(res.data);
    setFetchingComps(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const numVal = parseFloat(value);

    // If comps were fetched and a value is entered, enforce the 70%-100% rule
    if (comps && value && verification) {
      if (!verification.passes) {
        const min = (verification.marketRef * 0.7).toFixed(0);
        const max = verification.marketRef.toFixed(0);
        if (verification.pct < 70) {
          setSubmitError(`Value ($${numVal}) is ${verification.pct}% of market average. Minimum is 70% ($${min}) to be logged in trade data.`);
        } else {
          setSubmitError(`Value ($${numVal}) is ${verification.pct}% of market average ($${max}). Values above 100% of market cannot be logged.`);
        }
        return;
      }
    }

    setSaving(true);

    // 1. Update the card status
    await base44.entities.Card.update(card.id, {
      status,
      sold_traded_date: new Date().toISOString(),
      sold_traded_value: numVal || undefined,
      sold_traded_notes: notes || undefined,
    });

    // 2. Log a CardTrade entry if a value was provided
    if (numVal > 0) {
      const tradeEntry = {
        card_name: card.name,
        set_name: card.set_name || '',
        year: card.year || '',
        sport: card.sport || 'other',
        trade_type: status === 'sold' ? 'cash' : 'card_for_card',
        total_value: numVal,
        ...(status === 'sold' ? { cash_paid: numVal } : { trade_card_value: numVal }),
        event_name: venue === 'card_show' ? (eventName || 'Card Show') : (venue === 'in_person' ? 'In-Person / Private' : ''),
        notes: notes || '',
        ebay_comp_avg: comps?.ebay_avg ?? null,
        ebay_comp_low: comps?.ebay_low ?? null,
        ebay_comp_high: comps?.ebay_high ?? null,
        market_data_raw: comps?.market_summary ?? null,
        verified: verification ? verification.passes : null,
        market_pct: verification?.pct ?? null,
      };
      await base44.entities.CardTrade.create(tradeEntry);
    }

    setSaving(false);
    onDone?.();
    onClose();
  };

  const minVal = comps ? ((comps.ebay_avg ?? comps.point130_avg ?? 0) * 0.7).toFixed(0) : null;
  const maxVal = comps ? (comps.ebay_avg ?? comps.point130_avg ?? 0).toFixed(0) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card border border-border/50 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border/30 sticky top-0 bg-card z-10">
          <h2 className="font-semibold text-foreground text-sm">Mark as Sold / Traded</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">
            This will move <span className="text-foreground font-medium">{card.name}</span> out of your active collection.
            {' '}The value will be logged into card trade data.
          </p>

          {/* Sold / Traded toggle */}
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

          {/* Venue */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium">Where did this happen?</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setVenue('card_show')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-all ${venue === 'card_show' ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-secondary/40 border-border/40 text-muted-foreground'}`}>
                <MapPin className="w-3.5 h-3.5" />Card Show
              </button>
              <button type="button" onClick={() => setVenue('in_person')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-medium transition-all ${venue === 'in_person' ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-secondary/40 border-border/40 text-muted-foreground'}`}>
                <Users className="w-3.5 h-3.5" />In Person / Private
              </button>
            </div>
            {venue === 'card_show' && (
              <input
                className="mt-2 w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="Event name (e.g. Dallas Card Show)"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
              />
            )}
          </div>

          {/* Market comps lookup */}
          <div className="rounded-xl border border-border/40 bg-secondary/20 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />Market Value Check
              </p>
              <button type="button" onClick={handleFetchComps} disabled={fetchingComps}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium disabled:opacity-50">
                {fetchingComps ? <><Loader2 className="w-3 h-3 animate-spin" />Checking...</> : <><Search className="w-3 h-3" />Look Up</>}
              </button>
            </div>
            {comps ? (
              <div className="space-y-1">
                <div className="flex gap-3 text-xs flex-wrap">
                  {comps.ebay_avg != null && <span className="text-muted-foreground">eBay Avg: <span className="text-primary font-semibold">${comps.ebay_avg}</span></span>}
                  {comps.point130_avg != null && <span className="text-muted-foreground">130pt Avg: <span className="text-emerald-400 font-semibold">${comps.point130_avg}</span></span>}
                </div>
                <p className="text-xs text-amber-400 font-medium">
                  Valid range: ${minVal} – ${maxVal} (70%–100% of market)
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                {fetchingComps ? 'Searching eBay & 130point...' : 'Click "Look Up" to verify your value against live market data.'}
              </p>
            )}
          </div>

          {/* Value input */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {status === 'sold' ? 'Sale Price ($)' : 'Card Trade Value ($)'}
              {comps && <span className="text-amber-400 ml-1">· must be ${minVal}–${maxVal}</span>}
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="number" min="0" step="0.01"
                className="w-full bg-secondary/40 border border-border/40 rounded-lg pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                placeholder="0.00"
                value={value}
                onChange={e => { setValue(e.target.value); setSubmitError(null); }}
              />
            </div>

            {/* Live verification badge */}
            {verification && value && (
              <div className={`mt-2 flex items-start gap-2 p-2.5 rounded-lg border text-xs ${verification.passes ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                {verification.passes
                  ? <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                <span>
                  {verification.passes
                    ? `✓ ${verification.pct}% of market — qualifies for Origins trade data`
                    : verification.pct < 70
                      ? `${verification.pct}% of market — below 70% minimum ($${minVal})`
                      : `${verification.pct}% of market — above 100% maximum ($${maxVal})`}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Notes <span className="opacity-60">— optional</span></label>
            <input
              className="w-full bg-secondary/40 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              placeholder="Any extra details..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{submitError}</p>
            </div>
          )}

          {value && comps && verification?.passes && (
            <p className="text-xs text-muted-foreground bg-primary/5 border border-primary/15 rounded-lg px-3 py-2">
              📊 This value will be logged into the Origins card trade data to help the community with market comps.
            </p>
          )}

          <Button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground h-10">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : `Mark as ${status === 'sold' ? 'Sold' : 'Traded'}`}
          </Button>
        </form>
      </div>
    </div>
  );
}