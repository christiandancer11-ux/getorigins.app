import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Save } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EditCardModal({ card, onClose }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: card.name || '',
    set_name: card.set_name || '',
    sport: card.sport || '',
    year: card.year || '',
    card_number: card.card_number || '',
    description: card.description || '',
    image_url: card.image_url || '',
  });
  const [uploading, setUploading] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Card.update(card.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', card.id] });
      onClose();
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update('image_url', file_url);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border/50 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Edit Card Details</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Update info only — message history is permanent</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Image */}
            <div>
              <Label className="text-foreground mb-2 block">Card Photo</Label>
              {form.image_url ? (
                <div className="relative w-32 aspect-[3/4] rounded-xl overflow-hidden border border-border">
                  <img src={form.image_url} alt="Card" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => update('image_url', '')}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center text-xs text-foreground"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 aspect-[3/4] rounded-xl border-2 border-dashed border-border hover:border-primary/30 cursor-pointer transition-colors bg-muted/20">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Upload</span>
                    </>
                  )}
                </label>
              )}
            </div>

            <div>
              <Label className="text-foreground">Card Name *</Label>
              <Input value={form.name} onChange={e => update('name', e.target.value)} required className="mt-1.5 bg-secondary border-border" />
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
                <Label className="text-foreground">Year</Label>
                <Input value={form.year} onChange={e => update('year', e.target.value)} placeholder="e.g. 1986" className="mt-1.5 bg-secondary border-border" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Set / Collection</Label>
                <Input value={form.set_name} onChange={e => update('set_name', e.target.value)} placeholder="e.g. Fleer" className="mt-1.5 bg-secondary border-border" />
              </div>
              <div>
                <Label className="text-foreground">Card Number</Label>
                <Input value={form.card_number} onChange={e => update('card_number', e.target.value)} placeholder="e.g. #57" className="mt-1.5 bg-secondary border-border" />
              </div>
            </div>

            <div>
              <Label className="text-foreground">Notes</Label>
              <Textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Condition, significance, etc." className="mt-1.5 bg-secondary border-border" rows={3} />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border/50">
                Cancel
              </Button>
              <Button type="submit" disabled={!form.name || updateMutation.isPending} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}