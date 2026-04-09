import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, RotateCcw, TrendingUp, ShoppingCart, Handshake, Star, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Plus, X, Award, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SoldListingsTable from './SoldListingsTable';
import CardConditionModal from '@/components/scan/CardConditionModal';

const STEP = { IDLE: 'idle', CONDITION: 'condition', UPLOADING: 'uploading', ANALYZING: 'analyzing', NEED_BACK: 'need_back', UPLOADING_BACK: 'uploading_back', DONE: 'done', ERROR: 'error' };

export default function CardScanner() {
  const [step, setStep] = useState(STEP.IDLE);
  const [frontUrl, setFrontUrl] = useState(null);
  const [backUrl, setBackUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showListings, setShowListings] = useState(false);
  const [cardCondition, setCardCondition] = useState(null);
  const frontCamRef = useRef();
  const frontGalleryRef = useRef();
  const backCamRef = useRef();
  const backGalleryRef = useRef();

  const analyzeCard = async (front, back, condition) => {
    setStep(STEP.ANALYZING);
    const payload = { image_url: front };
    if (back) payload.back_image_url = back;
    if (condition) {
      payload.is_raw = condition.is_raw;
      payload.grading_company = condition.grading_company;
      payload.grade = condition.grade;
    }
    const res = await base44.functions.invoke('analyzeCardImage', payload);
    if (res.data?.error) {
      setError(res.data.error);
      setStep(STEP.ERROR);
    } else {
      // If AI says it needs the back and we don't have it yet
      if (res.data?.needs_back_image && !back) {
        setStep(STEP.NEED_BACK);
      } else {
        setResult(res.data);
        setStep(STEP.DONE);
      }
    }
  };

  const handleConditionSubmit = (condition) => {
    setCardCondition(condition);
    analyzeCard(frontUrl, null, condition);
  };

  const handleFrontFile = async (file) => {
    if (!file) return;
    setStep(STEP.UPLOADING);
    setError(null);
    setResult(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFrontUrl(file_url);
    setStep(STEP.CONDITION);
  };

  const handleBackFile = async (file) => {
    if (!file) return;
    setStep(STEP.UPLOADING_BACK);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setBackUrl(file_url);
    await analyzeCard(frontUrl, file_url, cardCondition);
  };

  const reset = () => {
    setStep(STEP.IDLE);
    setFrontUrl(null);
    setBackUrl(null);
    setResult(null);
    setError(null);
    setShowListings(false);
  };

  const id = result?.identification;
  const mkt = result?.market;
  const isGraded = id?.grading_company && id?.grade;

  return (
    <div className="space-y-6">

      {/* CONDITION — select raw vs graded */}
       {step === STEP.CONDITION && (
         <CardConditionModal 
           onSubmit={handleConditionSubmit}
           onCancel={() => { setStep(STEP.IDLE); setFrontUrl(null); }}
         />
       )}

      {/* IDLE — upload front */}
       {step === STEP.IDLE && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div
            onClick={() => frontGalleryRef.current?.click()}
            className="flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 bg-secondary/20 cursor-pointer transition-colors group"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Camera className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground mb-1">Tap to scan card front</p>
              <p className="text-sm text-muted-foreground">AI identifies the card and pulls live market value. Upload back if needed for more info.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={() => frontCamRef.current?.click()} className="border-border/50 gap-2">
              <Camera className="w-4 h-4" />Take Photo
            </Button>
            <Button type="button" variant="outline" onClick={() => frontGalleryRef.current?.click()} className="border-border/50 gap-2">
              <Upload className="w-4 h-4" />Upload from Gallery
            </Button>
          </div>

          <input ref={frontCamRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFrontFile(e.target.files[0])} />
          <input ref={frontGalleryRef} type="file" accept="image/*" className="hidden" onChange={e => handleFrontFile(e.target.files[0])} />
        </motion.div>
      )}

      {/* Loading: uploading or analyzing */}
      {(step === STEP.UPLOADING || step === STEP.ANALYZING || step === STEP.UPLOADING_BACK) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 py-14">
          <div className="flex gap-3">
            {frontUrl && (
              <div className="w-20 h-28 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/10">
                <img src={frontUrl} alt="front" className="w-full h-full object-cover" />
              </div>
            )}
            {backUrl && (
              <div className="w-20 h-28 rounded-xl overflow-hidden border-2 border-primary/20 shadow-md">
                <img src={backUrl} alt="back" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-semibold">
                {step === STEP.UPLOADING ? 'Uploading front...' : step === STEP.UPLOADING_BACK ? 'Uploading back...' : 'Analyzing card & fetching market data...'}
              </span>
            </div>
            {step === STEP.ANALYZING && (
              <p className="text-xs text-muted-foreground max-w-xs">Cross-referencing eBay, 130point.com, and Origins community trades</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Need back image */}
      {step === STEP.NEED_BACK && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {frontUrl && (
            <div className="w-20 h-28 rounded-xl overflow-hidden border-2 border-primary/20 mx-auto">
              <img src={frontUrl} alt="front" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <p className="font-semibold text-foreground">More info needed</p>
            <p className="text-sm text-muted-foreground">AI needs the back of this card to gather enough details (card number, set info, cert number, etc.).</p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button type="button" variant="outline" onClick={() => backCamRef.current?.click()} className="border-primary/30 text-primary gap-2">
                <Camera className="w-4 h-4" />Take Back Photo
              </Button>
              <Button type="button" variant="outline" onClick={() => backGalleryRef.current?.click()} className="border-primary/30 text-primary gap-2">
                <Upload className="w-4 h-4" />Upload Back
              </Button>
            </div>
            <button onClick={() => analyzeCard(frontUrl, null).then(() => {})} className="text-xs text-muted-foreground underline mt-1">
              Skip and continue with front only
            </button>
          </div>
          <input ref={backCamRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleBackFile(e.target.files[0])} />
          <input ref={backGalleryRef} type="file" accept="image/*" className="hidden" onChange={e => handleBackFile(e.target.files[0])} />
        </motion.div>
      )}

      {/* Error */}
      {step === STEP.ERROR && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {frontUrl && <img src={frontUrl} alt="card" className="w-24 h-36 object-cover rounded-xl border border-border/50 mx-auto" />}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <Button onClick={reset} variant="outline" className="w-full border-border/50">
            <RotateCcw className="w-4 h-4 mr-2" />Try Again
          </Button>
        </motion.div>
      )}

      {/* Results */}
      {step === STEP.DONE && result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Card images */}
          <div className="flex gap-3 items-start">
            <div className="flex gap-2 shrink-0">
              {frontUrl && (
                <div className="w-20 h-28 rounded-xl overflow-hidden border-2 border-primary/20 shadow-md">
                  <img src={frontUrl} alt="front" className="w-full h-full object-cover" />
                </div>
              )}
              {backUrl && (
                <div className="w-20 h-28 rounded-xl overflow-hidden border border-border/50 shadow-sm">
                  <img src={backUrl} alt="back" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-green-400 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Identified — {id?.confidence} confidence</span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground leading-tight">{id?.card_name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {[id?.year, id?.set_name, id?.card_number && `#${id.card_number}`].filter(Boolean).join(' · ')}
              </p>
              {isGraded && (
                <div className="flex items-center gap-1.5 mt-1.5 px-2 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 w-fit">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400">{id.grading_company} {id.grade}</span>
                  {id.cert_number && <span className="text-xs text-muted-foreground">#{id.cert_number}</span>}
                </div>
              )}
              {id?.condition_estimate && !isGraded && (
                <p className="text-xs text-muted-foreground mt-1">Visual condition: <span className="text-foreground">{id.condition_estimate}</span></p>
              )}
              {id?.visible_attributes?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {id.visible_attributes.map(a => (
                    <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{a}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Data quality warnings */}
          {mkt?.insufficient_data && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-sm text-destructive leading-relaxed">
                <strong>Not enough data</strong> — fewer than 3 confirmed sold listings were found. There is insufficient recent sales activity to determine a reliable market value for this card.
              </p>
            </div>
          )}
          {!mkt?.insufficient_data && mkt?.low_data && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-300 leading-relaxed">
                <strong>Limited data</strong> — only {mkt.total_confirmed_sales_count} confirmed sales found. Value estimate may not fully reflect current market.
              </p>
            </div>
          )}

          {/* Estimated value hero */}
          {mkt?.estimated_value != null && (
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 p-5 text-center">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1 flex items-center justify-center gap-1.5">
                <Star className="w-3.5 h-3.5" />Estimated Market Value
              </p>
              <p className="text-4xl font-display font-bold text-foreground">${mkt.estimated_value.toLocaleString()}</p>
              {mkt.value_range_low != null && mkt.value_range_high != null && (
                <p className="text-sm text-muted-foreground mt-1">Range: ${mkt.value_range_low} – ${mkt.value_range_high}</p>
              )}
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/40 border border-border/40">
                {isGraded
                  ? <><Award className="w-3 h-3 text-amber-400" /><span className="text-xs text-amber-400 font-semibold">{id.grading_company} {id.grade} — Graded sales only</span></>
                  : <><span className="text-xs text-muted-foreground">📋 Raw/Ungraded sales only — graded comps excluded</span></>
                }
              </div>
            </div>
          )}

          {/* Pop Report (graded cards) */}
          {id?.pop_report && (
            <div className="rounded-xl bg-amber-400/5 border border-amber-400/20 p-4">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />Population Report
              </p>
              <p className="text-sm text-foreground leading-relaxed">{id.pop_report}</p>
            </div>
          )}

          {/* Quick stats row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-card border border-amber-400/20 bg-amber-400/5 p-3 text-center">
              <Award className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{mkt?.psa_value != null ? `$${mkt.psa_value}` : '—'}</p>
              <p className="text-xs text-muted-foreground">PSA Value{mkt?.psa_grade_used ? ` (${mkt.psa_grade_used})` : ''}</p>
            </div>
            <div className="rounded-xl bg-card border border-blue-400/20 bg-blue-400/5 p-3 text-center">
              <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{mkt?.ebay_avg_24h != null ? `$${mkt.ebay_avg_24h}` : (mkt?.ebay_avg != null ? `$${mkt.ebay_avg}` : '—')}</p>
              <p className="text-xs text-muted-foreground">{mkt?.ebay_avg_24h != null ? 'eBay Avg (24h)' : 'eBay Avg'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-card border border-emerald-400/20 bg-emerald-400/5 p-3 text-center">
              <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{mkt?.point130_avg != null ? `$${mkt.point130_avg}` : '—'}</p>
              <p className="text-xs text-muted-foreground">130pt Avg</p>
            </div>
            <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
              <Handshake className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{result.internal_trades?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Show Trades</p>
            </div>
          </div>

          {/* Market summary */}
          {mkt?.market_summary && (
            <div className="rounded-xl bg-card border border-border/50 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Market Analysis</p>
              <p className="text-sm text-foreground leading-relaxed">{mkt.market_summary}</p>
            </div>
          )}

          {/* AI condition notes */}
          {id?.notes && (
            <div className="rounded-xl bg-secondary/30 border border-border/30 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Condition Notes</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{id.notes}</p>
            </div>
          )}

          {/* Internal trade comps */}
          {result.internal_trades?.length > 0 && (
            <div className="rounded-xl bg-card border border-border/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30 flex items-center gap-2">
                <Handshake className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-foreground">Origins Community Trades</span>
              </div>
              <div className="divide-y divide-border/20">
                {result.internal_trades.slice(0, 5).map((t, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground">{t.card_name} {t.set_name || ''}</p>
                      <p className="text-xs text-muted-foreground">{t.condition || 'raw'} · {t.event_name || 'Card show'}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-400">${(t.total_value || t.cash_paid || 0).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toggle full listings */}
          <button
            onClick={() => setShowListings(v => !v)}
            className="flex items-center justify-center gap-1.5 w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            {showListings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showListings ? 'Hide' : 'Show'} full sold listings
          </button>

          {showListings && (
            <div className="grid md:grid-cols-2 gap-4">
              <SoldListingsTable title="eBay Sold" icon={ShoppingCart} sales={mkt?.ebay_recent_sales || []} avg={mkt?.ebay_avg} low={mkt?.ebay_low} high={mkt?.ebay_high} salesCount={mkt?.ebay_sales_count} accentColor="text-blue-400" bgColor="bg-blue-400/10" borderColor="border-blue-400/20" />
              <SoldListingsTable title="130point.com" icon={TrendingUp} sales={mkt?.point130_recent_sales || []} avg={mkt?.point130_avg} low={mkt?.point130_low} high={mkt?.point130_high} salesCount={null} accentColor="text-emerald-400" bgColor="bg-emerald-400/10" borderColor="border-emerald-400/20" />
            </div>
          )}

          <Button onClick={reset} variant="outline" className="w-full border-border/50">
            <RotateCcw className="w-4 h-4 mr-2" />Scan Another Card
          </Button>
        </motion.div>
      )}
    </div>
  );
}