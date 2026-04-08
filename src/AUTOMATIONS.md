# Origins — Automations Reference

> Last updated: 2026-04-08  
> All times are UTC (cron expressions). Timezone: America/Chicago (UTC-5/6)

---

## ✅ System Health Check
- **Type:** Scheduled (Cron)
- **Function:** `systemHealthCheck`
- **Schedule:** Every hour at :30 → `30 * * * *`
- **Status:** 🟢 Active
- **What it does:** Checks trending cache freshness (16 categories), market picks age, price alert staleness, card knowledge records, and active subscriptions. Emails admin if anything is broken.

---

## 🔄 Pre-Cache Trending Automations

These 16 automations each warm the trending cache for a single card category every hour. They run staggered across the hour to avoid overloading the LLM.

| Name | Group | Category | Cron | Status | Last Run Status | Success/Total |
|------|-------|----------|------|--------|-----------------|---------------|
| Pre-Cache Trending - Football (A) | A | football | `0 * * * *` | ⚪ Inactive | — | — |
| Pre-Cache Trending - Baseball (B) | B | baseball | `4 * * * *` | ⚪ Inactive | — | — |
| Pre-Cache Trending - Basketball (C) | C | basketball | `8 * * * *` | ⚪ Inactive | — | — |
| Pre-Cache Trending - Soccer (D) | D | soccer | `12 * * * *` | ⚪ Inactive | — | — |
| Pre-Cache Trending - Hockey (E) | E | hockey | `16 * * * *` | ⚪ Inactive | — | — |
| Pre-Cache Trending - Golf (F) | F | golf | `20 * * * *` | ⚪ Inactive | — | — |
| Pre-Cache Trending - UFC (G) | G | ufc | `24 * * * *` | ⚪ Inactive | — | — |
| Pre-Cache Trending - WWE (H) | H | wwe | `28 * * * *` | ⚪ Inactive | — | — |
| Pre-Cache Trending - F1 (I) | I | f1 | `32 * * * *` | ⚪ Inactive | failed | 2/9 |
| Pre-Cache Trending - NCAA Football (J) | J | ncaa_football | `36 * * * *` | ⚪ Inactive | failed | 0/5 |
| Pre-Cache Trending - NCAA Basketball (K) | K | ncaa_basketball | `40 * * * *` | ⚪ Inactive | failed | 1/8 |
| Pre-Cache Trending - NCAA Baseball (L) | L | ncaa_baseball | `44 * * * *` | ⚪ Inactive | failed | 0/5 |
| Pre-Cache Trending - Pokemon (M) | M | pokemon | `48 * * * *` | ⚪ Inactive | failed | 1/6 |
| Pre-Cache Trending - One Piece (N) | N | one_piece | `52 * * * *` | ⚪ Inactive | failed | 3/9 |
| Pre-Cache Trending - MTG (O) | O | mtg | `56 * * * *` | ⚪ Inactive | failed | 1/8 |
| Pre-Cache Trending - Yu-Gi-Oh (P) | P | yugioh | `58 * * * *` | ⚪ Inactive | failed | 1/7 |

> ⚠️ **Note:** All 16 Pre-Cache Trending automations are currently **inactive** due to consecutive failures (5+). They need to be re-enabled and the `preCacheTrending` function may need debugging.

---

## 📋 Notes

### Function Reference
| Function | Purpose |
|----------|---------|
| `systemHealthCheck` | Hourly health check + email alert |
| `preCacheTrending` | Pre-warms trending card data per category (groups A–P) |
| `fetchTrending` | Serves trending data to the frontend (reads from cache) |
| `syncCardKnowledge` | Syncs card knowledge from external sources (admin-only) |
| `updateMarketPicks` | Updates buy/hold/sell market picks |
| `checkPriceAlerts` | Checks active user price alerts and sends notifications |
| `fetchCardComps` | Fetches comparable sales data for a card |
| `createCheckout` | Creates Stripe checkout session |
| `stripeWebhook` | Handles Stripe webhook events |
| `aiCardGrading` | AI-powered card grading from image |
| `analyzeCardImage` | Analyzes a card image for identification |
| `registerCardAI` | AI-assisted card registration |
| `cardSignals` | Fetches market signals for user's collection |
| `bulkDealCalculator` | Calculates bulk deal value |
| `sendBOLOAlerts` | Sends BOLO theft alerts to nearby users |
| `sendFollowNotification` | Notifies users of new followers |
| `moderateAndPostComment` | AI-moderates comments before posting |
| `getFlipOpportunities` | Finds flip opportunities for the card flipper |
| `getGrading10Odds` | Calculates PSA 10 odds for a card |
| `updateCardValue` | Updates estimated card values |
| `updatePopReports` | Updates population report data |
| `generateAdminCode` | Generates promo/admin codes |
| `redeemCode` | Redeems a promo code |
| `extractSlabCerts` | Extracts cert numbers from slab images |
| `fetchBoxPrices` | Fetches wax box prices |
| `analyzeTrendingCard` | Deep-dives a single trending card |
| `getUserReferralCode` | Gets or creates a user's referral code |
| `sendOwnershipNotification` | Notifies card owner of transfer requests |
| `reviewOutOfRangeTrade` | AI reviews suspicious trade values |
| `checkUsageLimit` | Checks if user has hit usage limits |
| `loadTestSimulation` | Load test simulator (dev only) |

---

## ⚠️ Action Items
1. **Re-enable Pre-Cache Trending automations** — all 16 are currently inactive after hitting 5 consecutive failures. Investigate `preCacheTrending` function logs.
2. **Populate Card Knowledge** — `CardKnowledge` entity is empty; run `syncCardKnowledge` as admin to seed it.
3. **Update admin email** in `systemHealthCheck` function (currently set to `admin@originscard.com`).