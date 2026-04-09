import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, RefreshCw, MapPin, ChevronDown, ChevronUp, CreditCard } from 'lucide-react';
import SportBadge from '../shared/SportBadge';

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

export default function TradeCard({ trade, index }) {
  const [expanded, setExpanded] = useState(false);

  const dealBadge = () => {
    if (!trade.ebay_comp_avg || !trade.total_value) return null;
    const ratio = trade.total_value / trade.ebay_comp_avg;
    if (ratio < 0.85) return { label: '🔥 Great Deal', color: 'text-green-400 bg-green-400/10 border-green-400/20' };
    if (ratio > 1.15) return { label: '⚠️ Above Market', color: 'text-red-400 bg-red-400/10 border-red-400/20' };
    return { label: '✓ Fair Deal', color: 'text-primary bg-primary/10 border-primary/20' };
  };

  const badge = dealBadge();
  const date = new Date(trade.created_date);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl bg-card border border-border/50 overflow-hidden hover:border-border transition-colors"
    >
      <div className="flex gap-4 p-4">
        {/* Card Image */}
        <div className="w-16 h-22 shrink-0">
          {trade.image_url ? (
            <img src={trade.image_url} alt={trade.card_name} className="w-16 h-[88px] object-cover rounded-xl border border-border/50" />
          ) : (
            <div className="w-16 h-[88px] rounded-xl bg-secondary border border-border/50 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-semibold text-foreground text-base leading-tight">{trade.card_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {[trade.year, trade.set_name, trade.card_number && `#${trade.card_number}`].filter(Boolean).join(' · ')}
              </p>
            </div>
            {badge && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${badge.color} shrink-0`}>{badge.label}</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {trade.sport && <SportBadge sport={trade.sport} />}
            {trade.condition && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border/50 text-muted-foreground">
                {CONDITION_LABELS[trade.condition] || trade.condition}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-bold text-primary">${(trade.total_value || trade.cash_paid || 0).toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">{TRADE_TYPE_LABELS[trade.trade_type]}</span>
            </div>
            {trade.ebay_comp_avg && (
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">eBay avg: <span className="text-foreground font-medium">${trade.ebay_comp_avg}</span></span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
            {trade.event_name && (
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{trade.event_name}</span>
            )}
            <span>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1 py-2 border-t border-border/30 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
      >
        {expanded ? <><ChevronUp className="w-3 h-3" />Less</> : <><ChevronDown className="w-3 h-3" />More details</>}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border/30">
          {trade.trade_card_description && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Cards Given in Trade</p>
              <p className="text-sm text-foreground">{trade.trade_card_description}</p>
              {trade.trade_card_value && <p className="text-xs text-muted-foreground mt-0.5">Value: ${trade.trade_card_value}</p>}
            </div>
          )}
          {(trade.ebay_comp_low != null || trade.ebay_comp_high != null) && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Market Comps</p>
              <div className="flex gap-4 text-sm">
                {trade.ebay_comp_low != null && <span className="text-muted-foreground">Low: <span className="text-green-400 font-semibold">${trade.ebay_comp_low}</span></span>}
                {trade.ebay_comp_avg != null && <span className="text-muted-foreground">Avg: <span className="text-primary font-semibold">${trade.ebay_comp_avg}</span></span>}
                {trade.ebay_comp_high != null && <span className="text-muted-foreground">High: <span className="text-foreground font-semibold">${trade.ebay_comp_high}</span></span>}
              </div>
              {trade.market_data_raw && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{trade.market_data_raw}</p>}
            </div>
          )}
          {trade.notes && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
              <p className="text-sm text-foreground">{trade.notes}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Logged by {trade.created_by}</p>
        </div>
      )}
    </motion.div>
  );
}