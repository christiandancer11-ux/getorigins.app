/**
 * CertLookupEntry — lets a user scan a slab photo OR manually enter a cert number
 * to link a graded card to their Origins card. The AI identifies which grading
 * company the slab belongs to so numbers from different companies never collide.
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, Camera, Upload, Loader2, Search, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_COMPANIES, getCompany } from '@/lib/gradingCompanies';

const MODES = { IDLE: 'idle', UPLOADING: 'uploading', IDENTIFYING: 'identifying', MANUAL: 'manual', RESULT: 'result', ERROR: 'error' };

export default function CertLookupEntry({ onClose }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(MODES.IDLE);
  const [imageUrl, setImageUrl] = useState(null);
  const [detectedCompany, setDetectedCompany] = useState('');
  const [certInput, setCertInput] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('PSA');
  const [error, setError] = useState(null);
  const camRef = useRef();
  const galleryRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setMode(MODES.UPLOADING);
    setError(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setMode(MODES.IDENTIFYING);

    // AI identifies grading company + cert number from the slab photo
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert in trading card grading company slabs. Analyze this image carefully.

Each grading company has a DISTINCT slab appearance:
- PSA: bright red label, white background slab, "PSA" logo prominently displayed, cert number is 8 digits
- BGS (Beckett): black label with colored tier indicators (gold/black/pristine), "BGS" or "BCCG" logo, cert is 7-10 digits
- SGC: black slab with red label, "SGC" logo, cert is typically 7-8 digits  
- CGC (Cards): blue label, holographic seal, "CGC" logo with "Trading Cards" text, cert is 10+ digits
- HGA: distinctive multicolor grade display showing subgrades prominently, "HGA" logo
- CSG: silver/gray label, "CSG" logo, Certified Sports Guaranty branding
- ACE: ACE logo, British grading company

Identify:
1. Which grading company this slab is from (MUST be one of: PSA, BGS, SGC, CGC, HGA, CSG, ACE, or UNKNOWN)
2. The certification/serial number visible on the label
3. The grade shown
4. Whether you are confident this is a graded slab (not a raw card)

Return JSON:
- grading_company: string (PSA/BGS/SGC/CGC/HGA/CSG/ACE/UNKNOWN)
- cert_number: string or null
- grade: string or null  
- is_graded_slab: boolean
- confidence: "high" | "medium" | "low"
- notes: any relevant observations about label visibility`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          grading_company: { type: 'string' },
          cert_number: { type: 'string' },
          grade: { type: 'string' },
          is_graded_slab: { type: 'boolean' },
          confidence: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    });

    if (!result.is_graded_slab) {
      setError('Could not identify a graded slab in this image. Please try a clearer photo of the label.');
      setMode(MODES.ERROR);
      return;
    }

    if (result.grading_company && result.grading_company !== 'UNKNOWN' && result.cert_number) {
      // Auto-detected — navigate directly
      navigate(`/graded/${result.grading_company.toLowerCase()}/${result.cert_number}`);
      onClose?.();
    } else {
      // Partial — got company but no cert, or unknown company
      setDetectedCompany(result.grading_company !== 'UNKNOWN' ? result.grading_company : '');
      setCertInput(result.cert_number || '');
      setSelectedCompany(result.grading_company !== 'UNKNOWN' ? result.grading_company : 'PSA');
      setMode(MODES.MANUAL);
    }
  };

  const handleManualLookup = () => {
    if (!certInput.trim() || !selectedCompany) return;
    navigate(`/graded/${selectedCompany.toLowerCase()}/${certInput.trim()}`);
    onClose?.();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-4 h-4 text-amber-400" />
        <h3 className="font-semibold text-foreground text-sm">Look Up Graded Slab</h3>
      </div>

      <AnimatePresence mode="wait">

        {/* IDLE */}
        {mode === MODES.IDLE && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-xs text-muted-foreground">Scan a photo of any graded slab — AI identifies the company and cert number. Or enter manually below.</p>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => camRef.current?.click()} className="border-border/50 gap-1.5 text-xs">
                <Camera className="w-3.5 h-3.5" />Scan Slab Photo
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => galleryRef.current?.click()} className="border-border/50 gap-1.5 text-xs">
                <Upload className="w-3.5 h-3.5" />Upload Photo
              </Button>
            </div>
            <div className="relative flex items-center gap-2">
              <div className="flex-1 h-px bg-border/40" />
              <span className="text-xs text-muted-foreground">or enter manually</span>
              <div className="flex-1 h-px bg-border/40" />
            </div>
            <div className="space-y-2">
              <select
                value={selectedCompany}
                onChange={e => setSelectedCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border/50 bg-secondary/50 text-sm text-foreground focus:outline-none focus:border-primary/50"
              >
                {ALL_COMPANIES.map(c => (
                  <option key={c} value={c}>{getCompany(c)?.fullName || c} ({c})</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter cert number..."
                  value={certInput}
                  onChange={e => setCertInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleManualLookup()}
                  className="flex-1 bg-secondary/50 border-border/50 text-sm"
                />
                <Button onClick={handleManualLookup} disabled={!certInput.trim()} size="sm" className="bg-primary text-primary-foreground shrink-0">
                  <Search className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          </motion.div>
        )}

        {/* Uploading / Identifying */}
        {(mode === MODES.UPLOADING || mode === MODES.IDENTIFYING) && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-6">
            {imageUrl && <img src={imageUrl} alt="slab" className="w-16 h-24 object-cover rounded-lg border border-border/50" />}
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">
                {mode === MODES.UPLOADING ? 'Uploading...' : 'Identifying grading company...'}
              </span>
            </div>
            {mode === MODES.IDENTIFYING && (
              <p className="text-xs text-muted-foreground text-center">AI is reading the label to determine company and cert number</p>
            )}
          </motion.div>
        )}

        {/* Manual fallback (AI got partial info) */}
        {mode === MODES.MANUAL && (
          <motion.div key="manual" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {imageUrl && <img src={imageUrl} alt="slab" className="w-16 h-24 object-cover rounded-lg border border-border/50 mx-auto" />}
            <p className="text-xs text-muted-foreground text-center">
              {detectedCompany ? `Detected: ${detectedCompany}` : 'Could not read company.'} Confirm the details below:
            </p>
            <select
              value={selectedCompany}
              onChange={e => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border/50 bg-secondary/50 text-sm text-foreground focus:outline-none"
            >
              {ALL_COMPANIES.map(c => (
                <option key={c} value={c}>{getCompany(c)?.fullName || c} ({c})</option>
              ))}
            </select>
            <div className="flex gap-2">
              <Input
                placeholder="Cert number..."
                value={certInput}
                onChange={e => setCertInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleManualLookup()}
                className="flex-1 bg-secondary/50 border-border/50 text-sm"
              />
              <Button onClick={handleManualLookup} disabled={!certInput.trim()} size="sm" className="bg-primary text-primary-foreground">
                <Search className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Error */}
        {mode === MODES.ERROR && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
            <Button onClick={() => { setMode(MODES.IDLE); setError(null); setImageUrl(null); }} variant="outline" size="sm" className="w-full border-border/50 text-xs">
              Try Again
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}