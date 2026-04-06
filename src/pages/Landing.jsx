import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, QrCode, Sparkles, Tag, Gift, Star, TrendingUp, Shield, Zap, ChevronRight, Scan, Video, History, BarChart3, CheckCircle, Users, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import RedeemCodeModal from '@/components/shared/RedeemCodeModal';
import OnboardingWalkthrough from '@/components/onboarding/OnboardingWalkthrough';
import WhatsNewBanner from '@/components/onboarding/WhatsNewBanner';
import { useAuth } from '@/lib/AuthContext';
import ScanSpeedHero from '@/components/landing/ScanSpeedHero';
import DataSourcesBadge from '@/components/landing/DataSourcesBadge';
import ImportCTA from '@/components/landing/ImportCTA';
import SetProgressViz from '@/components/landing/SetProgressViz';
import PortfolioTrends from '@/components/landing/PortfolioTrends';
import SupportedGames from '@/components/landing/SupportedGames';
import StickyHeader from '@/components/landing/StickyHeader';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <StickyHeader />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/8 rounded-full blur-[180px] pointer-events-none" />

        <motion.div {...fadeUp(0)} className="relative z-10 max-w-4xl mx-auto pt-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-primary/8 text-primary text-xs font-semibold mb-8 tracking-wide">
            <Sparkles className="w-3.5 h-3.5" /> The Identity Layer for Trading Cards
          </div>

          <h1
            className="font-display font-bold text-foreground leading-[0.9] tracking-tight mb-6"
            style={{ fontSize: 'clamp(2.8rem, 9vw, 6rem)' }}
          >
            Every Card Has a Story.<br />
            <span className="text-primary">Now You Can Own It.</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Track ownership, value, and history of your cards in one place — powered by AI and QR technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Link to="/pricing">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-13 px-10 text-base font-semibold gap-2 shadow-lg shadow-primary/25">
                Claim Founder Status <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="h-13 px-8 text-base border-border/50 gap-1">
                Go to Dashboard <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="text-primary font-semibold">First 1,000 Founders get 3 months Pro free</span> · No credit card required
          </p>

          <SupportedGames />
        </motion.div>

        {/* Social proof numbers */}
        <motion.div {...fadeUp(0.3)} className="relative z-10 mt-20 grid grid-cols-3 gap-6 sm:gap-16 max-w-2xl mx-auto pb-12">
          {[
            { num: '10,000+', label: 'Cards Registered' },
            { num: '$500K+', label: 'Collection Value Tracked' },
            { num: '50,000+', label: 'QR Scans' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl sm:text-4xl font-bold text-primary">{s.num}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="py-28 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-5">The Problem</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground leading-tight mb-8">
              Trading cards lose their history<br />the moment they change hands.
            </h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed font-medium">
              No proof. No story. No trust.
            </p>
            <div className="space-y-4 max-w-xl mx-auto text-left">
              {[
                "You don't know where a card came from",
                "You don't know if it's been flipped 10 times",
                "You don't know if you're overpaying",
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/15">
                  <span className="text-destructive font-bold text-lg leading-none mt-0.5">✕</span>
                  <p className="text-foreground/80 text-sm leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="py-28 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">The Solution</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Origins gives every card<br />a permanent identity.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Set up in under 2 minutes. Then your card does the work forever.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Scan, label: 'Scan your card in seconds', desc: 'AI identifies player, set, year, and grade from a photo.' },
              { icon: QrCode, label: 'Generate a unique QR code', desc: 'A permanent sticker that travels with your card forever.' },
              { icon: Video, label: 'Attach videos & ownership history', desc: 'Record a message. Every owner adds to the story.' },
              { icon: TrendingUp, label: 'Track real-time value', desc: 'Live eBay comps and AI-powered market signals.' },
            ].map((item, i) => (
              <motion.div key={item.label} {...fadeUp(i * 0.1)}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1.5 leading-snug">{item.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCAN SPEED DEMO ── */}
      <section className="py-28 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Instant Inventory</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Scan 100 cards in minutes, not hours.
            </h2>
            <p className="text-muted-foreground text-lg">See how fast AI identification works in action.</p>
          </motion.div>
          <ScanSpeedHero />
        </div>
      </section>

      {/* ── VALUE / MONEY ── */}
      <section className="py-28 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">The Money Angle</p>
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-4">
              Never overpay for a card again.
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">Real data. Real prices. Right when you need it.</p>
          </motion.div>

          <div className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: BarChart3, title: 'Live eBay Sold Prices', body: 'See what cards actually sold for — not what sellers are asking. Real comps, updated in real time.' },
                { icon: Sparkles, title: 'AI-Powered Fair Market Value', body: 'Our AI cross-references population reports, recent sales, and grade to tell you what a card is truly worth.' },
                { icon: TrendingUp, title: 'Track Price Trends Instantly', body: 'Set alerts. Watch movement. Know exactly when to buy, hold, or sell.' },
              ].map((item, i) => (
                <motion.div key={item.title} {...fadeUp(i * 0.1)}
                  className="p-7 rounded-2xl bg-primary/5 border border-primary/15 flex flex-col gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <DataSourcesBadge />
          </div>
        </div>
      </section>

      {/* ── IMPORT / MIGRATION ── */}
      <section className="py-28 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">No Friction Switch</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-5">
              Already using another app?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              If you've invested time in TCGPlayer, Dex, PriceCharting, or a spreadsheet, we make the move painless.
            </p>
            <ImportCTA />
          </motion.div>
        </div>
      </section>

      {/* ── SET COMPLETION / GAMIFICATION ── */}
      <section className="py-28 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 items-start">
            <motion.div {...fadeUp()}>
              <SetProgressViz />
            </motion.div>
            <motion.div {...fadeUp(0.15)}>
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Collectors Are Completionists</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-5 leading-tight">
                Visualize your progress.<br />
                <span className="text-primary">Find what's missing.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Collectors don't just want to list their cards—they want to manage their hobby. Origins shows you exactly which cards you need to complete your sets, and helps you find them.
              </p>
              <ul className="space-y-3">
                {[
                  "See completion % for each set you own",
                  "Get alerts when missing cards appear for sale",
                  "Track how close you are to mastering a set",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PORTFOLIO TRENDS / INVESTOR ANGLE ── */}
      <section className="py-28 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="mb-12">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Asset Tracking</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-5">
              Your collection is an investment.
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Watch your portfolio grow. Origins Pro tracks daily market movers and shows you your ROI in real time.
            </p>
            <PortfolioTrends />
          </motion.div>
        </div>
      </section>

      {/* ── DIFFERENTIATOR ── */}
      <section className="py-28 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp()}>
              <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Your Secret Weapon</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-5 leading-tight">
                This isn't just collecting...<br />
                <span className="text-primary">it's ownership.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                When a card has a verified story, it becomes more than cardboard. It becomes a digital asset with documented provenance — and that makes it worth more.
              </p>
              <Link to="/pricing">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  Claim Founder Status <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div {...fadeUp(0.15)} className="space-y-4">
              {[
                { icon: CheckCircle, label: 'Every card becomes a digital asset', sub: 'Verified identity, documented value, permanent record.' },
                { icon: History, label: 'Ownership history travels with the card', sub: 'Every hand it passes through is logged forever.' },
                { icon: Video, label: 'Stories stay attached forever', sub: 'Owner messages, videos, and notes — all preserved on the QR.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50">
                  <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── VIRAL LOOP ── */}
      <section className="py-28 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Viral by Design</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Scan any card. Discover its story.
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">Every QR sticker is a gateway into the Origins network.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: Users, title: 'Follow cards across owners', body: 'Watch a card move through the hobby. See every collector who touched it.' },
              { icon: Eye, title: 'See scan activity', body: 'Real-time scan counts show how much attention your card is getting at shows and online.' },
              { icon: Star, title: 'Build reputation as a collector', body: 'Your verified trade history and collection become your calling card in the hobby.' },
            ].map((item, i) => (
              <motion.div key={item.title} {...fadeUp(i * 0.1)}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 flex flex-col gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="py-28 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Real Collectors</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Results that speak for themselves.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { quote: "Used the Card Show tool and caught a dealer charging 40% over market on a Ja Morant rookie. Saved me $85 on the spot.", name: "Marcus T.", tag: "Basketball Collector" },
              { quote: "The Pro Flipper found me 3 PSA 9s with 90%+ odds of grading a 10. Two came back 10s. That's literally free money.", name: "Dani R.", tag: "Card Flipper" },
              { quote: "I won't buy a high-value card without an Origins scan anymore. The ownership history is everything when you're spending $500+.", name: "Chris L.", tag: "Vintage Collector" },
            ].map((t, i) => (
              <motion.div key={i} {...fadeUp(i * 0.1)}
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
      <section className="py-28 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-3">Pricing</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Start free. Upgrade when ready.</h2>
            <p className="text-muted-foreground text-lg">Origins Pro pays for itself the first time you avoid a bad deal.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                name: 'Free', price: '$0', highlight: false,
                features: ['Register cards & QR codes', 'AI card identification', 'Full ownership history', 'Up to 5 story messages/day', 'BOLO stolen card alerts', 'Leaderboard & analytics'],
                cta: 'Get Started Free', ctaLink: '/register',
              },
              {
                name: 'Origins Pro Bundle', price: '$14.99', sub: '/mo', highlight: true, badge: 'Founder Exclusive',
                features: ['Everything in Free', 'Live Market Value (eBay + AI)', 'Card Show Trade Comps', 'Trending Top 100', 'Pro Card Flipper', 'Price Alerts', 'AI Card Grading', 'Bulk Deal Calculator', '3 months free for Founders'],
                cta: 'Claim 3 Months Free', ctaLink: '/pricing',
              },
            ].map((plan, i) => (
              <motion.div key={plan.name} {...fadeUp(i * 0.1)}
                className={`relative rounded-2xl border p-7 flex flex-col ${plan.highlight ? 'border-amber-400/40 bg-amber-400/5' : 'border-border/50 bg-card'}`}>
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30 whitespace-nowrap">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-5">
                  <h3 className={`font-bold text-sm mb-1 ${plan.highlight ? 'text-amber-400' : 'text-muted-foreground'}`}>{plan.name}</h3>
                  <div className="flex items-end gap-0.5">
                    <span className="text-3xl font-display font-bold text-foreground">{plan.price}</span>
                    {plan.sub && <span className="text-xs text-muted-foreground mb-1">{plan.sub}</span>}
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.highlight ? 'text-amber-400' : 'text-primary'}`} />{f}
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

          <motion.div {...fadeUp(0.1)} className="mt-6 grid sm:grid-cols-3 gap-4">
            {[
              { icon: Gift, title: '7-Day Free Trial', desc: 'Try Origins Pro free — no commitment.' },
              { icon: Tag, title: 'Referral Program', desc: 'You and a friend both get 7 free days.' },
              { icon: Sparkles, title: 'Creator Codes', desc: '50% off for 3 months for partner creators.' },
            ].map(p => (
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
          <motion.div {...fadeUp()}
            className="p-14 rounded-3xl bg-gradient-to-b from-card to-secondary/50 border border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-foreground mb-5 leading-tight">
                Start building your<br />
                <span className="text-primary">card's legacy today.</span>
              </h2>
              <p className="text-muted-foreground mb-10 max-w-md mx-auto text-base leading-relaxed">
                The collectors who use Origins don't just collect cards — they own verified assets with permanent identity. Join them.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/pricing">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-10 text-base font-semibold shadow-lg shadow-primary/25 gap-2">
                    Get Founder Benefits <ArrowRight className="w-4 h-4" />
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