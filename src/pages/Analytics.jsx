import React, { useMemo } from 'react';
import { legacyApi } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Eye, Users, MessageCircle, Share2, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../components/analytics/StatCard';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';
import CardAnalyticsRow from '../components/analytics/CardAnalyticsRow';
import EmptyState from '../components/shared/EmptyState';

export default function Analytics() {
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['my-cards'],
    queryFn: () => legacyApi.entities.Card.list('-created_date'),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => legacyApi.entities.VideoMessage.list(),
  });

  const { data: scanEvents = [] } = useQuery({
    queryKey: ['all-scan-events'],
    queryFn: () => legacyApi.entities.ScanEvent.list('-created_date', 1000),
  });

  const myScanEvents = useMemo(() => {
    const myCardIds = new Set(cards.map(c => c.id));
    return scanEvents.filter(e => myCardIds.has(e.card_id));
  }, [cards, scanEvents]);

  const totalViews = cards.reduce((sum, c) => sum + (c.scan_count || 0), 0);
  const totalUniqueVisitors = new Set(myScanEvents.filter(e => e.visitor_id).map(e => e.visitor_id)).size;
  const totalMessages = messages.filter(m => cards.some(c => c.id === m.card_id)).length;
  const totalShares = cards.reduce((sum, c) => sum + (c.share_count || 0), 0);

  const peakHour = useMemo(() => {
    if (!myScanEvents.length) return null;
    const counts = Array(24).fill(0);
    myScanEvents.forEach(e => { if (e.hour_of_day != null) counts[e.hour_of_day]++; });
    const max = Math.max(...counts);
    const hour = counts.indexOf(max);
    const suffix = hour < 12 ? 'am' : 'pm';
    const label = hour === 0 ? '12am' : hour === 12 ? '12pm' : `${hour % 12}${suffix}`;
    return label;
  }, [myScanEvents]);

  const myMessages = useMemo(() => {
    const myCardIds = new Set(cards.map(c => c.id));
    return messages.filter(m => myCardIds.has(m.card_id));
  }, [cards, messages]);

  const getMessageCount = (cardId) => myMessages.filter(m => m.card_id === cardId).length;
  const getCardScanEvents = (cardId) => myScanEvents.filter(e => e.card_id === cardId);

  // Sort cards by most views
  const sortedCards = [...cards].sort((a, b) => (b.scan_count || 0) - (a.scan_count || 0));

  if (cardsLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">Analytics</h1>
          <p className="text-sm text-muted-foreground">Engagement metrics across all your registered cards</p>
        </motion.div>

        {cards.length === 0 ? (
          <EmptyState icon={BarChart2} title="No Data Yet" description="Register cards and share their QR codes to start seeing engagement metrics." />
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Eye} label="Total Views" value={totalViews} sub="QR scans across all cards" index={0} />
              <StatCard icon={Users} label="Unique Visitors" value={totalUniqueVisitors} sub="Distinct people who scanned" index={1} />
              <StatCard icon={MessageCircle} label="Total Messages" value={totalMessages} sub="Owner messages left" index={2} />
              <StatCard icon={Share2} label="Total Shares" value={totalShares} sub={peakHour ? `Peak activity: ${peakHour}` : 'Share your card stories'} index={3} />
            </div>

            {/* Activity Heatmap */}
            <div className="mb-8">
              <ActivityHeatmap scanEvents={myScanEvents} messageEvents={myMessages} />
            </div>

            {/* Per-Card Breakdown */}
            <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-border/50">
                <h3 className="font-semibold text-foreground">Per-Card Breakdown</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Sorted by most views</p>
              </div>
              <div className="divide-y divide-border/30 px-2">
                {sortedCards.map((card, i) => (
                  <CardAnalyticsRow
                    key={card.id}
                    card={card}
                    messageCount={getMessageCount(card.id)}
                    scanEvents={getCardScanEvents(card.id)}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

