import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, RotateCcw, TrendingUp, ShoppingCart, Handshake, Star, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SoldListingsTable from './SoldListingsTable';

const STEP = { IDLE: 'idle', UPLOADING: 'uploading', ANALYZING: 'analyzing', DONE: 'done', ERROR: 'error' };

export default function CardScanner() {
  const [step, setStep] = useState(STEP.IDLE);
  const [imageUrl, setImageUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showListings, setShowListings] = useState(false);
  const fileRef = useRef();
  const galleryRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setStep(STEP.UPLOADING);
    setError(null);
    setResult(null);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setStep(STEP.ANALYZING);

    const res = await base44.functions.invoke('analyzeCardImage', { image_url: file_url });
    if (res.data?.error) {
      setError(res.data.error);
      setStep(STEP.ERROR);
    } else {
      setResult(res.data);
      setStep(STEP.DONE);
    }
  };

  const reset = () => {
    setStep(STEP.IDLE);
    setImageUrl(null);
    setResult(null);
    setError(null);
    setShowListings(false);
  };

  const id = result?.identification;
  const mkt = result?.market;

  return (
    <div className="space-y-6">
      {/* Upload area */}
      {step === STEP.IDLE && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => galleryRef.current?.click()}
            className="flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 bg-secondary/20 cursor-pointer transition-colors group"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Camera className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground mb-1">Tap to choose a photo</p>
              <p className="text-sm text-muted-foreground">AI identifies the card and pulls live market value from eBay, 130point, and Origins trades</p>
            </div>
          </div>

          {/* Two explicit buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} className="border-border/50 gap-2">
              <Camera className="w-4 h-4" />Take Photo
            </Button>
            <Button type="button" variant="outline" onClick={() => galleryRef.current?.click()} className="border-border/50 gap-2">
              <Upload className="w-4 h-4" />Upload from Gallery
            </Button>
          </div>

          {/* Camera input */}
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          {/* Gallery input — no capture attribute so it opens the file picker */}
          <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </motion.div>
      )}

      {/* Loading states */}
      {(step === STEP.UPLOADING || step === STEP.ANALYZING) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-5 py-14">
          {imageUrl && (
            <div className="w-24 h-36 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/10">
              <img src={imageUrl} alt="card" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-semibold">
                {step === STEP.UPLOADING ? 'Uploading image...' : 'Analyzing card & researching market value...'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              {step === STEP.ANALYZING ? 'Cross-referencing eBay, 130point.com, and Origins community trades' : ''}
            </p>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {step === STEP.ERROR && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {imageUrl && <img src={imageUrl} alt="card" className="w-24 h-36 object-cover rounded-xl border border-border/50 mx-auto" />}
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
          {/* Card image + identity */}
          <div className="flex gap-4 items-start">
            {imageUrl && (
              <div className="w-20 h-28 rounded-xl overflow-hidden border-2 border-primary/20 shadow-md shrink-0">
                <img src={imageUrl} alt="card" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-green-400 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Card identified — {id?.confidence} confidence</span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground leading-tight">{id?.card_name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {[id?.year, id?.set_name, id?.card_number && `#${id.card_number}`].filter(Boolean).join(' · ')}
              </p>
              {id?.condition_estimate && (
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

          {/* Estimated value hero */}
          {mkt?.estimated_value != null && (
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 p-5 text-center">
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1 flex items-center justify-center gap-1.5">
                <Star className="w-3.5 h-3.5" />Estimated Value
              </p>
              <p className="text-4xl font-display font-bold text-foreground">${mkt.estimated_value.toLocaleString()}</p>
              {mkt.value_range_low != null && mkt.value_range_high != null && (
                <p className="text-sm text-muted-foreground mt-1">Range: ${mkt.value_range_low} – ${mkt.value_range_high}</p>
              )}
            </div>
          )}

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
              <ShoppingCart className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{mkt?.ebay_avg != null ? `$${mkt.ebay_avg}` : '—'}</p>
              <p className="text-xs text-muted-foreground">eBay Avg</p>
            </div>
            <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
              <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-foreground">{mkt?.point130_avg != null ? `$${mkt.point130_avg}` : '—'}</p>
              <p className="text-xs text-muted-foreground">130pt Avg</p>
            </div>
            <div className="rounded-xl bg-card border border-border/50 p-3 text-center">
              <Handshake className="w-4 h-4 text-amber-400 mx-auto mb-1" />
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