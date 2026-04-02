import React from 'react';

const CATEGORIES = [
  { id: 'football',   label: 'Football',    emoji: '🏈' },
  { id: 'baseball',   label: 'Baseball',    emoji: '⚾' },
  { id: 'basketball', label: 'Basketball',  emoji: '🏀' },
  { id: 'soccer',     label: 'Soccer',      emoji: '⚽' },
  { id: 'f1',         label: 'F1',          emoji: '🏎️' },
  { id: 'pokemon',    label: 'Pokémon',     emoji: '⚡' },
  { id: 'one_piece',  label: 'One Piece',   emoji: '☠️' },
];

export { CATEGORIES };

export default function TrendingCategoryPicker({ selected, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
            selected === cat.id
              ? 'bg-primary/20 border-primary/50 text-primary'
              : 'bg-secondary/40 border-border/40 text-muted-foreground hover:text-foreground hover:border-border'
          }`}
        >
          <span className="text-base">{cat.emoji}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}