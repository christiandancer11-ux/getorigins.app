export const mapValueRecord = (supabaseValue) => {
  if (!supabaseValue) return null;
  return {
    id: supabaseValue.id,
    card_id: supabaseValue.card_id,
    estimated_value: supabaseValue.value,
    source: supabaseValue.source,
    source_summary: supabaseValue.source || 'Market data',
    created_at: supabaseValue.created_at,
    // Add other fields as needed
  };
};