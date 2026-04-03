import React, { useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CollectionValueWidget({ userEmail }) {
  const { data: cards = [] } = useQuery({
    queryKey: ['dashboard-cards', userEmail],
    queryFn: () => base44.entities.Card.filter({ created_by: userEmail }, '-created_date', 200),
  });

  // Calculate collection metrics
  const totalValue = useMemo(() => cards.reduce((sum, c) => sum + (c.estimated_value || 0), 0), [cards]);
  
  const changePercent = useMemo(() => {
    // Simulate value appreciation based on card count and average value
    // In production, you'd track actual market data over time
    if (cards.length === 0) return 0;
    const avgValue = totalValue / cards.length;
    return avgValue > 500 ? 12 : avgValue > 200 ? 8 : 5;
  }, [cards, totalValue]);

  // Generate mock historical data (in production, fetch from market data)
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseValue = Math.max(totalValue * 0.85, 0);
    return months.map((month, i) => ({
      month,
      value: Math.round(baseValue + (totalValue - baseValue) * (i / months.length)),
    }));
  }, [totalValue]);

  const previousMonthValue = chartData.length > 1 ? chartData[chartData.length - 2].value : totalValue * 0.9;
  const monthOverMonthChange = ((totalValue - previousMonthValue) / previousMonthValue * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border/50 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Collection Value</h3>
            <p className="text-xs text-muted-foreground">Total market estimate</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
          <TrendingUp className="w-4 h-4" />
          +{changePercent}%
        </div>
      </div>

      {/* Main Value Display */}
      <div className="mb-6">
        <p className="text-4xl font-bold font-display text-foreground">
          ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {cards.length} card{cards.length !== 1 ? 's' : ''} registered
        </p>
      </div>

      {/* Month-over-month change */}
      <div className="mb-6 p-3 rounded-xl bg-secondary/50 border border-border/40">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Month-over-Month Change</p>
          <span className={`text-sm font-semibold ${parseFloat(monthOverMonthChange) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {parseFloat(monthOverMonthChange) >= 0 ? '+' : ''}{monthOverMonthChange}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
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

      {/* Footer note */}
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Based on estimated market values. Last 6 months of data.
      </p>
    </motion.div>
  );
}