import { supabase } from '@/lib/supabaseClient'
import { mapCardRecord } from '@/lib/mapCardRecord'
import { mapStoryRecord } from '@/lib/mapStoryRecord'
import { mapValueRecord } from '@/lib/mapValueRecord'

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