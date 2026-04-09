import React from 'react';

const sportLabels = {
  baseball: '⚾ Baseball',
  basketball: '🏀 Basketball',
  football: '🏈 Football',
  hockey: '🏒 Hockey',
  soccer: '⚽ Soccer',
  golf: '⛳ Golf',
  ufc: '🥊 UFC',
  wwe: '🤼 WWE',
  f1: '🏎 F1',
  pokemon: '⚡ Pokémon',
  magic_the_gathering: '🧙 Magic: The Gathering',
  yugioh: '🃏 Yu-Gi-Oh!',
  lorcana: '👑 Lorcana',
  one_piece: '⛵ One Piece',
  other: '🎴 Other',
};

export default function SportBadge({ sport }) {
  if (!sport) return null;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
      {sportLabels[sport] || sport}
    </span>
  );
}