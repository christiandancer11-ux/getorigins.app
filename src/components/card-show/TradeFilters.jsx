import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SPORTS = [
  { value: 'all', label: 'All Sports' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'football', label: 'Football' },
  { value: 'hockey', label: 'Hockey' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'pokemon', label: 'Pokémon' },
  { value: 'magic_the_gathering', label: 'MTG' },
  { value: 'yugioh', label: 'Yu-Gi-Oh!' },
  { value: 'other', label: 'Other' },
];

export default function TradeFilters({ search, sport, onSearchChange, onSportChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search player, set, card number..."
          className="pl-9 bg-secondary border-border"
        />
        {search && (
          <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Select value={sport} onValueChange={onSportChange}>
        <SelectTrigger className="w-full sm:w-40 bg-secondary border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SPORTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}