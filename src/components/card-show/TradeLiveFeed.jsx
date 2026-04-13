import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTradesForCard } from '@/lib/db';
import { Handshake } from 'lucide-react';
import TradeCard from './TradeCard';

export default function TradeLiveFeed({ cardId }) {
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trade-live-feed', cardId],
    queryFn: async () => {
      const result = await getTradesForCard(cardId)
      return result.data ?? []
    },
  });

  if (isLoading) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 mx-auto mb-4 border-4 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading recent trades...</p>
        </div>
      </div>
    );
  }

  if (!trades.length) {
    return (
      <div className="bg-card border border-border/50 rounded-2xl p-6">
        <div className="text-center py-12">
          <Handshake className="w-6 h-6 mx-auto text-primary mb-4" />
          <p className="text-sm text-muted-foreground">No verified trades are available yet. Log a trade to see it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trades.map((trade, index) => (
        <TradeCard key={trade.id} trade={trade} index={index} />
      ))}
    </div>
  );
}
























