import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Users, MessageCircle, Share2, ChevronRight } from 'lucide-react';
import SportBadge from '../shared/SportBadge';

export default function CardAnalyticsRow({ card, messageCount, scanEvents, index }) {
  const totalScans = card.scan_count || 0;
  const uniqueVisitors = new Set(scanEvents.filter(e => e.visitor_id).map(e => e.visitor_id)).size;
  const shares = card.share_count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link to={`/cards/${card.id}`} className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors group">
        {/* Thumbnail */}
        <div className="w-12 h-16 rounded-lg overflow-hidden border border-border/50 bg-muted/30 shrink-0">
          {card.image_url
            ? <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-xl">🃏</div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{card.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <SportBadge sport={card.sport} />
            {card.year && <span className="text-xs text-muted-foreground">{card.year}</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 text-center shrink-0">
          <div>
            <p className="text-lg font-bold text-foreground">{totalScans}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center"><Eye className="w-3 h-3" />Views</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{uniqueVisitors}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center"><Users className="w-3 h-3" />Unique</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{messageCount}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center"><MessageCircle className="w-3 h-3" />Messages</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{shares}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center"><Share2 className="w-3 h-3" />Shares</p>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
      </Link>
    </motion.div>
  );
}