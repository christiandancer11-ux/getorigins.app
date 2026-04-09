import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MarketPicksWidget() {
  // TODO: Migrate market picks to Supabase
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-bold text-foreground">Market Picks</h3>
        </div>
        <Button variant="outline" size="sm" disabled>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="text-center py-8">
        <p className="text-muted-foreground">Market picks are temporarily unavailable during migration.</p>
      </div>
    </div>
  );
}