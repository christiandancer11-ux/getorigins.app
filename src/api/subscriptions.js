import { supabase } from '@/lib/supabaseClient'

export const getUserSubscription = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !sessionData?.session?.user?.id) {
    return {
      plan: 'free',
      status: 'inactive',
      isPro: false,
      isExpert: false,
      allowed: true,
      current_period_end: null,
    }
  }

  const userId = sessionData.session.user.id
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return {
      plan: 'free',
      status: 'inactive',
      isPro: false,
      isExpert: false,
      allowed: true,
      current_period_end: null,
      error,
    }
  }

  const active = data.status === 'active'
  const isPro = active && data.plan === 'pro'
  const isExpert = active && data.plan === 'expert'

  return {
    plan: data.plan || 'free',
    status: data.status || 'inactive',
    isPro,
    isExpert,
    allowed: active && ['pro', 'expert'].includes(data.plan),
    current_period_end: data.current_period_end,
    stripe_subscription_id: data.stripe_subscription_id || null,
    stripe_customer_id: data.stripe_customer_id || null,
  }
}
