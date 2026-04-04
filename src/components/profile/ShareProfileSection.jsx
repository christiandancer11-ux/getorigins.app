import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ShareProfileSection({ userEmail }) {
  const [copied, setCopied] = useState(false);

  const profileUrl = `${window.location.origin}/collector/${encodeURIComponent(userEmail)}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="rounded-2xl bg-card border border-border/50 p-6 mt-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            Share Your Profile
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share a link to your public collector profile with friends
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-border/50">
          <span className="text-xs text-muted-foreground truncate">{profileUrl}</span>
        </div>
        <Button
          onClick={handleCopyLink}
          size="sm"
          className="gap-2 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}