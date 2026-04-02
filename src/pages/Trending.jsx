import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Loader2, RefreshCw, Lock, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from '@/components/shared/UpgradeModal';
import TrendingCategoryPicker, { CATEGORIES } from '@/components/trending/TrendingCategoryPicker';
import TrendingCardRow from '@/components/trending/TrendingCardRow';

export default function Trending() {
  const { isExpert, loading: subLoading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('football');
  const [trendingData, setTrendingData] = useState({});
  const [loadingCategory, setLoadingCategory] = useState(null);

  const currentData = trendingData[selectedCategory];
  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);

  const fetchCategory = async (categoryId) => {
    if (trendingData[categoryId]) return; // cached
    setLoadingCategory(categoryId);
    const res = await base44.functions.invoke('fetchTrending', { category: categoryId });
    if (res.data && !res.data.error) {
      setTrendingData(prev => ({ ...prev, [categoryId]: res.data }));
    }
    setLoadingCategory(null);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (isExpert) fetchCategory(categoryId);
  };

  const handleRefresh = () => {
    setTrendingData(prev => {
      const updated = { ...prev };
      delete updated[selectedCategory];
      return updated;
    });
    fetchCategory(selectedCategory);
  };

  // Load first category once expert status confirmed
  React.useEffect(() => {
    if (isExpert && !currentData && loadingCategory !== selectedCategory) {
      fetchCategory(selectedCategory);
    }
  }, [isExpert]);

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isExpert) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md w-full">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-amber-400/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
              <Flame className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-3">Trending</h1>
            <p className="text-muted-foreground mb-2 text-base">
              See the top 100 hottest cards right now across all major markets — eBay, 130point, and Origins card shows.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Available in the <span className="text-primary font-semibold">Expert Bundle</span>.
            </p>

            {/* Category preview (locked) */}
            <div className="flex gap-2 overflow-x-auto pb-3 justify-center mb-8">
              {CATEGORIES.map(cat => (
                <div key={cat.id} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border/30 bg-secondary/20 text-xs text-muted-foreground/50 whitespace-nowrap">
                  <span>{cat.emoji}</span>{cat.label}
                  <Lock className="w-2.5 h-2.5 ml-0.5" />
                </div>
              ))}
            </div>

            {/* Fake locked rows */}
            <div className="rounded-2xl border border-border/30 overflow-hidden mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/60 to-card z-10 pointer-events-none" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 blur-sm">
                  <div className="w-8 text-center text-xs font-bold text-muted-foreground">#{i + 1}</div>
                  <div className="flex-1">
                    <div className={`h-3 rounded bg-secondary/60 mb-1.5`} style={{ width: `${70 - i * 8}%` }} />
                    <div className="h-2 rounded bg-secondary/40 w-1/2" />
                  </div>
                  <div className="h-4 w-12 rounded bg-secondary/40" />
                </div>
              ))}
            </div>

            <Button onClick={() => setShowUpgrade(true)} className="w-full bg-primary text-primary-foreground h-12 text-base font-semibold">
              <Zap className="w-4 h-4 mr-2" />Unlock with Expert Bundle — $14.99/mo
            </Button>
          </div>
        </div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} defaultPlan="expert" />}
      </>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Trending</h1>
            <p className="text-xs text-muted-foreground">What's hot right now · Live market data</p>
          </div>
        </div>
        {currentData && (
          <button onClick={handleRefresh} disabled={loadingCategory === selectedCategory} className="text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className={`w-4 h-4 ${loadingCategory === selectedCategory ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="mb-6">
        <TrendingCategoryPicker selected={selectedCategory} onSelect={handleCategorySelect} />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loadingCategory === selectedCategory ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Building Top 100 for {currentCategory?.label}...</p>
              <p className="text-sm text-muted-foreground mt-1">Analyzing eBay, 130point & Origins trades</p>
            </div>
          </motion.div>
        ) : currentData ? (
          <motion.div key={selectedCategory} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {/* Summary banner */}
            {currentData.category_summary && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 mb-4 flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/90">{currentData.category_summary}</p>
              </div>
            )}

            {/* Stats row */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-semibold text-foreground">Top {currentData.cards?.length || 0} Cards</span>
              <span className="text-xs text-muted-foreground">
                Updated {currentData.generated_at ? new Date(currentData.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>

            {/* Card list */}
            <div className="rounded-2xl border border-border/40 overflow-hidden bg-card">
              {currentData.cards?.map((card, i) => (
                <TrendingCardRow key={card.rank} card={card} highlight={i < 3} />
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Data sourced from eBay sold listings, 130point.com, and Origins community trades.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}