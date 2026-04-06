import React from 'react';
import { motion } from 'framer-motion';

export default function ScanSpeedHero() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-card border border-border/50 h-96 flex items-center justify-center">
      {/* Video Loop Placeholder */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://media.base44.com/images/public/69ceb0c6913655f4b9105f84/scanning-demo.mp4" type="video/mp4" />
        {/* Fallback: gradient animation to simulate scanning speed */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-pulse" />
      </video>

      {/* Overlay with scan speed indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative z-10 text-center pointer-events-none"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/90 text-primary-foreground text-sm font-semibold backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
          Scan Speed: 3-5 seconds per card
        </div>
      </motion.div>
    </div>
  );
}