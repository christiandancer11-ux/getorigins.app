import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Plus, Calculator, Loader2, Lock, AlertCircle,
  RotateCcw, CheckCircle2, ChevronDown, ChevronUp, Trash2, ImagePlus
} from 'lucide-react';
import UpgradeModal from '@/components/shared/UpgradeModal';
import SportBadge from '@/components/shared/SportBadge';

const PERCENTAGES = [
  { label: '90%', value: 0.9, color: 'text-green-400' },
  { label: '80%', value: 0.8, color: 'text-amber-400' },
  { label: '70%', value: 0.7, color: 'text-orange-400' },
  { label: '60%', value: 0.6, color: 'text-red-400' },
];

function CardEntry({ card, index, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isAnalyzing = card.status === 'analyzing';
  const isError = card.status === 'error';
  const isDone = card.status === 'done';

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
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              Analyzing card {index + 1}...
            </div>
          )}
          {isError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-3.5 h-3.5" />
              Could not identify
            </div>
          )}
          {isDone && card.result && (
            <div>
              <p className="font-medium text-sm text-foreground truncate">{card.result.card_name}</p>
              <p className="text-xs text-muted-foreground truncate">{[card.result.year, card.result.set_name].filter(Boolean).join(' · ')}</p>
              {card.result.variant && <p className="text-xs text-primary/80">{card.result.variant}</p>}
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
          {isDone && (
            <button onClick={() => setExpanded(v => !v)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
              {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
          )}
          <button onClick={() => onDelete(index)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {/* Expanded notes */}
      {expanded && isDone && card.result && (
        <div className="px-3 pb-3 border-t border-border/30 pt-2">
          <div className="flex flex-wrap gap-1 mb-2">
            {card.result.sport && <SportBadge sport={card.result.sport} />}
            <Badge className="text-xs bg-secondary border-border/50">{card.result.condition || 'Raw'}</Badge>
            <Badge className={`text-xs ${card.result.confidence === 'high' ? 'bg-green-500/10 text-green-400 border-green-500/20' : card.result.confidence === 'medium' ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {card.result.confidence} confidence
            </Badge>
          </div>
          {card.result.notes && <p className="text-xs text-muted-foreground leading-relaxed">{card.result.notes}</p>}
        </div>
      )}
    </motion.div>
  );
}

export default function BulkDealCalculator() {
  const { isPro, loading: subLoading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [cards, setCards] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [captureMode, setCaptureMode] = useState(null); // 'front' | 'back'
  const [pendingFront, setPendingFront] = useState(null); // { file, url }
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const addRef = useRef(null);

  const totalValue = cards
    .filter(c => c.status === 'done' && c.result?.estimated_value)
    .reduce((sum, c) => sum + (c.result.estimated_value || 0), 0);

  const analyzingCount = cards.filter(c => c.status === 'analyzing').length;
  const doneCount = cards.filter(c => c.status === 'done').length;

  const handleFrontCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = '';
    const url = URL.createObjectURL(file);
    setPendingFront({ file, url });
    // Prompt for back
    setCaptureMode('back');
    setTimeout(() => backRef.current?.click(), 300);
  };

  const handleBackCapture = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';

    let backData = null;
    if (file) {
      backData = { file, url: URL.createObjectURL(file) };
    }

    if (!pendingFront) return;

    // Add card with analyzing status
    const newCard = {
      id: Date.now(),
      frontUrl: pendingFront.url,
      backUrl: backData?.url || null,
      status: 'analyzing',
      result: null,
    };
    const cardIndex = cards.length;
    setCards(prev => [...prev, newCard]);
    setPendingFront(null);
    setCaptureMode(null);

    // Upload and analyze
    try {
      const uploadedUrls = [];
      const { file_url: frontFileUrl } = await base44.integrations.Core.UploadFile({ file: pendingFront.file });
      uploadedUrls.push(frontFileUrl);

      if (backData?.file) {
        const { file_url: backFileUrl } = await base44.integrations.Core.UploadFile({ file: backData.file });
        uploadedUrls.push(backFileUrl);
      }

      const res = await base44.functions.invoke('bulkDealCalculator', {
        imageUrls: uploadedUrls,
        cardIndex,
      });

      setCards(prev => prev.map(c =>
        c.id === newCard.id ? { ...c, status: res.data?.result ? 'done' : 'error', result: res.data?.result || null } : c
      ));
    } catch {
      setCards(prev => prev.map(c =>
        c.id === newCard.id ? { ...c, status: 'error' } : c
      ));
    }
  };

  const handleSkipBack = () => {
    // Simulate a capture with no file
    setCaptureMode(null);
    if (!pendingFront) return;

    const newCard = {
      id: Date.now(),
      frontUrl: pendingFront.url,
      backUrl: null,
      status: 'analyzing',
      result: null,
    };
    const cardIndex = cards.length;
    setCards(prev => [...prev, newCard]);

    const front = pendingFront;
    setPendingFront(null);

    base44.integrations.Core.UploadFile({ file: front.file })
      .then(({ file_url }) => base44.functions.invoke('bulkDealCalculator', { imageUrls: [file_url], cardIndex }))
      .then(res => {
        setCards(prev => prev.map(c =>
          c.id === newCard.id ? { ...c, status: res.data?.result ? 'done' : 'error', result: res.data?.result || null } : c
        ));
      })
      .catch(() => {
        setCards(prev => prev.map(c =>
          c.id === newCard.id ? { ...c, status: 'error' } : c
        ));
      });
  };

  const deleteCard = (index) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  const reset = () => {
    setCards([]);
    setPendingFront(null);
    setCaptureMode(null);
  };

  const startAddCard = () => {
    setPendingFront(null);
    setCaptureMode('front');
    setTimeout(() => frontRef.current?.click(), 100);
  };

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
    <div className="min-h-screen bg-background pb-32">
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
          <p className="text-sm text-muted-foreground">Scan card fronts & backs — AI identifies each card and calculates your lot value.</p>
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
                <CardEntry key={card.id} card={card} index={i} onDelete={deleteCard} />
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
            <p className="text-foreground font-medium mb-1">No cards scanned yet</p>
            <p className="text-sm text-muted-foreground max-w-xs">Tap "Add Card" to start scanning. The AI will identify each card and estimate its value.</p>
          </motion.div>
        )}

        {/* Add Card Button */}
        {captureMode !== 'back' && (
          <Button
            onClick={startAddCard}
            variant="outline"
            className="w-full border-dashed border-border/60 gap-2 text-muted-foreground hover:text-foreground hover:border-primary/40 mb-6"
            disabled={analyzingCount > 0}
          >
            <Plus className="w-4 h-4" />
            {cards.length === 0 ? 'Scan First Card' : 'Add Another Card'}
          </Button>
        )}

        {/* Status bar */}
        {cards.length > 0 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{doneCount} of {cards.length} analyzed</span>
            {analyzingCount > 0 && (
              <span className="flex items-center gap-1 text-primary">
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing {analyzingCount}...
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
              {/* Total */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">Lot Value ({doneCount} card{doneCount !== 1 ? 's' : ''})</p>
                  <p className="text-3xl font-bold text-primary font-display">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                </div>
                <button onClick={reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              {/* Percentage Offers */}
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

              {analyzingCount > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  ⏳ {analyzingCount} more card{analyzingCount !== 1 ? 's' : ''} still being analyzed — value will update
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}