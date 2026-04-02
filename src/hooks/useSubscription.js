import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Returns:
//   isPro  = true  → has "pro" plan (market + card show + unlimited stories)
//   hasStories = true → has at least "stories" plan (unlimited messages)
//   loading = true while fetching

export function useSubscription() {
  const [plan, setPlan] = useState(null); // null=loading, false=free, 'stories', 'pro'
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
    isPro: plan === 'pro',
    hasStories: plan === 'stories' || plan === 'pro',
  };
}