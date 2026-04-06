import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Loader2, X, Camera, Sparkles, CheckCircle2, AlertCircle, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import CardConditionModal from '@/components/scan/CardConditionModal';

import { motion, AnimatePresence } from 'framer-motion';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ORG-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const STAGE = {
  UPLOAD: 'upload',
  CONDITION: 'condition',
  UPLOADING: 'uploading',
  ANALYZING: 'analyzing',
  GRADING_CHOICE: 'grading_choice',
  CUSTOM_PHOTOS: 'custom_photos',
  SAVING: 'saving',
  ERROR: 'error',
};

export default function RegisterCard() {
  const navigate = useNavigate();

  // Pre-fill cert/grader if arriving from a PSA QR scan
  const urlParams = new URLSearchParams(window.location.search);
  const prefillCert = urlParams.get('cert');
  const prefillGrader = urlParams.get('grader');

  const [stage, setStage] = useState(STAGE.UPLOAD);
  const [frontUrl, setFrontUrl] = useState(null);
  const [backUrl, setBackUrl] = useState(null);
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [error, setError] = useState(null);
  const [cardCondition, setCardCondition] = useState(null);

  const frontCamRef = useRef();
  const frontGalleryRef = useRef();
  const backCamRef = useRef();
  const backGalleryRef = useRef();
  const customFrontCamRef = useRef();
  const customFrontGalleryRef = useRef();
  const customBackCamRef = useRef();
  const customBackGalleryRef = useRef();



  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Card.create(data),
    onSuccess: (card) => navigate(`/cards/${card.id}`),
  });

  const uploadFile = async (file, setSide) => {
    if (setSide === 'front') setUploadingFront(true);
    else setUploadingBack(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (setSide === 'front') { setFrontUrl(file_url); setUploadingFront(false); }
    else { setBackUrl(file_url); setUploadingBack(false); }
    return file_url;
  };

  const handleConditionSubmit = (condition) => {
    setCardCondition(condition);
    setStage(STAGE.ANALYZING);
    handleAnalyze(frontUrl, backUrl, condition);
  };

  const handleAnalyze = async (front, back, condition) => {
    if (!front) return;
    setError(null);

    const res = await base44.functions.invoke('registerCardAI', { 
      front_url: front, 
      back_url: back || undefined,
      is_raw: condition.is_raw,
      grading_company: condition.grading_company,
      grade: condition.grade,
    });

    if (res.data?.error || res.data?.validation_failed) {
      setError(res.data.error || 'Could not identify card. Please try a clearer photo.');
      setStage(STAGE.ERROR);
      return;
    }

    setAiResult(res.data);

    // If graded and grading company found images, ask user
    if (res.data.is_graded && res.data.grading_images?.found) {
      setStage(STAGE.GRADING_CHOICE);
    } else {
      await saveCard(res.data, front, back);
    }
  };

  const saveCard = async (result, overrideFront, overrideBack) => {
    setStage(STAGE.SAVING);
    const id = result.identification;
    const cardData = {
      unique_code: generateCode(),
      name: id.name || 'Unknown Card',
      set_name: id.set_name || '',
      sport: id.sport || '',
      year: id.year || '',
      card_number: id.card_number || '',
      description: id.description || '',
      rarity: id.rarity || undefined,
      grading_company: id.grading_company || '',
      grade: id.grade || '',
      cert_number: id.cert_number || prefillCert || '',
      grading_company: id.grading_company || prefillGrader || '',
      image_url: overrideFront || frontUrl || '',
      image_back_url: overrideBack || backUrl || '',
    };
    // Remove empty strings for cleanliness
    Object.keys(cardData).forEach(k => { if (cardData[k] === '') delete cardData[k]; });
    createMutation.mutate(cardData);
  };

  const handleUseGradingPhotos = () => {
    const imgs = aiResult.grading_images;
    saveCard(aiResult, imgs.front_image_url, imgs.back_image_url || backUrl);
  };

  const handleUseOwnPhotos = () => {
    setStage(STAGE.CUSTOM_PHOTOS);
  };

  const handleCustomPhotoDone = async () => {
    await saveCard(aiResult, frontUrl, backUrl);
  };

  const id = aiResult?.identification;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-lg mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to My Cards
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Register a Card</h1>
          <p className="text-muted-foreground mb-8">Upload photos of your card — AI will identify it and fill in all the details for you.</p>

          <AnimatePresence mode="wait">

            {/* STAGE: UPLOAD */}
            {stage === STAGE.UPLOAD && (
              <motion.div key="upload" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="rounded-xl border border-border/50 bg-secondary/20 p-4 text-sm text-muted-foreground flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Upload a front photo (and optionally the back) — AI will automatically identify and fill in all card details. Only trading cards and graded slabs are allowed.</span>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {/* Front */}
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Front <span className="text-primary">*</span></p>
                    {frontUrl ? (
                      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 border-primary/30">
                        <img src={frontUrl} alt="Front" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setFrontUrl(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-border bg-muted/10 flex flex-col items-center justify-center gap-3 p-3">
                        {uploadingFront ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : (
                          <>
                            <div className="flex flex-col gap-2 w-full">
                              <button type="button" onClick={() => frontCamRef.current?.click()} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                                <Camera className="w-3.5 h-3.5" />Camera
                              </button>
                              <button type="button" onClick={() => frontGalleryRef.current?.click()} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border/50 text-muted-foreground text-xs hover:text-foreground hover:border-primary/30 transition-colors">
                                <Upload className="w-3.5 h-3.5" />Gallery
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <input ref={frontCamRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={async e => { const f = e.target.files[0]; if (f) await uploadFile(f, 'front'); }} />
                    <input ref={frontGalleryRef} type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files[0]; if (f) await uploadFile(f, 'front'); }} />
                  </div>

                  {/* Back */}
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Back <span className="text-muted-foreground text-xs font-normal">(optional)</span></p>
                    {backUrl ? (
                      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-border/50">
                        <img src={backUrl} alt="Back" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setBackUrl(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-border/40 bg-muted/5 flex flex-col items-center justify-center gap-3 p-3">
                        {uploadingBack ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : (
                          <>
                            <div className="flex flex-col gap-2 w-full">
                              <button type="button" onClick={() => backCamRef.current?.click()} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border/40 text-muted-foreground text-xs hover:text-foreground hover:border-primary/20 transition-colors">
                                <Camera className="w-3.5 h-3.5" />Camera
                              </button>
                              <button type="button" onClick={() => backGalleryRef.current?.click()} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border/40 text-muted-foreground text-xs hover:text-foreground hover:border-primary/20 transition-colors">
                                <Upload className="w-3.5 h-3.5" />Gallery
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    <input ref={backCamRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={async e => { const f = e.target.files[0]; if (f) await uploadFile(f, 'back'); }} />
                    <input ref={backGalleryRef} type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files[0]; if (f) await uploadFile(f, 'back'); }} />
                  </div>
                </div>

                <Button
                   onClick={() => setStage(STAGE.CONDITION)}
                   disabled={!frontUrl || uploadingFront || uploadingBack}
                   className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                 >
                   <Sparkles className="w-4 h-4" />
                   Identify Card with AI
                 </Button>
              </motion.div>
            )}

            {/* STAGE: CONDITION */}
             {stage === STAGE.CONDITION && (
               <CardConditionModal 
                 onSubmit={handleConditionSubmit}
                 onCancel={() => setStage(STAGE.UPLOAD)}
               />
             )}

            {/* STAGE: ANALYZING / UPLOADING / SAVING */}
             {(stage === STAGE.UPLOADING || stage === STAGE.ANALYZING || stage === STAGE.SAVING) && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6 py-16">
                <div className="flex gap-3">
                  {frontUrl && <div className="w-20 h-28 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg"><img src={frontUrl} alt="front" className="w-full h-full object-cover" /></div>}
                  {backUrl && <div className="w-20 h-28 rounded-xl overflow-hidden border border-border/50"><img src={backUrl} alt="back" className="w-full h-full object-cover" /></div>}
                </div>
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-semibold">
                      {stage === STAGE.SAVING ? 'Saving your card...' : 'AI is analyzing your card...'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    {stage === STAGE.ANALYZING ? 'Identifying card details, grading info, and looking up registry data...' : ''}
                  </p>
                </div>
              </motion.div>
            )}

            {/* STAGE: GRADING CHOICE */}
            {stage === STAGE.GRADING_CHOICE && aiResult && (
              <motion.div key="grading_choice" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="rounded-2xl bg-card border border-border/50 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Card identified — {id?.confidence} confidence</span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground">{id?.name}</h2>
                  <p className="text-sm text-muted-foreground">{[id?.year, id?.set_name, id?.card_number && `#${id.card_number}`].filter(Boolean).join(' · ')}</p>
                  {id?.grading_company && id?.grade && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-400/20 w-fit">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-400">{id.grading_company} {id.grade}</span>
                      {id?.cert_number && <span className="text-xs text-muted-foreground">#{id.cert_number}</span>}
                    </div>
                  )}
                </div>

                {/* Show grading company images */}
                {aiResult.grading_images?.front_image_url && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Photos from {id?.grading_company} registry:</p>
                    <div className="flex gap-3">
                      <div className="w-24 h-32 rounded-xl overflow-hidden border-2 border-amber-400/30">
                        <img src={aiResult.grading_images.front_image_url} alt="Registry front" className="w-full h-full object-cover" />
                      </div>
                      {aiResult.grading_images.back_image_url && (
                        <div className="w-24 h-32 rounded-xl overflow-hidden border border-border/50">
                          <img src={aiResult.grading_images.back_image_url} alt="Registry back" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                  <p className="font-semibold text-foreground text-center">Would you like to keep the pictures we got from the {id?.grading_company} website? Or use your own?</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handleUseGradingPhotos} className="h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                      Yes, keep them
                    </Button>
                    <Button onClick={handleUseOwnPhotos} variant="outline" className="h-11 border-border/50">
                      No, use mine
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STAGE: CUSTOM PHOTOS */}
            {stage === STAGE.CUSTOM_PHOTOS && (
              <motion.div key="custom_photos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="rounded-xl border border-border/50 bg-secondary/20 p-4 text-sm text-muted-foreground flex items-start gap-2">
                  <Camera className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Upload your own photos of the front and back of the card.</span>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {/* Front */}
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Front</p>
                    {frontUrl ? (
                      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border-2 border-primary/30">
                        <img src={frontUrl} alt="Front" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setFrontUrl(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <div className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-border bg-muted/10 flex flex-col items-center justify-center gap-2 p-3">
                        {uploadingFront ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : (
                          <>
                            <button type="button" onClick={() => customFrontCamRef.current?.click()} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium w-full"><Camera className="w-3.5 h-3.5" />Camera</button>
                            <button type="button" onClick={() => customFrontGalleryRef.current?.click()} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border/50 text-muted-foreground text-xs w-full"><Upload className="w-3.5 h-3.5" />Gallery</button>
                          </>
                        )}
                      </div>
                    )}
                    <input ref={customFrontCamRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={async e => { const f = e.target.files[0]; if (f) await uploadFile(f, 'front'); }} />
                    <input ref={customFrontGalleryRef} type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files[0]; if (f) await uploadFile(f, 'front'); }} />
                  </div>

                  {/* Back */}
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-2">Back</p>
                    {backUrl ? (
                      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-border/50">
                        <img src={backUrl} alt="Back" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setBackUrl(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <div className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-border/40 bg-muted/5 flex flex-col items-center justify-center gap-2 p-3">
                        {uploadingBack ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : (
                          <>
                            <button type="button" onClick={() => customBackCamRef.current?.click()} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border/40 text-muted-foreground text-xs w-full"><Camera className="w-3.5 h-3.5" />Camera</button>
                            <button type="button" onClick={() => customBackGalleryRef.current?.click()} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border/40 text-muted-foreground text-xs w-full"><Upload className="w-3.5 h-3.5" />Gallery</button>
                          </>
                        )}
                      </div>
                    )}
                    <input ref={customBackCamRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={async e => { const f = e.target.files[0]; if (f) await uploadFile(f, 'back'); }} />
                    <input ref={customBackGalleryRef} type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files[0]; if (f) await uploadFile(f, 'back'); }} />
                  </div>
                </div>

                <Button onClick={handleCustomPhotoDone} disabled={!frontUrl || uploadingFront || uploadingBack || createMutation.isPending} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Card
                </Button>
              </motion.div>
            )}

            {/* STAGE: ERROR */}
            {stage === STAGE.ERROR && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive mb-1">Unable to process image</p>
                    <p className="text-sm text-destructive/80">{error}</p>
                  </div>
                </div>
                <Button onClick={() => { setStage(STAGE.UPLOAD); setFrontUrl(null); setBackUrl(null); setError(null); }} variant="outline" className="w-full border-border/50">
                  Try Again
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
      </div>
    </div>
  );
}