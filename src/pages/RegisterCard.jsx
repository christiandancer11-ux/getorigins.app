import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ORG-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function RegisterCard() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    set_name: '',
    sport: '',
    year: '',
    card_number: '',
    description: '',
    image_url: '',
  });
  const [uploading, setUploading] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Card.create(data),
    onSuccess: (card) => navigate(`/cards/${card.id}`),
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, image_url: file_url }));
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      unique_code: generateCode(),
    });
  };

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to My Cards
        </Link>

        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Register a Card</h1>
        <p className="text-muted-foreground mb-8">Add your card details to generate a unique QR code sticker.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <Label className="text-foreground mb-2 block">Card Photo</Label>
            <div className="relative">
              {form.image_url ? (
                <div className="relative w-full aspect-[3/4] max-w-[200px] rounded-xl overflow-hidden border border-border">
                  <img src={form.image_url} alt="Card" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => update('image_url', '')}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center text-xs text-foreground"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-[3/4] max-w-[200px] rounded-xl border-2 border-dashed border-border hover:border-primary/30 cursor-pointer transition-colors bg-muted/20">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-xs text-muted-foreground">Upload photo</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground">Card Name *</Label>
              <Input id="name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Michael Jordan Rookie" required className="mt-1.5 bg-secondary border-border" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Sport / Type</Label>
                <Select value={form.sport} onValueChange={v => update('sport', v)}>
                  <SelectTrigger className="mt-1.5 bg-secondary border-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
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
                <Input id="year" value={form.year} onChange={e => update('year', e.target.value)} placeholder="e.g. 1986" className="mt-1.5 bg-secondary border-border" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="set_name" className="text-foreground">Set / Collection</Label>
                <Input id="set_name" value={form.set_name} onChange={e => update('set_name', e.target.value)} placeholder="e.g. Fleer" className="mt-1.5 bg-secondary border-border" />
              </div>
              <div>
                <Label htmlFor="card_number" className="text-foreground">Card Number</Label>
                <Input id="card_number" value={form.card_number} onChange={e => update('card_number', e.target.value)} placeholder="e.g. #57" className="mt-1.5 bg-secondary border-border" />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground">Notes</Label>
              <Textarea id="description" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Any notes about condition, significance, etc." className="mt-1.5 bg-secondary border-border" rows={3} />
            </div>
          </div>

          <Button
            type="submit"
            disabled={!form.name || createMutation.isPending}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Register & Generate QR Code
          </Button>
        </form>
      </div>
    </div>
  );
}