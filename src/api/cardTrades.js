import { supabase } from '@/lib/supabaseClient'

export const createCardTrade = async (payload) => {
  const { data, error } = await supabase
    .from('card_trades')
    .insert(payload)
    .select()
    .single()

  return { data, error }
}

export const getCardTrades = async () => {
  const { data, error } = await supabase
    .from('card_trades')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  return { data: data ?? [], error }
}

export const getUserCardTrades = async (userId) => {
  if (!userId) return { data: [], error: null }
  const { data, error } = await supabase
    .from('card_trades')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

export const getTradeStats = async () => {
  const { data, error } = await supabase
    .from('card_trades')
    .select('id, total_value, is_verified, sport, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  return { data: data ?? [], error }
}

export const fetchTradeComps = async ({ card_name, set_name, year, card_number }) => {
  const query = supabase.from('card_trades').select('*').order('created_at', { ascending: false }).limit(50)

  if (card_name) {
    query.ilike('card_name', `%${card_name}%`)
  }
  if (set_name) {
    query.ilike('set_name', `%${set_name}%`)
  }
  if (year) {
    query.eq('year', year)
  }
  if (card_number) {
    query.ilike('card_number', `%${card_number}%`)
  }

  const { data, error } = await query
  const rows = data ?? []
  const prices = rows.map((trade) => trade.total_value || trade.price || 0).filter((price) => price > 0)
  const average = prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : null
  const min = prices.length ? Math.min(...prices) : null
  const max = prices.length ? Math.max(...prices) : null

  return {
    data: {
      recent_sales: rows,
      average_price: average,
      min_price: min,
      max_price: max,
      ebay_avg: average,
      ebay_low: min,
      ebay_high: max,
      market_summary: rows.length ? `${rows.length} recent sales found` : null,
    },
    error,
  }
}
