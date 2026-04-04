import React, { useState } from 'react';
import { X, Zap, Loader2, CheckCircle, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const PRO_PLAN = {
  id: 'pro',
  name: 'Origins Pro Bundle',
  price: '$9.99',
  icon: Flame,
  color: 'text-amber-400',
  bg: 'bg-amber-400/10',
  border: 'border-amber-400/30',
  badge: 'All Features',
  features: [
    'Unlimited story messages & videos per day',
    'Market Value & AI Card Scanner',
    'Card Show Trades — log & browse real comps',
    'Trending — Top 100 hottest cards per category',
    'Live eBay, 130point & Origins data',
    'Pro Card Flipper — PSA/BGS/SGC/CGC pop report analysis',
    'BGS Black Label candidate finder',
  ],
};

export default function UpgradeModal({ onClose, creatorCouponId = null }) {
  const [loading, setLoading] = useState(false);
  const [useTrial, setUseTrial] = useState(!creatorCouponId);

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
      plan: 'pro',
      ...(creatorCouponId ? { couponId: creatorCouponId } : {}),
      ...(!creatorCouponId && useTrial ? { trialDays: 7 } : {}),
    });
    if (res.data?.url) window.location.href = res.data.url;
    setLoading(false);
  };

  const Icon = PRO_PLAN.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card border border-border/50 rounded-2xl p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">Origins Pro Bundle</h2>
          <p className="text-sm text-muted-foreground">Everything you need to collect smarter.</p>
        </div>

        <div className={`rounded-xl border-2 ${PRO_PLAN.bg} ${PRO_PLAN.border} p-5 mb-6`}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${PRO_PLAN.bg} border ${PRO_PLAN.border} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${PRO_PLAN.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-foreground">{PRO_PLAN.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">{PRO_PLAN.badge}</span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className={`text-2xl font-bold ${PRO_PLAN.color}`}>{PRO_PLAN.price}</span>
              <p className="text-[10px] text-muted-foreground">/month</p>
            </div>
          </div>
          <ul className="space-y-2">
            {PRO_PLAN.features.map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-amber-400 text-background hover:bg-amber-400/90 h-12 text-base font-semibold mb-3"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Redirecting...</>
          ) : (
            `Subscribe — $9.99/mo`
          )}
        </Button>

        {!creatorCouponId && (
          <div className="flex items-center gap-2 mb-3">
            <input type="checkbox" id="trial" checked={useTrial} onChange={e => setUseTrial(e.target.checked)} className="accent-primary" />
            <label htmlFor="trial" className="text-xs text-muted-foreground cursor-pointer">Start with a <span className="text-primary font-semibold">7-day free trial</span> — cancel anytime before being charged.</label>
          </div>
        )}
        {creatorCouponId && (
          <div className="text-xs text-center text-primary font-medium mb-3">🎨 Creator discount applied — 50% off for 3 months!</div>
        )}
        <p className="text-xs text-muted-foreground text-center">Cancel anytime. Billed monthly via Stripe.</p>
      </div>
    </div>
  );
}