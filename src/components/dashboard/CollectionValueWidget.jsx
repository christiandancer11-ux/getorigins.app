import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { getTradeAnalyticsSummary } from '@/lib/db';

export default function CollectionValueWidget({ userEmail }) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboard-trade-analytics', userEmail],
    queryFn: async () => {
      const { data } = await getTradeAnalyticsSummary({ limit: 200 });
      return data;
    },
    staleTime: 60_000,
  });

  const chartData = useMemo(() => {
    if (!analytics?.recent_sales?.length) return [];
    return [...analytics.recent_sales]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-12)
      .map((trade) => ({
        label: new Date(trade.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: trade.total_value ?? trade.price ?? 0,
      }));
  }, [analytics]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Market Analytics</h3>
            <p className="text-xs text-muted-foreground">Real-time insights from recent Supabase trades.</p>
          </div>
        </div>
        <div className="text-sm font-semibold text-foreground">
          {analytics?.trend_30d_pct != null ? (
            <span className={analytics.trend_30d_pct >= 0 ? 'text-green-400' : 'text-red-400'}>
              {analytics.trend_30d_pct >= 0 ? '+' : ''}{analytics.trend_30d_pct.toFixed(1)}%
            </span>
          ) : (
            'No trend yet'
          )}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-4xl font-bold font-display text-foreground">
          {analytics?.average_price != null ? `$${analytics.average_price.toFixed(0)}` : '--'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {analytics?.sample_size ?? 0} recent trade{(analytics?.sample_size ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground mb-6">
        <div className="rounded-2xl bg-secondary/30 p-4 border border-border/50">
          <p className="font-semibold text-foreground">Confidence</p>
          <p>{analytics?.confidence_score != null ? `${analytics.confidence_score}%` : '—'}</p>
        </div>
        <div className="rounded-2xl bg-secondary/30 p-4 border border-border/50">
          <p className="font-semibold text-foreground">Volatility</p>
          <p>{analytics?.volatility_pct != null ? `${analytics.volatility_pct.toFixed(1)}%` : '—'}</p>
        </div>
        <div className="rounded-2xl bg-secondary/30 p-4 border border-border/50">
          <p className="font-semibold text-foreground">Next Range</p>
          <p>
            {analytics?.estimated_next_low != null && analytics?.estimated_next_high != null
              ? `$${analytics.estimated_next_low.toFixed(0)} - $${analytics.estimated_next_high.toFixed(0)}`
              : '—'}
          </p>
        </div>
      </div>

      <div className="h-64 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        {analytics?.source_summary ?? (isLoading ? 'Loading trade analytics…' : 'Collecting current trade market signals.')}
      </p>
    </motion.div>
  );
}

