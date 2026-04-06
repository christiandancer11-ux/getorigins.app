import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Loader2, RefreshCw, Lock, Zap, TrendingUp, DollarSign, Search, ShoppingCart, BarChart2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from '@/components/shared/UpgradeModal';
import TrendingCategoryPicker, { CATEGORIES } from '@/components/trending/TrendingCategoryPicker';
import TrendingCardRow from '@/components/trending/TrendingCardRow';
import TrendingCardDetailSheet from '@/components/trending/TrendingCardDetailSheet';
import SetAlertModal from '@/components/alerts/SetAlertModal';
import { usePullToRefresh } from '@/hooks/usePullToRefresh.jsx';
import BoxPriceTracker from '@/components/trending/BoxPriceTracker';

const VIEW_MODES = [
  { id: 'hottest',       label: 'Hottest',        icon: Flame,       desc: 'Overall hottest cards right now'        },
  { id: 'highest_sold',  label: 'Highest Sold',   icon: DollarSign,  desc: 'Highest recent sale prices'             },
  { id: 'most_searched', label: 'Most Searched',  icon: Search,      desc: 'Most searched players & cards'          },
  { id: 'most_bought',   label: 'Most Bought',    icon: ShoppingCart,desc: 'Most bought cards recently'             },
  { id: 'rising',        label: '48hr Growth',    icon: BarChart2,   desc: 'Steady value growth in last 48 hours'   },
  { id: 'new_releases',  label: 'New Releases',   icon: Package,     desc: 'Newest products — MSRP & best prices'  },
];

export default function Trending() {
  const { isExpert, loading: subLoading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('football');
  const [selectedViewMode, setSelectedViewMode] = useState('hottest');
  const [trendingData, setTrendingData] = useState({});
  const [loadingCategory, setLoadingCategory] = useState(null);
  const [visibleCount, setVisibleCount] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [alertCard, setAlertCard] = useState(null);

  const cacheKey = `${selectedCategory}__${selectedViewMode}`;
  const currentData = trendingData[cacheKey];
  const currentCategory = CATEGORIES.find(c => c.id === selectedCategory);
  const currentVisible = visibleCount[cacheKey] || 25;

  const fetchCategory = async (categoryId, viewMode) => {
    const key = `${categoryId}__${viewMode}`;
    if (trendingData[key]) return;
    setLoadingCategory(key);
    try {
      const res = await base44.functions.invoke('fetchTrending', { category: categoryId, viewMode, limit: 15 });
      if (res.data && !res.data.error) {
        setTrendingData(prev => ({ ...prev, [key]: res.data }));
      }
    } catch (e) {
      console.error('Failed to fetch trending:', e.message);
      // Set empty data to show error state but prevent infinite loading
      setTrendingData(prev => ({ ...prev, [key]: { cards: [], error: 'Failed to load trending data' } }));
    }
    setLoadingCategory(null);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (isExpert) fetchCategory(categoryId, selectedViewMode);
  };

  const handleViewModeSelect = (modeId) => {
    setSelectedViewMode(modeId);
    if (isExpert) fetchCategory(selectedCategory, modeId);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setTrendingData(prev => { const u = { ...prev }; delete u[cacheKey]; return u; });
    setVisibleCount(prev => ({ ...prev, [cacheKey]: 100 }));
    setLoadingCategory(cacheKey);
    try {
      const res = await base44.functions.invoke('fetchTrending', { category: selectedCategory, viewMode: selectedViewMode, limit: 100 });
      if (res.data && !res.data.error) {
        setTrendingData(prev => ({ ...prev, [cacheKey]: res.data }));
      }
    } catch (e) {
      console.error('Failed to load more:', e.message);
    }
    setLoadingCategory(null);
    setLoadingMore(false);
  };

  const handleRefresh = () => {
    setVisibleCount(prev => ({ ...prev, [cacheKey]: 25 }));
    setTrendingData(prev => { const u = { ...prev }; delete u[cacheKey]; return u; });
    fetchCategory(selectedCategory, selectedViewMode);
  };

  React.useEffect(() => {
    if (isExpert && !currentData && loadingCategory !== cacheKey) {
      fetchCategory(selectedCategory, selectedViewMode);
    }
  }, [isExpert]);

  const { containerRef, PullIndicator } = usePullToRefresh(async () => {
    if (isExpert) {
      setTrendingData(prev => { const u = { ...prev }; delete u[cacheKey]; return u; });
      await fetchCategory(selectedCategory, selectedViewMode);
    }
  });

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
              Available in the <span className="text-primary font-semibold">Origins Pro Bundle</span>.
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
              <Zap className="w-4 h-4 mr-2" />Unlock with Origins Pro — $9.99/mo
            </Button>
          </div>
        </div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </>
    );
  }

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto px-4 py-8">
      <PullIndicator />
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
      <div className="mb-3">
        <TrendingCategoryPicker selected={selectedCategory} onSelect={handleCategorySelect} />
      </div>

      {/* View mode filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-hide">
        {VIEW_MODES.map(mode => {
          const Icon = mode.icon;
          const active = selectedViewMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => handleViewModeSelect(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all shrink-0
                ${active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/40 text-muted-foreground border-border/40 hover:border-primary/40 hover:text-foreground'
                }`}
            >
              <Icon className="w-3 h-3" />
              {mode.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* New Releases tab */}
        {selectedViewMode === 'new_releases' ? (
          <motion.div key={`box-${selectedCategory}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <BoxPriceTracker category={selectedCategory} />
          </motion.div>
        ) : loadingCategory === cacheKey ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{VIEW_MODES.find(m => m.id === selectedViewMode)?.desc} · {currentCategory?.label}</p>
              <p className="text-sm text-muted-foreground mt-1">Scanning eBay, 130point & Origins trades…</p>
            </div>
          </motion.div>
        ) : currentData?.error ? (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-12 text-center rounded-xl bg-destructive/5 border border-destructive/20 px-6">
            <p className="font-semibold text-foreground">Failed to load data</p>
            <p className="text-sm text-muted-foreground">Please try again or refresh the page.</p>
            <Button variant="outline" onClick={handleRefresh} className="mt-2">Retry</Button>
          </motion.div>
        ) : currentData ? (
          <motion.div key={cacheKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {/* Summary banner */}
            {currentData.category_summary && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 mb-4 flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/90">{currentData.category_summary}</p>
              </div>
            )}

            {/* Stats row */}
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm font-semibold text-foreground">{VIEW_MODES.find(m => m.id === selectedViewMode)?.label} · Top {currentData.cards?.length || 0} Cards</span>
              <span className="text-xs text-muted-foreground">
                Updated {currentData.generated_at ? new Date(currentData.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>

            {/* Card list */}
            <div className="rounded-2xl border border-border/40 overflow-hidden bg-card">
            {currentData.cards?.slice(0, currentVisible).map((card, i) => (
            <TrendingCardRow key={card.rank} card={card} highlight={i < 3} onClick={() => setSelectedCard(card)} onSetAlert={(c) => setAlertCard(c)} />
            ))}
            </div>

            {/* Load More */}
            {currentVisible < 100 && currentData.cards?.length >= 15 && (
              <div className="flex justify-center mt-5">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="gap-2 text-sm"
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  {loadingMore ? 'Loading...' : 'Load More (up to 100)'}
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center mt-4">
              Data sourced from eBay sold listings, 130point.com, and Origins community trades.
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {selectedCard && (
        <TrendingCardDetailSheet
          card={selectedCard}
          viewMode={selectedViewMode}
          onClose={() => setSelectedCard(null)}
        />
      )}
      {alertCard && (
        <SetAlertModal
          prefill={{
            card_name: alertCard.player_or_name,
            set_name: alertCard.set_name,
            year: alertCard.year,
            variant: alertCard.variant,
          }}
          onClose={() => setAlertCard(null)}
          onCreated={() => setAlertCard(null)}
        />
      )}
    </div>
  );
}