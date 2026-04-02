import React, { useState } from 'react';
import { Play, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function VideoMessageCard({ message, index = 0 }) {
  const [playing, setPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative"
    >
      {/* Timeline connector */}
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="w-px flex-1 bg-border/50 mt-2" />
        </div>

        <div className="pb-8 flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h4 className="font-semibold text-foreground">{message.owner_name}</h4>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {message.created_date ? format(new Date(message.created_date), 'MMM d, yyyy') : 'Unknown'}
            </span>
          </div>

          {message.message && (
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{message.message}</p>
          )}

          {message.video_url && (
            <div className="rounded-xl overflow-hidden border border-border/50 bg-muted/30">
              {!playing ? (
                <button
                  onClick={() => setPlaying(true)}
                  className="relative w-full aspect-video bg-muted/50 flex items-center justify-center group cursor-pointer"
                >
                  {message.thumbnail_url ? (
                    <img src={message.thumbnail_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
                  )}
                  <div className="relative z-10 w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center group-hover:bg-primary transition-colors group-hover:scale-110 duration-200">
                    <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
                  </div>
                </button>
              ) : (
                <video
                  src={message.video_url}
                  controls
                  autoPlay
                  className="w-full aspect-video"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}