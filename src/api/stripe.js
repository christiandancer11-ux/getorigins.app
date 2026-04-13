import { supabase } from '@/lib/supabaseClient'

const stripeFunctionsUrl = import.meta.env.VITE_STRIPE_FUNCTIONS_URL || ''

const getAuthHeaders = async () => {
  const { data: sessionData, error } = await supabase.auth.getSession()
  if (error || !sessionData?.session?.access_token) {
    return {}
  }

  return {
    Authorization: `Bearer ${sessionData.session.access_token}`,
  }
}

const requestStripeFunction = async (path, payload) => {
  if (!stripeFunctionsUrl) {
    throw new Error('Missing VITE_STRIPE_FUNCTIONS_URL environment variable')
  }

  const authHeaders = await getAuthHeaders()
  const response = await fetch(`${stripeFunctionsUrl}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    const error = data?.error || data?.message || 'Stripe request failed'
    return { data: null, error: new Error(error) }
  }

  return { data, error: null }
}

export const createCheckoutSession = async (params) => {
  return requestStripeFunction('createCheckoutSession', params)
}

export const createBillingPortalSession = async () => {
  return requestStripeFunction('createBillingPortalSession', {})
}
