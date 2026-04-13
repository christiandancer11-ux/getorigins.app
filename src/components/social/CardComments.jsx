import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CardComments({ cardId, currentUserEmail, currentUserName }) {
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const { user } = useAuth();
  const canComment = !!user?.email;
  const comments = [];

  const handlePost = async () => {
    if (!commentText.trim() || !canComment) return;
    setPosting(true);
    setTimeout(() => {
      setPosting(false);
      setCommentText('');
    }, 300);
  };

  return (
    <div className="space-y-3 mt-3 pt-3 border-t border-border/30">
      {canComment ? (
        <div className="flex gap-2">
          <Input
            placeholder="Comments are temporarily unavailable"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            disabled
            className="text-xs h-8 bg-secondary border-border"
          />
          <Button size="sm" variant="ghost" disabled className="h-8 px-2">
            <Send className="w-3 h-3" />
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Commenting is temporarily unavailable.</p>
      )}

      <div className="rounded-2xl bg-secondary/30 p-4 text-xs text-muted-foreground">
        Card comment history is not available in this build.
      </div>
    </div>
  );
}

