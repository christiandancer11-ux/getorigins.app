import React from 'react';

const EMOJIS = ['🔥', '💎', '⭐', '🤩', '👏'];

export default function CardReactions({ targetId, targetType, currentUserEmail }) {
  return (
    <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
      {EMOJIS.map((emoji) => (
        <div key={emoji} className="flex items-center gap-1 px-2 py-1 rounded-full border border-border/40 bg-secondary/50">
          <span>{emoji}</span>
          <span>0</span>
        </div>
      ))}
      <span className="text-[10px]">Reactions are temporarily unavailable.</span>
    </div>
  );
}

