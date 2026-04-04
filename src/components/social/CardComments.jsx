import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function CardComments({ cardId, currentUserEmail, currentUserName }) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  const { data: comments = [] } = useQuery({
    queryKey: ['card-comments', cardId],
    queryFn: () => base44.entities.CardComment.filter({ card_id: cardId }, '-created_date', 20),
  });

  const postMutation = useMutation({
    mutationFn: () =>
      base44.entities.CardComment.create({
        card_id: cardId,
        user_email: currentUserEmail,
        user_name: currentUserName,
        text: commentText,
      }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['card-comments', cardId] });
    },
  });

  const handlePost = async () => {
    if (!commentText.trim() || !currentUserEmail) return;
    setPosting(true);
    await postMutation.mutateAsync();
    setPosting(false);
  };

  return (
    <div className="space-y-3 mt-3 pt-3 border-t border-border/30">
      {/* Comment input */}
      {currentUserEmail && (
        <div className="flex gap-2">
          <Input
            placeholder="Add a comment..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handlePost()}
            className="text-xs h-8 bg-secondary border-border"
            disabled={posting}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePost}
            disabled={!commentText.trim() || posting}
            className="h-8 px-2"
          >
            {posting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          </Button>
        </div>
      )}

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-2">
          {comments.map(comment => (
            <div key={comment.id} className="bg-secondary/30 rounded-lg p-2.5 text-xs">
              <Link to={`/collector/${encodeURIComponent(comment.user_email)}`} className="font-semibold text-primary hover:underline text-[11px]">
                @{comment.user_name || comment.user_email.split('@')[0]}
              </Link>
              <p className="text-foreground mt-0.5">{comment.text}</p>
              <p className="text-muted-foreground text-[10px] mt-1">{timeAgo(comment.created_date)}</p>
            </div>
          ))}
        </div>
      ) : currentUserEmail ? (
        <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</p>
      ) : null}
    </div>
  );
}