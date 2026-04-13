import { supabase } from '@/lib/supabaseClient'
import { mapCardRecord } from '@/lib/mapCardRecord'
import { mapStoryRecord } from '@/lib/mapStoryRecord'
import { mapValueRecord } from '@/lib/mapValueRecord'

export const getMySubscription = async (userId) => {
  if (!userId) {
    return { data: null, error: new Error('Missing userId for subscription lookup') }
  }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export const upsertMySubscription = async (payload) => {
  const {
    user_id,
    plan = 'free',
    status = 'inactive',
    stripe_customer_id = null,
    stripe_subscription_id = null,
    current_period_end = null,
  } = payload || {}

  if (!user_id) {
    return { data: null, error: new Error('Missing user_id for subscription upsert') }
  }

  const { data, error } = await supabase
    .from('user_subscriptions')
    .upsert(
      {
        user_id,
        plan,
        status,
        stripe_customer_id,
        stripe_subscription_id,
        current_period_end,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  return { data, error }
}

// Temporary helper for manual testing and admin/dev setup.
// TODO: remove this after the Stripe onboarding flow is implemented.
export const createManualProSubscription = async (userId) => {
  return upsertMySubscription({
    user_id: userId,
    plan: 'pro',
    status: 'active',
  })
}

export const getSubscriptionDefaults = () => ({
  plan: 'free',
  status: 'inactive',
  isPro: false,
  isExpert: false,
  isSubscribed: false,
  allowed: true,
  remaining: 0,
  canUsePremiumFeatures: false,
  current_period_end: null,
})

export const normalizeSubscription = (subscription) => {
  if (!subscription) {
    return getSubscriptionDefaults()
  }

  const plan = subscription.plan || 'free'
  const status = subscription.status || 'inactive'
  const active = status === 'active'
  const isPro = active && plan === 'pro'
  const isExpert = active && plan === 'expert'

  return {
    plan,
    status,
    isPro,
    isExpert,
    isSubscribed: active,
    allowed: true,
    remaining: plan === 'free' ? 0 : null,
    canUsePremiumFeatures: active && ['pro', 'expert'].includes(plan),
    current_period_end: subscription.current_period_end || null,
    stripe_customer_id: subscription.stripe_customer_id || null,
    stripe_subscription_id: subscription.stripe_subscription_id || null,
  }
}

const mapTradeRecord = (trade) => {
  if (!trade) return null

  const mapped = {
    ...trade,
    card_name: trade.player_name || trade.title || trade.brand || 'Unknown Card',
    set_name: trade.title || trade.brand || null,
    total_value: trade.price ?? null,
    verified: trade.is_verified,
    created_date: trade.created_at,
  }

  return mapped
}

export const createTrade = async (payload) => {
  if (!payload?.user_id) {
    return { data: null, error: new Error('Missing user_id for trade creation') }
  }

  const tradePayload = {
    user_id: payload.user_id,
    card_id: payload.card_id || null,
    player_name: payload.player_name || null,
    title: payload.title || null,
    brand: payload.brand || null,
    year: payload.year || null,
    price: payload.price ?? null,
    platform: payload.platform || null,
    sport: payload.sport || null,
    notes: payload.notes || null,
    is_verified: payload.is_verified !== undefined ? payload.is_verified : true,
    created_at: payload.created_at || new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('card_trades')
    .insert(tradePayload)
    .select()
    .single()

  return { data: mapTradeRecord(data), error }
}

export const getMyTrades = async (userId) => {
  if (!userId) {
    return { data: [], error: new Error('Missing userId for trade lookup') }
  }

  const { data, error } = await supabase
    .from('card_trades')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(200)

  return { data: data ? data.map(mapTradeRecord) : [], error }
}

export const getTradesForCard = async (cardId) => {
  const query = supabase
    .from('card_trades')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (cardId) query.eq('card_id', cardId)
  else query.eq('is_verified', true)

  const { data, error } = await query
  return { data: data ? data.map(mapTradeRecord) : [], error }
}

export const getRecentTrades = async ({ limit = 200 } = {}) => {
  const { data, error } = await supabase
    .from('card_trades')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data ? data.map(mapTradeRecord) : [], error }
}

export const getCardByUniqueCode = async (uniqueCode) => {
  if (!uniqueCode) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('unique_code', uniqueCode)
    .single()

  return { data: data ? mapCardRecord(data) : null, error }
}

export const getUserByEmail = async (email) => {
  if (!email) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  return { data, error }
}

export const getUserById = async (userId) => {
  if (!userId) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  return { data, error }
}

export const getTradesByCreatorEmail = async (email, limit = 100) => {
  if (!email) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('card_trades')
    .select('*')
    .eq('created_by', email)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data ? data.map(mapTradeRecord) : [], error }
}

export const getCardsByCreatorEmail = async (email, limit = 100) => {
  if (!email) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('created_by', email)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data ? data.map(mapCardRecord) : [], error }
}

export const updateUserProfile = async (userId, payload) => {
  if (!userId) {
    return { data: null, error: new Error('Missing user_id for profile update') }
  }

  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

const parseTradeDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const calculateMedian = (values) => {
  if (!values || values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

const safePercentChange = (current, previous) => {
  if (current == null || previous == null || previous === 0) return null
  return ((current - previous) / Math.abs(previous)) * 100
}

const calculateVolatilityPct = (prices) => {
  if (!prices || prices.length < 2) return 0
  const average = prices.reduce((sum, value) => sum + value, 0) / prices.length
  if (average === 0) return 0

  const variance = prices.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / (prices.length - 1)
  return (Math.sqrt(variance) / average) * 100
}

const calculateConfidenceScore = (sampleSize, volatilityPct) => {
  if (!sampleSize || sampleSize < 1) return 0
  const base = Math.min(1, Math.log10(sampleSize + 1) / 2)
  const volatilityPenalty = Math.min(1, volatilityPct / 60)
  const score = Math.max(10, Math.min(95, 100 * base * (1 - volatilityPenalty)))
  return Math.round(score)
}

const estimateNextSaleRange = (average, volatilityPct, minPrice, maxPrice) => {
  if (average == null) {
    return [null, null]
  }
  const rangeFactor = 1 + Math.min(volatilityPct / 100, 0.35)
  const low = Math.max(0, average * (1 - rangeFactor * 0.3))
  const high = average * rangeFactor
  return [
    minPrice != null ? Math.min(minPrice, low) : low,
    maxPrice != null ? Math.max(maxPrice, high) : high,
  ]
}

const buildTradeAnalyticsResult = (rows) => {
  const prices = rows.map((trade) => trade.total_value || trade.price || 0).filter((price) => price > 0)
  const average = prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : null
  const min = prices.length ? Math.min(...prices) : null
  const max = prices.length ? Math.max(...prices) : null
  const median = calculateMedian(prices)
  const volatilityPct = calculateVolatilityPct(prices)
  const confidenceScore = calculateConfidenceScore(prices.length, volatilityPct)
  const [estimated_next_low, estimated_next_high] = estimateNextSaleRange(average, volatilityPct, min, max)

  const now = new Date()
  const last7 = rows.filter((trade) => {
    const date = parseTradeDate(trade.created_at)
    return date && now - date <= 7 * 24 * 60 * 60 * 1000
  })
  const last14 = rows.filter((trade) => {
    const date = parseTradeDate(trade.created_at)
    const elapsed = date ? now - date : null
    return elapsed && elapsed > 7 * 24 * 60 * 60 * 1000 && elapsed <= 14 * 24 * 60 * 60 * 1000
  })
  const last30 = rows.filter((trade) => {
    const date = parseTradeDate(trade.created_at)
    return date && now - date <= 30 * 24 * 60 * 60 * 1000
  })
  const last60 = rows.filter((trade) => {
    const date = parseTradeDate(trade.created_at)
    const elapsed = date ? now - date : null
    return elapsed && elapsed > 30 * 24 * 60 * 60 * 1000 && elapsed <= 60 * 24 * 60 * 60 * 1000
  })

  const averageLast7 = last7.length ? last7.reduce((sum, trade) => sum + (trade.total_value || trade.price || 0), 0) / last7.length : null
  const averageLast14 = last14.length ? last14.reduce((sum, trade) => sum + (trade.total_value || trade.price || 0), 0) / last14.length : null
  const averageLast30 = last30.length ? last30.reduce((sum, trade) => sum + (trade.total_value || trade.price || 0), 0) / last30.length : null
  const averageLast60 = last60.length ? last60.reduce((sum, trade) => sum + (trade.total_value || trade.price || 0), 0) / last60.length : null

  const trend_7d_pct = safePercentChange(averageLast7, averageLast14 ?? average)
  const trend_30d_pct = safePercentChange(averageLast30, averageLast60 ?? average)
  const sampleSize = prices.length
  const latestTradeDate = rows.length ? parseTradeDate(rows[0].created_at) : null
  const timeframe = last30.length >= 1 ? '30 days' : last7.length >= 1 ? '7 days' : 'available period'

  const market_summary = rows.length
    ? `${rows.length} recent matching trade${rows.length === 1 ? '' : 's'} found`
    : 'No recent matching trades found'

  const source_summary = rows.length
    ? `${rows.length} trades from the last ${timeframe}`
    : 'No recent trade comps found'

  return {
    recent_sales: rows,
    sample_size: sampleSize,
    average_price: average,
    median_price: median,
    min_price: min,
    max_price: max,
    trend_7d_pct,
    trend_30d_pct,
    volatility_pct: volatilityPct,
    confidence_score: confidenceScore,
    estimated_next_low,
    estimated_next_high,
    latest_trade_date: latestTradeDate ? latestTradeDate.toISOString() : null,
    market_summary,
    source_summary,
    ebay_avg: average,
    ebay_low: min,
    ebay_high: max,
  }
}

export const fetchTradeComps = async ({ card_name, set_name, year, card_number }) => {
  const query = supabase
    .from('card_trades')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

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
  return { data: buildTradeAnalyticsResult(rows), error }
}

export const getCardPriceSummary = async ({ card_name, set_name, year, card_number }) => {
  return fetchTradeComps({ card_name, set_name, year, card_number })
}

export const getTradeAnalyticsSummary = async ({ limit = 500 } = {}) => {
  const { data, error } = await supabase
    .from('card_trades')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: buildTradeAnalyticsResult(data ?? []), error }
}

export const getTradeStats = async () => {
  const { data, error } = await supabase
    .from('card_trades')
    .select('id, price, is_verified, sport, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  return { data: data ?? [], error }
}

export const createScanEvent = async ({ card_id, scanner_id = null }) => {
  if (!card_id) {
    return { data: null, error: new Error('Missing card_id for scan event') }
  }

  const { data, error } = await supabase
    .from('scan_events')
    .insert({ card_id, scanner_id })
    .select()
    .single()

  return { data, error }
}

export const createOwnershipRequest = async (payload) => {
  if (!payload?.card_id) {
    return { data: null, error: new Error('Missing card_id for ownership request') }
  }

  const requestPayload = {
    card_id: payload.card_id,
    requester_id: payload.requester_id || null,
    owner_id: payload.owner_id || null,
    message: payload.message || null,
    status: payload.status || 'pending',
  }

  const { data, error } = await supabase
    .from('card_ownership_requests')
    .insert(requestPayload)
    .select()
    .single()

  return { data, error }
}

export const getOwnershipRequestsForCard = async (cardId) => {
  if (!cardId) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('card_ownership_requests')
    .select('*')
    .eq('card_id', cardId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

export const getOwnershipRequestsForOwner = async (ownerId) => {
  if (!ownerId) {
    return { data: [], error: null }
  }

  const { data, error } = await supabase
    .from('card_ownership_requests')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

export const getMyCards = async (userId) => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data ? data.map(mapCardRecord) : [], error }
}

export const createCard = async (payload) => {
  const { data, error } = await supabase
    .from('cards')
    .insert(payload)
    .select()
    .single()
  return { data: data ? mapCardRecord(data) : null, error }
}

export const getCardById = async (id) => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', id)
    .single()
  return { data: data ? mapCardRecord(data) : null, error }
}

export const updateCard = async (id, payload) => {
  const { data, error } = await supabase
    .from('cards')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  return { data: data ? mapCardRecord(data) : null, error }
}

export const deleteCard = async (id) => {
  const { data, error } = await supabase
    .from('cards')
    .delete()
    .eq('id', id)
  return { data, error }
}

export const createCardStory = async (payload) => {
  const { data, error } = await supabase
    .from('card_stories')
    .insert(payload)
    .select()
    .single()
  return { data, error }
}

export const getCardStories = async (cardId) => {
  const { data, error } = await supabase
    .from('card_stories')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: false })
  return { data: data ? data.map(mapStoryRecord) : [], error }
}

export const recordScan = async (payload) => {
  const { data, error } = await supabase
    .from('scans')
    .insert(payload)
    .select()
    .single()
  return { data, error }
}

export const getCardValues = async (cardId) => {
  const { data, error } = await supabase
    .from('card_values')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: false })
  return { data: data ? data.map(mapValueRecord) : [], error }
}

export const createCardValue = async (payload) => {
  const { data, error } = await supabase
    .from('card_values')
    .insert(payload)
    .select()
    .single()
  return { data: data ? mapValueRecord(data) : null, error }
}

export const getLatestCardValue = async (cardId) => {
  const { data, error } = await supabase
    .from('card_values')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return { data: data ? mapValueRecord(data) : null, error }
}

export const upsertCardQrCode = async (cardId, qrCode) => {
  const { data, error } = await supabase
    .from('cards')
    .update({ qr_code: qrCode })
    .eq('id', cardId)
    .select()
    .single()
  return { data, error }
}