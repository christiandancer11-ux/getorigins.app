import React from 'react';
import { ExternalLink } from 'lucide-react';

export default function SocialLink({ label, value, baseUrl, color }) {
  if (!value) return null;

  const href = value.startsWith('http') ? value : `${baseUrl}${value.replace(/^@/, '')}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 hover:bg-secondary transition-colors group"
    >
      <span className="text-sm font-medium text-foreground flex-1">{label}</span>
      <span className="text-xs text-muted-foreground truncate max-w-[140px]">{value.replace(/^@/, '')}</span>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
    </a>
  );
}