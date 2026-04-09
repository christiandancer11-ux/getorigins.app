import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';

export default function PortfolioTrends() {
  const data = [
    { date: 'Apr 1', value: 4800 },
    { date: 'Apr 7', value: 5100 },
    { date: 'Apr 14', value: 5400 },
    { date: 'Apr 21', value: 6100 },
    { date: 'Apr 28', value: 6800 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="p-7 rounded-2xl bg-card border border-border/50"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-foreground mb-1">Collection Value</h3>
          <p className="text-sm text-muted-foreground">30-day portfolio performance</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-lg font-bold text-green-500 mb-1">
            <ArrowUpRight className="w-5 h-5" />
            +$2,000
          </div>
          <p className="text-xs text-muted-foreground">+41.7% this month</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.1} />
          <XAxis dataKey="date" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
          <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-foreground)',
            }}
            formatter={(value) => `$${value}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-primary)"
            dot={false}
            strokeWidth={2}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 p-4 rounded-lg bg-green-500/5 border border-green-500/20 flex gap-3">
        <TrendingUp className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
        <p className="text-xs text-green-500/90">
          Your top movers this week: <span className="font-semibold">2023 Bowman Chrome Patrick Sandoval</span> (+18%), <span className="font-semibold">Pokémon Charizard PSA 8</span> (+12%)
        </p>
      </div>
    </motion.div>
  );
}