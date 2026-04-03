import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import NativeSelect from '@/components/shared/NativeSelect';
import { X, Upload, Loader2, Search, TrendingUp, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Ban, Bot } from 'lucide-react';
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

async function checkImageClarity(imageUrl) {
  return base44.integrations.Core.InvokeLLM({
    prompt: `Analyze this image of a trading card. Is the card clearly visible and identifiable (not blurry, not dark, not obstructed)?
Return JSON: { "clear": true/false, "reason": "short explanation" }`,
    file_urls: [imageUrl],
    response_json_schema: { type: 'object', properties: { clear: { type: 'boolean' }, reason: { type: 'string' } } },
  });
}

function getVerification(totalValue, comps) {
  if (!comps) return null;
  const marketRef = comps.ebay_avg ?? comps.point130_avg ?? null;
  if (marketRef == null || marketRef === 0) return null;
  const tv = parseFloat(totalValue);
  if (isNaN(tv) || tv <= 0) return null;
  const pct = (tv / marketRef) * 100;
  return { pct: Math.round(pct), marketRef, tv, inRange: pct >= 70 && pct <= 100 };
}

export default function LogTradeModal({ onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [fetchingComps, setFetchingComps] = useState(false);
  const [comps, setComps] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [aiReviewing, setAiReviewing] = useState(false);
  const [aiResult, setAiResult] = useState(null); // { approved, reason, banned, attempts_remaining }
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState('');

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const totalValue = (
    parseFloat(form.cash_paid || 0) + parseFloat(form.trade_card_value || 0)
  ).toFixed(2);

  const verification = getVerification(totalValue, comps);

  // Check if user is banned on mount
  useEffect(() => {
    base44.auth.me().then(user => {
      if (user?.trade_banned) {
        setIsBanned(true);
        setBanReason(user.trade_ban_reason || 'You have been temporarily banned from logging trades.');
      }
    });
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setImageError(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const check = await checkImageClarity(file_url);
    if (!check.clear) {
      setImageError(check.reason || 'Image is not clear enough. Please retake the photo.');
      setUploading(false);
      return;
    }
    set('image_url', file_url);
    setUploading(false);
  };

  const handleFetchComps = async () => {
    if (!form.card_name) return;
    setFetchingComps(true);
    setComps(null);
    setSubmitError(null);
    setAiResult(null);
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

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.CardTrade.create(data),
    onMutate: async (newTrade) => {
      await queryClient.cancelQueries({ queryKey: ['card-trades'] });
      const previous = queryClient.getQueryData(['card-trades']);
      queryClient.setQueryData(['card-trades'], (old = []) => [
        { ...newTrade, id: `optimistic-${Date.now()}`, created_date: new Date().toISOString() },
        ...old,
      ]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['card-trades'], context?.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card-trades'] });
      onClose();
    },
  });

  const buildTradePayload = () => ({
    ...form,
    cash_paid: form.cash_paid ? parseFloat(form.cash_paid) : undefined,
    trade_card_value: form.trade_card_value ? parseFloat(form.trade_card_value) : undefined,
    total_value: parseFloat(totalValue),
    ebay_comp_low: comps?.ebay_low,
    ebay_comp_high: comps?.ebay_high,
    ebay_comp_avg: comps?.ebay_avg,
    market_data_raw: comps?.market_summary,
    verified: verification ? verification.inRange : null,
    market_pct: verification?.pct ?? null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setAiResult(null);

    if (isBanned) return;

    // In-range: log directly
    if (!verification || verification.inRange) {
      mutation.mutate(buildTradePayload());
      return;
    }

    // Out of range — send to AI review
    setAiReviewing(true);
    const res = await base44.functions.invoke('reviewOutOfRangeTrade', {
      trade_data: buildTradePayload(),
      comps,
    });
    setAiReviewing(false);

    const result = res.data;

    if (result.banned) {
      setIsBanned(true);
      setBanReason('You have been temporarily banned after multiple denied out-of-range submissions. Please contact an admin to appeal.');
      setAiResult(result);
      return;
    }

    if (!result.approved) {
      setAiResult(result);
      return;
    }

    // AI approved out-of-range — already logged by backend, just close
    queryClient.invalidateQueries({ queryKey: ['card-trades'] });
    onClose();
  };

  // Banned state
  if (isBanned) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-destructive/30 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center mx-auto mb-5">
              <Ban className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Trade Logging Suspended</h2>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{banReason}</p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs text-destructive font-semibold mb-1">To be reinstated:</p>
              <p className="text-xs text-muted-foreground">Contact an Origins admin and provide proof that your submissions were legitimate. Your account data will be reviewed before the ban is lifted.</p>
            </div>
            <Button variant="outline" onClick={onClose} className="w-full border-border/50">Close</Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-green-400 mb-1"><CheckCircle2 className="w-3.5 h-3.5" />Image verified — clear</div>
                    <button type="button" onClick={() => { set('image_url', ''); setImageError(null); }} className="text-xs text-muted-foreground hover:text-destructive underline">Remove</button>
                  </div>
                </div>
              ) : (
                <>
                  <label className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer bg-secondary/30 transition-colors ${imageError ? 'border-destructive/50 hover:border-destructive/70' : 'border-border hover:border-primary/30'}`}>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    {uploading
                      ? <><Loader2 className="w-5 h-5 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Checking image clarity...</span></>
                      : <><Upload className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Take or upload a photo of the card</span></>}
                  </label>
                  {imageError && (
                    <div className="flex items-start gap-2 mt-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <p className="text-xs text-destructive">{imageError} Please retake the photo in better lighting.</p>
                    </div>
                  )}
                </>
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
                <NativeSelect value={form.sport} onValueChange={v => set('sport', v)} options={SPORTS} placeholder="Select..." />
              </div>
              <div className="col-span-2">
                <Label className="text-foreground mb-1 block">Condition / Grade</Label>
                <NativeSelect value={form.condition} onValueChange={v => set('condition', v)} options={CONDITIONS} placeholder="Select grade..." />
              </div>
            </div>

            {/* Market Comps */}
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />Market Comps
                </p>
                <Button type="button" size="sm" variant="outline" onClick={handleFetchComps} disabled={!form.card_name || fetchingComps} className="border-border/50 text-xs">
                  {fetchingComps ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Searching...</> : <><Search className="w-3 h-3 mr-1" />Fetch Comps</>}
                </Button>
              </div>
              {comps ? (
                <div className="space-y-1.5">
                  <div className="flex gap-4 text-sm flex-wrap">
                    {comps.ebay_low != null && <span className="text-muted-foreground">eBay Low: <span className="text-green-400 font-semibold">${comps.ebay_low}</span></span>}
                    {comps.ebay_avg != null && <span className="text-muted-foreground">eBay Avg: <span className="text-primary font-semibold">${comps.ebay_avg}</span></span>}
                    {comps.point130_avg != null && <span className="text-muted-foreground">130pt Avg: <span className="text-emerald-400 font-semibold">${comps.point130_avg}</span></span>}
                  </div>
                  {(comps.ebay_avg ?? comps.point130_avg) && (
                    <p className="text-xs text-muted-foreground">
                      Valid range (70%–100%): <span className="text-amber-400 font-semibold">${((comps.ebay_avg ?? comps.point130_avg) * 0.7).toFixed(0)}</span> – <span className="text-amber-400 font-semibold">${(comps.ebay_avg ?? comps.point130_avg).toFixed(0)}</span>
                    </p>
                  )}
                  {comps.market_summary && <p className="text-xs text-muted-foreground leading-relaxed mt-1">{comps.market_summary}</p>}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Fill in card details then click "Fetch Comps" to pull recent eBay & 130point sold prices.</p>
              )}
            </div>

            {/* Trade Type */}
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

            {/* Deal value + verification badge */}
            {parseFloat(totalValue) > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
                  <span className="text-sm font-semibold text-foreground">Total Deal Value</span>
                  <span className="text-lg font-bold text-primary">${totalValue}</span>
                </div>

                {verification && (
                  <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm ${
                    verification.inRange
                      ? 'bg-green-400/10 border-green-400/20'
                      : 'bg-amber-400/10 border-amber-400/20'
                  }`}>
                    {verification.inRange
                      ? <ShieldCheck className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                      : <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />}
                    <div>
                      <p className={`font-semibold text-sm ${verification.inRange ? 'text-green-400' : 'text-amber-400'}`}>
                        {verification.inRange ? '✓ Within Fair Market Range' : `⚠ Outside Fair Market Range (${verification.pct}%)`}
                      </p>
                      <p className={`text-xs mt-0.5 ${verification.inRange ? 'text-green-400/70' : 'text-amber-400/70'}`}>
                        {verification.inRange
                          ? `Trade is ${verification.pct}% of market avg — qualifies for Origins Market Value.`
                          : `Value is outside 70%–100% range. Submitting will trigger an AI review. Repeated fraudulent submissions result in a ban.`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI review result */}
            {aiResult && !aiResult.approved && (
              <div className="flex items-start gap-2.5 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <Bot className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive mb-1">AI Review — Submission Denied</p>
                  <p className="text-xs text-destructive/80 leading-relaxed">{aiResult.reason}</p>
                  {aiResult.attempts_remaining > 0 && (
                    <p className="text-xs text-amber-400 mt-2 font-medium">
                      ⚠ Warning: {aiResult.attempts_remaining} more denied submission{aiResult.attempts_remaining !== 1 ? 's' : ''} will result in a temporary ban.
                    </p>
                  )}
                </div>
              </div>
            )}

            {submitError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">{submitError}</p>
              </div>
            )}

            <div>
              <Label className="text-foreground mb-1 block">Event / Location</Label>
              <Input value={form.event_name} onChange={e => set('event_name', e.target.value)} placeholder="e.g. Chicago Card Show" className="bg-secondary border-border" />
            </div>

            <div>
              <Label className="text-foreground mb-1 block">Notes {verification && !verification.inRange && <span className="text-amber-400 text-xs">— explain the out-of-range value here</span>}</Label>
              <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any extra details..." rows={2} className="bg-secondary border-border resize-none" />
            </div>
          </form>

          <div className="px-6 py-4 border-t border-border/50 flex gap-3 shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border/50">Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.card_name || !form.trade_type || mutation.isPending || uploading || aiReviewing}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {aiReviewing
                ? <><Bot className="w-4 h-4 animate-pulse mr-2" />AI Reviewing...</>
                : mutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</>
                  : verification && !verification.inRange
                    ? 'Submit for AI Review'
                    : 'Log Trade'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}