# Deployment Checklist

## Required Environment Variables

### Supabase Configuration
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### Optional (for future features)
```
# Stripe (currently stubbed)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Base44 (legacy - remove after full migration)
BASE44_API_KEY=...
```

## Supabase Project Setup

### Required Buckets
- `card-images` - For card photo uploads
  - Public access: ✅ Enabled
  - File size limit: 10MB
  - Allowed MIME types: `image/*`

### Required Database Tables

#### `cards`
```sql
CREATE TABLE cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  player_name TEXT,
  year INTEGER,
  brand TEXT,
  sport TEXT DEFAULT 'baseball',
  grading_company TEXT,
  grade TEXT,
  price_paid DECIMAL(10,2),
  estimated_value DECIMAL(10,2),
  image_url TEXT,
  qr_code TEXT,
  unique_code TEXT UNIQUE,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `card_stories`
```sql
CREATE TABLE card_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  message TEXT NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `card_values` (Optional - for future market tracking)
```sql
CREATE TABLE card_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  value DECIMAL(10,2) NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Required Indexes
```sql
CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_unique_code ON cards(unique_code);
CREATE INDEX idx_card_stories_card_id ON card_stories(card_id);
CREATE INDEX idx_card_values_card_id ON card_values(card_id);
```

### Row Level Security (RLS) Policies

#### Cards Table
```sql
-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Users can view their own cards
CREATE POLICY "Users can view own cards" ON cards
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own cards
CREATE POLICY "Users can insert own cards" ON cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own cards
CREATE POLICY "Users can update own cards" ON cards
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own cards
CREATE POLICY "Users can delete own cards" ON cards
  FOR DELETE USING (auth.uid() = user_id);
```

#### Card Stories Table
```sql
-- Enable RLS
ALTER TABLE card_stories ENABLE ROW LEVEL SECURITY;

-- Anyone can view stories (public sharing)
CREATE POLICY "Anyone can view card stories" ON card_stories
  FOR SELECT USING (true);

-- Users can insert stories on their own cards
CREATE POLICY "Users can insert stories on own cards" ON card_stories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards
      WHERE cards.id = card_stories.card_id
      AND cards.user_id = auth.uid()
    )
  );
```

## Current Limitations (Expected)

### Payment Features
- ✅ **Pricing page shows placeholder message**
- ✅ **Upgrade modal shows alert**
- ✅ **Code redemption shows alert**
- ✅ **All users get free access**

### AI Features
- ✅ **Manual card registration (no AI photo recognition)**
- ✅ **Text-only stories (no video upload)**
- ✅ **Basic QR codes (no advanced sharing)**

### Market Features
- ✅ **Value refresh shows placeholder**
- ✅ **Signals return empty**
- ✅ **Portfolio shows basic stats**

## Post-Deployment Verification

1. **Environment Variables**: Confirm Supabase vars are set
2. **Database**: Verify tables and RLS policies exist
3. **Storage**: Confirm `card-images` bucket is public
4. **Auth**: Test sign up/sign in flow
5. **Core Flow**: Create card → Add story → Share → Delete
6. **Placeholders**: Verify stubbed features show appropriate messages

## Rollback Plan

If issues arise:
1. All Base44 dependencies are isolated/stubbed
2. Can rollback to previous Base44-only version
3. Supabase data remains intact for future migration
4. User accounts persist via Supabase Auth