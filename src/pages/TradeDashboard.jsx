import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, TrendingUp, DollarSign, Handshake, Lock, Zap, Trophy, Flame } from 'lucide-react';
import { getRecentTrades } from '@/lib/db';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import UpgradeModal from '@/components/shared/UpgradeModal';
import SportBadge from '@/components/shared/SportBadge';

const SPORT_LABELS = {
  baseball: 'Baseball', basketball: 'Basketball', football: 'Football',
  hockey: 'Hockey', soccer: 'Soccer', pokemon: 'Pokémon',
  magic_the_gathering: 'MTG', yugioh: 'Yu-Gi-Oh!', other: 'Other',
};

function StatCard({ label, value, sub, icon: Icon, color = 'text-primary' }) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className={`text-2xl font-bold font-display ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.dataKey === 'avg' || p.dataKey === 'total' ? `$${p.value}` : p.value}</p>
      ))}
    </div>
  );
};

export default function TradeDashboard() {
  const { isPro, loading: subLoading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['trade-dash'],
    queryFn: async () => {
      const res = await getRecentTrades({ limit: 500 });
      return res.data ?? [];
    },
    enabled: isPro,
  });

  // Volume over time (last 30 days, grouped by day)
  const volumeData = useMemo(() => {
    const map = {};
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[key] = { day: key, count: 0, total: 0 };
    }
    trades.forEach(t => {
      const d = new Date(t.created_date);
      if (Date.now() - d.getTime() > 30 * 86400000) return;
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (map[key]) { map[key].count++; map[key].total += t.total_value || 0; }
    });
    return Object.values(map).map(v => ({ ...v, total: Math.round(v.total) }));
  }, [trades]);

  // Top cards by avg trade value
  const topCards = useMemo(() => {
    const map = {};
    trades.forEach(t => {
      if (!t.card_name || !t.total_value) return;
      const key = `${t.card_name}||${t.set_name || ''}||${t.year || ''}`;
      if (!map[key]) map[key] = { card_name: t.card_name, set_name: t.set_name, year: t.year, sport: t.sport, values: [], count: 0 };
      map[key].values.push(t.total_value);
      map[key].count++;
    });
    return Object.values(map)
      .map(c => ({ ...c, avg: Math.round(c.values.reduce((s, v) => s + v, 0) / c.values.length) }))
      .filter(c => c.count >= 1)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 10);
  }, [trades]);

  // By sport breakdown
  const sportData = useMemo(() => {
    const map = {};
    trades.forEach(t => {
      const s = t.sport || 'other';
      if (!map[s]) map[s] = { sport: s, count: 0, total: 0 };
      map[s].count++;
      map[s].total += t.total_value || 0;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [trades]);

  const totalValue = trades.reduce((s, t) => s + (t.total_value || 0), 0);
  const avgValue = trades.length ? totalValue / trades.length : 0;
  const verifiedPct = trades.length ? Math.round(trades.filter(t => t.verified).length / trades.length * 100) : 0;

  if (subLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  if (!isPro) return (
    <>
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
            <BarChart2 className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Trade Dashboard</h2>
          <p className="text-sm text-muted-foreground mb-6">Trends in card values, top traded cards, and volume analytics — exclusive to Pro members.</p>
          <button onClick={() => setShowUpgrade(true)} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90">
            <Zap className="w-4 h-4" />Unlock with Origins Pro
          </button>
        </div>
      </div>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <BarChart2 className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Trade Dashboard</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-9">Market trends based on {trades.length} community trades</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-card border border-border/50 animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Trades" value={trades.length} sub="all time" icon={Handshake} />
              <StatCard label="Total Volume" value={`$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} sub="logged deal value" icon={DollarSign} color="text-green-400" />
              <StatCard label="Avg Deal" value={`$${avgValue.toFixed(0)}`} sub="per trade" icon={TrendingUp} color="text-amber-400" />
              <StatCard label="Verified Deals" value={`${verifiedPct}%`} sub="within fair range" icon={Trophy} color="text-blue-400" />
            </div>

            {/* Volume chart */}
            <div className="rounded-2xl bg-card border border-border/50 p-5 mb-6">
              <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Trade Volume — Last 30 Days</h2>
              <p className="text-xs text-muted-foreground mb-4">Number of trades logged per day</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} interval={6} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Trades" stroke="hsl(var(--primary))" fill="url(#vol)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Value chart */}
            <div className="rounded-2xl bg-card border border-border/50 p-5 mb-6">
              <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-400" />Deal Value — Last 30 Days</h2>
              <p className="text-xs text-muted-foreground mb-4">Total dollar volume of trades per day</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} interval={6} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Volume" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Top cards */}
              <div className="rounded-2xl bg-card border border-border/50 p-5">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Flame className="w-4 h-4 text-primary" />Top Traded Cards</h2>
                {topCards.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No trades yet.</p>
                ) : (
                  <div className="space-y-2">
                    {topCards.map((card, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/30 transition-colors">
                        <span className="text-xs font-bold text-muted-foreground w-5 text-center">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{card.card_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{[card.year, card.set_name].filter(Boolean).join(' · ')}</p>
                        </div>
                        {card.sport && <SportBadge sport={card.sport} />}
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-primary">${card.avg}</p>
                          <p className="text-[10px] text-muted-foreground">{card.count} trade{card.count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* By sport */}
              <div className="rounded-2xl bg-card border border-border/50 p-5">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-primary" />Trades by Sport</h2>
                {sportData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {sportData.map(s => {
                      const maxCount = sportData[0].count;
                      return (
                        <div key={s.sport}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-foreground font-medium">{SPORT_LABELS[s.sport] || s.sport}</span>
                            <span className="text-muted-foreground">{s.count} trades · ${Math.round(s.total).toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

