import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from '@/components/shared/UpgradeModal';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Award, Loader2, Lock, Zap, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import FlipOpportunitiesList from '@/components/flipper/FlipOpportunitiesList';
import GradingOddsList from '@/components/flipper/GradingOddsList';

const TABS = [
  { id: 'flip', label: 'Buy Low / Sell High', icon: TrendingUp, desc: 'Top 10 flip opportunities across all categories' },
  { id: 'grade', label: 'Perfect 10 Candidates', icon: Award, desc: 'Cards most likely to grade a perfect 10' },
];

export default function ProCardFlipper() {
  const { isPro, loading: subLoading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activeTab, setActiveTab] = useState('flip');

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md w-full">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-amber-400/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-3">Pro Card Flipper</h1>
            <p className="text-muted-foreground mb-2 text-base">
              AI-powered buy low / sell high opportunities and perfect 10 grading candidates — updated live from eBay, 130point, and grading population reports.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Available in the <span className="text-primary font-semibold">Origins Pro Bundle</span>.
            </p>
            <Button onClick={() => setShowUpgrade(true)} className="w-full bg-primary text-primary-foreground h-12 text-base font-semibold">
              <Zap className="w-4 h-4 mr-2" />Unlock with Origins Pro — $9.99/mo
            </Button>
          </div>
        </div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pro Card Flipper</h1>
          <p className="text-xs text-muted-foreground">AI-powered market intelligence · Live data</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-secondary/50 border border-border/50 mb-8">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.id === 'flip' ? 'Flip' : 'Grade 10'}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'flip' ? (
          <motion.div key="flip" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <FlipOpportunitiesList />
          </motion.div>
        ) : (
          <motion.div key="grade" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <GradingOddsList />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}