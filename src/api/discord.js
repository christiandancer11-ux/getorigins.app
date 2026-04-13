import { supabase } from '@/lib/supabaseClient'

const discordFunctionsUrl =
  import.meta.env.VITE_DISCORD_FUNCTIONS_URL ||
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ||
  import.meta.env.VITE_STRIPE_FUNCTIONS_URL || ''

const getAuthHeaders = async () => {
  const { data: sessionData, error } = await supabase.auth.getSession()
  if (error || !sessionData?.session?.access_token) {
    return {}
  }

  return {
    Authorization: `Bearer ${sessionData.session.access_token}`,
  }
}

const invokeDiscordFunction = async (path, payload) => {
  if (!discordFunctionsUrl) {
    throw new Error('Missing VITE_DISCORD_FUNCTIONS_URL or VITE_SUPABASE_FUNCTIONS_URL environment variable')
  }

  const authHeaders = await getAuthHeaders()
  const response = await fetch(`${discordFunctionsUrl}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  if (!response.ok) {
    const error = data?.error || data?.message || 'Discord request failed'
    return { data: null, error: new Error(error) }
  }

  return { data, error: null }
}

export const sendDiscordMessage = async (payload) => {
  return invokeDiscordFunction('sendDiscordMessage', payload)
}

export const getDiscordWebhooks = async () => {
  const { data, error } = await supabase
    .from('discord_webhooks')
    .select('id,server_name,is_active,last_posted')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const createDiscordWebhook = async ({ server_name, webhook_url }) => {
  const { data, error } = await supabase
    .from('discord_webhooks')
    .insert({ server_name: server_name || 'Discord', webhook_url, is_active: true })
    .select('id,server_name,is_active,last_posted')
    .single()

  return { data, error }
}

export const deleteDiscordWebhook = async (id) => {
  const { data, error } = await supabase
    .from('discord_webhooks')
    .delete()
    .eq('id', id)
    .single()

  return { data, error }
}
