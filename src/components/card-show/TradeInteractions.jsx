import React from 'react';

export default function TradeInteractions({ tradeId, currentUserEmail }) {
  return (
    <div className="border-t border-border/30 px-3.5 pt-2.5 pb-3">
      <div className="text-xs text-muted-foreground">
        Trade reactions and comments are temporarily unavailable. This feature will return after data migration.
      </div>
    </div>
  );
}

