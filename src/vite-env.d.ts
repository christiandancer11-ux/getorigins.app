/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_STRIPE_FUNCTIONS_URL?: string
  readonly VITE_DISCORD_FUNCTIONS_URL?: string
  readonly VITE_SUPABASE_FUNCTIONS_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
