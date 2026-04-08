# Origins — Automations Reference

> Last updated: 2026-04-08  
> All times are UTC (cron expressions). Timezone: America/Chicago (UTC-5/6)

---

## ✅ System Health Check
- **Function:** `systemHealthCheck`
- **Schedule:** Every hour at :30 → `30 * * * *`
- **Status:** 🟢 Active
- **What it does:** Checks trending cache freshness (16 categories), market picks age, price alert staleness, card knowledge records, and active subscriptions. Emails `christiandancer11@gmail.com` if anything is broken.

---

## ✅ Daily Card Knowledge Sync
- **Function:** `syncCardKnowledge`
- **Schedule:** Daily at 2am CT → `0 8 * * *` (UTC)
- **Status:** 🟢 Active
- **What it does:** Fetches latest card set releases and trending card knowledge from PSA, TCGPlayer, and community sources. Seeds the `CardKnowledge` database.

---

## 🔄 Pre-Cache Trending Automations

These 16 automations each warm the trending cache for a single card category every hour. Staggered across the hour to avoid LLM overload. A 50-second timeout guard prevents hard failures.

| Name | Group | Category | Cron (UTC) | Status |
|------|-------|----------|------------|--------|
| Pre-Cache Trending - Football (A) | A | football | `0 * * * *` | 🟢 Active |
| Pre-Cache Trending - Baseball (B) | B | baseball | `4 * * * *` | 🟢 Active |
| Pre-Cache Trending - Basketball (C) | C | basketball | `8 * * * *` | 🟢 Active |
| Pre-Cache Trending - Soccer (D) | D | soccer | `12 * * * *` | 🟢 Active |
| Pre-Cache Trending - Hockey (E) | E | hockey | `16 * * * *` | 🟢 Active |
| Pre-Cache Trending - Golf (F) | F | golf | `20 * * * *` | 🟢 Active |
| Pre-Cache Trending - UFC (G) | G | ufc | `24 * * * *` | 🟢 Active |
| Pre-Cache Trending - WWE (H) | H | wwe | `28 * * * *` | 🟢 Active |
| Pre-Cache Trending - F1 (I) | I | f1 | `32 * * * *` | 🟢 Active |
| Pre-Cache Trending - NCAA Football (J) | J | ncaa_football | `36 * * * *` | 🟢 Active |
| Pre-Cache Trending - NCAA Basketball (K) | K | ncaa_basketball | `40 * * * *` | 🟢 Active |
| Pre-Cache Trending - NCAA Baseball (L) | L | ncaa_baseball | `44 * * * *` | 🟢 Active |
| Pre-Cache Trending - Pokemon (M) | M | pokemon | `48 * * * *` | 🟢 Active |
| Pre-Cache Trending - One Piece (N) | N | one_piece | `52 * * * *` | 🟢 Active |
| Pre-Cache Trending - MTG (O) | O | mtg | `56 * * * *` | 🟢 Active |
| Pre-Cache Trending - Yu-Gi-Oh (P) | P | yugioh | `58 * * * *` | 🟢 Active |

---

## 🛡️ Resilience Changes (2026-04-08)

- **`preCacheTrending`** — Added a 50-second LLM timeout per category. If the LLM is slow, the function returns a partial success (200 OK) instead of timing out and counting as a failure. This prevents the 5-consecutive-failure auto-disable.
- **Football (A) & Baseball (B)** — Recreated fresh (old ones had missing IDs).
- **All other 14 groups** — Re-enabled after being auto-disabled.
- **Daily Card Knowledge Sync** — New automation seeding the `CardKnowledge` entity every morning at 2am CT.

---

## 📋 Function Reference

| Function | Purpose | Scheduled? |
|----------|---------|------------|
| `systemHealthCheck` | Hourly health check + email alert | ✅ Every hour at :30 |
| `preCacheTrending` | Pre-warms trending card data per category (groups A–P) | ✅ 16 automations, staggered hourly |
| `syncCardKnowledge` | Syncs card knowledge from external sources | ✅ Daily at 2am CT |
| `fetchTrending` | Serves trending data to the frontend (reads from cache) | User-triggered |
| `updateMarketPicks` | Updates buy/hold/sell market picks | Manual/admin |
| `checkPriceAlerts` | Checks active user price alerts and sends notifications | Manual/admin |
| `fetchCardComps` | Fetches comparable sales data for a card | User-triggered |
| `createCheckout` | Creates Stripe checkout session | User-triggered |
| `stripeWebhook` | Handles Stripe webhook events | Stripe webhook |
| `aiCardGrading` | AI-powered card grading from image | User-triggered |
| `analyzeCardImage` | Analyzes a card image for identification | User-triggered |
| `registerCardAI` | AI-assisted card registration | User-triggered |
| `cardSignals` | Fetches market signals for user's collection | User-triggered |
| `bulkDealCalculator` | Calculates bulk deal value | User-triggered |
| `sendBOLOAlerts` | Sends BOLO theft alerts to nearby users | Entity automation |
| `sendFollowNotification` | Notifies users of new followers | Entity automation |
| `moderateAndPostComment` | AI-moderates comments before posting | User-triggered |
| `getFlipOpportunities` | Finds flip opportunities for the card flipper | User-triggered |
| `getGrading10Odds` | Calculates PSA 10 odds for a card | User-triggered |
| `updateCardValue` | Updates estimated card values | User-triggered |
| `updatePopReports` | Updates population report data | User-triggered |
| `generateAdminCode` | Generates promo/admin codes | Admin-triggered |
| `redeemCode` | Redeems a promo code | User-triggered |
| `extractSlabCerts` | Extracts cert numbers from slab images | User-triggered |
| `fetchBoxPrices` | Fetches wax box prices | User-triggered |
| `analyzeTrendingCard` | Deep-dives a single trending card | User-triggered |
| `getUserReferralCode` | Gets or creates a user's referral code | User-triggered |
| `sendOwnershipNotification` | Notifies card owner of transfer requests | Entity automation |
| `reviewOutOfRangeTrade` | AI reviews suspicious trade values | Entity automation |
| `checkUsageLimit` | Checks if user has hit usage limits | User-triggered |
| `loadTestSimulation` | Load test simulator (dev only) | Dev only |