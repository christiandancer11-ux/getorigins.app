import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Search, Loader2, BarChart2, ShoppingCart, AlertCircle, Camera, Lock, Bell } from 'lucide-react';
import SetAlertModal from '../components/alerts/SetAlertModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import MarketSummaryCards from '../components/market/MarketSummaryCards';
import SoldListingsTable from '../components/market/SoldListingsTable';
import CardShowComps from '../components/market/CardShowComps';
import CardScanner from '../components/market/CardScanner';
import UpgradeModal from '../components/shared/UpgradeModal';
import { useSubscription } from '../hooks/useSubscription';

const TABS = [
  { id: 'search', label: 'Search', icon: Search },
  { id: 'scan', label: 'Scan & Value', icon: Camera },
];

export default function MarketValue() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const { isPro, loading: subLoading } = useSubscription();

  const { data: allTrades = [] } = useQuery({
    queryKey: ['card-trades'],
    queryFn: () => base44.entities.CardTrade.list('-created_date', 500),
    enabled: !!activeSearch,   // only fetch once a search is triggered
    staleTime: 2 * 60 * 1000, // cache for 2 minutes
  });

  const showTrades = useMemo(() => {
    if (!activeSearch || !allTrades.length) return [];
    const q = activeSearch.toLowerCase();
    return allTrades.filter(t =>
      [t.card_name, t.set_name, t.year, t.card_number].filter(Boolean)
        .some(v => v.toLowerCase().includes(q))
    );
  }, [allTrades, activeSearch]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setActiveSearch(searchInput.trim());
    setLoading(true);
    setResult(null);
    setError(null);
    const res = await base44.functions.invoke('fetchCardComps', { card_name: searchInput.trim() });
    if (res.data?.error) setError(res.data.error);
    else setResult(res.data);
    setLoading(false);
  };

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <>
        <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Pro Feature</h2>
            <p className="text-sm text-muted-foreground mb-6">Market Value — including live eBay comps, 130point data, and the AI Card Scanner — is part of Origins Pro.</p>
            <Button onClick={() => setShowUpgrade(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
              View Plans
            </Button>
          </div>
        </div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} defaultPlan="pro" />}
        {showAlertModal && (
          <SetAlertModal
            prefill={{ card_name: activeSearch }}
            onClose={() => setShowAlertModal(false)}
            onCreated={() => setShowAlertModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
            <TrendingUp className="w-3.5 h-3.5" />Live Market Data
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">Market Value</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Search by name or snap a photo — AI identifies the card and pulls live prices from eBay, 130point.com, and Origins community trades.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="flex gap-2 p-1 rounded-xl bg-secondary/50 border border-border/50 mb-8 w-fit mx-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'scan' ? (
            <motion.div key="scan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <CardScanner />
            </motion.div>
          ) : (
            <motion.div key="search" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="e.g. 2011 Mike Trout RC, Charizard Base Set Holo, Black Lotus MTG, Blue-Eyes White Dragon LOB..."
                    className="pl-9 bg-secondary border-border h-11"
                  />
                </div>
                <Button type="submit" disabled={loading || !searchInput.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-5 shrink-0">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span className="ml-2 hidden sm:inline">{loading ? 'Searching...' : 'Search'}</span>
                </Button>
              </form>

              {loading && (
                <div className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Researching market prices...</p>
                      <p className="text-sm text-muted-foreground">Pulling sold data from eBay & 130point.com</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 mb-6">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <AnimatePresence mode="wait">
                {result && !loading && (
                  <motion.div key={activeSearch} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    {result.insufficient_data && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                        <p className="text-sm text-destructive leading-relaxed">
                          <strong>Not enough data</strong> — fewer than 3 confirmed sold listings were found for this card. There is insufficient recent sales activity to determine a reliable market value. This may be a very low-population card or a card that rarely trades publicly.
                        </p>
                      </div>
                    )}
                    {!result.insufficient_data && result.low_data && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-300 leading-relaxed">
                          <strong>Limited data</strong> — only {result.total_confirmed_sales_count} confirmed sales found. The estimated value may not fully reflect current market conditions.
                        </p>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Results for</p>
                        <h2 className="font-display text-xl font-bold text-foreground">{activeSearch}</h2>
                        {result.search_query_used && result.search_query_used !== activeSearch && (
                          <p className="text-xs text-muted-foreground mt-0.5">Searched as: <span className="italic">{result.search_query_used}</span></p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowAlertModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors shrink-0"
                      >
                        <Bell className="w-3.5 h-3.5" />Set Alert
                      </button>
                    </div>
                    <MarketSummaryCards
                      result={result}
                      showTradesCount={showTrades.length}
                      conditionLabel={(() => {
                        const q = activeSearch || '';
                        const gradedMatch = q.match(/\b(PSA|BGS|SGC|CGC|HGA|CSG)\s*([\d.]+)/i);
                        if (gradedMatch) return `${gradedMatch[1].toUpperCase()} ${gradedMatch[2]} (Graded)`;
                        if (/\braw\b|\bungraded\b/i.test(q)) return 'Raw / Ungraded';
                        return null;
                      })()}
                    />
                    {result.market_summary && (
                      <div className="rounded-2xl bg-card border border-border/50 p-5">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <BarChart2 className="w-3.5 h-3.5" />Market Analysis
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">{result.market_summary}</p>
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-6">
                      <SoldListingsTable title="eBay Sold Listings" icon={ShoppingCart} sales={result.ebay_recent_sales || []} avg={result.ebay_avg} low={result.ebay_low} high={result.ebay_high} salesCount={result.ebay_sales_count} accentColor="text-blue-400" bgColor="bg-blue-400/10" borderColor="border-blue-400/20" />
                      <SoldListingsTable title="130point.com Sales" icon={TrendingUp} sales={result.point130_recent_sales || []} avg={result.point130_avg} low={result.point130_low} high={result.point130_high} salesCount={null} accentColor="text-emerald-400" bgColor="bg-emerald-400/10" borderColor="border-emerald-400/20" />
                      {result.tcgplayer_market_price != null || (result.tcgplayer_recent_sales && result.tcgplayer_recent_sales.length > 0) ? (
                        <SoldListingsTable title="TCGPlayer Verified Dealers" icon={ShoppingCart} sales={result.tcgplayer_recent_sales || []} avg={result.tcgplayer_market_price} low={result.tcgplayer_low} high={result.tcgplayer_high} salesCount={null} accentColor="text-violet-400" bgColor="bg-violet-400/10" borderColor="border-violet-400/20" />
                      ) : null}
                    </div>
                    <CardShowComps trades={showTrades} query={activeSearch} />
                  </motion.div>
                )}
              </AnimatePresence>

              {!result && !loading && !error && (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                    <TrendingUp className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Search for any card</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Enter a player name, set, year, or grade — or switch to <button onClick={() => setActiveTab('scan')} className="text-primary underline">Scan & Value</button> to photograph a card directly.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {['2011 Mike Trout Topps Update RC', 'LeBron James Prizm PSA 10', 'Charizard Base Set Holo', 'Patrick Mahomes Rookie', 'Blue-Eyes White Dragon LOB 1st Edition', 'Black Lotus Alpha MTG', 'Pikachu Illustrator PSA 10', 'One Piece Luffy OP01'].map(ex => (
                      <button key={ex} onClick={() => setSearchInput(ex)}
                        className="text-xs px-3 py-1.5 rounded-full bg-secondary border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}