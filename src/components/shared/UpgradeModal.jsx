import React, { useState } from 'react';
import { X, Zap, Loader2, CheckCircle, MessageSquare, TrendingUp, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const PLANS = [
  {
    id: 'stories',
    name: 'Stories',
    price: '$3.99',
    icon: MessageSquare,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/30',
    features: [
      'Unlimited story messages & videos per day',
    ],
  },
  {
    id: 'pro',
    name: 'Origins Pro',
    price: '$7.99',
    icon: TrendingUp,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
    features: [
      'Everything in Stories',
      'Card Show Trades — log & browse real comps',
      'Market Value & AI Card Scanner',
    ],
  },
  {
    id: 'expert',
    name: 'Expert Bundle',
    price: '$14.99',
    icon: Flame,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    badge: 'Most Powerful',
    features: [
      'Everything in Origins Pro',
      'Trending — Top 100 hottest cards per category',
      'Live data from eBay, 130point & Origins trades',
    ],
  },
];

export default function UpgradeModal({ onClose, defaultPlan = 'stories' }) {
  const [selected, setSelected] = useState(defaultPlan);
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
      plan: selected,
    });
    if (res.data?.url) window.location.href = res.data.url;
    setLoading(false);
  };

  const selectedPlan = PLANS.find(p => p.id === selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-card border border-border/50 rounded-2xl p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-1">Upgrade Origins</h2>
          <p className="text-sm text-muted-foreground">Choose the plan that fits your collecting style.</p>
        </div>

        <div className="space-y-3 mb-6">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            const isSelected = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${isSelected ? `${plan.bg} ${plan.border} border-2` : 'border-border/50 bg-secondary/30 hover:bg-secondary/60'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${plan.bg} border ${plan.border} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${plan.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{plan.name}</span>
                        {plan.badge && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-400/20 text-orange-400 border border-orange-400/30">{plan.badge}</span>
                        )}
                      </div>
                      <ul className="mt-1.5 space-y-0.5">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-lg font-bold ${plan.color}`}>{plan.price}</span>
                    <p className="text-[10px] text-muted-foreground">/month</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold mb-3"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Redirecting...</>
          ) : (
            `Subscribe to ${selectedPlan?.name} — ${selectedPlan?.price}/mo`
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">Cancel anytime. Billed monthly via Stripe.</p>
      </div>
    </div>
  );
}