import React, { useState } from 'react';
import { X, Flame, TrendingUp, TrendingDown, Minus, Loader2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const trendIcon = (trend) => {
  if (trend === 'up')   return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const heatColor = (score) => {
  if (score >= 90) return 'text-red-400';
  if (score >= 75) return 'text-orange-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-muted-foreground';
};

export default function TrendingCardDetailSheet({ card, onClose, viewMode }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!card) return;
    fetchAnalysis();
  }, [card?.rank]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    const res = await base44.functions.invoke('analyzeTrendingCard', { card, viewMode });
    if (res.data && !res.data.error) setAnalysis(res.data);
    setLoading(false);
  };

  if (!card) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          className="relative w-full max-w-lg bg-card border border-border/50 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto z-10"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <div className="w-8 text-center">
                {card.rank <= 3 ? (
                  <span className="text-xl">{card.rank === 1 ? '🥇' : card.rank === 2 ? '🥈' : '🥉'}</span>
                ) : (
                  <span className="text-sm font-bold text-muted-foreground">#{card.rank}</span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground leading-tight">{card.player_or_name}</h2>
                <p className="text-xs text-muted-foreground">
                  {[card.year, card.set_name, card.variant].filter(Boolean).join(' · ')}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground ml-2 mt-0.5">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 px-5 py-4 border-b border-border/20">
            <div className="flex-1 rounded-xl bg-secondary/40 px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Est. Value</p>
              <div className="flex items-center justify-center gap-1">
                {trendIcon(card.trend)}
                <span className="text-base font-bold text-foreground">${card.estimated_value_avg?.toLocaleString() || '—'}</span>
              </div>
            </div>
            <div className="flex-1 rounded-xl bg-secondary/40 px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Heat Score</p>
              <div className="flex items-center justify-center gap-1">
                {card.heat_score >= 85 && <Flame className="w-4 h-4 text-red-400" />}
                <span className={`text-base font-bold ${heatColor(card.heat_score)}`}>{card.heat_score}°</span>
              </div>
            </div>
            <div className="flex-1 rounded-xl bg-secondary/40 px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Trend</p>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                {trendIcon(card.trend)}
                <span className="text-sm font-semibold capitalize text-foreground">{card.trend || '—'}</span>
              </div>
            </div>
          </div>

          {/* Why hot snippet */}
          {card.why_hot && (
            <div className="px-5 py-3 border-b border-border/20">
              <p className="text-xs text-muted-foreground italic">"{card.why_hot}"</p>
            </div>
          )}

          {/* AI Analysis */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">AI Deep Dive</h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing market signals...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                {analysis.popularity_reason && (
                  <Section title="Why It's Hot Right Now" content={analysis.popularity_reason} />
                )}
                {analysis.market_drivers && (
                  <Section title="Market Drivers" content={analysis.market_drivers} />
                )}
                {analysis.recent_sales_context && (
                  <Section title="Recent Sales Context" content={analysis.recent_sales_context} />
                )}
                {analysis.collector_sentiment && (
                  <Section title="Collector Sentiment" content={analysis.collector_sentiment} />
                )}
                {analysis.short_term_outlook && (
                  <Section title="Short-Term Outlook" content={analysis.short_term_outlook} />
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Could not load analysis.</p>
            )}
          </div>

          <div className="px-5 pb-6 pt-1">
            <p className="text-xs text-muted-foreground text-center">AI analysis is for informational purposes only — not financial advice.</p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function Section({ title, content }) {
  return (
    <div>
      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{title}</p>
      <p className="text-sm text-foreground/90 leading-relaxed">{content}</p>
    </div>
  );
}