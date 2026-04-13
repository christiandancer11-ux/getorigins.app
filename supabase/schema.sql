-- Supabase table definitions for the new product-ready migration

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'expert')),
  current_period_end timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own subscription" ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription" ON user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" ON user_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscription" ON user_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

CREATE TABLE IF NOT EXISTS discord_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  server_name text NOT NULL,
  webhook_url text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_posted timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE discord_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select their own Discord webhooks" ON discord_webhooks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Discord webhooks" ON discord_webhooks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Discord webhooks" ON discord_webhooks
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Discord webhooks" ON discord_webhooks
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_discord_webhooks_user_id ON discord_webhooks(user_id);

CREATE TABLE IF NOT EXISTS card_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  card_id uuid,
  player_name text,
  title text,
  brand text,
  year text,
  price numeric(12,2),
  platform text,
  sport text,
  notes text,
  is_verified boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_card_trades_user_id ON card_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_card_trades_created_at ON card_trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_card_trades_sport ON card_trades(sport);

ALTER TABLE card_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own trades" ON card_trades
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own trades or public verified trades" ON card_trades
  FOR SELECT
  USING (auth.uid() = user_id OR is_verified = true);

CREATE POLICY "Users can update their own trades" ON card_trades
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trades" ON card_trades
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS card_ownership_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL,
  requester_id uuid,
  owner_id uuid,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_card_ownership_requests_card_id ON card_ownership_requests(card_id);
CREATE INDEX IF NOT EXISTS idx_card_ownership_requests_owner_id ON card_ownership_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_card_ownership_requests_requester_id ON card_ownership_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_card_ownership_requests_status ON card_ownership_requests(status);

ALTER TABLE card_ownership_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow owner or requester to select ownership requests" ON card_ownership_requests
  FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = requester_id);

CREATE POLICY "Allow requesters to insert ownership requests" ON card_ownership_requests
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Allow owner or requester to update ownership requests" ON card_ownership_requests
  FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() = requester_id)
  WITH CHECK (auth.uid() = owner_id OR auth.uid() = requester_id);

CREATE TABLE IF NOT EXISTS scan_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL,
  scanner_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scan_events_card_id ON scan_events(card_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_scanner_id ON scan_events(scanner_id);
CREATE INDEX IF NOT EXISTS idx_scan_events_created_at ON scan_events(created_at DESC);

ALTER TABLE scan_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert scan events with matching scanner or anonymous" ON scan_events
  FOR INSERT
  WITH CHECK (
    scanner_id IS NULL
    OR auth.uid() = scanner_id
  );

CREATE POLICY "Allow select scan events" ON scan_events
  FOR SELECT
  USING (true);
