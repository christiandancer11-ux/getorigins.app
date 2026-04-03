import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { ShieldCheck, Handshake, DollarSign, Trophy, TrendingUp, MapPin, CreditCard, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import SportBadge from '@/components/shared/SportBadge';

const CONDITION_LABELS = {
  raw: 'Raw', psa_10: 'PSA 10', psa_9: 'PSA 9', psa_8: 'PSA 8',
  psa_7: 'PSA 7', bgs_10: 'BGS 10', bgs_9_5: 'BGS 9.5', bgs_9: 'BGS 9', sgc_10: 'SGC 10',
};

const SPORT_LABELS = {
  baseball: 'Baseball', basketball: 'Basketball', football: 'Football',
  hockey: 'Hockey', soccer: 'Soccer', pokemon: 'Pokémon', magic_the_gathering: 'MTG', yugioh: 'Yu-Gi-Oh!', other: 'Other',
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CollectorProfile() {
  const { email } = useParams();
  const decodedEmail = decodeURIComponent(email);

  const { data: users = [] } = useQuery({
    queryKey: ['collector-user', decodedEmail],
    queryFn: () => base44.entities.User.filter({ email: decodedEmail }),
  });
  const user = users[0];

  const { data: allTrades = [], isLoading: loadingTrades } = useQuery({
    queryKey: ['collector-trades', decodedEmail],
    queryFn: () => base44.entities.CardTrade.filter({ created_by: decodedEmail }, '-created_date', 100),
  });

  const { data: allCards = [], isLoading: loadingCards } = useQuery({
    queryKey: ['collector-cards', decodedEmail],
    queryFn: () => base44.entities.Card.filter({ created_by: decodedEmail }, '-created_date', 100),
  });

  const topSports = useMemo(() => {
    const map = {};
    allTrades.forEach(t => { if (t.sport) { map[t.sport] = (map[t.sport] || 0) + 1; } });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([sport]) => sport);
  }, [allTrades]);

  const totalValue = allTrades.reduce((s, t) => s + (t.total_value || 0), 0);
  const verifiedCount = allTrades.filter(t => t.verified).length;
  const isVerifiedCollector = allTrades.length >= 5 && verifiedCount >= 3;
  const avgDeal = allTrades.length ? totalValue / allTrades.length : 0;

  const isLoading = loadingTrades || loadingCards;

  // Get grail cards (highest estimated value)
  const grailCards = allCards
    .filter(c => c.estimated_value)
    .sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0))
    .slice(0, 3);

  // Total collection value
  const totalCollectionValue = allCards.reduce((sum, c) => sum + (c.estimated_value || 0), 0);

  // Get leaderboard rank (simplified - you'd calculate from all users in production)
  const totalCardsRegistered = allCards.length;

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center pt-24">
      <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border/50 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-muted/40 border border-border/50 overflow-hidden shrink-0 flex items-center justify-center text-3xl">
              {user?.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" /> : '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl font-bold text-foreground">{user?.full_name || decodedEmail.split('@')[0]}</h1>
                {isVerifiedCollector && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/15 border border-primary/30 text-primary font-semibold">
                    <ShieldCheck className="w-3 h-3" />Verified Collector
                  </span>
                )}
              </div>
              {user?.bio && <p className="text-sm text-muted-foreground mt-1">{user.bio}</p>}
              {topSports.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {topSports.map(s => <SportBadge key={s} sport={s} />)}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 pt-4 border-t border-border/50">
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-foreground">{totalCardsRegistered}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1"><Star className="w-3 h-3" />Cards</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-primary">${totalCollectionValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1"><DollarSign className="w-3 h-3" />Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-green-400">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1"><Handshake className="w-3 h-3" />Volume</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold font-display text-amber-400">${avgDeal.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" />Avg</p>
            </div>
          </div>
        </motion.div>

        {/* Grail Cards */}
        {grailCards.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-card border border-border/50 p-5 mb-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Grail Cards</h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {grailCards.map((card) => (
                <div key={card.id} className="rounded-xl overflow-hidden bg-secondary/50 border border-border/40 group cursor-pointer hover:border-primary/30 transition-colors">
                  {card.image_url ? (
                    <img src={card.image_url} alt={card.name} className="w-full h-40 object-cover group-hover:opacity-90 transition-opacity" />
                  ) : (
                    <div className="w-full h-40 bg-muted flex items-center justify-center">
                      <Star className="w-8 h-8 text-muted-foreground/20" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-xs font-semibold text-foreground truncate">{card.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.set_name} {card.year && `• ${card.year}`}</p>
                    <p className="text-sm font-bold text-primary mt-2">${card.estimated_value?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Top 3 categories */}
         {topSports.length > 0 && (
           <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-card border border-border/50 p-5 mb-6">
             <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Star className="w-4 h-4 text-primary" />Favorite Categories</h2>
             <div className="flex gap-2 flex-wrap">
               {topSports.map((s, i) => (
                 <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/40">
                   <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                   <SportBadge sport={s} />
                   <span className="text-xs text-foreground">{SPORT_LABELS[s] || s}</span>
                 </div>
               ))}
             </div>
           </motion.div>
         )}

        {/* Trade history */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />Trade History
            <span className="text-xs text-muted-foreground font-normal ml-1">({allTrades.length} total)</span>
          </h2>
          {allTrades.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border/50 p-10 text-center text-sm text-muted-foreground">No trades logged yet.</div>
          ) : (
            <div className="space-y-3">
              {allTrades.map((trade, i) => (
                <div key={trade.id} className="flex gap-3 p-4 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors">
                  {trade.image_url ? (
                    <img src={trade.image_url} alt={trade.card_name} className="w-12 h-[68px] object-cover rounded-lg border border-border/50 shrink-0" />
                  ) : (
                    <div className="w-12 h-[68px] rounded-lg bg-secondary border border-border/50 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground text-sm truncate">{trade.card_name}</p>
                      <span className="text-sm font-bold text-primary shrink-0">${(trade.total_value || trade.cash_paid || 0).toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{[trade.year, trade.set_name, trade.condition && (CONDITION_LABELS[trade.condition] || trade.condition)].filter(Boolean).join(' · ')}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {trade.sport && <SportBadge sport={trade.sport} />}
                      {trade.verified && <span className="flex items-center gap-1 text-[10px] text-green-400"><ShieldCheck className="w-3 h-3" />Verified</span>}
                      {trade.event_name && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="w-2.5 h-2.5" />{trade.event_name}</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(trade.created_date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}