import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Bell, TrendingDown } from 'lucide-react';
import { legacyApi } from '@/api/apiClient';

export default function MajorPullAlerts() {
  const [pulls, setPulls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPulls = async () => {
      try {
        const recentPulls = await legacyApi.entities.MajorPullAlert.filter({
          status: 'active',
          verified: true
        }, '-created_date', 5);
        setPulls(recentPulls);
      } catch (e) {
        console.error('Failed to fetch pulls:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPulls();
    const interval = setInterval(fetchLatestPulls, 60 * 1000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-40 bg-card rounded-2xl border border-border/50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pulls.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/25"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-bold text-foreground">Major Pull Alert</h3>
      </div>
      
      <div className="space-y-3">
        {pulls.map((pull) => (
          <div key={pull.id} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="shrink-0 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {pull.card_name} pulled from {pull.product_name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ${pull.estimated_value.toLocaleString()} • Verified on {pull.social_platforms.join(', ')}
              </p>
              {pull.impact_on_market && (
                <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                  <TrendingDown className="w-3 h-3 shrink-0 mt-0.5 text-orange-500" />
                  {pull.impact_on_market}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/20 flex items-center gap-2 text-xs text-muted-foreground">
        <Bell className="w-3.5 h-3.5 text-primary" />
        <span>Enable notifications in your profile to get alerts like this</span>
      </div>
    </motion.div>
  );
}

