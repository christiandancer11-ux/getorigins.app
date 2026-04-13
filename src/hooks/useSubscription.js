import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/AuthContext'
import { getMySubscription, normalizeSubscription, getSubscriptionDefaults } from '@/lib/db'

export function useSubscription() {
  const { user, isLoadingAuth } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async () => {
      if (!user) {
        return getSubscriptionDefaults()
      }

      const { data: subscription, error } = await getMySubscription(user.id)
      if (error) {
        return getSubscriptionDefaults()
      }

      return normalizeSubscription(subscription)
    },
    enabled: !isLoadingAuth,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const loading = isLoading || isLoadingAuth

  return {
    plan: data?.plan ?? 'free',
    status: data?.status ?? 'inactive',
    isPro: data?.isPro === true,
    isExpert: data?.isExpert === true,
    isSubscribed: data?.isSubscribed === true,
    loading,
    allowed: data?.allowed === true,
    remaining: data?.remaining ?? 0,
    canUsePremiumFeatures: data?.canUsePremiumFeatures === true,
    current_period_end: data?.current_period_end ?? null,
  }
}
