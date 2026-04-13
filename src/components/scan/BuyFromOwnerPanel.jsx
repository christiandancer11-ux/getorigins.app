import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { createOwnershipRequest } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingBag, DollarSign, CheckCircle2, Loader2, User, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BuyFromOwnerPanel({ card }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ buyer_name: '', buyer_email: '', sale_price: '' });
  const [error, setError] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('Please sign in to request ownership.');
      return;
    }
    if (!form.buyer_email) { setError('Please enter your email.'); return; }

    setLoading(true);

    await createOwnershipRequest({
      card_id: card.id,
      requester_id: user.id,
      owner_id: card.user_id || null,
      message: `Buyer: ${form.buyer_name || form.buyer_email}. Notes: ${form.sale_price ? `$${parseFloat(form.sale_price).toFixed(2)}` : 'no price provided'}`,
    });

    setLoading(false);
    setStep('success');
  };

  return (
    <div className="mt-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-sm font-medium text-primary"
        >
          <ShoppingBag className="w-4 h-4" />
          I bought this card from the owner
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/20 bg-card p-5"
          >
            {step === 'success' ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-green-400/15 border border-green-400/30 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-1">Request Sent!</h3>
                <p className="text-sm text-muted-foreground">
                  The current owner has been notified and will confirm or deny the transfer. Check your email for updates.
                </p>
                <Button variant="outline" size="sm" onClick={() => { setOpen(false); setStep('form'); }} className="mt-4 border-border/50">
                  Close
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">Claim This Card</h3>
                    <p className="text-xs text-muted-foreground">Notify the owner to confirm the sale</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Your Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        value={form.buyer_name}
                        onChange={e => set('buyer_name', e.target.value)}
                        placeholder="Your name"
                        className="pl-9 bg-secondary border-border text-sm h-9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Your Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={form.buyer_email}
                        onChange={e => set('buyer_email', e.target.value)}
                        placeholder="you@email.com"
                        required
                        className="pl-9 bg-secondary border-border text-sm h-9"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Amount Paid (optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.sale_price}
                        onChange={e => set('sale_price', e.target.value)}
                        placeholder="0.00"
                        className="pl-9 bg-secondary border-border text-sm h-9"
                      />
                    </div>
                  </div>

                  {error && <p className="text-xs text-destructive">{error}</p>}

                  <div className="flex gap-2 pt-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="flex-1 border-border/50 text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={loading} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
                      {loading ? <><Loader2 className="w-3 h-3 animate-spin mr-1" />Sending...</> : 'Send Request'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

