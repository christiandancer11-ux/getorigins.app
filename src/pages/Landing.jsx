import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { QrCode, Video, History, ArrowRight, Layers, Sparkles, TrendingUp, Handshake, BarChart2, Flame, MessageSquare, CheckCircle, Tag, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import RedeemCodeModal from '@/components/shared/RedeemCodeModal';

const HOW_IT_WORKS = [
  { icon: QrCode, title: 'Generate QR Stickers', description: 'Register your card — AI identifies it from your photo and generates a unique QR code sticker for the back.' },
  { icon: Video, title: 'Record Video Messages', description: 'Leave a personal video message — a memory, story, or greeting for the next owner.' },
  { icon: History, title: 'Trace the Journey', description: 'Every owner adds to the card\'s story. Scan to see the full timeline from owner to owner.' },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started, no card required.',
    color: 'text-muted-foreground',
    features: ['Register cards & generate QR codes', 'Up to 5 story messages/videos per day', 'Leaderboard & analytics'],
  },
  {
    name: 'Origins Pro Bundle',
    price: '$9.99',
    sub: '/mo',
    description: 'Everything you need to collect smarter.',
    color: 'text-amber-400',
    highlight: true,
    badge: 'All Features',
    features: ['Unlimited story messages & videos per day', 'Market Value & AI Card Scanner', 'Card Show Trades — real comp logs', 'Trending — Top 100 hottest cards', 'Live eBay, 130point & Origins data'],
  },
];

const PERKS = [
  { icon: Gift, title: '7-Day Free Trial', desc: 'Try all Expert features free when you subscribe — no commitment.' },
  { icon: Tag, title: 'Referral Program', desc: 'Share your code. You and your friend both get 7 free days.' },
  { icon: Sparkles, title: 'Creator Codes', desc: 'Partner creators unlock 50% off for their first 3 months.' },
];

function FeatureCard({ feature, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      transition={{ delay: index * 0.12, duration: 0.5 }}
      className="group relative p-7 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <feature.icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const [showRedeem, setShowRedeem] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />Every card has a story
            </div>
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-foreground leading-[0.95] tracking-tight mb-6">
              Give Your Cards<br /><span className="text-primary">A Voice</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Attach scannable QR stickers to your sports cards and TCGs. Record video messages that follow the card from owner to owner — building a living history.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Link to="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base">
                  Register Your First Card <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-border/50 hover:border-primary/30">
                  <Layers className="w-4 h-4 mr-2" />View My Cards
                </Button>
              </Link>
            </div>
            <button onClick={() => setShowRedeem(true)} className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
              Have a promo or referral code?
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.8 }} className="mt-16 relative">
            <div className="relative max-w-xs mx-auto">
              <div className="aspect-[2.5/3.5] rounded-2xl bg-gradient-to-br from-card via-secondary to-card border border-border/50 overflow-hidden shadow-2xl shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
                <div className="absolute inset-4 rounded-xl border border-border/30 flex flex-col items-center justify-center gap-3">
                  <QrCode className="w-16 h-16 text-primary/40" />
                  <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">Scan to discover</p>
                </div>
              </div>
              <div className="absolute -inset-8 bg-primary/5 rounded-full blur-3xl -z-10" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 border-t border-border/30">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Three simple steps to preserve your card's legacy.</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-secondary/20">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Everything a Collector Needs</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">From storytelling to market data — Origins has your collection covered.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: QrCode, title: 'AI Card Scanner', desc: 'Snap a photo — AI identifies the card and auto-fills all details.' },
              { icon: TrendingUp, title: 'Live Market Values', desc: 'Real-time eBay sold data, 130point comps, and community trade logs.' },
              { icon: Handshake, title: 'Card Show Trades', desc: 'Log real in-person deals. See what cards actually sell for at shows.' },
              { icon: Flame, title: 'Trending Top 100', desc: 'Football, Baseball, Pokémon, F1 and more — the hottest cards right now.' },
              { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Track scans, visitor counts, and engagement across your entire collection.' },
              { icon: MessageSquare, title: 'Video Message Timeline', desc: 'Every owner leaves a message. Cards build a story that travels with them.' },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-5 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-3">Simple Pricing</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Start free. Upgrade when you're ready for more.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {PLANS.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 flex flex-col ${plan.highlight ? 'border-amber-400/40 bg-amber-400/5' : 'border-border/50 bg-card'}`}>
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full border ${plan.highlight ? 'bg-amber-400/20 text-amber-400 border-amber-400/30' : 'bg-orange-400/20 text-orange-400 border-orange-400/30'}`}>
                    {plan.badge}
                  </span>
                )}
                <div className="mb-4">
                  <h3 className={`font-bold text-base ${plan.color} mb-0.5`}>{plan.name}</h3>
                  <div className="flex items-end gap-0.5">
                    <span className="text-2xl font-display font-bold text-foreground">{plan.price}</span>
                    {plan.sub && <span className="text-xs text-muted-foreground mb-1">{plan.sub}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/dashboard" className="mt-5">
                  <Button size="sm" variant={plan.highlight ? 'default' : 'outline'}
                    className={`w-full ${plan.highlight ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-border/50'}`}>
                    {plan.name === 'Free' ? 'Get Started' : 'Choose Plan'}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-10 grid sm:grid-cols-3 gap-4">
            {PERKS.map((p, i) => (
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

      {/* CTA */}
      <section className="py-20 px-6 border-t border-border/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-b from-card to-secondary/50 border border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Start Building Your Collection's History</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Every card you own holds memories. Don't let them fade.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8">
                    Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
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

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <img src="https://media.base44.com/images/public/69ceb0c6913655f4b9105f84/7231ac246_BF64DB45-9D7E-4450-BC8E-767F5F7DD0E0.jpeg" alt="Origins" className="h-7 w-7 rounded-md" />
          <div className="flex items-center gap-4">
            <button onClick={() => setShowRedeem(true)} className="text-xs text-muted-foreground hover:text-primary transition-colors">Redeem Code</button>
            <p className="text-xs text-muted-foreground">Every card has a story.</p>
          </div>
        </div>
      </footer>

      {showRedeem && <RedeemCodeModal onClose={() => setShowRedeem(false)} />}
    </div>
  );
}