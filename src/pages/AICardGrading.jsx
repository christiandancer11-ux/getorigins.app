import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, Loader2, Lock, AlertCircle, RotateCcw } from 'lucide-react';
import UpgradeModal from '@/components/shared/UpgradeModal';
import GradingResults from '@/components/grading/GradingResults';

const STEPS = [
  {
    id: 'centering',
    label: 'Centering Analysis',
    title: 'Hold Your Card Still',
    instruction: 'Place your card flat and take a photo showing the full front. Make sure the entire card is visible so we can measure the borders on all four sides.',
    tip: '💡 Lay the card on a dark, flat surface for best results.',
    prompt: 'Take a clear photo of the full front of your card',
  },
  {
    id: 'centering_back',
    label: 'Back Centering',
    title: 'Flip to the Card Back',
    instruction: 'Now take a clear photo of the full card back. This lets us verify centering consistency on both sides.',
    tip: '💡 Same flat surface, same lighting as the front.',
    prompt: 'Take a photo of the full card back',
  },
  {
    id: 'surface',
    label: 'Surface Scratches',
    title: 'Move Card in the Light',
    instruction: 'Slowly tilt the card under a lamp or bright light. Take photos from a few angles so the AI can detect any surface scratches, print lines, or dimples.',
    tip: '💡 A phone flashlight held at an angle works great.',
    prompt: 'Take a surface scratch photo under raking light',
  },
  {
    id: 'corners',
    label: 'Corner Inspection',
    title: 'Show Us the Corners',
    instruction: 'Get close! Take a photo clearly showing all four corners of the card. Sharp, undamaged corners are critical for high grades.',
    tip: '💡 Macro mode on your phone camera helps here.',
    prompt: 'Take a close-up photo of all four corners',
  },
];

export default function AICardGrading() {
  const { isPro, loading: subLoading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState({});
  const [stepResults, setStepResults] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const step = STEPS[currentStep];
  const isComplete = finalResult !== null;

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCapturedImages(prev => ({ ...prev, [step.id]: { file, url } }));
  };

  const analyzeStep = async () => {
    const imageData = capturedImages[step.id];
    if (!imageData) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Upload image
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imageData.file });

      // Map step id to analysis type
      const analysisStep = step.id === 'centering_back' ? 'centering' : step.id;

      const res = await base44.functions.invoke('aiCardGrading', {
        imageUrls: [file_url],
        step: analysisStep,
      });

      setStepResults(prev => ({ ...prev, [step.id]: res.data.result }));

      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Run final analysis
        await runFinalAnalysis({ ...stepResults, [step.id]: res.data.result });
      }
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const runFinalAnalysis = async (allResults) => {
    setAnalyzing(true);
    try {
      const summary = JSON.stringify(allResults, null, 2);
      const res = await base44.functions.invoke('aiCardGrading', {
        imageUrls: [summary],
        step: 'final',
      });
      setFinalResult(res.data.result);
    } catch (err) {
      setError(err.message || 'Final analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setCapturedImages({});
    setStepResults({});
    setFinalResult(null);
    setError(null);
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
          <p className="text-muted-foreground mb-6">AI Card Grading is available on the Origins Pro plan. Get instant grading predictions from PSA, BGS, SGC, and CGC.</p>
          <Button onClick={() => setShowUpgrade(true)} className="w-full">Upgrade to Pro</Button>
        </motion.div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </div>
    );
  }

  if (isComplete) {
    return <GradingResults result={finalResult} images={capturedImages} onReset={reset} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6 pt-2">
          <h1 className="text-2xl font-bold font-display">AI Card Grading</h1>
          <p className="text-muted-foreground text-sm mt-1">Get grading predictions from PSA, BGS, SGC & CGC</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-500 ${
                i < currentStep ? 'bg-primary' :
                i === currentStep ? 'bg-primary/60' :
                'bg-muted'
              }`} />
              <p className={`text-xs mt-1 text-center truncate ${i === currentStep ? 'text-primary' : 'text-muted-foreground'}`}>
                {i < currentStep ? <CheckCircle2 className="w-3 h-3 inline" /> : s.label}
              </p>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 border-border bg-card mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">{currentStep + 1}</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{step.title}</h2>
                  <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
                </div>
              </div>

              <p className="text-sm text-foreground/90 mb-4 leading-relaxed">{step.instruction}</p>

              <div className="bg-muted/40 rounded-lg px-4 py-2 text-xs text-muted-foreground mb-6">
                {step.tip}
              </div>

              {/* Image Preview */}
              {capturedImages[step.id] ? (
                <div className="relative rounded-xl overflow-hidden mb-4">
                  <img src={capturedImages[step.id].url} alt="Captured" className="w-full object-cover max-h-64 rounded-xl" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg"
                  >
                    Retake
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl h-48 flex flex-col items-center justify-center gap-3 hover:border-primary/50 transition-colors mb-4"
                >
                  <Camera className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{step.prompt}</span>
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageCapture}
              />

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                disabled={!capturedImages[step.id] || analyzing}
                onClick={analyzeStep}
              >
                {analyzing ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Analyzing...</>
                ) : currentStep === STEPS.length - 1 ? (
                  'Analyze & Get Grades'
                ) : (
                  'Analyze & Continue'
                )}
              </Button>
            </Card>

            {/* Completed Steps Preview */}
            {currentStep > 0 && (
              <div className="flex gap-2 flex-wrap">
                {STEPS.slice(0, currentStep).map(s => (
                  <Badge key={s.id} className="bg-primary/10 text-primary border-primary/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> {s.label}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <button onClick={reset} className="mt-6 text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
          <RotateCcw className="w-3 h-3" /> Start Over
        </button>
      </div>
    </div>
  );
}