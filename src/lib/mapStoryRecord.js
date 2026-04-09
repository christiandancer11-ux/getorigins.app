export const mapStoryRecord = (supabaseStory) => {
  if (!supabaseStory) return null;
  return {
    id: supabaseStory.id,
    card_id: supabaseStory.card_id,
    owner_name: supabaseStory.owner_name,
    message: supabaseStory.message,
    video_url: supabaseStory.video_url || null,
    created_date: supabaseStory.created_at,
    // Add other fields as needed
  };
};