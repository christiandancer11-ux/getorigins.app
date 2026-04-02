import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Download, ExternalLink, QrCode } from 'lucide-react';
import { Button } from "@/components/ui/button";
import html2canvas from 'html2canvas';

const PLATFORMS = [
  {
    name: 'X / Twitter',
    color: 'bg-black hover:bg-black/80',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.902-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    getUrl: (link, card, count) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out the history of my ${card.name}${card.year ? ` (${card.year})` : ''} — ${count} owner message${count !== 1 ? 's' : ''} and counting! 🃏✨ #Origins #CardCollecting`)}&url=${encodeURIComponent(link)}`,
  },
  {
    name: 'Instagram',
    color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    getUrl: () => null, // Instagram doesn't support direct web share with URL
    note: 'Download the image and share on Instagram',
  },
  {
    name: 'TikTok',
    color: 'bg-black hover:bg-black/80',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
      </svg>
    ),
    getUrl: (link, card, count) =>
      `https://www.tiktok.com/share?url=${encodeURIComponent(link)}&title=${encodeURIComponent(`My ${card.name} has ${count} owner messages on Origins!`)}`,
  },
  {
    name: 'YouTube',
    color: 'bg-red-600 hover:bg-red-700',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    getUrl: (link, card) =>
      `https://www.youtube.com/share?url=${encodeURIComponent(link)}&title=${encodeURIComponent(`Origins: The story of my ${card.name}`)}`,
  },
  {
    name: 'Twitch',
    color: 'bg-purple-600 hover:bg-purple-700',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
    getUrl: (link, card) =>
      `https://www.twitch.tv/share?url=${encodeURIComponent(link)}`,
  },
];

function PreviewCard({ card, messages, previewRef }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.origin + '/scan/' + card.unique_code)}&bgcolor=0d1117&color=e5a825&format=svg`;

  const sportEmojis = {
    baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
    soccer: '⚽', pokemon: '⚡', magic_the_gathering: '🧙', yugioh: '🃏', other: '🎴',
  };

  const recentOwners = messages.slice(0, 3);

  return (
    <div
      ref={previewRef}
      style={{ fontFamily: 'Inter, sans-serif', width: '540px', background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)' }}
      className="rounded-2xl overflow-hidden border border-yellow-500/20 p-8 relative"
    >
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(229,168,37,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(229,168,37,0.15)', border: '1px solid rgba(229,168,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '14px' }}>◻</span>
        </div>
        <span style={{ color: '#e5a825', fontWeight: '700', fontSize: '16px', letterSpacing: '-0.02em' }}>Origins</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginLeft: 'auto' }}>Card Story</span>
      </div>

      {/* Card + Info row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        {/* Card image */}
        <div style={{ width: '100px', height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(229,168,37,0.2)', background: '#1a1f2b', flexShrink: 0 }}>
          {card.image_url ? (
            <img src={card.image_url} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
              {sportEmojis[card.sport] || '🎴'}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {card.sport && (
            <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', background: 'rgba(229,168,37,0.1)', border: '1px solid rgba(229,168,37,0.2)', color: '#e5a825', fontSize: '11px', fontWeight: '600', marginBottom: '8px', width: 'fit-content' }}>
              {sportEmojis[card.sport]} {card.sport.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          )}
          <h2 style={{ color: '#f0e6c8', fontWeight: '800', fontSize: '20px', lineHeight: '1.2', marginBottom: '6px' }}>{card.name}</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
            {[card.set_name, card.year, card.card_number ? `#${card.card_number}` : null].filter(Boolean).join(' · ')}
          </p>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e5a825', display: 'inline-block' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{messages.length} owner message{messages.length !== 1 ? 's' : ''} in this card's history</span>
          </div>
        </div>
      </div>

      {/* Recent messages preview */}
      {recentOwners.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>Recent Voices</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentOwners.map((msg, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(229,168,37,0.15)', border: '1px solid rgba(229,168,37,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#e5a825', fontWeight: '700', fontSize: '12px' }}>
                  {msg.owner_name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#f0e6c8', fontSize: '12px', fontWeight: '600', marginBottom: '2px' }}>{msg.owner_name}</p>
                  {msg.message && (
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', lineHeight: '1.4', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{msg.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer: QR + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p style={{ color: '#e5a825', fontWeight: '700', fontSize: '13px', marginBottom: '2px' }}>Scan to explore this card's journey</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{window.location.origin}/scan/{card.unique_code}</p>
        </div>
        <img src={qrUrl} alt="QR" style={{ width: '60px', height: '60px', borderRadius: '8px', border: '1px solid rgba(229,168,37,0.3)' }} />
      </div>
    </div>
  );
}

export default function ShareCardModal({ card, messages, onClose }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef(null);

  const shareLink = `${window.location.origin}/scan/${card.unique_code}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    const canvas = await html2canvas(previewRef.current, { backgroundColor: null, scale: 2, useCORS: true, allowTaint: true });
    const link = document.createElement('a');
    link.download = `origins-${card.unique_code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setDownloading(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="bg-card border border-border/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Share This Card's Story</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Share the unique journey of <span className="text-foreground font-medium">{card.name}</span></p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Preview Card */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Preview</p>
              <div className="overflow-x-auto pb-2">
                <PreviewCard card={card} messages={messages} previewRef={previewRef} />
              </div>
            </div>

            {/* Download Image Button */}
            <Button
              onClick={handleDownload}
              disabled={downloading}
              variant="outline"
              className="w-full border-primary/30 text-primary hover:bg-primary/10"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? 'Generating Image...' : 'Download Share Image'}
            </Button>

            {/* Copy Link */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Shareable Link</p>
              <div className="flex gap-2">
                <div className="flex-1 px-3 py-2.5 rounded-lg bg-secondary border border-border text-sm text-muted-foreground font-mono truncate">
                  {shareLink}
                </div>
                <Button onClick={handleCopy} variant="outline" size="sm" className="shrink-0 border-border/50">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* Platform Buttons */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Share to Platform</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PLATFORMS.map((platform) => {
                  const url = platform.getUrl?.(shareLink, card, messages.length);
                  return (
                    <div key={platform.name} className="relative group">
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200 ${platform.color} w-full`}>
                          {platform.icon}
                          {platform.name}
                          <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                        </a>
                      ) : (
                        <button
                          onClick={handleDownload}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-all duration-200 ${platform.color} w-full`}
                        >
                          {platform.icon}
                          {platform.name}
                          <Download className="w-3 h-3 ml-auto opacity-60" />
                        </button>
                      )}
                      {platform.note && (
                        <div className="absolute bottom-full left-0 mb-1 px-2 py-1 rounded bg-background border border-border text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {platform.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}