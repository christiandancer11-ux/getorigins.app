import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, MessageSquare, Eye, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import TopCardsList from '@/components/leaderboard/TopCardsList';

export default function Leaderboard() {
  const [tab, setTab] = useState('contributors');

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['all-messages-lb'],
    queryFn: () => base44.entities.VideoMessage.list(),
  });

  const { data: cards = [], isLoading: loadingCards } = useQuery({
    queryKey: ['all-cards-lb'],
    queryFn: () => base44.entities.Card.list(),
  });

  // Top contributors: people with the most messages
  const contributorMap = {};
  messages.forEach(m => {
    const name = m.owner_name || 'Anonymous';
    contributorMap[name] = (contributorMap[name] || 0) + 1;
  });
  const topContributors = Object.entries(contributorMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Top scanned cards
  const topScanned = [...cards]
    .filter(c => c.scan_count > 0)
    .sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0))
    .slice(0, 10);

  // Top shared cards
  const topShared = [...cards]
    .filter(c => c.share_count > 0)
    .sort((a, b) => (b.share_count || 0) - (a.share_count || 0))
    .slice(0, 10);

  const tabs = [
    { id: 'contributors', label: 'Top Contributors', icon: MessageSquare },
    { id: 'scanned', label: 'Most Viewed', icon: Eye },
    { id: 'shared', label: 'Most Shared', icon: Share2 },
  ];

  const isLoading = loadingMessages || loadingCards;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">See who's contributing the most stories and which cards have the biggest followings.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-secondary/50 border border-border/50 rounded-xl p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
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

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-card border border-border/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'contributors' && (
              <LeaderboardTable
                rows={topContributors}
                valueLabel="Messages"
                emptyMessage="No messages have been posted yet."
              />
            )}
            {tab === 'scanned' && (
              <TopCardsList
                cards={topScanned}
                valueKey="scan_count"
                valueLabel="Scans"
                emptyMessage="No cards have been scanned yet."
              />
            )}
            {tab === 'shared' && (
              <TopCardsList
                cards={topShared}
                valueKey="share_count"
                valueLabel="Shares"
                emptyMessage="No cards have been shared yet."
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}