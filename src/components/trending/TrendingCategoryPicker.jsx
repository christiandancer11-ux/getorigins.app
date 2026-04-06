import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CATEGORIES = [
  { id: 'football',         label: 'Football',        emoji: '🏈', group: 'Pro Sports' },
  { id: 'baseball',         label: 'Baseball',        emoji: '⚾', group: 'Pro Sports' },
  { id: 'basketball',       label: 'Basketball',      emoji: '🏀', group: 'Pro Sports' },
  { id: 'soccer',           label: 'Soccer',          emoji: '⚽', group: 'Pro Sports' },
  { id: 'hockey',           label: 'Hockey',          emoji: '🏒', group: 'Pro Sports' },
  { id: 'golf',             label: 'Golf',            emoji: '⛳', group: 'Pro Sports' },
  { id: 'ufc',              label: 'UFC',             emoji: '🥊', group: 'Pro Sports' },
  { id: 'wwe',              label: 'WWE',             emoji: '🤼', group: 'Pro Sports' },
  { id: 'f1',               label: 'F1',              emoji: '🏎️', group: 'Pro Sports' },
  { id: 'ncaa_football',    label: 'NCAA Football',   emoji: '🏈', group: 'College Sports' },
  { id: 'ncaa_basketball',  label: 'NCAA Basketball', emoji: '🏀', group: 'College Sports' },
  { id: 'ncaa_baseball',    label: 'NCAA Baseball',   emoji: '⚾', group: 'College Sports' },
  { id: 'pokemon',          label: 'Pokémon',         emoji: '⚡', group: 'TCG' },
  { id: 'one_piece',        label: 'One Piece',       emoji: '☠️', group: 'TCG' },
  { id: 'mtg',              label: 'MTG',             emoji: '🧙', group: 'TCG' },
  { id: 'yugioh',           label: 'Yu-Gi-Oh!',       emoji: '🃏', group: 'TCG' },
];

const CATEGORY_GROUPS = [
  { name: 'Pro Sports', categories: CATEGORIES.filter(c => c.group === 'Pro Sports') },
  { name: 'College Sports', categories: CATEGORIES.filter(c => c.group === 'College Sports') },
  { name: 'TCG', categories: CATEGORIES.filter(c => c.group === 'TCG') },
];

export { CATEGORIES };

export default function TrendingCategoryPicker({ selected, onSelect }) {
  const [expandedGroup, setExpandedGroup] = useState('Pro Sports');

  return (
    <div className="space-y-2">
      {CATEGORY_GROUPS.map(group => (
        <div key={group.name}>
          <button
            onClick={() => setExpandedGroup(expandedGroup === group.name ? null : group.name)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-1.5"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroup === group.name ? '' : '-rotate-90'}`} />
            {group.name}
          </button>
          {expandedGroup === group.name && (
            <div className="flex gap-2 flex-wrap pl-1">
              {group.categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => onSelect(cat.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-all ${
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
          )}
        </div>
      ))}
    </div>
  );
}