import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Loader2, RefreshCw, AlertCircle, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

export default function GradingOddsList() {
  // TODO: Migrate grading odds to Supabase
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-bold text-foreground">Grading Odds</h3>
        </div>
        <Button variant="outline" size="sm" disabled>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="text-center py-8">
        <p className="text-muted-foreground">Grading odds are temporarily unavailable during migration.</p>
      </div>
    </div>
  );
}
