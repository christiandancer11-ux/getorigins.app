import React from 'react';
import { DollarSign, Layers, TrendingUp, Star } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, parseISO, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

const SPORT_COLORS = {
  football:          '#f59e0b',
  basketball:        '#ef4444',
  baseball:          '#3b82f6',
  hockey:            '#8b5cf6',
  soccer:            '#10b981',
  pokemon:           '#f97316',
  magic_the_gathering:'#ec4899',
  yugioh:            '#14b8a6',
  other:             '#6b7280',
};

const SPORT_LABELS = {
  football: 'Football', basketball: 'Basketball', baseball: 'Baseball',
  hockey: 'Hockey', soccer: 'Soccer', pokemon: 'Pokémon',
  magic_the_gathering: 'MTG', yugioh: 'Yu-Gi-Oh!', other: 'Other',
};

const RARITY_COLORS = {
  common: '#6b7280', uncommon: '#10b981', rare: '#3b82f6',
  ultra_rare: '#8b5cf6', legendary: '#f59e0b', '1_of_1': '#ef4444',
};

const RARITY_LABELS = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare',
  ultra_rare: 'Ultra Rare', legendary: 'Legendary', '1_of_1': '1-of-1',
};

function StatBox({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-xl bg-card border border-border/40 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-bold text-primary">${payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="font-semibold text-foreground">{payload[0].name}</p>
      <p className="text-muted-foreground">{payload[0].payload.count} card{payload[0].payload.count !== 1 ? 's' : ''}</p>
      {payload[0].payload.value > 0 && <p className="text-primary font-medium">${payload[0].payload.value.toLocaleString()}</p>}
    </div>
  );
};

export default function CollectionStats({ cards }) {
  const owned = React.useMemo(() => cards.filter(c => !c.status || c.status === 'owned'), [cards]);

  // Total value
  const totalValue = React.useMemo(() => owned.reduce((sum, c) => sum + (c.estimated_value || 0), 0), [owned]);
  const cardsWithValue = React.useMemo(() => owned.filter(c => c.estimated_value > 0).length, [owned]);

  // Sport breakdown
  const sportData = React.useMemo(() => {
    const sportMap = {};
    owned.forEach(c => {
      const key = c.sport || 'other';
      if (!sportMap[key]) sportMap[key] = { count: 0, value: 0 };
      sportMap[key].count++;
      sportMap[key].value += c.estimated_value || 0;
    });
    return Object.entries(sportMap)
      .map(([key, d]) => ({ name: SPORT_LABELS[key] || key, count: d.count, value: Math.round(d.value), fill: SPORT_COLORS[key] || '#6b7280' }))
      .sort((a, b) => b.count - a.count);
  }, [owned]);

  // Rarity breakdown
  const rarityData = React.useMemo(() => {
    const rarityMap = {};
    owned.forEach(c => {
      if (!c.rarity) return;
      if (!rarityMap[c.rarity]) rarityMap[c.rarity] = { count: 0, value: 0 };
      rarityMap[c.rarity].count++;
      rarityMap[c.rarity].value += c.estimated_value || 0;
    });
    return Object.entries(rarityMap)
      .map(([key, d]) => ({ name: RARITY_LABELS[key] || key, count: d.count, value: Math.round(d.value), fill: RARITY_COLORS[key] || '#6b7280' }));
  }, [owned]);

  // Value over time (cumulative by month added)
  const valueOverTime = React.useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({ start: sixMonthsAgo, end: now });
    return months.map(month => {
      const monthStr = format(month, 'MMM yy');
      const cumValue = owned
        .filter(c => {
          const d = c.created_date ? parseISO(c.created_date) : null;
          return d && startOfMonth(d) <= startOfMonth(month);
        })
        .reduce((sum, c) => sum + (c.estimated_value || 0), 0);
      return { month: monthStr, value: Math.round(cumValue) };
    });
  }, [owned]);

  const hasValueData = React.useMemo(() => valueOverTime.some(d => d.value > 0), [valueOverTime]);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBox icon={Layers} label="Active Cards" value={owned.length} sub="in collection" />
        <StatBox icon={DollarSign} label="Total Value" value={`$${totalValue.toLocaleString()}`} sub={`${cardsWithValue} valued`} />
        <StatBox icon={TrendingUp} label="Avg Value" value={cardsWithValue > 0 ? `$${Math.round(totalValue / cardsWithValue).toLocaleString()}` : '—'} sub="per card" />
        <StatBox icon={Star} label="Sports / TCGs" value={sportData.length} sub="categories" />
      </div>

      {/* Value over time */}
      {hasValueData && (
        <div className="rounded-xl bg-card border border-border/40 p-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Collection Value Over Time</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={valueOverTime} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="valueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#valueGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sport + Rarity charts */}
      <div className="grid sm:grid-cols-2 gap-4">
        {sportData.length > 0 && (
          <div className="rounded-xl bg-card border border-border/40 p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">By Sport / TCG</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={sportData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="count" strokeWidth={0}>
                    {sportData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 min-w-0">
                {sportData.map(d => (
                  <div key={d.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                      <span className="text-xs text-muted-foreground truncate">{d.name}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground shrink-0">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {rarityData.length > 0 && (
          <div className="rounded-xl bg-card border border-border/40 p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">By Rarity</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={rarityData} cx="50%" cy="50%" innerRadius={28} outerRadius={46} dataKey="count" strokeWidth={0}>
                    {rarityData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5 min-w-0">
                {rarityData.map(d => (
                  <div key={d.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                      <span className="text-xs text-muted-foreground truncate">{d.name}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground shrink-0">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}