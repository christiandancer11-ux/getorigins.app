import { supabase } from '@/lib/supabaseClient'

export const healthCheck = async () => {
  const results = {
    supabaseClient: false,
    session: null,
    databaseRead: null,
    timestamp: new Date().toISOString()
  }

  try {
    // Check if Supabase client exists
    if (supabase) {
      results.supabaseClient = true
    }

    // Check session status
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (!sessionError) {
      results.session = {
        exists: !!sessionData.session,
        user: sessionData.session?.user?.email || null
      }
    }

    // Optional lightweight read test (safe table)
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('id')
        .limit(1)
        .maybeSingle()

      results.databaseRead = {
        success: !error,
        error: error?.message || null
      }
    } catch (dbError) {
      results.databaseRead = {
        success: false,
        error: dbError.message
      }
    }

  } catch (error) {
    results.error = error.message
  }

  return results
}