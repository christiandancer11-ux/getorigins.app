import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { QrCode, Video, History, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: QrCode,
    title: 'Generate QR Stickers',
    description: 'Register your card and get a unique QR code to print as a sticker for the back of your card.',
  },
  {
    icon: Video,
    title: 'Record Video Messages',
    description: 'Leave a personal video message about your card — a memory, a story, or a greeting for the next owner.',
  },
  {
    icon: History,
    title: 'Trace the Journey',
    description: 'Every owner adds to the card\'s story. Scan the QR to see the full timeline of video messages.',
  },
];

function FeatureCard({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="group relative p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500"
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
          <feature.icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Every card has a story
            </div>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-bold text-foreground leading-[0.95] tracking-tight mb-6">
              Give Your Cards
              <br />
              <span className="text-primary">A Voice</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Attach scannable QR stickers to your sports cards and TCGs. 
              Record video messages that follow the card from owner to owner — building a living history.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base">
                  Register Your First Card
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-border/50 hover:border-primary/30">
                  <Layers className="w-4 h-4 mr-2" />
                  View My Cards
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Floating card visual */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="relative max-w-xs mx-auto">
              <div className="aspect-[2.5/3.5] rounded-2xl bg-gradient-to-br from-card via-secondary to-card border border-border/50 overflow-hidden shadow-2xl shadow-primary/5">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
                <div className="absolute inset-4 rounded-xl border border-border/30 flex flex-col items-center justify-center gap-3">
                  <QrCode className="w-16 h-16 text-primary/40" />
                  <p className="text-xs text-muted-foreground font-medium tracking-widest uppercase">Scan to discover</p>
                </div>
              </div>
              {/* Glow behind card */}
              <div className="absolute -inset-8 bg-primary/5 rounded-full blur-3xl -z-10" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Three simple steps to preserve your card's legacy.</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-3xl bg-gradient-to-b from-card to-secondary/50 border border-border/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Start Building Your Collection's History</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Every card you own holds memories. Don't let them fade.</p>
              <Link to="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-primary" />
            <span className="font-display text-sm font-semibold text-foreground">Origins</span>
          </div>
          <p className="text-xs text-muted-foreground">Every card has a story.</p>
        </div>
      </footer>
    </div>
  );
}