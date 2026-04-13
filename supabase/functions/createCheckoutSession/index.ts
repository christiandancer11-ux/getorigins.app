import { serve } from 'https://deno.land/std@0.201.0/http/server.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://yourdomain.com'
const PRICE_MONTHLY = Deno.env.get('STRIPE_PRICE_PRO_MONTHLY') ?? ''
const PRICE_YEARLY = Deno.env.get('STRIPE_PRICE_PRO_YEARLY') ?? ''

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
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_subscriptions?user_id=eq.${userId}&select=stripe_customer_id,status,plan`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })

  if (!res.ok) {
    return null
  }

  const data = await res.json()
  return data?.[0] ?? null
}

const createCheckoutSession = async (userId: string, email: string, plan: string, couponId?: string) => {
  const price = plan === 'yearly' ? PRICE_YEARLY : PRICE_MONTHLY
  if (!price) {
    return { status: 400, body: { error: 'Missing Stripe price configuration' } }
  }

  const customerRecord = await getSubscriptionRecord(userId)
  
  // Check for existing active subscription (prevent duplicates)
  if (customerRecord && customerRecord.status === 'active' && customerRecord.plan === 'pro') {
    return { status: 200, body: { alreadySubscribed: true } }
  }

  const checkoutParams = new URLSearchParams()
  checkoutParams.set('mode', 'subscription')
  checkoutParams.set('payment_method_types[]', 'card')
  checkoutParams.set('success_url', `${SITE_URL}/pricing?session_id={CHECKOUT_SESSION_ID}`)
  checkoutParams.set('cancel_url', `${SITE_URL}/pricing`)
  checkoutParams.set('subscription_data[metadata][user_id]', userId)
  checkoutParams.set('subscription_data[metadata][plan]', 'pro')
  checkoutParams.set('line_items[0][price]', price)
  checkoutParams.set('line_items[0][quantity]', '1')
  checkoutParams.set('customer_email', email)

  if (customerRecord?.stripe_customer_id) {
    checkoutParams.set('customer', customerRecord.stripe_customer_id)
  }

  if (couponId) {
    checkoutParams.set('discounts[0][coupon]', couponId)
  }

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: checkoutParams.toString(),
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
  const body = await req.json()
  const plan = body?.plan === 'yearly' ? 'yearly' : 'monthly'
  const couponId = body?.couponId

  if (!user?.email || !user?.id) {
    return new Response(JSON.stringify({ error: 'User information missing' }), { status: 400, headers: { 'content-type': 'application/json' } })
  }

  const result = await createCheckoutSession(user.id, user.email, plan, couponId)
  return new Response(JSON.stringify(result.body), { status: result.status, headers: { 'content-type': 'application/json' } })
})
