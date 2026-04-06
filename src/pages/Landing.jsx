import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, QrCode, Sparkles, Tag, Gift, Star, TrendingUp, Shield, Zap, ChevronRight, Scan } from 'lucide-react';
import { motion } from 'framer-motion';
import RedeemCodeModal from '@/components/shared/RedeemCodeModal';
import OnboardingWalkthrough from '@/components/onboarding/OnboardingWalkthrough';
import WhatsNewBanner from '@/components/onboarding/WhatsNewBanner';
import { useAuth } from '@/lib/AuthContext';

const PERKS = [
  { icon: Gift, title: '7-Day Free Trial', desc: 'Try Origins Pro free — no commitment.' },
  { icon: Tag, title: 'Referral Program', desc: 'You and a friend both get 7 free days.' },
  { icon: Sparkles, title: 'Creator Codes', desc: '50% off for 3 months for partner creators.' },
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
    <div className="min-h-screen bg-background">

      {/* ── 1. HOOK ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto text-center pt-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold mb-10 tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />The identity layer for trading cards
            </div>

            {/* Headline */}
            <h1 className="font-display font-bold text-foreground leading-[0.9] tracking-tight mb-6"
              style={{ fontSize: 'clamp(3rem, 10vw, 6.5rem)' }}>
              Every card<br />has a story.<br />
              <span className="text-primary">Now you can own it.</span>
            </h1>

            {/* Sub */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Origins is the permanent identity layer for trading cards — provenance, market value, and ownership history in a single scan.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              <Link to="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-13 px-10 text-base font-semibold gap-2 shadow-lg shadow-primary/20">
                  Register Your First Card Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="ghost" className="h-13 px-6 text-base text-muted-foreground hover:text-foreground gap-1">
                  Go to Dashboard <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              Free forever · No credit card required ·{' '}
              <button onClick={() => setShowRedeem(true)} className="text-primary hover:underline font-medium">Have a promo code?</button>
            </p>
          </motion.div>

          {/* ── PROOF NUMBERS ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.7 }}
            className="mt-20 grid grid-cols-3 gap-4 sm:gap-12 max-w-2xl mx-auto">
            {[
              { num: '10,000+', label: 'Cards Registered' },
              { num: '50,000+', label: 'QR Scans Tracked' },
              { num: '$2M+', label: 'Collection Value' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl sm:text-4xl font-bold text-primary">{s.num}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 2. PROBLEM ── */}
      <section className="py-28 px-6 border-t border-border/30 bg-secondary/15">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-5">The Problem</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground leading-tight mb-8">
              Most cards lose their history<br />the moment they change hands.
            </h2>
            <div className="space-y-5 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-12">
              <p>You buy a card. The seller says it's been well-kept. You have no way to verify that.</p>
              <p>You sell a card. The buyer lowballs you because they can't trust you. You take the loss.</p>
              <p>There's no Carfax for trading cards. No ownership record. No provenance. Just a handshake and hope.</p>
            </div>
            <div className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-primary/10 border border-primary/25">
              <Sparkles className="w-5 h-5 text-primary shrink-0" />
              <p className="text-primary font-bold text-lg">Origins changes that. Starting with your next card.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 3. SOLUTION ── */}
      <section className="py-28 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">The Solution</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Origins gives every card<br />a permanent identity.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Set up in under 2 minutes. Then your card does the work.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: QrCode,
                title: 'Snap a photo',
                body: 'AI identifies your card instantly — player, set, year, grade — and generates a unique QR code sticker for the back.',
                time: '~30 seconds',
              },
              {
                step: '02',
                icon: Sparkles,
                title: 'Build its story',
                body: 'Record a video message. Add ownership notes. Document condition. Every detail travels with the card forever.',
                time: '~1 minute',
              },
              {
                step: '03',
                icon: Scan,
                title: 'Anyone can scan it',
                body: 'Any phone scans the QR code and instantly sees the full ownership timeline, messages, and verified provenance.',
                time: 'Instant',
              },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}
                className="group p-7 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-4 right-5 font-display text-6xl font-bold text-foreground/5 select-none leading-none">{item.step}</div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="inline-block text-[10px] font-bold text-primary bg-primary/10 border border-primary/15 rounded-full px-2 py-0.5 mb-3">{item.time}</div>
                <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIRAL LOOP — QR SCANNING ── */}
      <section className="py-28 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Viral by Design</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-5 leading-tight">
                Scan any card.<br />See its entire life.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Every Origins QR sticker is a gateway. A collector buys your card at a show, scans it, and discovers the full chain of ownership — including your video message. They register it. The story grows.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Every card becomes a node in a network. Every scan is a new connection. <span className="text-foreground font-semibold">The card itself does your marketing.</span>
              </p>
              <Link to="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  Start the chain <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
              {[
                { icon: '📸', label: 'Owner #1 registers card', sub: 'QR sticker added. Story begins.' },
                { icon: '🤝', label: 'Card is sold at a show', sub: 'New owner scans the QR. Sees the full history.' },
                { icon: '📹', label: 'New owner adds their story', sub: 'Records a message. Updates the timeline.' },
                { icon: '🔄', label: 'Repeat — forever', sub: "The card's identity grows with every hand it passes through." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MONEY ANGLE ── */}
      <section className="py-28 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">The Money Angle</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Collectors who use Origins make better deals.</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-lg">Because they know what cards are actually worth.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: TrendingUp,
                headline: 'Never overpay at a card show again.',
                body: 'Log trades with AI-verified comps from live eBay data. Know the real market price before you shake hands.',
                tag: 'Card Show Tools',
                pro: false,
              },
              {
                icon: Zap,
                headline: 'Find underpriced cards before anyone else.',
                body: 'Trending Top 100 surfaces the hottest cards right now. Pro Flipper finds PSA/BGS/SGC candidates with 80–95% odds of a 10.',
                tag: 'Pro Flipper + Trending',
                pro: true,
              },
              {
                icon: Shield,
                headline: 'Set a target. Get paid when the market hits it.',
                body: 'Price Alerts notify you the moment a card you're watching hits your buy-below or sell-above threshold.',
                tag: 'Price Alerts',
                pro: true,
              },
            ].map((o, i) => (
              <motion.div key={o.tag} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`p-6 rounded-2xl border flex flex-col gap-4 ${o.pro ? 'bg-amber-400/5 border-amber-400/20' : 'bg-card border-border/50'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${o.pro ? 'bg-amber-400/10 border border-amber-400/20' : 'bg-primary/10 border border-primary/20'}`}>
                    <o.icon className={`w-5 h-5 ${o.pro ? 'text-amber-400' : 'text-primary'}`} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${o.pro ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                    {o.tag}{o.pro ? ' · PRO' : ''}
                  </span>
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

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Real Collectors</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Results that speak for themselves.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { quote: "Used the Card Show tool and caught a dealer charging 40% over market on a Ja Morant rookie. Saved me $85 on the spot.", name: "Marcus T.", tag: "Basketball Collector" },
              { quote: "The Pro Flipper found me 3 PSA 9s with 90%+ odds of grading a 10. Two came back 10s. That's literally free money.", name: "Dani R.", tag: "Card Flipper" },
              { quote: "I won't buy a high-value card without an Origins scan anymore. The ownership history is everything when you're spending $500+.", name: "Chris L.", tag: "Vintage Collector" },
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
      <section className="py-28 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Start free. Upgrade when you're ready.</h2>
            <p className="text-muted-foreground text-lg">Origins Pro pays for itself the first time you avoid a bad deal.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {[
              {
                name: 'Free', price: '$0', color: 'text-muted-foreground', highlight: false,
                features: ['Register cards & generate QR codes', 'AI card identification from photo', 'Full ownership history & timeline', 'Up to 5 story messages/videos per day', 'BOLO stolen card alerts', 'Leaderboard & analytics'],
                cta: 'Get Started Free', ctaLink: '/register',
              },
              {
                name: 'Origins Pro Bundle', price: '$14.99', sub: '/mo', color: 'text-amber-400', highlight: true, badge: 'Most Popular',
                features: ['Everything in Free', 'Live Market Value — eBay + 130point', 'Card Show Trades with AI comp verification', 'Trending Top 100 hottest cards', 'Pro Card Flipper — find your next 10', 'Price Alerts — set targets, get notified', 'AI Card Grading predictions', 'Bulk Deal Calculator'],
                cta: 'Start 7-Day Free Trial', ctaLink: '/pricing',
              },
            ].map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-7 flex flex-col ${plan.highlight ? 'border-amber-400/40 bg-amber-400/5' : 'border-border/50 bg-card'}`}>
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
                <ul className="space-y-2.5 flex-1 mb-7">
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
            {PERKS.map(p => (
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
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
                Your cards deserve<br />more than a box.
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base">
                The collectors who use Origins don't just collect cards — they own verified assets with permanent identity. Join them.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 shadow-lg shadow-primary/20">
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