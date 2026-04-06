import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { QrCode, Video, History, ArrowRight, Sparkles, TrendingUp, Handshake, ShieldAlert, Tag, Gift, Award, Bell, ChevronRight, Star, Zap, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import RedeemCodeModal from '@/components/shared/RedeemCodeModal';
import OnboardingWalkthrough from '@/components/onboarding/OnboardingWalkthrough';
import WhatsNewBanner from '@/components/onboarding/WhatsNewBanner';
import { useAuth } from '@/lib/AuthContext';

const PERKS = [
  { icon: Gift, title: '7-Day Free Trial', desc: 'Try Origins Pro Bundle free — no commitment.' },
  { icon: Tag, title: 'Referral Program', desc: 'You and your friend both get 7 free days when you share your code.' },
  { icon: Sparkles, title: 'Creator Codes', desc: 'Partner creators unlock 50% off for their first 3 months.' },
];

const OUTCOMES = [
  {
    icon: ShieldAlert,
    headline: 'Never get ripped off at a card show again.',
    body: 'Log real in-person trades with AI-verified comps pulled from live eBay data. Know instantly if you\'re overpaying — before you hand over cash.',
    tag: 'Card Show Tools',
    pro: false,
  },
  {
    icon: TrendingUp,
    headline: 'Know exactly what your collection is worth — right now.',
    body: 'Live market values from eBay, 130point, and Origins community data. Your portfolio updates in real time so you\'re never guessing.',
    tag: 'Market Value',
    pro: true,
  },
  {
    icon: Award,
    headline: 'Find the cards most likely to grade a 10 — before you submit.',
    body: 'Our Pro Flipper analyzes PSA, BGS, SGC & CGC pop reports to surface cards with 80–95% odds of a perfect grade. That\'s money in your pocket.',
    tag: 'Pro Flipper',
    pro: true,
  },
  {
    icon: Bell,
    headline: 'Stop watching prices manually. Let us watch for you.',
    body: 'Set a buy-below or sell-above target. Get an email the moment the market hits your price. You flip, we watch.',
    tag: 'Price Alerts',
    pro: true,
  },
  {
    icon: Lock,
    headline: 'A card gets stolen. Yours might be next.',
    body: 'Verified dealers and shop owners report stolen cards in real time. BOLO alerts notify collectors near the incident location before the thief moves on.',
    tag: 'BOLO Alerts',
    pro: false,
  },
  {
    icon: History,
    headline: 'Prove your card is the real deal — from day one.',
    body: 'Every Origins card gets a unique QR code that tracks the full chain of ownership. Buyers trust cards with a story. Yours will have one.',
    tag: 'Ownership History',
    pro: false,
  },
];

export default function Landing() {
  const [showRedeem, setShowRedeem] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && !localStorage.getItem('origins_onboarding_complete')) {
      const timer = setTimeout(() => setShowWalkthrough(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />The card collecting platform built for serious collectors
            </div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-foreground leading-[0.92] tracking-tight mb-6">
              Every Card<br />Has a Story.<br /><span className="text-primary">Now You Can Prove It.</span>
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
              Origins gives your cards a permanent, scannable identity — tracking ownership history, market value, and provenance from the moment you register them.
            </p>
            <p className="text-sm text-muted-foreground/70 max-w-lg mx-auto mb-12">
              Buyers pay more for cards they can trust. Sellers close faster. Collectors collect smarter.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link to="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-13 px-8 text-base gap-2">
                  Register Your First Card Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="ghost" className="h-13 px-6 text-base text-muted-foreground hover:text-foreground">
                  Go to Dashboard <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              Free forever. No credit card required. &nbsp;·&nbsp;{' '}
              <button onClick={() => setShowRedeem(true)} className="text-primary hover:underline font-medium">Have a promo code?</button>
            </p>
          </motion.div>

          {/* Social proof numbers */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16">
            {[
              { num: '10,000+', label: 'Cards Registered' },
              { num: '50,000+', label: 'QR Scans Tracked' },
              { num: '$2M+', label: 'Collection Value Managed' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl sm:text-3xl font-bold text-primary">{s.num}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── THE PROBLEM ── */}
      <section className="py-24 px-6 border-t border-border/30 bg-secondary/20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Why Origins Exists</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-8 leading-tight">
              Cards have no history.<br />Buyers don't trust sellers.<br />Provenance doesn't exist.
            </h2>
            <div className="text-muted-foreground text-base sm:text-lg leading-relaxed space-y-4 max-w-2xl mx-auto mb-10">
              <p>You buy a card. The seller says it's been well-kept. You have no way to verify that. You take the risk.</p>
              <p>You sell a card. The buyer lowballs you because they have no way to trust you. You take the loss.</p>
              <p>There's no Carfax for trading cards. No ownership record. No provenance. Just a handshake and hope.</p>
            </div>
            <div className="inline-block px-6 py-3 rounded-2xl bg-primary/10 border border-primary/20">
              <p className="text-primary font-bold text-lg">Origins changes that. Starting with your next card.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">The Process</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Set up in under 2 minutes.</h2>
            <p className="text-muted-foreground">Then your card does the talking.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '01', icon: QrCode, title: 'Snap a photo', body: 'AI instantly identifies your card — player, set, year, grade — and generates a unique QR code sticker for the back.' },
              { step: '02', icon: Video, title: 'Tell its story', body: 'Record a personal video message. Add notes. Document the condition. Every detail travels with the card forever.' },
              { step: '03', icon: History, title: 'Scan reveals everything', body: 'Any phone can scan the QR code and see the full ownership timeline, messages, and provenance — instantly.' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="group p-7 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-4 right-4 font-display text-5xl font-bold text-foreground/5 select-none">{item.step}</div>
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OUTCOMES (what users actually care about) ── */}
      <section className="py-24 px-6 border-t border-border/30 bg-secondary/10">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">What Origins Actually Does For You</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Built for collectors who take this seriously.</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Stop tracking spreadsheets. Stop guessing values. Stop hoping buyers trust you.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OUTCOMES.map((o, i) => (
              <motion.div key={o.tag} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className={`p-6 rounded-2xl border flex flex-col gap-4 ${o.pro ? 'bg-amber-400/5 border-amber-400/20' : 'bg-card border-border/50'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${o.pro ? 'bg-amber-400/10 border border-amber-400/20' : 'bg-primary/10 border border-primary/20'}`}>
                    <o.icon className={`w-5 h-5 ${o.pro ? 'text-amber-400' : 'text-primary'}`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${o.pro ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                      {o.tag}
                    </span>
                    {o.pro && <span className="text-[9px] font-bold text-amber-400">PRO</span>}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-2 leading-snug">{o.headline}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{o.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS / TRUST ── */}
      <section className="py-24 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Collector Community</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Real collectors. Real results.</h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                quote: "I used the Card Show tool at a local show and caught a dealer trying to charge me 40% over market on a Ja Morant rookie. Saved me $85 right there.",
                name: "Marcus T.",
                tag: "Basketball Collector",
              },
              {
                quote: "The Pro Flipper found me 3 PSA 9s with 90%+ odds of grading a 10. Submitted all three. Two came back 10s. That's literally free money.",
                name: "Dani R.",
                tag: "Card Flipper",
              },
              {
                quote: "Being able to scan a QR on a card and see its whole ownership history changed how I buy. I won't buy a high-value card without Origins history anymore.",
                name: "Chris L.",
                tag: "Vintage Collector",
              },
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, s) => <Star key={s} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed flex-1">"{t.quote}"</p>
                <div>
                  <p className="text-xs font-semibold text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.tag}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-6 bg-secondary/10 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Start free. Upgrade when you're ready.</h2>
            <p className="text-muted-foreground">Origins Pro pays for itself the first time you avoid a bad deal.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {[
              {
                name: 'Free',
                price: '$0',
                color: 'text-muted-foreground',
                highlight: false,
                features: [
                  'Register cards & generate QR codes',
                  'AI card identification from photos',
                  'Ownership history & timeline',
                  'Up to 5 story messages/videos per day',
                  'BOLO stolen card alerts',
                  'Leaderboard & analytics',
                ],
                cta: 'Get Started Free',
                ctaLink: '/register',
              },
              {
                name: 'Origins Pro Bundle',
                price: '$14.99',
                sub: '/mo',
                color: 'text-amber-400',
                highlight: true,
                badge: 'Most Popular',
                features: [
                  'Everything in Free',
                  'Live Market Value — eBay + 130point',
                  'Card Show Trades with AI comp verification',
                  'Trending Top 100 hottest cards',
                  'Pro Card Flipper — find your next 10',
                  'Price Alerts — set targets, get notified',
                  'AI Card Grading predictions',
                  'Bulk Deal Calculator',
                ],
                cta: 'Start 7-Day Free Trial',
                ctaLink: '/pricing',
              },
            ].map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 flex flex-col ${plan.highlight ? 'border-amber-400/40 bg-amber-400/5' : 'border-border/50 bg-card'}`}>
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-5">
                  <h3 className={`font-bold text-sm ${plan.color} mb-1`}>{plan.name}</h3>
                  <div className="flex items-end gap-0.5">
                    <span className="text-3xl font-display font-bold text-foreground">{plan.price}</span>
                    {plan.sub && <span className="text-xs text-muted-foreground mb-1">{plan.sub}</span>}
                  </div>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Zap className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.highlight ? 'text-amber-400' : 'text-primary'}`} />{f}
                    </li>
                  ))}
                </ul>
                <Link to={plan.ctaLink}>
                  <Button size="sm" variant={plan.highlight ? 'default' : 'outline'}
                    className={`w-full ${plan.highlight ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-border/50'}`}>
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 grid sm:grid-cols-3 gap-4">
            {PERKS.map((p) => (
              <div key={p.title} className="flex gap-3 p-4 rounded-xl bg-card border border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <p.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-6 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-b from-card to-secondary/50 border border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Your cards have a story.<br />Start telling it today.
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                The collectors who use Origins don't just collect cards — they own verifiable assets. Join them.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8">
                    Register Your First Card Free <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" onClick={() => setShowRedeem(true)} className="h-12 px-8 border-border/50">
                  <Tag className="w-4 h-4 mr-2" />Redeem a Code
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border/50 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-3">
              <img src="https://media.base44.com/images/public/69ceb0c6913655f4b9105f84/7231ac246_BF64DB45-9D7E-4450-BC8E-767F5F7DD0E0.jpeg" alt="Origins" className="h-7 w-7 rounded-md" />
              <span className="font-display text-sm font-semibold text-foreground">Origins</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowRedeem(true)} className="text-xs text-muted-foreground hover:text-primary transition-colors">Redeem Code</button>
              <Link to="/features" className="text-xs text-muted-foreground hover:text-primary transition-colors">Features</Link>
              <Link to="/support" className="text-xs text-muted-foreground hover:text-primary transition-colors">Support</Link>
            </div>
          </div>
          <div className="pt-4 border-t border-border/30">
            <div className="flex items-center justify-center gap-4 flex-wrap mb-4">
              <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              <span className="text-border/50">•</span>
              <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Use</Link>
            </div>
            <p className="text-xs text-muted-foreground text-center">© Origins. All ideas and design copyrighted by Skillerz Breaks.</p>
          </div>
        </div>
      </footer>

      {showRedeem && <RedeemCodeModal onClose={() => setShowRedeem(false)} />}
      {showWalkthrough && <OnboardingWalkthrough isOpen={showWalkthrough} onClose={() => setShowWalkthrough(false)} />}
      {user && !showWalkthrough && <WhatsNewBanner />}
    </div>
  );
}