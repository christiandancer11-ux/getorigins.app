import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, UserPlus, UserCheck, CreditCard, Star, CreditCard as CardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function CollectorCard({ user, currentUserEmail, myFollows, onToggleFollow }) {
  const isMe = user.email === currentUserEmail;
  const isFollowing = myFollows.some(f => f.following_email === user.email);
  const displayName = user.full_name || user.email.split('@')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/20 transition-colors"
    >
      <Link to={`/collector/${encodeURIComponent(user.email)}`} className="shrink-0">
        <div className="w-12 h-12 rounded-xl bg-muted/40 border border-border/50 overflow-hidden flex items-center justify-center text-xl">
          {user.avatar_url
            ? <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            : displayName[0]?.toUpperCase() || '👤'
          }
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/collector/${encodeURIComponent(user.email)}`} className="font-semibold text-foreground hover:text-primary transition-colors text-sm">
          {displayName}
        </Link>
        {user.bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{user.bio}</p>}
        <p className="text-[10px] text-muted-foreground mt-0.5">@{user.email.split('@')[0]}</p>
      </div>

      <div className="shrink-0 flex flex-col gap-2">
        <Link to={`/collector/${encodeURIComponent(user.email)}`}>
          <Button size="sm" variant="outline" className="border-border/50 gap-1.5 w-full">
            <CreditCard className="w-3.5 h-3.5" />Collection
          </Button>
        </Link>
        {!isMe && currentUserEmail && (
          <Button
            size="sm"
            variant={isFollowing ? 'secondary' : 'default'}
            onClick={() => onToggleFollow(user.email, isFollowing)}
            className="gap-1.5"
          >
            {isFollowing ? <><UserCheck className="w-3.5 h-3.5" />Following</> : <><UserPlus className="w-3.5 h-3.5" />Follow</>}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function UserSearch() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list('-created_date', 200),
  });

  const { data: myFollows = [] } = useQuery({
    queryKey: ['my-follows', currentUser?.email],
    queryFn: () => base44.entities.UserFollow.filter({ follower_email: currentUser.email }),
    enabled: !!currentUser,
  });

  const { data: myFollowers = [] } = useQuery({
    queryKey: ['my-followers', currentUser?.email],
    queryFn: () => base44.entities.UserFollow.filter({ following_email: currentUser.email }),
    enabled: !!currentUser,
  });

  const followMutation = useMutation({
    mutationFn: ({ targetEmail }) =>
      base44.entities.UserFollow.create({ follower_email: currentUser.email, following_email: targetEmail }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-follows'] }),
  });

  const unfollowMutation = useMutation({
    mutationFn: async ({ targetEmail }) => {
      const existing = await base44.entities.UserFollow.filter({ follower_email: currentUser.email, following_email: targetEmail });
      if (existing[0]) await base44.entities.UserFollow.delete(existing[0].id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-follows'] }),
  });

  const handleToggleFollow = (targetEmail, isFollowing) => {
    if (!currentUser) return;
    if (isFollowing) {
      unfollowMutation.mutate({ targetEmail });
    } else {
      followMutation.mutate({ targetEmail });
    }
  };

  const filtered = allUsers.filter(u => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const followingList = allUsers.filter(u => myFollows.some(f => f.following_email === u.email));
  const followerList = allUsers.filter(u => myFollowers.some(f => f.follower_email === u.email));

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground mb-1">Find Collectors</h1>
          <p className="text-sm text-muted-foreground">Search, follow, and explore other collectors' profiles.</p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or username..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* My follow stats */}
        {currentUser && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold font-display text-primary">{myFollows.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Following</p>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold font-display text-primary">{myFollowers.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Followers</p>
            </div>
          </div>
        )}

        {/* Following list (when no search query) */}
        {!query && followingList.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />Following
            </h2>
            <div className="space-y-3">
              {followingList.map(u => (
                <CollectorCard
                  key={u.id}
                  user={u}
                  currentUserEmail={currentUser?.email}
                  myFollows={myFollows}
                  onToggleFollow={handleToggleFollow}
                />
              ))}
            </div>
          </div>
        )}

        {/* All collectors */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            {query ? `Results for "${query}"` : 'All Collectors'}
            <span className="text-xs text-muted-foreground font-normal">({filtered.length})</span>
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-card border border-border/50 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No collectors found.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map(u => (
                <CollectorCard
                  key={u.id}
                  user={u}
                  currentUserEmail={currentUser?.email}
                  myFollows={myFollows}
                  onToggleFollow={handleToggleFollow}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}