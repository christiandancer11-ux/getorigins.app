import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, QrCode, Sparkles, Tag, Gift, Star, TrendingUp, Shield, ChevronRight, Scan, Video, BarChart3, CheckCircle, Bell, BookOpen, Zap } from 'lucide-react';
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
import GradingSupport from '@/components/landing/GradingSupport';
import DataTransparency from '@/components/landing/DataTransparency';
import CommunityProof from '@/components/landing/CommunityProof';
import BrandLogos from '@/components/landing/BrandLogos';
import MajorPullAlerts from '@/components/landing/MajorPullAlerts';

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

      {/* ── BRAND LOGOS ── */}
      <div className="px-6 max-w-4xl mx-auto w-full">
        <BrandLogos />
      </div>

      {/* ── PROBLEM ── */}
      <section className="py-20 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-5">
              Your cards deserve a better home.
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Origins is the all-in-one app for tracking, valuing, and sharing your card collection — whether you collect sports cards, Pokémon, Lorcana, or any TCG.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── LORCANA SPOTLIGHT ── */}
      <section className="py-16 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="flex flex-col sm:flex-row items-center gap-10">
            {/* Card image */}
            <div className="shrink-0 w-40 sm:w-48">
              <img
                src="https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=600&fit=crop"
                alt="Disney Lorcana card example"
                className="w-full drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 8px 24px rgba(94,200,255,0.25))' }}
              />
            </div>
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-semibold mb-4 tracking-wide">
                👑 Now Fully Supported
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight">
                Disney Lorcana collectors — Origins has you covered.
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-4">
                Track your Lorcana collection, scan cards for instant identification, get real-time TCGPlayer market prices, and see what's trending — all the same tools sports card collectors use, built for Lorcana.
              </p>
              <ul className="space-y-1.5">
                {['AI card identification from photos', 'Live TCGPlayer & eBay market pricing', 'Trending hot cards by set', 'AI Bulk Deal Calculator for trades'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-sky-400">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">How It Works</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Set up in 2 minutes. Use it forever.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Scan,      num: '1', label: 'Photo your card', desc: 'AI instantly identifies the player, set, year, and grade.' },
              { icon: QrCode,    num: '2', label: 'Get a QR code', desc: 'A unique sticker that stays with your card forever.' },
              { icon: TrendingUp,num: '3', label: 'Track its value', desc: 'Live market prices and AI-powered signals update automatically.' },
              { icon: Video,     num: '4', label: 'Share its story', desc: 'Leave a video message. Every owner adds to the history.' },
            ].map((item, i) => (
              <motion.div key={item.label} {...fadeUp(i * 0.1)}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Step {item.num}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1 leading-snug">{item.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCAN SPEED DEMO ── */}
      <section className="py-20 px-6 border-t border-border/30">
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
      <section className="py-20 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Know What Your Cards Are Worth</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Real prices. Real time.
            </h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">Live eBay comps, TCGPlayer pricing, portfolio ROI tracking, and price alerts — all in one place.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5 mb-6">
            {[
              { icon: BarChart3, title: 'Live Market Comps', body: 'Real-time eBay Sold, TCGPlayer, and Heritage Auctions data updated constantly.' },
              { icon: Sparkles, title: 'Portfolio Tracking', body: 'Watch your collection value grow. See gains and losses by grade, set, and sport.' },
              { icon: Bell, title: 'Price Alerts', body: 'Set a target price and get notified the moment a card hits your number.' },
            ].map((item, i) => (
              <motion.div key={item.title} {...fadeUp(i * 0.1)}
                className="p-6 rounded-2xl bg-primary/5 border border-primary/15 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <DataTransparency />
        </div>
      </section>

      {/* ── GRADED & RAW + IMPORT ── */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-12 items-start">
          <motion.div {...fadeUp()}>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Graded & Raw Cards</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Raw or slabbed — Origins knows your card.
            </h2>
            <p className="text-muted-foreground mb-6">
              Instant PSA/BGS cert lookups, automatic pop reports, and grade-specific pricing.
            </p>
            <GradingSupport />
          </motion.div>
          <motion.div {...fadeUp(0.1)}>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Easy Import</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Already have a collection elsewhere?
            </h2>
            <p className="text-muted-foreground mb-6">
              Import from PriceGuide, Ludex, TCGPlayer, or any spreadsheet. No re-scanning needed.
            </p>
            <ImportCTA />
          </motion.div>
        </div>
      </section>

      {/* ── PORTFOLIO + SET PROGRESS ── */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-12 items-start">
          <motion.div {...fadeUp()}>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Track Your Collection</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              See your portfolio grow in real time.
            </h2>
            <p className="text-muted-foreground mb-6">Daily market movers, ROI tracking, and total collection value — all in your dashboard.</p>
            <PortfolioTrends />
          </motion.div>
          <motion.div {...fadeUp(0.1)}>
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Set Completion</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Know exactly what you're missing.
            </h2>
            <p className="text-muted-foreground mb-6">Origins shows your set completion %, alerts you when missing cards go up for sale, and keeps you on track.</p>
            <SetProgressViz />
          </motion.div>
        </div>
      </section>

      {/* ── WHY ORIGINS ── */}
      <section className="py-20 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">Why Origins</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              More than a collection app.
            </h2>
            <p className="text-muted-foreground text-base max-w-lg mx-auto">Origins gives your cards a permanent identity — verified value, ownership history, and community all in one QR code.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: CheckCircle, title: 'Verified ownership', body: 'Every card gets a permanent QR code. Ownership history is logged forever — across every collector who touches it.' },
              { icon: Star, title: 'Build your reputation', body: 'Your verified trade history and collection become your identity in the hobby.' },
              { icon: Shield, title: 'Protected & trusted', body: 'BOLO alerts for stolen cards. Verified trade comps. AI-checked authenticity at every step.' },
            ].map((item, i) => (
              <motion.div key={item.title} {...fadeUp(i * 0.1)}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CommunityProof />

      {/* ── MAJOR PULL ALERTS ── */}
      <section className="py-16 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <MajorPullAlerts />
        </div>
      </section>

      {/* ── LEARNING CENTER ── */}
      <section className="py-20 px-6 bg-secondary/15 border-t border-border/30">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <p className="text-xs font-bold tracking-widest text-primary uppercase mb-4">New Collectors</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Learn how to collect the right way.
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">Free, personalized learning paths designed to teach you everything from card types and buying strategies to grading and flipping tactics.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            {[
              { icon: BookOpen, title: '10-20 Lessons', desc: 'Comprehensive guides tailored to your goals' },
              { icon: Zap, title: 'Unlock Rewards', desc: '7-day Pro access for each milestone' },
              { icon: Sparkles, title: 'Learn by Doing', desc: 'Practice with Origins features as you go' },
            ].map((item, i) => (
              <motion.div key={item.title} {...fadeUp(i * 0.1)}
                className="p-6 rounded-2xl bg-card border border-border/50 flex flex-col gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center">
            <Link to="/learn">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-10 text-base font-semibold gap-2 shadow-lg shadow-primary/25">
                <BookOpen className="w-4 h-4" />
                Start Learning Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-20 px-6 bg-secondary/15 border-t border-border/30">
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

          <motion.div {...fadeUp(0.1)} className="mt-5 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5 text-primary" /> 7-Day Free Trial</span>
            <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-primary" /> Referral Program — you and a friend both get 7 free days</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary" /> Creator Codes — 50% off for 3 months</span>
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