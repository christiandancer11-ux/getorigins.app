import { serve } from 'https://deno.land/std@0.201.0/http/server.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://origins.app'

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

const fetchDiscordWebhooks = async (userId: string, webhookId?: string) => {
  let url = `${SUPABASE_URL}/rest/v1/discord_webhooks?user_id=eq.${userId}&is_active=eq.true`
  if (webhookId) {
    url += `&id=eq.${webhookId}`
  }

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    return []
  }

  const data = await res.json()
  return Array.isArray(data) ? data : []
}

const postDiscordWebhook = async (webhookUrl: string, payload: any) => {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return response
}

const updateLastPosted = async (id: string) => {
  await fetch(`${SUPABASE_URL}/rest/v1/discord_webhooks?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ last_posted: new Date().toISOString() }),
  })
}

const formatCardEmbed = (card: any, shareUrl: string, note?: string) => {
  const fields = []
  if (card.set_name) fields.push({ name: 'Set', value: card.set_name, inline: true })
  if (card.year) fields.push({ name: 'Year', value: card.year.toString(), inline: true })
  if (card.card_number) fields.push({ name: 'Card #', value: `#${card.card_number}`, inline: true })
  if (card.sport) fields.push({ name: 'Sport', value: card.sport.replace(/_/g, ' '), inline: true })
  if (card.estimated_value != null) fields.push({ name: 'Estimate', value: `$${Number(card.estimated_value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, inline: true })

  return {
    username: 'Origins',
    content: note || 'A card story has been shared from Origins! Click through to learn more.',
    embeds: [
      {
        title: card.name || 'Card Story Share',
        description: `${card.description || 'Check out this card story on Origins.'}`,
        url: shareUrl,
        color: 0xE5A825,
        fields,
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    })
  }

  const authCheck = await verifyRequest(req)
  if (authCheck.status !== 200) {
    return new Response(JSON.stringify(authCheck.body), {
      status: authCheck.status,
      headers: { 'content-type': 'application/json' },
    })
  }

  const { user } = authCheck.body
  const body = await req.json()
  const { card, shareUrl, note, webhookId, test } = body || {}
  const targetUrl = shareUrl || (card?.id ? `${SITE_URL}/cards/${card.id}` : SITE_URL)

  const webhooks = await fetchDiscordWebhooks(user.id, webhookId)
  if (!webhooks.length) {
    return new Response(JSON.stringify({ error: 'No Discord webhooks configured for this account.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    })
  }

  const sendPromises = webhooks.map(async (webhook: any) => {
    const payload = test
      ? {
          username: 'Origins Discord Test',
          content: `✅ Your Discord webhook is connected. This is a test message from Origins.`,
        }
      : formatCardEmbed(card, targetUrl, note)

    const response = await postDiscordWebhook(webhook.webhook_url, payload)
    if (response.ok) {
      await updateLastPosted(webhook.id)
      return { webhookId: webhook.id, success: true }
    }

    const resultText = await response.text().catch(() => 'Unknown error')
    return {
      webhookId: webhook.id,
      success: false,
      status: response.status,
      error: resultText,
    }
  })

  const results = await Promise.all(sendPromises)
  const successCount = results.filter((result) => result.success).length

  return new Response(JSON.stringify({ results, successCount }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
})
