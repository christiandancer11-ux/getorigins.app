export const mapCardRecord = (supabaseCard) => {
  if (!supabaseCard) return null;
  return {
    id: supabaseCard.id,
    name: supabaseCard.title || supabaseCard.player_name, // Assuming title is name
    player_name: supabaseCard.player_name,
    year: supabaseCard.year,
    brand: supabaseCard.brand,
    set_name: supabaseCard.set_name || '',
    sport: supabaseCard.sport || 'baseball',
    grading_company: supabaseCard.grading_company || '',
    grade: supabaseCard.grade || '',
    estimated_value: supabaseCard.estimated_value || 0,
    status: supabaseCard.status || 'owned',
    description: supabaseCard.description || '',
    image_url: supabaseCard.image_url || '',
    card_number: supabaseCard.card_number || '',
    user_id: supabaseCard.user_id || null,
    created_by: supabaseCard.created_by || null,
    unique_code: supabaseCard.unique_code || null,
    qr_code: supabaseCard.qr_code || '',
    created_date: supabaseCard.created_at,
    created_at: supabaseCard.created_at,
  };
};