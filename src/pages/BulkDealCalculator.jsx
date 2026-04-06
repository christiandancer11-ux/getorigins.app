import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Plus, Calculator, Loader2, Lock, AlertCircle,
  RotateCcw, ChevronDown, ChevronUp, Trash2, ImagePlus,
  Sparkles, MessageSquarePlus, CheckCircle2, X
} from 'lucide-react';
import UpgradeModal from '@/components/shared/UpgradeModal';
import SportBadge from '@/components/shared/SportBadge';

const PERCENTAGES = [
  { label: '90%', value: 0.9, color: 'text-green-400' },
  { label: '80%', value: 0.8, color: 'text-amber-400' },
  { label: '70%', value: 0.7, color: 'text-orange-400' },
  { label: '60%', value: 0.6, color: 'text-red-400' },
];

// ── Correction modal ──────────────────────────────────────────────────────────
function CorrectionModal({ card, onClose, onCorrected }) {
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!hint.trim()) return;
    setLoading(true);
    try {
      const urls = [card.frontUrl, card.backUrl].filter(Boolean);
      const res = await base44.functions.invoke('bulkDealCalculator', {
        imageUrls: urls,
        correctionHint: hint.trim(),
      });
      if (res.data?.result) {
        onCorrected(res.data.result);
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <p className="font-semibold text-sm text-foreground flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-primary" /> Help the AI correct this card
          </p>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Show thumbnails */}
          <div className="flex gap-2">
            {card.frontUrl && <img src={card.frontUrl} className="w-12 h-16 object-cover rounded-lg border border-border/50" alt="Front" />}
            {card.backUrl && <img src={card.backUrl} className="w-12 h-16 object-cover rounded-lg border border-border/50" alt="Back" />}
            {card.result && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">AI identified as:</p>
                <p className="text-sm font-semibold text-foreground truncate">{card.result.card_name}</p>
                <p className="text-xs text-muted-foreground truncate">{[card.result.year, card.result.set_name].filter(Boolean).join(' · ')}</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              What did the AI get wrong? Be specific — player name, year, set, variant, grade, etc.
            </label>
            <textarea
              className="w-full bg-secondary/30 border border-border/50 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              rows={3}
              placeholder="e.g. This is a 2018 Topps Chrome Shohei Ohtani RC, not 2019. It's a PSA 9 not a PSA 10."
              value={hint}
              onChange={e => setHint(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-border/40">
          <Button variant="outline" className="border-border/50 flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button
            className="bg-primary text-primary-foreground flex-1 gap-1.5"
            onClick={submit}
            disabled={!hint.trim() || loading}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Re-analyze
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Card row ─────────────────────────────────────────────────────────────────
function CardEntry({ card, index, onDelete, onCorrect }) {
  const [expanded, setExpanded] = useState(false);
  const isAnalyzing = card.status === 'analyzing';
  const isError = card.status === 'error';
  const isDone = card.status === 'done';
  const isPending = card.status === 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="flex items-center gap-3 p-3">
        {/* Thumbnails */}
        <div className="flex gap-1 shrink-0">
          {card.frontUrl && (
            <img src={card.frontUrl} className="w-10 h-14 object-cover rounded-lg border border-border/50" alt="Front" />
          )}
          {card.backUrl && (
            <img src={card.backUrl} className="w-10 h-14 object-cover rounded-lg border border-border/50" alt="Back" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {isPending && (
            <p className="text-sm text-muted-foreground">Card {index + 1} — ready to analyze</p>
          )}
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              Analyzing card {index + 1}...
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-3.5 h-3.5" />
              Could not identify — try correcting
            </div>
          )}
          {isDone && card.result && (
            <div>
              <p className="font-medium text-sm text-foreground truncate">{card.result.card_name}</p>
              <p className="text-xs text-muted-foreground truncate">{[card.result.year, card.result.set_name].filter(Boolean).join(' · ')}</p>
              {card.result.variant && <p className="text-xs text-primary/80 truncate">{card.result.variant}</p>}
              <p className="text-sm font-bold text-primary mt-0.5">
                ${card.result.estimated_value?.toLocaleString() ?? '?'}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  (${card.result.value_range_low?.toLocaleString()}–${card.result.value_range_high?.toLocaleString()})
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {(isDone || isError) && (
            <button
              onClick={() => onCorrect(card)}
              className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
              title="Correct AI identification"
            >
              <MessageSquarePlus className="w-4 h-4 text-muted-foreground hover:text-primary" />
            </button>
          )}
          {isDone && (
            <button onClick={() => setExpanded(v => !v)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          )}
          <button onClick={() => onDelete(card.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && isDone && card.result && (
        <div className="px-3 pb-3 border-t border-border/30 pt-2 space-y-2">
          <div className="flex flex-wrap gap-1">
            {card.result.sport && <SportBadge sport={card.result.sport} />}
            <Badge className="text-xs bg-secondary border-border/50">{card.result.condition || 'Raw'}</Badge>
            <Badge className={`text-xs ${card.result.confidence === 'high' ? 'bg-green-500/10 text-green-400 border-green-500/20' : card.result.confidence === 'medium' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {card.result.confidence} confidence
            </Badge>
            {card.result.is_graded && card.result.grading_company && (
              <Badge className="text-xs bg-amber-400/10 text-amber-400 border-amber-400/20">
                {card.result.grading_company} {card.result.grade}
              </Badge>
            )}
          </div>

          {/* Market sources breakdown */}
          <div className="grid grid-cols-3 gap-1.5">
            {card.result.ebay_avg != null && (
              <div className="rounded-lg bg-secondary/40 p-2 text-center">
                <p className="text-[10px] text-muted-foreground">eBay Avg</p>
                <p className="text-xs font-semibold text-foreground">${card.result.ebay_avg?.toLocaleString()}</p>
                {card.result.ebay_sales_count != null && <p className="text-[10px] text-muted-foreground">{card.result.ebay_sales_count} sales</p>}
              </div>
            )}
            {card.result.point130_avg != null && (
              <div className="rounded-lg bg-secondary/40 p-2 text-center">
                <p className="text-[10px] text-muted-foreground">130pt Avg</p>
                <p className="text-xs font-semibold text-foreground">${card.result.point130_avg?.toLocaleString()}</p>
              </div>
            )}
            {card.result.tcgplayer_market_price != null && (
              <div className="rounded-lg bg-secondary/40 p-2 text-center">
                <p className="text-[10px] text-muted-foreground">TCGPlayer</p>
                <p className="text-xs font-semibold text-foreground">${card.result.tcgplayer_market_price?.toLocaleString()}</p>
              </div>
            )}
            {card.result.average_sold_price != null && (
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-2 text-center col-span-3">
                <p className="text-[10px] text-primary/70">Combined Avg Sold Price</p>
                <p className="text-sm font-bold text-primary">${card.result.average_sold_price?.toLocaleString()}</p>
              </div>
            )}
          </div>

          {card.result.notes && <p className="text-xs text-muted-foreground leading-relaxed">{card.result.notes}</p>}
        </div>
      )}
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BulkDealCalculator() {
  const { isPro, loading: subLoading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [cards, setCards] = useState([]);
  const [captureMode, setCaptureMode] = useState(null); // 'front' | 'back'
  const [pendingFront, setPendingFront] = useState(null);
  const [correctionCard, setCorrectionCard] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const frontRef = useRef(null);
  const backRef = useRef(null);

  const pendingCount = cards.filter(c => c.status === 'pending').length;
  const analyzingCount = cards.filter(c => c.status === 'analyzing').length;
  const doneCount = cards.filter(c => c.status === 'done').length;
  const hasAnalyzed = doneCount > 0;
  const canAnalyze = pendingCount > 0 && !isAnalyzing;

  const totalValue = cards
    .filter(c => c.status === 'done' && c.result?.estimated_value)
    .reduce((sum, c) => sum + (c.result.estimated_value || 0), 0);

  // ── Image capture ──
  const handleFrontCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const url = URL.createObjectURL(file);
    setPendingFront({ file, url });
    setCaptureMode('back');
    setTimeout(() => backRef.current?.click(), 300);
  };

  const handleBackCapture = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    const backData = file ? { file, url: URL.createObjectURL(file) } : null;
    addPendingCard(backData);
  };

  const handleSkipBack = () => {
    setCaptureMode(null);
    addPendingCard(null);
  };

  const addPendingCard = (backData) => {
    if (!pendingFront) return;
    const newCard = {
      id: Date.now(),
      frontFile: pendingFront.file,
      backFile: backData?.file || null,
      frontUrl: pendingFront.url,
      backUrl: backData?.url || null,
      status: 'pending',
      result: null,
    };
    setCards(prev => [...prev, newCard]);
    setPendingFront(null);
    setCaptureMode(null);
  };

  const startAddCard = () => {
    setPendingFront(null);
    setCaptureMode('front');
    setTimeout(() => frontRef.current?.click(), 100);
  };

  // ── Analyze all pending ──
  const analyzeAll = async () => {
    const toAnalyze = cards.filter(c => c.status === 'pending');
    if (toAnalyze.length === 0) return;
    setIsAnalyzing(true);

    // Mark all as analyzing
    setCards(prev => prev.map(c => toAnalyze.find(t => t.id === c.id) ? { ...c, status: 'analyzing' } : c));

    // Analyze in parallel
    await Promise.all(
      toAnalyze.map(async (card) => {
        try {
          const uploadedUrls = [];
          const { file_url: frontUrl } = await base44.integrations.Core.UploadFile({ file: card.frontFile });
          uploadedUrls.push(frontUrl);
          if (card.backFile) {
            const { file_url: backUrl } = await base44.integrations.Core.UploadFile({ file: card.backFile });
            uploadedUrls.push(backUrl);
          }
          const res = await base44.functions.invoke('bulkDealCalculator', { imageUrls: uploadedUrls });
          setCards(prev => prev.map(c =>
            c.id === card.id
              ? { ...c, status: res.data?.result ? 'done' : 'error', result: res.data?.result || null }
              : c
          ));
        } catch {
          setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'error' } : c));
        }
      })
    );

    setIsAnalyzing(false);
  };

  // ── Correction ──
  const handleCorrected = (cardId, newResult) => {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, status: 'done', result: newResult } : c));
  };

  const deleteCard = (id) => setCards(prev => prev.filter(c => c.id !== id));
  const reset = () => { setCards([]); setPendingFront(null); setCaptureMode(null); };

  if (subLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Pro Feature</h2>
          <p className="text-muted-foreground mb-6">The AI Bulk Deal Calculator is available on the Origins Pro plan. Scan entire lots and know exactly what to pay.</p>
          <Button onClick={() => setShowUpgrade(true)} className="w-full">Upgrade to Pro</Button>
        </motion.div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-48">
      {/* Hidden file inputs */}
      <input ref={frontRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFrontCapture} />
      <input ref={backRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleBackCapture} />

      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold font-display">Bulk Deal Calculator</h1>
            <Badge className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20">PRO</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Add all your cards first, then tap <strong className="text-foreground">Analyze</strong> — AI values every card at once.</p>
        </div>

        {/* Back capture prompt */}
        <AnimatePresence>
          {captureMode === 'back' && pendingFront && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 p-4"
            >
              <div className="flex items-center gap-4">
                <img src={pendingFront.url} className="w-12 h-16 object-cover rounded-lg border border-border" alt="Front" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground mb-1">Got the front! 👍</p>
                  <p className="text-xs text-muted-foreground mb-3">Now take a photo of the <strong>card back</strong>, or skip if you only have the front.</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => backRef.current?.click()} className="flex-1 gap-1.5 text-xs">
                      <Camera className="w-3.5 h-3.5" /> Capture Back
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleSkipBack} className="text-xs border-border/50">
                      Skip
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cards List */}
        {cards.length > 0 && (
          <div className="space-y-2 mb-4">
            <AnimatePresence>
              {cards.map((card, i) => (
                <CardEntry
                  key={card.id}
                  card={card}
                  index={i}
                  onDelete={deleteCard}
                  onCorrect={setCorrectionCard}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state */}
        {cards.length === 0 && captureMode !== 'back' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <ImagePlus className="w-10 h-10 text-primary/60" />
            </div>
            <p className="text-foreground font-medium mb-1">No cards added yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">Add all your cards first, then tap "Analyze All" to get values for the entire lot at once.</p>
          </motion.div>
        )}

        {/* Add Card Button */}
        {captureMode !== 'back' && (
          <Button
            onClick={startAddCard}
            variant="outline"
            className="w-full border-dashed border-border/60 gap-2 text-muted-foreground hover:text-foreground hover:border-primary/40"
            disabled={isAnalyzing}
          >
            <Plus className="w-4 h-4" />
            {cards.length === 0 ? 'Add First Card' : 'Add Another Card'}
          </Button>
        )}

        {/* Analyze button — shown when there are pending cards */}
        <AnimatePresence>
          {pendingCount > 0 && captureMode !== 'back' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3"
            >
              <Button
                onClick={analyzeAll}
                disabled={!canAnalyze}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 text-base font-semibold"
              >
                {isAnalyzing
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing {analyzingCount} card{analyzingCount !== 1 ? 's' : ''}...</>
                  : <><Sparkles className="w-5 h-5" /> Analyze {pendingCount} Card{pendingCount !== 1 ? 's' : ''}</>
                }
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-1.5">
                {hasAnalyzed ? 'New cards will be added to your existing results.' : 'AI will search recent sales and value each card.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status bar */}
        {cards.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
            <span>{doneCount} of {cards.length} analyzed</span>
            {isAnalyzing && (
              <span className="flex items-center gap-1 text-primary">
                <Loader2 className="w-3 h-3 animate-spin" />
                Working...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Sticky Bottom Results Panel */}
      <AnimatePresence>
        {doneCount > 0 && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border/60 shadow-2xl"
          >
            <div className="max-w-lg mx-auto p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Lot Value ({doneCount} card{doneCount !== 1 ? 's' : ''})</p>
                  <p className="text-3xl font-bold text-primary font-display">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>
                <button onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {PERCENTAGES.map(({ label, value, color }) => {
                  const offerVal = Math.round(totalValue * value);
                  return (
                    <div key={label} className="rounded-xl bg-secondary/50 border border-border/40 p-2 text-center">
                      <p className={`text-xs font-bold ${color} mb-0.5`}>{label}</p>
                      <p className="text-sm font-semibold text-foreground">${offerVal.toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>

              {isAnalyzing && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  ⏳ Analyzing remaining cards — total will update
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Correction modal */}
      <AnimatePresence>
        {correctionCard && (
          <CorrectionModal
            card={correctionCard}
            onClose={() => setCorrectionCard(null)}
            onCorrected={(result) => {
              handleCorrected(correctionCard.id, result);
              setCorrectionCard(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}