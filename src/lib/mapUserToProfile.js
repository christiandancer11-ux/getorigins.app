export const mapUserToProfile = (supabaseUser) => {
  if (!supabaseUser) return null;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    // Add other fields as needed, with defaults
    name: supabaseUser.user_metadata?.name || supabaseUser.email,
    avatar_url: supabaseUser.user_metadata?.avatar_url || null,
    // Map any other Base44-specific fields here
  };
};