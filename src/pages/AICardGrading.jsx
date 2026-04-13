import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { legacyApi } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Zap, Microscope, ChevronRight, Loader2, RotateCcw } from 'lucide-react';
import GradingResults from '@/components/grading/GradingResults';

// ── Step definitions ──────────────────────────────────────────────────────────
const QUICK_STEPS = [
  { id: 'front',   label: 'Card Front',  hint: 'Full front of the card' },
  { id: 'back',    label: 'Card Back',   hint: 'Full back of the card' },
];

const DEEP_STEPS = [
  { id: 'front',       label: 'Card Front',        hint: 'Full front of the card' },
  { id: 'back',        label: 'Card Back',          hint: 'Full back of the card' },
  { id: 'corner_tl',  label: 'Top-Left Corner',    hint: 'Close-up of top-left corner' },
  { id: 'corner_tr',  label: 'Top-Right Corner',   hint: 'Close-up of top-right corner' },
  { id: 'corner_bl',  label: 'Bottom-Left Corner', hint: 'Close-up of bottom-left corner' },
  { id: 'corner_br',  label: 'Bottom-Right Corner',hint: 'Close-up of bottom-right corner' },
  { id: 'surface',    label: 'Surface Video/Photo', hint: 'Tilt card under light to show surface' },
];

function stepToApiStep(stepId) {
  if (stepId === 'front' || stepId === 'back') return 'centering';
  if (stepId.startsWith('corner')) return 'corners';
  if (stepId === 'surface') return 'surface';
  return 'centering';
}

// ── Image capture ─────────────────────────────────────────────────────────────
function ImageCapture({ step, onCapture }) {
  const fileRef = useRef();
  const cameraRef = useRef();
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    const { file_url } = await legacyApi.integrations.Core.UploadFile({ file });
    setUploading(false);
    onCapture({ url: file_url, localUrl });
  };

  const isVideo = step.id === 'surface';

  return (
    <div className="space-y-4">
      <div
        className="relative w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border bg-muted/20 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          isVideo
            ? <video src={preview} className="w-full h-full object-cover" controls />
            : <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-6">
            <Camera className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{step.hint}</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tap to upload</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => cameraRef.current?.click()} className="gap-2">
          <Camera className="w-4 h-4" /> Camera
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
          <Upload className="w-4 h-4" /> Gallery
        </Button>
      </div>

      {/* hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept={isVideo ? 'video/*,image/*' : 'image/*'}
        capture="environment"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept={isVideo ? 'video/*,image/*' : 'image/*'}
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AICardGrading() {
  const [phase, setPhase] = useState('cardType'); // cardType → mode → capture → analyzing → results
  const [cardType, setCardType] = useState(null);  // 'sports' | 'tcg'
  const [analysisMode, setAnalysisMode] = useState(null); // 'quick' | 'deep'
  const [stepIndex, setStepIndex] = useState(0);
  const [captures, setCaptures] = useState({});    // { stepId: { url, localUrl } }
  const [currentCapture, setCurrentCapture] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const steps = analysisMode === 'quick' ? QUICK_STEPS : DEEP_STEPS;
  const currentStep = steps[stepIndex];

  const reset = () => {
    setPhase('cardType');
    setCardType(null);
    setAnalysisMode(null);
    setStepIndex(0);
    setCaptures({});
    setCurrentCapture(null);
    setResult(null);
  };

  const handleNextStep = async () => {
    if (!currentCapture) return;

    const newCaptures = { ...captures, [currentStep.id]: currentCapture };
    setCaptures(newCaptures);
    setCurrentCapture(null);

    const isLast = stepIndex === steps.length - 1;
    if (!isLast) {
      setStepIndex(i => i + 1);
      return;
    }

    // All steps done — run analysis
    setPhase('analyzing');
    setAnalyzing(true);

    try {
      const stepResults = [];

      // Analyze each step
      for (const step of steps) {
        const cap = newCaptures[step.id];
        const apiStep = stepToApiStep(step.id);
        const res = await legacyApi.functions.invoke('aiCardGrading', {
          imageUrls: [cap.url],
          step: apiStep,
          stepId: step.id,
          cardType,
          analysisMode,
        });
        stepResults.push({ stepId: step.id, apiStep, data: res.data?.result });
      }

      // Final aggregation
      const summaryText = stepResults.map(s => `[${s.stepId}]: ${JSON.stringify(s.data)}`).join('\n\n');
      const finalRes = await legacyApi.functions.invoke('aiCardGrading', {
        imageUrls: [summaryText],
        step: 'final',
        cardType,
        analysisMode,
      });

      setResult(finalRes.data?.result);
      setPhase('results');
    } catch (err) {
      console.error(err);
      alert('Analysis failed: ' + err.message);
      setPhase('capture');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (phase === 'results') {
    return <GradingResults result={result} images={captures} onReset={reset} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto">
        <div className="mb-6 pt-2">
          <h1 className="text-2xl font-bold font-display">AI Card Grading</h1>
          <p className="text-muted-foreground text-sm mt-1">Get a PSA / BGS / SGC / CGC grade estimate</p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Card type selection ── */}
          {phase === 'cardType' && (
            <motion.div key="cardType" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">What type of card?</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'sports', label: 'Sports Card', emoji: '🏈' },
                  { id: 'tcg',   label: 'TCG Card',    emoji: '🎴' },
                ].map(opt => (
                  <Card
                    key={opt.id}
                    className="p-5 cursor-pointer border-border hover:border-primary/50 transition-colors text-center"
                    onClick={() => { setCardType(opt.id); setPhase('mode'); }}
                  >
                    <div className="text-3xl mb-2">{opt.emoji}</div>
                    <div className="font-semibold">{opt.label}</div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Mode selection ── */}
          {phase === 'mode' && (
            <motion.div key="mode" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">Choose analysis type</p>

              <Card
                className="p-5 cursor-pointer border-border hover:border-primary/50 transition-colors"
                onClick={() => { setAnalysisMode('quick'); setPhase('capture'); }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold">Quick Analysis</span>
                  <Badge variant="secondary" className="ml-auto text-xs">2 photos</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Front + back photos. Fast ~1 min estimate. Good for a quick check.</p>
              </Card>

              <Card
                className="p-5 cursor-pointer border-border hover:border-primary/50 transition-colors"
                onClick={() => { setAnalysisMode('deep'); setPhase('capture'); }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Microscope className="w-5 h-5 text-primary" />
                  <span className="font-bold">In-Depth Analysis</span>
                  <Badge className="ml-auto text-xs">7 steps</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Front, back, all 4 corner close-ups, plus a surface inspection photo/video. Most accurate.</p>
              </Card>

              <Button variant="ghost" className="w-full mt-2" onClick={() => setPhase('cardType')}>
                ← Back
              </Button>
            </motion.div>
          )}

          {/* ── Capture steps ── */}
          {phase === 'capture' && (
            <motion.div key={`capture-${stepIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Progress */}
              <div className="flex items-center gap-2 mb-4">
                {steps.map((s, i) => (
                  <div
                    key={s.id}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${i < stepIndex ? 'bg-primary' : i === stepIndex ? 'bg-primary/60' : 'bg-muted'}`}
                  />
                ))}
              </div>

              <div className="mb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Step {stepIndex + 1} of {steps.length}</p>
                <h2 className="text-lg font-bold">{currentStep.label}</h2>
              </div>

              <ImageCapture step={currentStep} onCapture={setCurrentCapture} />

              <div className="flex gap-2 mt-4">
                <Button
                  variant="ghost"
                  onClick={() => stepIndex === 0 ? setPhase('mode') : setStepIndex(i => i - 1)}
                  className="flex-1"
                >
                  ← Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  disabled={!currentCapture}
                  onClick={handleNextStep}
                >
                  {stepIndex === steps.length - 1 ? 'Analyze' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Analyzing ── */}
          {phase === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">Analyzing your card…</h2>
              <p className="text-muted-foreground text-sm">This may take 30–60 seconds. Please wait.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

