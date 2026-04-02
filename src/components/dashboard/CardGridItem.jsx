import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import SportBadge from '../shared/SportBadge';

export default function CardGridItem({ card, messageCount = 0, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/cards/${card.id}`} className="group block">
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
          {/* Card Image */}
          <div className="aspect-[3/4] bg-muted/30 relative overflow-hidden">
            {card.image_url ? (
              <img src={card.image_url} alt={card.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-muted">
                <QrCode className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <div className="px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageCircle className="w-3 h-3" />
                {messageCount}
              </div>
            </div>
          </div>

          {/* Card Info */}
          <div className="p-4">
            <h3 className="font-semibold text-foreground text-sm mb-1 truncate group-hover:text-primary transition-colors">{card.name}</h3>
            <div className="flex items-center gap-2 mb-2">
              {card.set_name && <p className="text-xs text-muted-foreground truncate">{card.set_name}</p>}
              {card.year && <span className="text-xs text-muted-foreground">• {card.year}</span>}
            </div>
            <SportBadge sport={card.sport} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}