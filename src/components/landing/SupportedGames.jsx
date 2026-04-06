import React from 'react';
import { motion } from 'framer-motion';

export default function SupportedGames() {
  const games = [
    { name: 'Pokémon', emoji: '🔴' },
    { name: 'Magic: The Gathering', emoji: '🪄' },
    { name: 'Yu-Gi-Oh!', emoji: '⚡' },
    { name: 'Lorcana', emoji: '👑' },
    { name: 'One Piece', emoji: '⛵' },
    { name: 'Sports Cards', emoji: '🏀' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mt-10 pt-8 border-t border-border/30"
    >
      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-4 text-center">Supports 100+ Games & Sports</p>
      <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap">
        {games.map(game => (
          <div key={game.name} className="text-center">
            <span className="text-2xl mb-1 block">{game.emoji}</span>
            <p className="text-xs text-muted-foreground font-medium">{game.name}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}