import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, Plus, Trash2, Pause, Play, CheckCircle2, Clock, AlertCircle, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SetAlertModal from '@/components/alerts/SetAlertModal';
import UpgradeModal from '@/components/shared/UpgradeModal';
import { useSubscription } from '@/hooks/useSubscription';

const ALERT_LIMIT = 100;

const statusConfig = {
  active:    { icon: Clock,         color: 'text-amber-400',   label: 'Watching' },
  triggered: { icon: CheckCircle2,  color: 'text-emerald-400', label: 'Triggered' },
  paused:    { icon: AlertCircle,   color: 'text-muted-foreground', label: 'Paused' },
};

function AlertCard({ alert, onDelete, onTogglePause }) {
  const cfg = statusConfig[alert.status] || statusConfig.active;
  const Icon = cfg.icon;
  const cardLabel = [alert.card_name, alert.year, alert.set_name, alert.variant].filter(Boolean).join(' · ');
  const isPaused = alert.status === 'paused';
  const isTriggered = alert.status === 'triggered';

  return (
    <div className={`rounded-xl border p-4 bg-card transition-all ${isTriggered ? 'border-emerald-400/40 bg-emerald-400/5' : 'border-border/40'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-3.5 h-3.5 shrink-0 ${cfg.color}`} />
            <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full border font-medium ${alert.alert_type === 'buy_below' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' : 'text-red-400 border-red-400/30 bg-red-400/10'}`}>
              {alert.alert_type === 'buy_below' ? '🟢 Buy Below' : '🔴 Sell Above'}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground truncate">{cardLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Target: <span className="text-foreground font-medium">${alert.target_price?.toLocaleString()}</span>
            {alert.current_price ? <> · Last seen: <span className="text-foreground">${alert.current_price?.toLocaleString()}</span></> : ''}
          </p>
          {alert.notes && <p className="text-xs text-muted-foreground/70 mt-1 italic">{alert.notes}</p>}
          {alert.triggered_at && (
            <p className="text-xs text-emerald-400 mt-1">Triggered {new Date(alert.triggered_at).toLocaleDateString()}</p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isTriggered && (
            <button
              onClick={() => onTogglePause(alert)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={() => onDelete(alert.id)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PriceAlerts() {
  const [showModal, setShowModal] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [prefill, setPrefill] = useState({});
  const queryClient = useQueryClient();
  const { isPro, loading: subLoading } = useSubscription();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['price-alerts'],
    queryFn: () => base44.entities.PriceAlert.filter({}, '-created_date'),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['price-alerts'] });

  const handleDelete = async (id) => {
    await base44.entities.PriceAlert.delete(id);
    refresh();
  };

  const handleTogglePause = async (alert) => {
    const newStatus = alert.status === 'paused' ? 'active' : 'paused';
    await base44.entities.PriceAlert.update(alert.id, { status: newStatus });
    refresh();
  };

  const handleNewAlert = (pre = {}) => {
    if (!isPro) { setShowUpgrade(true); return; }
    if (alerts.length >= ALERT_LIMIT) return;
    setPrefill(pre);
    setShowModal(true);
  };

  const active = alerts.filter(a => a.status === 'active');
  const triggered = alerts.filter(a => a.status === 'triggered');
  const paused = alerts.filter(a => a.status === 'paused');

  if (subLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Bell className="w-8 h-8 animate-pulse text-primary" /></div>;
  }

  if (!isPro) {
    return (
      <>
        <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Bell className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Price Alerts</h2>
            <p className="text-sm text-muted-foreground mb-2">Get notified by email when any card hits your target buy or sell price — up to 100 alerts at once.</p>
            <p className="text-sm text-muted-foreground mb-6">Available in the <span className="text-primary font-semibold">Origins Pro Bundle</span>.</p>
            <Button onClick={() => setShowUpgrade(true)} className="bg-primary text-primary-foreground h-11 px-8">
              <Zap className="w-4 h-4 mr-2" />Unlock with Origins Pro — $9.99/mo
            </Button>
          </div>
        </div>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </>
    );
  }

  const atLimit = alerts.length >= ALERT_LIMIT;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Price Alerts</h1>
              <p className="text-xs text-muted-foreground">{alerts.length}/{ALERT_LIMIT} alerts · Get notified when cards hit your target price</p>
            </div>
          </div>
          <Button onClick={() => handleNewAlert()} disabled={atLimit} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1" /> New Alert
          </Button>
        </div>
        {atLimit && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 mb-5 text-sm text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            You've reached the 100-alert limit. Delete some alerts to add more.
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-card border border-border/40 animate-pulse" />)}
          </div>
        )}

        {!isLoading && alerts.length === 0 && (
          <div className="text-center py-20">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-foreground font-medium mb-1">No alerts yet</p>
            <p className="text-sm text-muted-foreground mb-6">Set a price alert to get notified when a card hits your target buy or sell price.</p>
            <Button onClick={() => handleNewAlert()} className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-1" /> Set Your First Alert
            </Button>
          </div>
        )}

        {!isLoading && alerts.length > 0 && (
          <div className="space-y-6">
            {triggered.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">🔔 Triggered</p>
                <div className="space-y-2">{triggered.map(a => <AlertCard key={a.id} alert={a} onDelete={handleDelete} onTogglePause={handleTogglePause} />)}</div>
              </div>
            )}
            {active.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">👀 Watching</p>
                <div className="space-y-2">{active.map(a => <AlertCard key={a.id} alert={a} onDelete={handleDelete} onTogglePause={handleTogglePause} />)}</div>
              </div>
            )}
            {paused.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">⏸ Paused</p>
                <div className="space-y-2">{paused.map(a => <AlertCard key={a.id} alert={a} onDelete={handleDelete} onTogglePause={handleTogglePause} />)}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && <SetAlertModal prefill={prefill} onClose={() => setShowModal(false)} onCreated={refresh} />}
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}