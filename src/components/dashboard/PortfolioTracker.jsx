import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Layers, ArrowUpRight,
  ArrowDownRight, Star, Trophy, BarChart2, Activity, Minus
} from 'lucide-react';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { motion } from 'framer-motion';

// ─── Constants ───────────────────────────────────────────────────────────────

const SPORT_COLORS = {
  football: '#f59e0b', basketball: '#ef4444', baseball: '#3b82f6',
  hockey: '#8b5cf6', soccer: '#10b981', golf: '#22d3ee', ufc: '#f97316',
  wwe: '#ec4899', f1: '#e11d48', pokemon: '#facc15', magic_the_gathering: '#a855f7',
  yugioh: '#14b8a6', one_piece: '#fb923c', other: '#6b7280',
};
const SPORT_LABELS = {
  football: 'Football', basketball: 'Basketball', baseball: 'Baseball',
  hockey: 'Hockey', soccer: 'Soccer', golf: 'Golf', ufc: 'UFC',
  wwe: 'WWE', f1: 'F1', pokemon: 'Pokémon', magic_the_gathering: 'MTG',
  yugioh: 'Yu-Gi-Oh!', one_piece: 'One Piece', other: 'Other',
};

// ─── Tooltip Components ───────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-3 py-2.5 shadow-2xl text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-foreground text-sm">${payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
};

const PieTooltipCustom = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border/60 rounded-xl px-3 py-2.5 shadow-2xl text-xs">
      <p className="font-semibold text-foreground">{d.name}</p>
      <p className="text-muted-foreground">{d.count} card{d.count !== 1 ? 's' : ''}</p>
      {d.value > 0 && <p className="text-primary font-bold">${d.value.toLocaleString()}</p>}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, sub, accent, change }) {
  const isPositive = change > 0;
  return (
    <div className="rounded-2xl bg-card border border-border/40 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent || 'bg-primary/10'}`}>
          <Icon className="w-4 h-4 text-primary" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : change < 0 ? <ArrowDownRight className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {change !== 0 ? `${Math.abs(change).toFixed(1)}%` : '—'}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PortfolioTracker({ cards }) {
  const [chartRange, setChartRange] = useState(6); // months

  const owned = useMemo(() => cards.filter(c => !c.status || c.status === 'owned'), [cards]);
  const soldTraded = useMemo(() => cards.filter(c => c.status === 'sold' || c.status === 'traded'), [cards]);

  // ── Core metrics ──────────────────────────────────────────────────────────
  const totalValue = useMemo(() => owned.reduce((s, c) => s + (c.estimated_value || 0), 0), [owned]);
  const totalCost  = useMemo(() => owned.reduce((s, c) => s + (c.price_paid || 0), 0), [owned]);
  const unrealizedPnl = totalValue - totalCost;
  const unrealizedPct = totalCost > 0 ? (unrealizedPnl / totalCost) * 100 : 0;
  const cardsWithValue = useMemo(() => owned.filter(c => c.estimated_value > 0), [owned]);
  const avgValue = cardsWithValue.length > 0 ? totalValue / cardsWithValue.length : 0;

  // Realized P&L from sold/traded cards
  const realizedPnl = useMemo(() => soldTraded.reduce((s, c) => {
    const cost = c.price_paid || 0;
    const sold = c.sold_traded_value || 0;
    return s + (sold - cost);
  }, 0), [soldTraded]);

  // ── Portfolio value over time (cumulative by month cards were added) ───────
  const valueOverTime = useMemo(() => {
    const now = new Date();
    const start = subMonths(now, chartRange - 1);
    const months = eachMonthOfInterval({ start, end: now });
    return months.map(month => {
      const cumValue = owned
        .filter(c => {
          const d = c.created_date ? parseISO(c.created_date) : null;
          return d && startOfMonth(d) <= startOfMonth(month);
        })
        .reduce((s, c) => s + (c.estimated_value || 0), 0);
      const cumCost = owned
        .filter(c => {
          const d = c.created_date ? parseISO(c.created_date) : null;
          return d && startOfMonth(d) <= startOfMonth(month);
        })
        .reduce((s, c) => s + (c.price_paid || 0), 0);
      return { month: format(month, 'MMM yy'), value: Math.round(cumValue), cost: Math.round(cumCost) };
    });
  }, [owned, chartRange]);

  const hasChartData = valueOverTime.some(d => d.value > 0);

  // ── Sport allocation ──────────────────────────────────────────────────────
  const sportData = useMemo(() => {
    const map = {};
    owned.forEach(c => {
      const key = c.sport || 'other';
      if (!map[key]) map[key] = { count: 0, value: 0 };
      map[key].count++;
      map[key].value += c.estimated_value || 0;
    });
    return Object.entries(map)
      .map(([key, d]) => ({
        name: SPORT_LABELS[key] || key,
        count: d.count,
        value: Math.round(d.value),
        pct: owned.length > 0 ? Math.round((d.count / owned.length) * 100) : 0,
        fill: SPORT_COLORS[key] || '#6b7280',
      }))
      .sort((a, b) => b.value - a.value);
  }, [owned]);

  // ── Top holdings (by value) ────────────────────────────────────────────────
  const topHoldings = useMemo(() =>
    [...cardsWithValue].sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0)).slice(0, 8),
    [cardsWithValue]
  );

  // ── Graded vs raw ─────────────────────────────────────────────────────────
  const gradedCount = useMemo(() => owned.filter(c => c.grading_company && c.grade).length, [owned]);
  const rawCount = owned.length - gradedCount;
  const gradedValue = useMemo(() => owned.filter(c => c.grading_company).reduce((s, c) => s + (c.estimated_value || 0), 0), [owned]);

  const pnlPositive = unrealizedPnl >= 0;

  return (
    <div className="space-y-6">

      {/* ── Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-card border border-border/40 p-6 relative overflow-hidden"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }} />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Portfolio Value</p>
              <p className="text-5xl font-bold font-display text-foreground tracking-tight">
                ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${pnlPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
              {pnlPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {pnlPositive ? '+' : ''}{unrealizedPnl.toLocaleString(undefined, { maximumFractionDigits: 0, style: 'currency', currency: 'USD' })}
              <span className="text-xs opacity-80">({pnlPositive ? '+' : ''}{unrealizedPct.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{owned.length} cards owned</span>
            {totalCost > 0 && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />Cost basis ${totalCost.toLocaleString()}</span>}
            {soldTraded.length > 0 && (
              <span className={`flex items-center gap-1 font-semibold ${realizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                <Activity className="w-3.5 h-3.5" />
                Realized {realizedPnl >= 0 ? '+' : ''}{realizedPnl.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Key Metrics Row ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard
          icon={DollarSign} label="Avg Card Value" value={`$${Math.round(avgValue).toLocaleString()}`}
          sub={`${cardsWithValue.length} valued`}
          change={unrealizedPct}
        />
        <MetricCard
          icon={Trophy} label="Top Card" value={topHoldings[0] ? `$${(topHoldings[0].estimated_value || 0).toLocaleString()}` : '—'}
          sub={topHoldings[0]?.name || 'Add values'}
        />
        <MetricCard
          icon={Star} label="Graded Slabs" value={gradedCount}
          sub={gradedCount > 0 ? `$${gradedValue.toLocaleString()} value` : `${rawCount} raw`}
        />
        <MetricCard
          icon={BarChart2} label="Categories" value={sportData.length}
          sub="sports & TCGs"
        />
      </motion.div>

      {/* ── Value Chart ── */}
      {hasChartData && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card border border-border/40 p-5">
          <div className="flex items-center justify-between mb-5">
            <SectionHeader title="Portfolio Over Time" subtitle="Cumulative estimated value as cards were added" />
            <div className="flex gap-1">
              {[3, 6, 12].map(r => (
                <button key={r} onClick={() => setChartRange(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${chartRange === r ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                  {r}M
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={valueOverTime} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="valueGradMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="costGradMain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} width={48} />
              <Tooltip content={<ChartTooltip />} />
              {totalCost > 0 && (
                <Area type="monotone" dataKey="cost" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5}
                  strokeDasharray="4 3" fill="url(#costGradMain)" dot={false} name="Cost Basis" />
              )}
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5}
                fill="url(#valueGradMain)" dot={false} name="Market Value" />
            </AreaChart>
          </ResponsiveContainer>
          {totalCost > 0 && (
            <div className="flex items-center gap-4 mt-3 px-1">
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-primary rounded" /><span className="text-[11px] text-muted-foreground">Market Value</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-muted-foreground rounded opacity-60" style={{ borderTop: '1.5px dashed' }} /><span className="text-[11px] text-muted-foreground">Cost Basis</span></div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Allocation + Top Holdings ── */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Sport Allocation */}
        {sportData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="rounded-2xl bg-card border border-border/40 p-5">
            <SectionHeader title="Allocation by Category" subtitle="Cards and value by sport or TCG" />
            <div className="flex items-center gap-4 mb-4">
              <ResponsiveContainer width={96} height={96}>
                <PieChart>
                  <Pie data={sportData} cx="50%" cy="50%" innerRadius={26} outerRadius={44} dataKey="count" strokeWidth={0}>
                    {sportData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTooltipCustom />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2 min-w-0">
                {sportData.slice(0, 5).map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                    <span className="text-xs text-muted-foreground truncate flex-1">{d.name}</span>
                    <span className="text-xs font-semibold text-foreground">{d.pct}%</span>
                  </div>
                ))}
                {sportData.length > 5 && <p className="text-xs text-muted-foreground/50">+{sportData.length - 5} more</p>}
              </div>
            </div>
            {/* Mini bar chart of value by category */}
            {sportData.some(d => d.value > 0) && (
              <ResponsiveContainer width="100%" height={80}>
                <BarChart data={sportData.slice(0, 6)} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<PieTooltipCustom />} />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {sportData.slice(0, 6).map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        )}

        {/* Top Holdings */}
        {topHoldings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl bg-card border border-border/40 p-5">
            <SectionHeader title="Top Holdings" subtitle="Your highest-value cards" />
            <div className="space-y-2">
              {topHoldings.map((card, i) => {
                const pct = totalValue > 0 ? ((card.estimated_value || 0) / totalValue) * 100 : 0;
                const cardPnl = (card.estimated_value || 0) - (card.price_paid || 0);
                const cardPnlPos = cardPnl >= 0;
                return (
                  <div key={card.id} className="flex items-center gap-3 py-1.5">
                    <span className="text-xs font-bold text-muted-foreground/50 w-4 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{card.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="h-1 rounded-full bg-border/40 flex-1 overflow-hidden">
                          <div className="h-1 rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-foreground">${(card.estimated_value || 0).toLocaleString()}</p>
                      {card.price_paid > 0 && (
                        <p className={`text-[10px] font-medium ${cardPnlPos ? 'text-emerald-400' : 'text-red-400'}`}>
                          {cardPnlPos ? '+' : ''}{cardPnl.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* ── P&L Summary ── */}
      {(totalCost > 0 || soldTraded.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-card border border-border/40 p-5">
          <SectionHeader title="Profit & Loss Summary" subtitle="Based on price paid vs estimated/sold value" />
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-secondary/40 border border-border/30 p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Cost Basis</p>
              <p className="text-lg font-bold text-foreground">${totalCost.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">amount paid</p>
            </div>
            <div className={`rounded-xl border p-3 text-center ${pnlPositive ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-red-500/8 border-red-500/20'}`}>
              <p className="text-xs text-muted-foreground mb-1">Unrealized P&L</p>
              <p className={`text-lg font-bold ${pnlPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {pnlPositive ? '+' : ''}{unrealizedPnl.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </p>
              <p className={`text-xs font-medium ${pnlPositive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>{pnlPositive ? '+' : ''}{unrealizedPct.toFixed(1)}%</p>
            </div>
            {soldTraded.length > 0 && (
              <div className={`rounded-xl border p-3 text-center ${realizedPnl >= 0 ? 'bg-emerald-500/8 border-emerald-500/20' : 'bg-red-500/8 border-red-500/20'}`}>
                <p className="text-xs text-muted-foreground mb-1">Realized P&L</p>
                <p className={`text-lg font-bold ${realizedPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {realizedPnl >= 0 ? '+' : ''}{realizedPnl.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">{soldTraded.length} sold/traded</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground text-center pb-2">
        Values based on your entered estimates. Update individual card values for accurate tracking.
      </p>
    </div>
  );
}