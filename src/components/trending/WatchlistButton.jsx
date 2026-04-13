import React from 'react';
import { Bookmark } from 'lucide-react';

export default function WatchlistButton({ card, userEmail, onToggle }) {
  if (!userEmail) return null;

  return (
    <button
      disabled
      title="Watchlist is temporarily unavailable"
      className="p-1.5 rounded-lg transition-colors shrink-0 text-muted-foreground bg-secondary/50 cursor-not-allowed"
    >
      <Bookmark className="w-3.5 h-3.5" />
    </button>
  );
}

