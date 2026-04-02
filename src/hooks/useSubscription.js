import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Tier hierarchy: free < stories < pro < expert
// isPro    = pro OR expert (market + card show access)
// hasStories = stories OR pro OR expert (unlimited messages)
// isExpert = expert only (trending access)

export function useSubscription() {
  const [plan, setPlan] = useState(null); // null=loading, false=free, 'stories', 'pro', 'expert'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('checkUsageLimit', {})
      .then(res => {
        const data = res.data;
        if (data?.isPro) setPlan(data.plan || 'stories');
        else setPlan(false);
      })
      .catch(() => setPlan(false))
      .finally(() => setLoading(false));
  }, []);

  return {
    plan,
    loading,
    isExpert: plan === 'expert',
    isPro: plan === 'pro' || plan === 'expert',
    hasStories: plan === 'stories' || plan === 'pro' || plan === 'expert',
  };
}