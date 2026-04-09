import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const suffix = i < 12 ? 'am' : 'pm';
  const display = i === 0 ? '12am' : i === 12 ? '12pm' : `${i % 12}${suffix}`;
  return { hour: i, label: display };
});

export default function ActivityHeatmap({ scanEvents, messageEvents }) {
  const data = HOURS.map(({ hour, label }) => ({
    label,
    scans: scanEvents.filter(e => e.hour_of_day === hour).length,
    messages: messageEvents.filter(e => new Date(e.created_date).getHours() === hour).length,
  }));

  const maxVal = Math.max(...data.map(d => d.scans + d.messages), 1);

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-6">
      <h3 className="font-semibold text-foreground mb-1">Activity by Time of Day</h3>
      <p className="text-xs text-muted-foreground mb-5">When people scan and leave messages</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            interval={2}
          />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Bar dataKey="scans" name="Scans" stackId="a" radius={[0, 0, 0, 0]} fill="hsl(var(--primary))" opacity={0.7} />
          <Bar dataKey="messages" name="Messages" stackId="a" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary/70 inline-block" />Scans</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />Messages</span>
      </div>
    </div>
  );
}