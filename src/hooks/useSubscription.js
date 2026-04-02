import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Tier hierarchy: free < stories < pro < expert
// isPro    = pro OR expert (market + card show access)
// hasStories = stories OR pro OR expert (unlimited messages)
// isExpert = expert only (trending access)

async function fetchSubscriptionStatus() {
  const res = await base44.functions.invoke('checkUsageLimit', {});
  return res.data;
}

export function useSubscription() {
  const { data, isLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: fetchSubscriptionStatus,
    staleTime: 5 * 60 * 1000,   // treat as fresh for 5 minutes — no re-fetch on every nav
    gcTime: 10 * 60 * 1000,     // keep in cache for 10 minutes
    retry: 1,
  });

  const plan = isLoading ? null : (data?.plan || (data?.isPro ? 'stories' : false));

  return {
    plan,
    loading: isLoading,
    isExpert: plan === 'expert',
    isPro: plan === 'pro' || plan === 'expert',
    hasStories: plan === 'stories' || plan === 'pro' || plan === 'expert',
    remaining: data?.remaining ?? null,
  };
}