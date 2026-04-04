import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Clock, Zap, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CardReactions from '@/components/social/CardReactions';
import CardComments from '@/components/social/CardComments';
import SportBadge from '@/components/shared/SportBadge';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function FeedCard({ card, currentUserEmail, currentUserName }) {
  const [showComments, setShowComments] = useState(false);
  const displayName = card.created_by ? card.created_by.split('@')[0] : 'Collector';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/20 transition-colors"
    >
      <div className="flex gap-3 p-4">
        {/* Card image */}
        <Link to={`/cards/${card.id}`} className="shrink-0">
          {card.image_url ? (
            <img src={card.image_url} alt={card.name} className="w-16 h-[90px] object-cover rounded-xl border border-border/50" />
          ) : (
            <div className="w-16 h-[90px] rounded-xl bg-secondary border border-border/50 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-muted-foreground/30" />
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <Link to={`/cards/${card.id}`} className="font-semibold text-foreground text-sm hover:text-primary transition-colors truncate">
              {card.name}
            </Link>
            {card.estimated_value && (
              <span className="text-xs font-bold text-primary shrink-0">${card.estimated_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            )}
          </div>

          <p className="text-xs text-muted-foreground mb-1.5">
            {[card.set_name, card.year].filter(Boolean).join(' · ')}
            {card.grading_company && card.grade && (
              <span className="ml-1 text-amber-400 font-semibold">{card.grading_company} {card.grade}</span>
            )}
          </p>

          {card.sport && (
            <div className="mb-2">
              <SportBadge sport={card.sport} />
            </div>
          )}

          <div className="flex items-center justify-between">
            <Link to={`/collector/${encodeURIComponent(card.created_by)}`} className="text-xs text-muted-foreground hover:text-primary transition-colors">
              @{displayName}
            </Link>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />{timeAgo(card.created_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Reactions */}
      <div className="px-4 py-3 border-t border-border/30">
        <div className="flex items-center justify-between mb-2">
          <CardReactions targetId={card.id} targetType="card" currentUserEmail={currentUserEmail} />
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            💬
          </button>
        </div>

        {/* Comments section */}
        {showComments && (
          <CardComments cardId={card.id} currentUserEmail={currentUserEmail} currentUserName={currentUserName} />
        )}
      </div>
    </motion.div>
  );
}

export default function SocialFeed() {
  const queryClient = useQueryClient();
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(null);
  const [filter, setFilter] = useState('all');

  const SPORT_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'baseball', label: '⚾ Baseball' },
    { value: 'basketball', label: '🏀 Basketball' },
    { value: 'football', label: '🏈 Football' },
    { value: 'pokemon', label: '⚡ Pokémon' },
    { value: 'hockey', label: '🏒 Hockey' },
    { value: 'soccer', label: '⚽ Soccer' },
    { value: 'magic_the_gathering', label: '🧙 MTG' },
  ];

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u) {
        setCurrentUserEmail(u.email);
        setCurrentUserName(u.full_name || u.email.split('@')[0]);
      }
    }).catch(() => {});
  }, []);

  // Get current user's follows
  const { data: myFollows = [] } = useQuery({
    queryKey: ['my-follows-feed', currentUserEmail],
    queryFn: () => base44.entities.UserFollow.filter({ follower_email: currentUserEmail }),
    enabled: !!currentUserEmail,
  });

  const followingEmails = myFollows.map(f => f.following_email);

  const { data: allCards = [], isLoading } = useQuery({
    queryKey: ['social-feed', filter],
    queryFn: () => filter === 'all'
      ? base44.entities.Card.list('-created_date', 100)
      : base44.entities.Card.filter({ sport: filter }, '-created_date', 100),
    refetchInterval: 30000,
  });

  // Filter cards to only show from people the user follows
  const filteredCards = currentUserEmail
    ? allCards.filter(card => followingEmails.includes(card.created_by))
    : [];

  // Real-time subscription
  useEffect(() => {
    const unsub = base44.entities.Card.subscribe((event) => {
      if (event.type === 'create') {
        queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      }
    });
    return unsub;
  }, [queryClient]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Zap className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Live Card Feed</h1>
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />LIVE
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Cards being added by collectors in real time — free for everyone.</p>
        </div>

        {/* Sport filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
          {SPORT_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                filter === f.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Community stats */}
        {currentUserEmail ? (
          <div className="flex items-center gap-2 mb-5 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{filteredCards.length} cards from {followingEmails.length} friends</span>
            <Link to="/users" className="ml-auto text-primary hover:underline font-medium">Follow more →</Link>
          </div>
        ) : (
          <div className="bg-secondary/50 border border-border/40 rounded-xl p-4 mb-5 flex items-start gap-3">
            <Lock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold mb-1">Friends-Only Feed</p>
              <p className="text-xs mb-2">Sign in to see cards from collectors you follow.</p>
              <Link to="/users" className="text-primary hover:underline font-medium text-xs">Explore collectors →</Link>
            </div>
          </div>
        )}

        {/* Feed */}
        {!currentUserEmail ? (
          <div className="text-center py-16">
            <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground mb-3">This feed is for signed-in users only.</p>
            <Button onClick={() => base44.auth.redirectToLogin()} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Sign In
            </Button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-40 rounded-2xl bg-card border border-border/50 animate-pulse" />
            ))}
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="mb-3">No cards from your friends yet.</p>
            <Link to="/users" className="text-primary hover:underline font-medium text-sm">Follow collectors →</Link>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-4">
              {filteredCards.map(card => (
                <FeedCard key={card.id} card={card} currentUserEmail={currentUserEmail} currentUserName={currentUserName} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}