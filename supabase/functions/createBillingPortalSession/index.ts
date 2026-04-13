import { serve } from 'https://deno.land/std@0.201.0/http/server.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://yourdomain.com'

const verifyRequest = async (req: Request) => {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    return { status: 401, body: { error: 'Missing auth token' } }
  }

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_SERVICE_ROLE_KEY,
    },
  })

  if (!userRes.ok) {
    return { status: 401, body: { error: 'Invalid auth token' } }
  }

  const userData = await userRes.json()
  return { status: 200, body: { user: userData } }
}

const getSubscriptionRecord = async (userId: string) => {
  const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/user_subscriptions?user_id=eq.${userId}&select=*`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })

  if (!supabaseRes.ok) {
    return null
  }

  const data = await supabaseRes.json()
  return data?.[0] ?? null
}

const createPortalSession = async (customerId: string) => {
  const body = new URLSearchParams()
  body.set('customer', customerId)
  body.set('return_url', SITE_URL)

  const stripeRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  const data = await stripeRes.json()
  return { status: stripeRes.ok ? 200 : 400, body: data }
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'content-type': 'application/json' } })
  }

  const authCheck = await verifyRequest(req)
  if (authCheck.status !== 200) {
    return new Response(JSON.stringify(authCheck.body), { status: authCheck.status, headers: { 'content-type': 'application/json' } })
  }

  const { user } = authCheck.body
  const subscription = await getSubscriptionRecord(user.id)

  if (!subscription?.stripe_customer_id) {
    return new Response(JSON.stringify({ error: 'No Stripe customer is associated with this account' }), { status: 400, headers: { 'content-type': 'application/json' } })
  }

  const result = await createPortalSession(subscription.stripe_customer_id)
  return new Response(JSON.stringify(result.body), { status: result.status, headers: { 'content-type': 'application/json' } })
})
