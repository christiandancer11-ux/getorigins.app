import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Upload, Loader2, Search, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SPORTS = [
  { value: 'baseball', label: 'Baseball' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'football', label: 'Football' },
  { value: 'hockey', label: 'Hockey' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'pokemon', label: 'Pokémon' },
  { value: 'magic_the_gathering', label: 'Magic: The Gathering' },
  { value: 'yugioh', label: 'Yu-Gi-Oh!' },
  { value: 'other', label: 'Other' },
];

const CONDITIONS = [
  { value: 'raw', label: 'Raw (Ungraded)' },
  { value: 'psa_10', label: 'PSA 10' }, { value: 'psa_9', label: 'PSA 9' },
  { value: 'psa_8', label: 'PSA 8' }, { value: 'psa_7', label: 'PSA 7' },
  { value: 'psa_6', label: 'PSA 6' }, { value: 'psa_5', label: 'PSA 5' },
  { value: 'psa_4', label: 'PSA 4' }, { value: 'psa_3', label: 'PSA 3' },
  { value: 'psa_2', label: 'PSA 2' }, { value: 'psa_1', label: 'PSA 1' },
  { value: 'bgs_10', label: 'BGS 10' }, { value: 'bgs_9_5', label: 'BGS 9.5' },
  { value: 'bgs_9', label: 'BGS 9' }, { value: 'sgc_10', label: 'SGC 10' },
  { value: 'other_graded', label: 'Other Graded' },
];

const EMPTY = {
  card_name: '', set_name: '', year: '', card_number: '', sport: '',
  condition: 'raw', image_url: '',
  trade_type: 'cash', cash_paid: '', trade_card_description: '', trade_card_value: '',
  event_name: '', notes: '',
};

export default function LogTradeModal({ onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [fetchingComps, setFetchingComps] = useState(false);
  const [comps, setComps] = useState(null);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    set('image_url', file_url);
    setUploading(false);
  };

  const handleFetchComps = async () => {
    if (!form.card_name) return;
    setFetchingComps(true);
    setComps(null);
    const res = await base44.functions.invoke('fetchCardComps', {
      card_name: form.card_name,
      set_name: form.set_name,
      year: form.year,
      card_number: form.card_number,
      condition: form.condition,
    });
    setComps(res.data);
    setFetchingComps(false);
  };

  const totalValue = (
    parseFloat(form.cash_paid || 0) + parseFloat(form.trade_card_value || 0)
  ).toFixed(2);

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.CardTrade.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-trades'] });
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      cash_paid: form.cash_paid ? parseFloat(form.cash_paid) : undefined,
      trade_card_value: form.trade_card_value ? parseFloat(form.trade_card_value) : undefined,
      total_value: parseFloat(totalValue),
      ebay_comp_low: comps?.ebay_low,
      ebay_comp_high: comps?.ebay_high,
      ebay_comp_avg: comps?.ebay_avg,
      market_data_raw: comps?.market_summary,
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-xl bg-card border border-border/50 rounded-2xl shadow-2xl flex flex-col max-h-[92vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
            <h2 className="font-display text-lg font-bold text-foreground">Log a Trade</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
            {/* Card Image */}
            <div>
              <Label className="text-foreground mb-1.5 block">Card Photo</Label>
              {form.image_url ? (
                <div className="flex items-center gap-3">
                  <img src={form.image_url} alt="card" className="w-16 h-24 object-cover rounded-lg border border-border/50" />
                  <button type="button" onClick={() => set('image_url', '')} className="text-xs text-muted-foreground hover:text-destructive underline">Remove</button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/30 cursor-pointer bg-secondary/30 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <><Upload className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Take or upload a photo</span></>}
                </label>
              )}
            </div>

            {/* Card Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-foreground mb-1 block">Card Name / Player *</Label>
                <Input value={form.card_name} onChange={e => set('card_name', e.target.value)} placeholder="e.g. Mike Trout" required className="bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-foreground mb-1 block">Set Name</Label>
                <Input value={form.set_name} onChange={e => set('set_name', e.target.value)} placeholder="e.g. Topps Chrome" className="bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-foreground mb-1 block">Year</Label>
                <Input value={form.year} onChange={e => set('year', e.target.value)} placeholder="e.g. 2011" className="bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-foreground mb-1 block">Card #</Label>
                <Input value={form.card_number} onChange={e => set('card_number', e.target.value)} placeholder="e.g. /150" className="bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-foreground mb-1 block">Sport / Category</Label>
                <Select value={form.sport} onValueChange={v => set('sport', v)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{SPORTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-foreground mb-1 block">Condition / Grade</Label>
                <Select value={form.condition} onValueChange={v => set('condition', v)}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>{CONDITIONS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Market Comps */}
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Market Comps</p>
                <Button type="button" size="sm" variant="outline" onClick={handleFetchComps} disabled={!form.card_name || fetchingComps} className="border-border/50 text-xs">
                  {fetchingComps ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Searching...</> : <><Search className="w-3 h-3 mr-1" />Fetch Comps</>}
                </Button>
              </div>
              {comps ? (
                <div className="space-y-1.5">
                  <div className="flex gap-4 text-sm">
                    {comps.ebay_low != null && <span className="text-muted-foreground">Low: <span className="text-green-400 font-semibold">${comps.ebay_low}</span></span>}
                    {comps.ebay_avg != null && <span className="text-muted-foreground">Avg: <span className="text-primary font-semibold">${comps.ebay_avg}</span></span>}
                    {comps.ebay_high != null && <span className="text-muted-foreground">High: <span className="text-foreground font-semibold">${comps.ebay_high}</span></span>}
                  </div>
                  {comps.market_summary && <p className="text-xs text-muted-foreground leading-relaxed">{comps.market_summary}</p>}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Fill in card details then click "Fetch Comps" to pull recent eBay & 130point sold prices.</p>
              )}
            </div>

            {/* Trade Details */}
            <div>
              <Label className="text-foreground mb-1.5 block">Trade Type *</Label>
              <div className="grid grid-cols-3 gap-2">
                {[['cash','💵 Cash Only'],['card_for_card','🔄 Card for Card'],['cash_plus_card','💵+🔄 Cash + Card']].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => set('trade_type', v)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center ${form.trade_type === v ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary border-border/50 text-muted-foreground hover:text-foreground'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {(form.trade_type === 'cash' || form.trade_type === 'cash_plus_card') && (
              <div>
                <Label className="text-foreground mb-1 block">Cash Paid ($)</Label>
                <Input type="number" min="0" step="0.01" value={form.cash_paid} onChange={e => set('cash_paid', e.target.value)} placeholder="0.00" className="bg-secondary border-border" />
              </div>
            )}

            {(form.trade_type === 'card_for_card' || form.trade_type === 'cash_plus_card') && (
              <div className="space-y-3">
                <div>
                  <Label className="text-foreground mb-1 block">Card(s) Given in Trade</Label>
                  <Textarea value={form.trade_card_description} onChange={e => set('trade_card_description', e.target.value)} placeholder="e.g. 2019 Topps Chrome Julio Rodriguez PSA 9" rows={2} className="bg-secondary border-border resize-none" />
                </div>
                <div>
                  <Label className="text-foreground mb-1 block">Trade Card Value ($)</Label>
                  <Input type="number" min="0" step="0.01" value={form.trade_card_value} onChange={e => set('trade_card_value', e.target.value)} placeholder="0.00" className="bg-secondary border-border" />
                </div>
              </div>
            )}

            {parseFloat(totalValue) > 0 && (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
                <span className="text-sm font-semibold text-foreground">Total Deal Value</span>
                <span className="text-lg font-bold text-primary">${totalValue}</span>
              </div>
            )}

            <div>
              <Label className="text-foreground mb-1 block">Event / Location</Label>
              <Input value={form.event_name} onChange={e => set('event_name', e.target.value)} placeholder="e.g. Chicago Card Show, National Sports Collectors Convention" className="bg-secondary border-border" />
            </div>

            <div>
              <Label className="text-foreground mb-1 block">Notes</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any extra details..." rows={2} className="bg-secondary border-border resize-none" />
            </div>
          </form>

          <div className="px-6 py-4 border-t border-border/50 flex gap-3 shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border/50">Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.card_name || !form.trade_type || mutation.isPending} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              {mutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</> : 'Log Trade'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}