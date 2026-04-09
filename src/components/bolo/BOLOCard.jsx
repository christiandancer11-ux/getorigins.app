import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Calendar, User, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

const INCIDENT_LABELS = {
  stolen_at_show: '🎪 Stolen at Card Show',
  shop_break_in: '🏪 Shop Break-In',
  other: '📋 Other',
};

const DEALER_LABELS = {
  card_show_dealer: 'Certified Card Show Dealer',
  card_shop_owner: 'Certified Card Shop Owner',
};

export default function BOLOCard({ alert, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-card border border-destructive/20 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-destructive/10 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-destructive" />
          <span className="text-sm font-bold text-destructive">BOLO ALERT</span>
          <span className="text-xs text-muted-foreground ml-1">{INCIDENT_LABELS[alert.incident_type] || 'Stolen Cards'}</span>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${alert.status === 'active' ? 'bg-destructive/20 text-destructive' : alert.status === 'resolved' ? 'bg-green-500/20 text-green-400' : 'bg-secondary text-muted-foreground'}`}>
          {alert.status?.toUpperCase()}
        </span>
      </div>

      <div className="p-5">
        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
          {alert.location_name && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              {alert.location_name}
            </div>
          )}
          {alert.incident_date && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {new Date(alert.incident_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
            <DollarSign className="w-3.5 h-3.5 shrink-0" />
            ${(alert.total_value || 0).toLocaleString()} total value
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
            <User className="w-3 h-3 shrink-0" />
            {DEALER_LABELS[alert.reporter_type] || 'Dealer'}
          </div>
        </div>

        {/* Card images */}
        {alert.image_urls?.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {alert.image_urls.map((url, i) => (
              <img key={i} src={url} alt="" className="h-24 w-auto rounded-lg border border-border/50 shrink-0 object-cover" />
            ))}
          </div>
        )}

        {/* Card list preview */}
        <div className="bg-secondary/50 rounded-xl p-3 mb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 font-semibold">Stolen Cards</p>
          <p className={`text-sm text-foreground whitespace-pre-line ${!expanded ? 'line-clamp-3' : ''}`}>{alert.card_list}</p>
        </div>

        {/* Expandable details */}
        {(alert.slab_cert_numbers || alert.suspect_description) && (
          <button onClick={() => setExpanded(p => !p)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Show less' : 'Show cert numbers & suspect info'}
          </button>
        )}

        {expanded && (
          <div className="space-y-3">
            {alert.slab_cert_numbers && (
              <div className="bg-secondary/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 font-semibold">Slab Cert Numbers</p>
                <p className="text-sm font-mono text-foreground whitespace-pre-line">{alert.slab_cert_numbers}</p>
              </div>
            )}
            {alert.suspect_description && (
              <div className="bg-destructive/5 border border-destructive/15 rounded-xl p-3">
                <p className="text-xs text-destructive uppercase tracking-wide mb-1.5 font-semibold">Suspect Description</p>
                <p className="text-sm text-foreground">{alert.suspect_description}</p>
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground/50 mt-2">
          {new Date(alert.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {alert.notifications_sent > 0 && ` · ${alert.notifications_sent} collectors notified`}
        </p>
      </div>
    </motion.div>
  );
}