import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

export default function FollowButton({ targetEmail }) {
  const queryClient = useQueryClient();
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => { if (u) setCurrentUserEmail(u.email); }).catch(() => {});
  }, []);

  const { data: existing = [] } = useQuery({
    queryKey: ['follow-status', currentUserEmail, targetEmail],
    queryFn: () => base44.entities.UserFollow.filter({ follower_email: currentUserEmail, following_email: targetEmail }),
    enabled: !!currentUserEmail && currentUserEmail !== targetEmail,
  });

  const { data: followerCount = [] } = useQuery({
    queryKey: ['follower-count', targetEmail],
    queryFn: () => base44.entities.UserFollow.filter({ following_email: targetEmail }),
  });

  const isFollowing = existing.length > 0;

  const followMutation = useMutation({
    mutationFn: () => base44.entities.UserFollow.create({ follower_email: currentUserEmail, following_email: targetEmail }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', currentUserEmail, targetEmail] });
      queryClient.invalidateQueries({ queryKey: ['follower-count', targetEmail] });
      queryClient.invalidateQueries({ queryKey: ['my-follows'] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (existing[0]) await base44.entities.UserFollow.delete(existing[0].id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', currentUserEmail, targetEmail] });
      queryClient.invalidateQueries({ queryKey: ['follower-count', targetEmail] });
      queryClient.invalidateQueries({ queryKey: ['my-follows'] });
    },
  });

  if (!currentUserEmail || currentUserEmail === targetEmail) {
    return (
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{followerCount.length}</p>
        <p className="text-xs text-muted-foreground">Followers</p>
      </div>
    );
  }

  const isLoading = followMutation.isPending || unfollowMutation.isPending;

  return (
    <div className="flex items-center gap-3">
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">{followerCount.length}</p>
        <p className="text-xs text-muted-foreground">Followers</p>
      </div>
      <Button
        size="sm"
        variant={isFollowing ? 'secondary' : 'default'}
        onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
        disabled={isLoading}
        className="gap-1.5"
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isFollowing ? (
          <><UserCheck className="w-3.5 h-3.5" />Following</>
        ) : (
          <><UserPlus className="w-3.5 h-3.5" />Follow</>
        )}
      </Button>
    </div>
  );
}