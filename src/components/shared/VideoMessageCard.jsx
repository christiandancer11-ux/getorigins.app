import React, { useRef, useState } from 'react';
import { Play, Pause, Download, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoMessageCard({ message, index }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleDownload = async () => {
    if (!message.video_url) return;
    const a = document.createElement('a');
    a.href = message.video_url;
    a.download = `origins-story-${message.id}.mp4`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative flex gap-4 mb-8"
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 z-10">
          <User className="w-4 h-4 text-primary" />
        </div>
        <div className="w-px flex-1 bg-border/50 mt-2" />
      </div>

      <div className="flex-1 pb-8">
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          {/* Video */}
          {message.video_url && (
            <div className="relative bg-black aspect-video">
              <video
                ref={videoRef}
                src={message.video_url}
                poster={message.thumbnail_url}
                className="w-full h-full object-cover"
                onEnded={() => setPlaying(false)}
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  {playing
                    ? <Pause className="w-5 h-5 text-white" />
                    : <Play className="w-5 h-5 text-white ml-0.5" />}
                </button>
              </div>
              <button
                onClick={handleDownload}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-xs text-white hover:bg-black/80 transition-colors"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          )}

          {/* Text content */}
          <div className="p-4">
            <p className="text-sm font-semibold text-foreground mb-1">{message.owner_name}</p>
            {message.message && (
              <p className="text-sm text-muted-foreground leading-relaxed">{message.message}</p>
            )}
            <p className="text-xs text-muted-foreground/60 mt-2">
              {new Date(message.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}