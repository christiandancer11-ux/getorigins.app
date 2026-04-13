import { serve } from 'https://deno.land/std@0.201.0/http/server.ts'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? ''
const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const HMAC_SHA256 = async (key: string, payload: string) => {
  const enc = new TextEncoder()
  const keyData = enc.encode(key)
  const payloadData = enc.encode(payload)
  const cryptoKey = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, payloadData)
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const verifyStripeSignature = async (payload: string, signatureHeader: string | null) => {
  if (!signatureHeader) return false
  const parts = signatureHeader.split(',').map((part) => part.trim())
  const parsed: Record<string, string[]> = {}
  for (const part of parts) {
    const [key, value] = part.split('=')
    if (!parsed[key]) parsed[key] = []
    parsed[key].push(value)
  }
  const timestamp = parsed.t?.[0]
  const signatures = parsed.v1 ?? []
  if (!timestamp || !signatures.length) return false

  const signedPayload = `${timestamp}.${payload}`
  const expected = await HMAC_SHA256(STRIPE_WEBHOOK_SECRET, signedPayload)
  return signatures.some((signature) => signature === expected)
}

const createOrUpdateSubscription = async (payload: any) => {
  const body = JSON.stringify([payload])
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_subscriptions?on_conflict=user_id`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body,
  })
  return res.ok
}

const getUserByCustomerId = async (customerId: string) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_subscriptions?stripe_customer_id=eq.${customerId}&select=user_id`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data?.[0]?.user_id ?? null
}

const fetchStripeSubscription = async (subscriptionId: string) => {
  const res = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
    },
  })
  if (!res.ok) return null
  return res.json()
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'content-type': 'application/json' } })
  }

  const signature = req.headers.get('stripe-signature')
  const payload = await req.text()
  const valid = await verifyStripeSignature(payload, signature)
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid Stripe signature' }), { status: 400, headers: { 'content-type': 'application/json' } })
  }

  const event = JSON.parse(payload)
  const type = event.type
  const object = event.data?.object

  if (!object) {
    return new Response(JSON.stringify({ error: 'Invalid Stripe event payload' }), { status: 400, headers: { 'content-type': 'application/json' } })
  }

  const upsertPayload = async (userId: string, customerId: string, subscriptionId: string, status: string, currentPeriodEnd: number | null) => {
    const payload = {
      user_id: userId,
      plan: 'pro',
      status,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    }
    await createOrUpdateSubscription(payload)
  }

  if (type === 'checkout.session.completed') {
    const subscriptionId = object.subscription
    const customerId = object.customer
    const userId = object.metadata?.user_id

    if (!subscriptionId || !customerId || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required checkout session fields' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    const subscription = await fetchStripeSubscription(subscriptionId)
    const status = subscription?.status === 'active' ? 'active' : 'inactive'
    const currentPeriodEnd = subscription?.current_period_end ?? null
    await upsertPayload(userId, customerId, subscriptionId, status, currentPeriodEnd)
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  }

  if (type === 'customer.subscription.updated' || type === 'customer.subscription.deleted') {
    const subscriptionId = object.id
    const customerId = object.customer
    const status = object.status === 'active' ? 'active' : 'inactive'
    const currentPeriodEnd = object.current_period_end ?? null
    let userId = object.metadata?.user_id

    if (!userId && customerId) {
      userId = await getUserByCustomerId(customerId)
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unknown subscription customer' }), { status: 400, headers: { 'content-type': 'application/json' } })
    }

    await upsertPayload(userId, customerId, subscriptionId, status, currentPeriodEnd)
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'content-type': 'application/json' } })
})
