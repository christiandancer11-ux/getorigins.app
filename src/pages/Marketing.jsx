import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, TrendingUp, Users, QrCode, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Marketing() {
  const features = [
    {
      icon: QrCode,
      title: 'AI-Powered Card Recognition',
      description: 'Upload a photo and let AI automatically identify your card details.'
    },
    {
      icon: Zap,
      title: 'Instant QR Codes',
      description: 'Generate unique QR codes for each card to track scans and engagement.'
    },
    {
      icon: TrendingUp,
      title: 'Market Analytics',
      description: 'Monitor real-time pricing data and market trends for your collection.'
    },
    {
      icon: Users,
      title: 'Trading Community',
      description: 'Connect with collectors, log trades, and verify market deals.'
    },
    {
      icon: Shield,
      title: 'Stolen Card Alerts',
      description: 'BOLO network to protect against theft at shows and shops.'
    },
    {
      icon: Sparkles,
      title: 'Collection Stories',
      description: 'Add video messages and build the narrative behind each card.'
    }
  ];

  const tiers = [
    {
      name: 'Free',
      price: 'Free',
      features: ['Register unlimited cards', 'Generate QR codes', 'Basic analytics', 'Community trading']
    },
    {
      name: 'Origins Pro',
      price: '$9.99/mo',
      features: ['Everything in Free', 'Advanced market data', 'Price alerts', 'Trading insights', 'Priority support'],
      highlighted: true
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="pt-32 pb-20 px-4 sm:px-6 bg-gradient-to-b from-secondary/40 to-background">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="font-display text-5xl font-bold text-foreground mb-4">
            Transform Your Card Collection Into Stories
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Track, verify, and share your trading card collection with Origins—the platform built for serious collectors.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Register Your First Card
            </Button>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">Why Collectors Choose Origins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="p-6 rounded-2xl border border-border hover:border-primary/30 transition-colors">
                  <Icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-20 px-4 sm:px-6 bg-secondary/20">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tiers.map((tier, i) => (
              <div key={i} className={`p-8 rounded-2xl border transition-all ${
                tier.highlighted 
                  ? 'border-primary bg-primary/10 scale-105' 
                  : 'border-border'
              }`}>
                <h3 className="font-semibold text-lg text-foreground mb-2">{tier.name}</h3>
                <p className="text-3xl font-bold text-primary mb-6">{tier.price}</p>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>{f}
                    </li>
                  ))}
                </ul>
                <Button variant={tier.highlighted ? 'default' : 'outline'} className="w-full">
                  {tier.name === 'Free' ? 'Get Started' : 'Upgrade Now'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of collectors managing their cards on Origins.</p>
          <Link to="/register">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Register Your First Card Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}