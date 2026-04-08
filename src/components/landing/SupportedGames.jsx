import React from 'react';
import { motion } from 'framer-motion';

const GAMES = [
  {
    name: 'Pokémon',
    img: 'https://media.base44.com/images/public/69ceb0c6913655f4b9105f84/198d6239a_generated_image.png',
  },
  {
    name: 'Magic: TG',
    img: 'https://media.base44.com/images/public/69ceb0c6913655f4b9105f84/296169368_generated_image.png',
  },
  {
    name: 'Yu-Gi-Oh!',
    img: 'https://media.base44.com/images/public/69ceb0c6913655f4b9105f84/f203740fd_generated_image.png',
  },
  {
    name: 'One Piece',
    img: 'https://media.base44.com/images/public/69ceb0c6913655f4b9105f84/0134c7499_generated_image.png',
  },
  {
    name: 'Sports Cards',
    img: 'https://media.base44.com/images/public/69ceb0c6913655f4b9105f84/1ccbf62c9_generated_image.png',
  },
  {
    name: 'MTG Black Lotus',
    img: 'https://media.base44.com/images/public/69ceb0c6913655f4b9105f84/7d7779665_generated_image.png',
  },
];

export default function SupportedGames() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mt-10 pt-8 border-t border-border/30"
    >
      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-widest mb-6 text-center">
        Supports 100+ Games & Sports
      </p>
      <div className="flex items-end justify-center gap-4 sm:gap-6 flex-wrap">
        {GAMES.map((game, i) => (
          <div key={game.name} className="text-center group">
            <div className="w-14 h-20 mx-auto mb-2 relative">
              <img
                src={game.img}
                alt={game.name}
                className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
              />
            </div>
            <p className="text-xs text-muted-foreground font-medium">{game.name}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}