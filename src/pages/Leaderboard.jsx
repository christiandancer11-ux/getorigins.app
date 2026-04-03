import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Eye, MessageCircle, Users, Handshake, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import CollectorRow from '@/components/leaderboard/CollectorRow';
import TopCardsList from '@/components/leaderboard/TopCardsList';

const TABS = [
  { id: 'views',        label: 'Most Views',    icon: Eye,           valueLabel: 'Total Views',       desc: 'Collectors whose cards have been viewed the most' },
  { id: 'messages',     label: 'Most Messages', icon: MessageCircle, valueLabel: 'Messages Received', desc: 'Collectors with the most owner messages on their cards' },
  { id: 'visitors',     label: 'Most Visitors', icon: Users,         valueLabel: 'Unique Visitors',   desc: 'Collectors who have attracted the most unique scanners' },
  { id: 'most_trades',  label: 'Most Trades',   icon: Handshake,     valueLabel: 'Trades Logged',     desc: 'Collectors who have logged the most card show trades' },
  { id: 'highest_value',label: 'Highest Value', icon: DollarSign,    valueLabel: 'Total Value',       desc: 'Collectors with the highest total trade deal value' },
];

export default function Leaderboard() {
  const [tab, setTab] = useState('views');

  const { data: cards = [], isLoading: loadingCards } = useQuery({
    queryKey: ['all-cards-lb'],
    queryFn: () => base44.entities.Card.list(),
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['all-messages-lb'],
    queryFn: () => base44.entities.VideoMessage.list(),
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['all-users-lb'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: scanEvents = [], isLoading: loadingScanEvents } = useQuery({
    queryKey: ['all-scan-events-lb'],
    queryFn: () => base44.entities.ScanEvent.list('-created_date', 2000),
  });

  const { data: trades = [], isLoading: loadingTrades } = useQuery({
    queryKey: ['all-trades-lb'],
    queryFn: () => base44.entities.CardTrade.list('-created_date', 1000),
  });

  const isLoading = loadingCards || loadingMessages || loadingUsers || loadingScanEvents || loadingTrades;

  // Build a map of email -> user profile for display names/avatars
  const userMap = useMemo(() => {
    const map = {};
    users.forEach(u => { map[u.email] = u; });
    return map;
  }, [users]);

  // Group cards by owner email
  const cardsByOwner = useMemo(() => {
    const map = {};
    cards.forEach(c => {
      if (!c.created_by) return;
      if (!map[c.created_by]) map[c.created_by] = [];
      map[c.created_by].push(c);
    });
    return map;
  }, [cards]);

  // Compute leaderboard rows
  const leaderboard = useMemo(() => {
    return Object.entries(cardsByOwner).map(([email, ownerCards]) => {
      const profile = userMap[email];
      const name = profile?.full_name || email.split('@')[0];
      const avatar_url = profile?.avatar_url || null;
      const cardCount = ownerCards.length;
      const cardIds = new Set(ownerCards.map(c => c.id));

      const totalViews = ownerCards.reduce((s, c) => s + (c.scan_count || 0), 0);
      const totalMessages = messages.filter(m => cardIds.has(m.card_id)).length;
      const uniqueVisitors = new Set(
        scanEvents.filter(e => cardIds.has(e.card_id) && e.visitor_id).map(e => e.visitor_id)
      ).size;

      return { email, name, avatar_url, cardCount, totalViews, totalMessages, uniqueVisitors };
    });
  }, [cardsByOwner, userMap, messages, scanEvents]);

  // Trade leaderboard rows
  const tradeLeaderboard = useMemo(() => {
    const map = {};
    trades.forEach(t => {
      if (!t.created_by) return;
      if (!map[t.created_by]) {
        const profile = userMap[t.created_by];
        map[t.created_by] = {
          email: t.created_by,
          name: profile?.full_name || t.created_by.split('@')[0],
          avatar_url: profile?.avatar_url || null,
          tradeCount: 0,
          tradeValue: 0,
        };
      }
      map[t.created_by].tradeCount++;
      map[t.created_by].tradeValue += t.total_value || 0;
    });
    return Object.values(map).map(r => ({ ...r, tradeValue: Math.round(r.tradeValue) }));
  }, [trades, userMap]);

  const ranked = useMemo(() => {
    if (tab === 'most_trades') {
      return [...tradeLeaderboard].sort((a, b) => b.tradeCount - a.tradeCount).slice(0, 15).map(r => ({ ...r, score: r.tradeCount }));
    }
    if (tab === 'highest_value') {
      return [...tradeLeaderboard].sort((a, b) => b.tradeValue - a.tradeValue).slice(0, 15).map(r => ({ ...r, score: r.tradeValue }));
    }
    const scoreKey = tab === 'views' ? 'totalViews' : tab === 'messages' ? 'totalMessages' : 'uniqueVisitors';
    return [...leaderboard]
      .filter(r => r[scoreKey] > 0)
      .sort((a, b) => b[scoreKey] - a[scoreKey])
      .slice(0, 15)
      .map(r => ({ ...r, score: r[scoreKey] }));
  }, [leaderboard, tradeLeaderboard, tab]);

  const activeTab = TABS.find(t => t.id === tab);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top collectors ranked by engagement across their entire collection.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-3 bg-secondary/50 border border-border/50 rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab description */}
        <p className="text-xs text-muted-foreground text-center mb-6">{activeTab?.desc}</p>


        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-[72px] rounded-xl bg-card border border-border/50 animate-pulse" />
            ))}
          </div>
        ) : ranked.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No data yet — share your card QR codes to start climbing the leaderboard!
          </div>
        ) : (
          <div className="space-y-2">
            {ranked.map((collector, i) => (
              <CollectorRow
                key={collector.email}
                collector={collector}
                rank={i + 1}
                valueLabel={activeTab.valueLabel}
                index={i}
                formatValue={tab === 'highest_value' ? (v) => `$${v.toLocaleString()}` : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}