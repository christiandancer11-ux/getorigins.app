import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePullToRefresh } from '../hooks/usePullToRefresh.jsx';
import { Handshake, Plus, TrendingUp, DollarSign, RefreshCw, Lock, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import LogTradeModal from '../components/card-show/LogTradeModal';
import TradeCard from '../components/card-show/TradeCard';
import TradeFilters from '../components/card-show/TradeFilters';
import EmptyState from '../components/shared/EmptyState';
import UpgradeModal from '../components/shared/UpgradeModal';
import { useSubscription } from '../hooks/useSubscription';

export default function CardShow() {
  const [showLog, setShowLog] = useState(false);
  const [search, setSearch] = useState('');
  const [sport, setSport] = useState('all');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [userBanned, setUserBanned] = useState(false);
  const { isPro, loading: subLoading } = useSubscription();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => { if (u?.trade_banned) setUserBanned(true); });
  }, []);

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['card-trades'],
    queryFn: () => base44.entities.CardTrade.list('-created_date', 200),
  });

  const { containerRef, PullIndicator } = usePullToRefresh(async () => {
    await queryClient.invalidateQueries({ queryKey: ['card-trades'] });
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return trades.filter(t => {
      const matchesSport = sport === 'all' || t.sport === sport;
      const matchesSearch = !q || [t.card_name, t.set_name, t.year, t.card_number, t.event_name]
        .filter(Boolean).some(v => v.toLowerCase().includes(q));
      return matchesSport && matchesSearch;
    });
  }, [trades, search, sport]);

  // Summary stats
  const totalTrades = trades.length;
  const avgDeal = trades.length
    ? (trades.reduce((s, t) => s + (t.total_value || 0), 0) / trades.length).toFixed(0)
    : 0;
  const tradesWithComps = trades.filter(t => t.ebay_comp_avg).length;

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
        <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Pro Feature</h2>
            <p className="text-sm text-muted-foreground mb-6">Card Show Trades is part of Origins Pro. Upgrade to log deals, browse real comps, and see what cards are actually selling for.</p>
            <Button onClick={() => setShowUpgrade(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8">
              View Plans
            </Button>
          </div>
        </div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} defaultPlan="pro" />}
      </>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        <PullIndicator />

        {/* Ban Banner */}
        {userBanned && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
            <Ban className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Trade Logging Suspended</p>
              <p className="text-xs text-destructive/80 mt-0.5">Your account has been temporarily banned from logging trades due to multiple out-of-range submissions. Please contact an admin to appeal and have your access reinstated.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-1 flex items-center gap-3">
                <Handshake className="w-7 h-7 text-primary" />
                Card Show Trades
              </h1>
              <p className="text-sm text-muted-foreground">
                Real in-person trade comps — log deals, see what cards are actually selling for at shows.
              </p>
            </div>
            <Button onClick={() => setShowLog(true)} disabled={userBanned} className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="w-4 h-4 mr-2" />
              Log a Trade
            </Button>
          </div>

          {/* Quick stats */}
          {totalTrades > 0 && (
            <div className="flex gap-6 mt-5 pt-5 border-t border-border/50">
              <div>
                <p className="text-2xl font-bold font-display text-foreground">{totalTrades}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><RefreshCw className="w-3 h-3" />Trades Logged</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-foreground">${avgDeal}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" />Avg Deal Value</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-foreground">{tradesWithComps}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" />With Market Comps</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Filters */}
        <div className="mb-6">
          <TradeFilters
            search={search}
            sport={sport}
            onSearchChange={setSearch}
            onSportChange={setSport}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-card border border-border/50 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          trades.length === 0 ? (
            <EmptyState
              icon={Handshake}
              title="No trades logged yet"
              description="Be the first to log a card show trade. Your deal will be visible to all collectors for real-time comps."
            >
              <Button onClick={() => setShowLog(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Log First Trade
              </Button>
            </EmptyState>
          ) : (
            <div className="text-center py-16 text-sm text-muted-foreground">No trades match your search.</div>
          )
        ) : (
          <div className="space-y-4">
            {filtered.map((trade, i) => (
              <TradeCard key={trade.id} trade={trade} index={i} />
            ))}
            <p className="text-center text-xs text-muted-foreground pt-2">
              Showing {filtered.length} of {trades.length} trades
            </p>
          </div>
        )}
      </div>

      {showLog && <LogTradeModal onClose={() => setShowLog(false)} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}