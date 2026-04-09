export const mapCardRecord = (supabaseCard) => {
  if (!supabaseCard) return null;
  return {
    id: supabaseCard.id,
    name: supabaseCard.title || supabaseCard.player_name, // Assuming title is name
    player_name: supabaseCard.player_name,
    year: supabaseCard.year,
    brand: supabaseCard.brand,
    // Add safe defaults for missing fields
    set_name: supabaseCard.set_name || '',
    sport: supabaseCard.sport || 'baseball', // default
    grading_company: supabaseCard.grading_company || '',
    grade: supabaseCard.grade || '',
    estimated_value: supabaseCard.estimated_value || 0,
    status: supabaseCard.status || 'owned',
    created_date: supabaseCard.created_at,
    qr_code: supabaseCard.qr_code || '',
    // Map other fields as needed
  };
};