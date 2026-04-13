import React, { useState, useEffect } from 'react';
import { Bookmark, Loader2, Trash2, TrendingUp, TrendingDown, Minus, Flame, Lock, Zap } from 'lucide-react';
import { legacyApi } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from '@/components/shared/UpgradeModal';

const trendIcon = (trend) => {
  if (trend === 'up')   return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
};

const heatColor = (score) => {
  if (score >= 90) return 'text-red-400';
  if (score >= 75) return 'text-orange-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-muted-foreground';
};

export default function CardWatchlist() {
  const { isPro, loading: subLoading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [removing, setRemoving] = useState(null);

  useEffect(() => {
    legacyApi.auth.me().then(u => {
      setUser(u);
      if (u) {
        legacyApi.entities.CardWatchlist.filter({ user_email: u.email }, '-created_date', 100)
          .then(results => setWatchlist(results))
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const handleRemove = async (item) => {
    setRemoving(item.id);
    try {
      await legacyApi.entities.CardWatchlist.delete(item.id);
      setWatchlist(prev => prev.filter(w => w.id !== item.id));
    } catch (e) {
      console.error('Remove error:', e);
    }
    setRemoving(null);
  };

  if (subLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md w-full">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-amber-400/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-3">Card Watchlist</h1>
            <p className="text-muted-foreground mb-2 text-base">
              Save cards from Trending to your personal watchlist and monitor their heat score and market value.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Available in the <span className="text-primary font-semibold">Origins Pro Bundle</span>.
            </p>
            <div className="rounded-2xl border border-border/30 overflow-hidden mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/60 to-card z-10 pointer-events-none" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 blur-sm">
                  <Bookmark className="w-4 h-4 text-muted-foreground/30" />
                  <div className="flex-1">
                    <div className="h-3 rounded bg-secondary/60 mb-1.5 w-3/4" />
                    <div className="h-2 rounded bg-secondary/40 w-1/2" />
                  </div>
                  <div className="h-4 w-12 rounded bg-secondary/40" />
                </div>
              ))}
            </div>
            <Button onClick={() => setShowUpgrade(true)} className="w-full bg-primary text-primary-foreground h-12 text-base font-semibold">
              <Zap className="w-4 h-4 mr-2" />Unlock with Origins Pro — $9.99/mo
            </Button>
          </div>
        </div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Card Watchlist</h1>
          <p className="text-xs text-muted-foreground">{watchlist.length} card{watchlist.length !== 1 ? 's' : ''} saved · Add from Trending</p>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/40 border border-border/40 flex items-center justify-center mb-4">
            <Bookmark className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <p className="font-semibold text-foreground mb-1">No cards saved yet</p>
          <p className="text-sm text-muted-foreground">Go to <span className="text-primary">Trending</span> and tap the bookmark icon on any card to add it here.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/40 overflow-hidden bg-card">
          {watchlist.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0 hover:bg-secondary/20 transition-colors">
              <Bookmark className="w-4 h-4 text-primary shrink-0" />

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">{item.player_or_name}</p>
                  {item.heat_score >= 90 && <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {[item.year, item.set_name, item.variant].filter(Boolean).join(' · ')}
                </p>
                {item.why_hot && (
                  <p className="text-xs text-muted-foreground/60 truncate mt-0.5 italic">{item.why_hot}</p>
                )}
              </div>

              {/* Value + trend */}
              <div className="text-right shrink-0 mr-2">
                <div className="flex items-center gap-1 justify-end">
                  {trendIcon(item.trend)}
                  <span className="text-sm font-bold text-foreground">
                    ${item.estimated_value_avg?.toLocaleString() || '—'}
                  </span>
                </div>
                <div className={`text-xs font-semibold mt-0.5 ${heatColor(item.heat_score)}`}>
                  {item.heat_score}° heat
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => handleRemove(item)}
                disabled={removing === item.id}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                title="Remove from Watchlist"
              >
                {removing === item.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

