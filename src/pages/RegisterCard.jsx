import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AiAutoFillButton from '@/components/register/AiAutoFillButton';
import ImageAgreementModal from '@/components/register/ImageAgreementModal';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ORG-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function ImageUploadSlot({ label, imageUrl, onUpload, onClear, uploading }) {
  return (
    <div>
      <Label className="text-foreground mb-2 block">{label}</Label>
      {imageUrl ? (
        <div className="relative w-full aspect-[3/4] max-w-[160px] rounded-xl overflow-hidden border border-border">
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          <button type="button" onClick={onClear}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center text-xs text-foreground">
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-[3/4] max-w-[160px] rounded-xl border-2 border-dashed border-border hover:border-primary/30 cursor-pointer transition-colors bg-muted/20">
          <input type="file" accept="image/*" onChange={onUpload} className="hidden" />
          {uploading ? (
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          ) : (
            <>
              <Upload className="w-6 h-6 text-muted-foreground mb-2" />
              <span className="text-xs text-muted-foreground text-center px-2">Upload {label}</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}

export default function RegisterCard() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', set_name: '', sport: '', year: '', card_number: '', description: '',
    image_url: '', image_back_url: '',
    price_paid: '', estimated_value: '',
    grading_company: '', grade: '', cert_number: '',
  });
  const [uploadingFront, setUploadingFront] = useState(false);
  const [uploadingBack, setUploadingBack] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('origins_image_agreement_accepted')) {
      setShowAgreement(true);
    }
  }, []);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Card.create(data),
    onSuccess: (card) => navigate(`/cards/${card.id}`),
  });

  const handleImageUpload = async (e, side) => {
    const file = e.target.files[0];
    if (!file) return;
    if (side === 'front') setUploadingFront(true);
    else setUploadingBack(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, [side === 'front' ? 'image_url' : 'image_back_url']: file_url }));
    if (side === 'front') setUploadingFront(false);
    else setUploadingBack(false);
  };

  const handleAiFill = (data) => {
    setForm(prev => ({
      ...prev,
      ...(data.name && { name: data.name }),
      ...(data.set_name && { set_name: data.set_name }),
      ...(data.sport && { sport: data.sport }),
      ...(data.year && { year: data.year }),
      ...(data.card_number && { card_number: data.card_number }),
      ...(data.description && !prev.description && { description: data.description }),
      ...(data.grading_company && { grading_company: data.grading_company }),
      ...(data.grade && { grade: data.grade }),
      ...(data.cert_number && { cert_number: data.cert_number }),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, unique_code: generateCode() };
    // Clean up empty numeric fields
    if (!payload.price_paid) delete payload.price_paid;
    else payload.price_paid = parseFloat(payload.price_paid);
    if (!payload.estimated_value) delete payload.estimated_value;
    else payload.estimated_value = parseFloat(payload.estimated_value);
    createMutation.mutate(payload);
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const isGraded = !!form.grading_company;

  return (
    <>
      <ImageAgreementModal
        isOpen={showAgreement}
        onAgree={() => setShowAgreement(false)}
        onDisagree={() => navigate('/dashboard')}
      />
      <div className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-xl mx-auto">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back to My Cards
          </Link>

          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Register a Card</h1>
          <p className="text-muted-foreground mb-8">Upload photos and let AI identify your card automatically.</p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Front + Back Image Upload */}
            <div>
              <Label className="text-foreground mb-3 block font-semibold">Card Photos</Label>
              <div className="flex gap-4">
                <ImageUploadSlot
                  label="Front"
                  imageUrl={form.image_url}
                  uploading={uploadingFront}
                  onUpload={(e) => handleImageUpload(e, 'front')}
                  onClear={() => update('image_url', '')}
                />
                <ImageUploadSlot
                  label="Back"
                  imageUrl={form.image_back_url}
                  uploading={uploadingBack}
                  onUpload={(e) => handleImageUpload(e, 'back')}
                  onClear={() => update('image_back_url', '')}
                />
              </div>
              {form.image_url && (
                <AiAutoFillButton
                  imageUrl={form.image_url}
                  backImageUrl={form.image_back_url}
                  onFill={handleAiFill}
                />
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-foreground">Card Name *</Label>
                <Input id="name" value={form.name} onChange={e => update('name', e.target.value)}
                  placeholder="e.g. Michael Jordan Rookie" required className="mt-1.5 bg-secondary border-border" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Sport / Type</Label>
                  <Select value={form.sport} onValueChange={v => update('sport', v)}>
                    <SelectTrigger className="mt-1.5 bg-secondary border-border"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baseball">⚾ Baseball</SelectItem>
                      <SelectItem value="basketball">🏀 Basketball</SelectItem>
                      <SelectItem value="football">🏈 Football</SelectItem>
                      <SelectItem value="hockey">🏒 Hockey</SelectItem>
                      <SelectItem value="soccer">⚽ Soccer</SelectItem>
                      <SelectItem value="pokemon">⚡ Pokémon</SelectItem>
                      <SelectItem value="magic_the_gathering">🧙 MTG</SelectItem>
                      <SelectItem value="yugioh">🃏 Yu-Gi-Oh!</SelectItem>
                      <SelectItem value="other">🎴 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year" className="text-foreground">Year</Label>
                  <Input id="year" value={form.year} onChange={e => update('year', e.target.value)}
                    placeholder="e.g. 1986" className="mt-1.5 bg-secondary border-border" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="set_name" className="text-foreground">Set / Collection</Label>
                  <Input id="set_name" value={form.set_name} onChange={e => update('set_name', e.target.value)}
                    placeholder="e.g. Fleer" className="mt-1.5 bg-secondary border-border" />
                </div>
                <div>
                  <Label htmlFor="card_number" className="text-foreground">Card Number</Label>
                  <Input id="card_number" value={form.card_number} onChange={e => update('card_number', e.target.value)}
                    placeholder="e.g. #57" className="mt-1.5 bg-secondary border-border" />
                </div>
              </div>

              {/* Grading Section */}
              <div className="rounded-xl border border-border/50 bg-secondary/20 p-4 space-y-3">
                <Label className="text-foreground font-semibold block">Graded Card (optional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="grading_company" className="text-foreground text-xs">Grading Company</Label>
                    <Input id="grading_company" value={form.grading_company} onChange={e => update('grading_company', e.target.value)}
                      placeholder="e.g. PSA, BGS, SGC" className="mt-1 bg-secondary border-border" />
                  </div>
                  <div>
                    <Label htmlFor="grade" className="text-foreground text-xs">Grade</Label>
                    <Input id="grade" value={form.grade} onChange={e => update('grade', e.target.value)}
                      placeholder="e.g. 10, 9.5, 9" className="mt-1 bg-secondary border-border" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cert_number" className="text-foreground text-xs">Certification Number</Label>
                  <Input id="cert_number" value={form.cert_number} onChange={e => update('cert_number', e.target.value)}
                    placeholder="e.g. 12345678" className="mt-1 bg-secondary border-border" />
                </div>
                <p className="text-xs text-muted-foreground">AI will auto-detect grading info from your photos. Pop reports update daily.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_paid" className="text-foreground">Price Paid</Label>
                  <Input id="price_paid" type="number" value={form.price_paid} onChange={e => update('price_paid', e.target.value)}
                    placeholder="e.g. 150" className="mt-1.5 bg-secondary border-border" min="0" step="0.01" />
                </div>
                <div>
                  <Label htmlFor="estimated_value" className="text-foreground">Estimated Value</Label>
                  <Input id="estimated_value" type="number" value={form.estimated_value} onChange={e => update('estimated_value', e.target.value)}
                    placeholder="e.g. 250" className="mt-1.5 bg-secondary border-border" min="0" step="0.01" />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-foreground">Notes</Label>
                <Textarea id="description" value={form.description} onChange={e => update('description', e.target.value)}
                  placeholder="Any notes about condition, significance, etc." className="mt-1.5 bg-secondary border-border" rows={3} />
              </div>
            </div>

            <Button type="submit" disabled={!form.name || createMutation.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12">
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Register & Generate QR Code
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}