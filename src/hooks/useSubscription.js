import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Plan structure:
// free  = up to 5 story messages/videos per day (no subscription needed)
// pro   = Origins Pro Bundle — unlimited stories + market, card show, trending ($9.99/mo)

async function fetchSubscriptionStatus() {
  const res = await base44.functions.invoke('checkUsageLimit', {});
  return res.data;
}

export function useSubscription() {
  const { data, isLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: fetchSubscriptionStatus,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  const isPro = !isLoading && data?.isPro === true;

  return {
    plan: isLoading ? null : (isPro ? 'pro' : 'free'),
    loading: isLoading,
    isPro,
    // Legacy aliases so existing pages don't break
    isExpert: isPro,
    hasStories: true, // everyone can post stories (free tier allows 5/day)
    remaining: data?.remaining ?? null,
    allowed: data?.allowed ?? true,
  };
}