import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

export default function FollowButton({ targetEmail }) {
  const { user } = useAuth();
  const currentUserEmail = user?.email;
  const isOwnProfile = currentUserEmail && currentUserEmail === targetEmail;

  if (!currentUserEmail || isOwnProfile) {
    return (
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">0</p>
        <p className="text-xs text-muted-foreground">Followers</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-center">
        <p className="text-sm font-semibold text-foreground">0</p>
        <p className="text-xs text-muted-foreground">Followers</p>
      </div>
      <Button size="sm" variant="default" disabled className="gap-1.5 opacity-70 cursor-not-allowed">
        <UserPlus className="w-3.5 h-3.5" />Follow
      </Button>
    </div>
  );
}

