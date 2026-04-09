import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, ArrowRight, Tag, Gift } from 'lucide-react';

export default function Pricing() {
  // TODO: Migrate Stripe checkout to Supabase
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pricing</h1>
      <div className="text-center py-8">
        <p className="text-muted-foreground">Pricing and subscription features are temporarily unavailable during migration.</p>
        <p className="text-sm text-muted-foreground mt-2">All users currently have free access to core features.</p>
      </div>
    </div>
  );
}

const BUNDLES = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started, no card required.',
    color: 'text-muted-foreground',
    priceId: null,
    features: [
      'Register cards & generate QR codes',
      'AI card identification from photos',
      'Up to 5 story messages/videos per day',
      'Leaderboard & analytics',
      'BOLO stolen card alerts'
    ],
  },
  {
    name: 'Origins Pro Bundle',
    price: '$14.99',
    sub: '/mo',
    description: 'Everything you need to collect smarter.',
    color: 'text-amber-400',
    highlight: true,
    priceId: 'price_1Qvi4aAjk3EjqAEi8SJB4Y2P', // Monthly recurring
    badge: 'Most Popular',
    features: [
      'Unlimited story messages & videos per day',
      'Market Value & AI Card Scanner',
      'Card Show Trades — real comp logs',
      'Trending — Top 100 hottest cards',
      'Live eBay, 130point & Origins data',
      'Pro Card Flipper — PSA/BGS/SGC/CGC pop report analysis',
      'BGS Black Label candidate finder'
    ],
  },
];

const PERKS = [
  { icon: Gift, title: '7-Day Free Trial', desc: 'Try Origins Pro Bundle free when you subscribe — no commitment.' },
  { icon: Tag, title: 'Referral Program', desc: 'Share your code. You and your friend both get 7 free days of Origins Pro Bundle.' },
  { icon: Sparkles, title: 'Creator Codes', desc: 'Partner creators unlock 50% off Origins Pro Bundle for their first 3 months.' },
];

export default function Pricing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleCheckout = async (priceId) => {
    if (!priceId) return; // Free plan
    
    // Block iframe checkout
    if (window.self !== window.top) {
      alert('Checkout only works from the published app, not from an embedded preview.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await base44.functions.invoke('createCheckoutSession', {
        priceId,
        trialDays: 7, // 7-day trial
      });

      if (response.data.sessionUrl) {
        window.location.href = response.data.sessionUrl;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 px-6 border-b border-border/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h1>
            <p className="text-lg text-muted-foreground mb-2">Start free. Upgrade when you're ready for more.</p>
            <p className="text-sm text-muted-foreground">No credit card required to get started.</p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
            {BUNDLES.map((bundle, i) => (
              <motion.div
                key={bundle.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-8 flex flex-col transition-all ${
                  bundle.highlight
                    ? 'border-amber-400/40 bg-amber-400/5 ring-1 ring-amber-400/20'
                    : 'border-border/50 bg-card'
                }`}
              >
                {bundle.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
                    {bundle.badge}
                  </span>
                )}

                <div className="mb-6">
                  <h3 className={`font-bold text-lg ${bundle.color} mb-2`}>{bundle.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-display font-bold text-foreground">{bundle.price}</span>
                    {bundle.sub && <span className="text-sm text-muted-foreground mb-1">{bundle.sub}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{bundle.description}</p>
                </div>

                <ul className="space-y-3 flex-1 mb-6">
                  {bundle.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {bundle.priceId ? (
                  <Button
                    onClick={() => handleCheckout(bundle.priceId)}
                    disabled={loading}
                    className={`w-full h-11 ${
                      bundle.highlight
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border-border/50'
                    }`}
                    variant={bundle.highlight ? 'default' : 'outline'}
                  >
                    {loading ? 'Processing...' : 'Choose Plan'}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full h-11 border-border/50">
                    Get Started
                  </Button>
                )}
              </motion.div>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center mb-8"
            >
              {error}
            </motion.div>
          )}

          {/* Perks */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid sm:grid-cols-3 gap-4"
          >
            {PERKS.map((perk) => (
              <div key={perk.title} className="flex gap-3 p-4 rounded-xl bg-card border border-border/50">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <perk.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{perk.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{perk.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-border/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12">FAQ</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel anytime?',
                a: "Yes. Cancel your subscription at any time from your profile settings. Your access continues until the end of your billing cycle.",
              },
              {
                q: 'What payment methods do you accept?',
                a: "We accept all major credit cards (Visa, Mastercard, American Express) via Stripe.",
              },
              {
                q: 'Is there a refund policy?',
                a: "We offer a 7-day money-back guarantee. Contact support if you're not satisfied.",
              },
              {
                q: 'Do you offer discounts for annual plans?',
                a: "Contact our team at support@getorigins.app for bulk or annual pricing inquiries.",
              },
            ].map((faq, i) => (
              <div key={i} className="p-5 rounded-xl bg-card border border-border/50">
                <p className="font-semibold text-foreground mb-2">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}