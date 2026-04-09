import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const EMOJIS = ['🔥', '💎', '⭐', '🤩', '👏'];

export default function CardReactions({ targetId, targetType, currentUserEmail }) {
  const queryClient = useQueryClient();
  const [optimistic, setOptimistic] = useState(null);

  const { data: reactions = [] } = useQuery({
    queryKey: ['reactions', targetId],
    queryFn: () => base44.entities.CardReaction.filter({ target_id: targetId, target_type: targetType }),
  });

  const myReaction = reactions.find(r => r.user_email === currentUserEmail);

  // Aggregate counts
  const counts = EMOJIS.reduce((acc, e) => {
    acc[e] = reactions.filter(r => r.emoji === e).length;
    return acc;
  }, {});

  const toggleMutation = useMutation({
    mutationFn: async (emoji) => {
      if (myReaction) {
        if (myReaction.emoji === emoji) {
          // Remove reaction
          await base44.entities.CardReaction.delete(myReaction.id);
        } else {
          // Change reaction
          await base44.entities.CardReaction.delete(myReaction.id);
          await base44.entities.CardReaction.create({ user_email: currentUserEmail, target_id: targetId, target_type: targetType, emoji });
        }
      } else {
        await base44.entities.CardReaction.create({ user_email: currentUserEmail, target_id: targetId, target_type: targetType, emoji });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reactions', targetId] });
    },
  });

  const handleReact = (emoji) => {
    if (!currentUserEmail) return;
    toggleMutation.mutate(emoji);
  };

  const totalReactions = reactions.length;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {EMOJIS.map(emoji => {
        const count = counts[emoji] || 0;
        const isActive = myReaction?.emoji === emoji;
        if (count === 0 && !currentUserEmail) return null;
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            disabled={!currentUserEmail}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all ${
              isActive
                ? 'bg-primary/15 border-primary/40 text-primary font-semibold scale-105'
                : count > 0
                ? 'bg-secondary/50 border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                : 'border-border/30 text-muted-foreground/50 hover:border-border/50 hover:text-muted-foreground'
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
      {totalReactions > 0 && (
        <span className="text-[10px] text-muted-foreground ml-1">{totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}</span>
      )}
    </div>
  );
}