import React from 'react';
import { Handshake, MapPin, DollarSign, ShieldCheck, ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONDITION_LABELS = {
  raw: 'Raw', psa_10: 'PSA 10', psa_9: 'PSA 9', psa_8: 'PSA 8', psa_7: 'PSA 7',
  bgs_10: 'BGS 10', bgs_9_5: 'BGS 9.5', bgs_9: 'BGS 9', sgc_10: 'SGC 10', other_graded: 'Graded',
};

const TRADE_TYPE_LABELS = { cash: 'Cash', card_for_card: 'Card-for-Card', cash_plus_card: 'Cash + Card' };

export default function CardShowComps({ trades, query }) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Handshake className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <span className="font-semibold text-sm text-foreground">Card Show Trades</span>
        </div>
        <Link to="/card-show" className="text-xs text-primary hover:underline">View all</Link>
      </div>

      {trades.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground mb-1">No in-person trades found for this card.</p>
          <p className="text-xs text-muted-foreground">
            Trade this card at a show?{' '}
            <Link to="/card-show" className="text-primary hover:underline">Log it →</Link>
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border/20">
          {trades.map((t, i) => {
            const date = new Date(t.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return (
              <div key={t.id} className="px-4 py-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.card_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[t.year, t.set_name, t.card_number && `#${t.card_number}`, CONDITION_LABELS[t.condition]].filter(Boolean).join(' · ')}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap text-xs text-muted-foreground">
                    {t.event_name && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{t.event_name}</span>}
                    <span>{TRADE_TYPE_LABELS[t.trade_type] || t.trade_type}</span>
                    <span>{date}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-base font-bold text-amber-400 flex items-center gap-0.5 justify-end">
                    <DollarSign className="w-3.5 h-3.5" />{(t.total_value || t.cash_paid || 0).toFixed(2)}
                  </p>
                  {t.ebay_comp_avg && (
                    <p className="text-xs text-muted-foreground">eBay avg ${t.ebay_comp_avg}</p>
                  )}
                  {t.verified === true && (
                    <div className="flex items-center gap-0.5 text-xs text-green-400 mt-1 justify-end">
                      <ShieldCheck className="w-3 h-3" />Verified
                    </div>
                  )}
                  {t.verified === false && (
                    <div className="flex items-center gap-0.5 text-xs text-muted-foreground mt-1 justify-end">
                      <ShieldOff className="w-3 h-3" />Unverified
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}