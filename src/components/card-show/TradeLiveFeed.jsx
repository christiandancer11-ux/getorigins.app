import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, DollarSign, MapPin, CreditCard, ShieldCheck, AlertTriangle } from 'lucide-react';
import SportBadge from '../shared/SportBadge';
import TradeInteractions from './TradeInteractions';

const CONDITION_LABELS = {
  raw: 'Raw', psa_10: 'PSA 10', psa_9: 'PSA 9', psa_8: 'PSA 8', psa_7: 'PSA 7',
  psa_6: 'PSA 6', psa_5: 'PSA 5', psa_4: 'PSA 4', psa_3: 'PSA 3', psa_2: 'PSA 2', psa_1: 'PSA 1',
  bgs_10: 'BGS 10', bgs_9_5: 'BGS 9.5', bgs_9: 'BGS 9', sgc_10: 'SGC 10', other_graded: 'Graded',
};

const TRADE_TYPE_LABELS = {
  cash: '💵 Cash',
  card_for_card: '🔄 Card-for-Card',
  cash_plus_card: '💵+🔄 Cash + Card',
};

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function LiveTradeItem({ trade, isNew, currentUserEmail }) {
  const dealBadge = () => {
    if (!trade.ebay_comp_avg || !trade.total_value) return null;
    const ratio = trade.total_value / trade.ebay_comp_avg;
    if (ratio < 0.85) return { label: '🔥 Great Deal', color: 'text-green-400 bg-green-400/10 border-green-400/20' };
    if (ratio > 1.15) return { label: '⚠ Above Market', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' };
    return { label: '✓ Fair', color: 'text-primary bg-primary/10 border-primary/20' };
  };
  const badge = dealBadge();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className={`rounded-xl border overflow-hidden transition-colors ${isNew ? 'border-primary/40 bg-primary/5' : 'border-border/40 bg-card'}`}
    >
      <div className="flex gap-3 p-3.5">
      {/* Image */}
      <div className="shrink-0">
        {trade.image_url ? (
          <img src={trade.image_url} alt={trade.card_name} className="w-12 h-[68px] object-cover rounded-lg border border-border/50" />
        ) : (
          <div className="w-12 h-[68px] rounded-lg bg-secondary border border-border/50 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight truncate">{trade.card_name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {[trade.year, trade.set_name].filter(Boolean).join(' · ')}
              {trade.condition && ` · ${CONDITION_LABELS[trade.condition] || trade.condition}`}
            </p>
          </div>
          {badge && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${badge.color} shrink-0`}>{badge.label}</span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {trade.sport && <SportBadge sport={trade.sport} />}
          <span className="flex items-center gap-1 text-xs font-bold text-primary">
            <DollarSign className="w-3 h-3" />{(trade.total_value || trade.cash_paid || 0).toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">{TRADE_TYPE_LABELS[trade.trade_type]}</span>
          {trade.verified != null && (
            trade.verified
              ? <ShieldCheck className="w-3 h-3 text-green-400" />
              : <AlertTriangle className="w-3 h-3 text-amber-400/60" />
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          {trade.event_name && (
            <span className="flex items-center gap-1 truncate"><MapPin className="w-2.5 h-2.5 shrink-0" />{trade.event_name}</span>
          )}
          <span className="shrink-0 ml-auto">{timeAgo(trade.created_date)}</span>
        </div>
      </div>
      </div>
      <TradeInteractions tradeId={trade.id} currentUserEmail={currentUserEmail} />
    </motion.div>
  );
}

export default function TradeLiveFeed({ currentUserEmail }) {
  const [trades, setTrades] = useState([]);
  const [newIds, setNewIds] = useState(new Set());
  const initialized = useRef(false);

  useEffect(() => {
    // Initial load
    base44.entities.CardTrade.list('-created_date', 30).then(data => {
      setTrades(data);
      initialized.current = true;
    });

    // Real-time subscription
    const unsubscribe = base44.entities.CardTrade.subscribe((event) => {
      if (!initialized.current) return;
      if (event.type === 'create' && event.data) {
        setTrades(prev => [event.data, ...prev.slice(0, 49)]);
        setNewIds(prev => new Set([...prev, event.data.id]));
        // Remove "new" highlight after 8s
        setTimeout(() => {
          setNewIds(prev => { const n = new Set(prev); n.delete(event.data.id); return n; });
        }, 8000);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div>
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
        </span>
        <span className="text-sm font-semibold text-foreground">Live Feed</span>
        <span className="text-xs text-muted-foreground">— trades appear in real time</span>
        <span className="ml-auto text-xs text-muted-foreground">{trades.length} trades</span>
      </div>

      {trades.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center">
            <Radio className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No trades yet — be the first to log one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {trades.map(trade => (
              <LiveTradeItem key={trade.id} trade={trade} isNew={newIds.has(trade.id)} currentUserEmail={currentUserEmail} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}