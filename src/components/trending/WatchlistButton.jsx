import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function WatchlistButton({ card, userEmail, onToggle }) {
  const [isWatched, setIsWatched] = useState(false);
  const [watchlistId, setWatchlistId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userEmail || !card) return;
    // Check if this card is already on the watchlist
    base44.entities.CardWatchlist.filter({ user_email: userEmail, player_or_name: card.player_or_name, set_name: card.set_name || '' }, '-created_date', 1)
      .then(results => {
        if (results.length > 0) {
          setIsWatched(true);
          setWatchlistId(results[0].id);
        }
      }).catch(() => {});
  }, [userEmail, card?.player_or_name, card?.set_name]);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (!userEmail) return;
    setLoading(true);
    try {
      if (isWatched && watchlistId) {
        await base44.entities.CardWatchlist.delete(watchlistId);
        setIsWatched(false);
        setWatchlistId(null);
        onToggle?.('removed');
      } else {
        const created = await base44.entities.CardWatchlist.create({
          user_email: userEmail,
          player_or_name: card.player_or_name,
          card_name: card.card_name || card.player_or_name,
          year: card.year || '',
          set_name: card.set_name || '',
          variant: card.variant || '',
          sport: card.sport || '',
          estimated_value_avg: card.estimated_value_avg || 0,
          heat_score: card.heat_score || 0,
          trend: card.trend || 'stable',
          why_hot: card.why_hot || '',
        });
        setIsWatched(true);
        setWatchlistId(created.id);
        onToggle?.('added');
      }
    } catch (err) {
      console.error('Watchlist toggle error:', err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
      className={`p-1.5 rounded-lg transition-colors shrink-0 ${
        isWatched
          ? 'text-primary bg-primary/10 hover:bg-primary/20'
          : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isWatched ? (
        <BookmarkCheck className="w-3.5 h-3.5" />
      ) : (
        <Bookmark className="w-3.5 h-3.5" />
      )}
    </button>
  );
}