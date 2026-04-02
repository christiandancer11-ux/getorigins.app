import React, { useState } from 'react';
import { X, Zap, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function UpgradeModal({ onClose }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (window.self !== window.top) {
      alert('Payments can only be completed from the published app, not inside an iframe.');
      return;
    }
    setLoading(true);
    const currentUrl = window.location.href;
    const res = await base44.functions.invoke('createCheckout', {
      successUrl: currentUrl + '?upgraded=1',
      cancelUrl: currentUrl,
    });
    if (res.data?.url) {
      window.location.href = res.data.url;
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card border border-border/50 rounded-2xl p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-5">
            <Zap className="w-7 h-7 text-primary" />
          </div>

          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Upgrade to Pro</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You've used your 5 free messages for today. Upgrade for unlimited access.
          </p>

          <div className="w-full bg-secondary/60 border border-border/50 rounded-xl p-5 mb-6 text-left space-y-3">
            {[
              'Unlimited messages & videos per day',
              'All cards, no restrictions',
              'Support the Origins platform',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold mb-3"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Redirecting...</>
            ) : (
              'Upgrade for $3.99 / month'
            )}
          </Button>

          <p className="text-xs text-muted-foreground">Cancel anytime. Billed monthly via Stripe.</p>
        </div>
      </div>
    </div>
  );
}