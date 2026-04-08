import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CATEGORY_MAP = {
  football:    { sport: 'football',  label: 'Football' },
  baseball:    { sport: 'baseball',  label: 'Baseball' },
  basketball:  { sport: 'basketball', label: 'Basketball' },
  soccer:      { sport: 'soccer',    label: 'Soccer' },
  hockey:      { sport: 'hockey',    label: 'Hockey' },
  golf:        { sport: 'golf',      label: 'Golf' },
  ufc:         { sport: 'ufc',       label: 'UFC' },
  wwe:         { sport: 'wwe',       label: 'WWE' },
  f1:          { sport: 'f1',        label: 'F1' },
  pokemon:     { sport: 'pokemon',   label: 'Pokémon' },
  one_piece:   { sport: 'one_piece', label: 'One Piece' },
  mtg:         { sport: 'magic_the_gathering', label: 'Magic: The Gathering' },
  yugioh:      { sport: 'yugioh',   label: 'Yu-Gi-Oh!' },
};

// In-memory cache: key -> { data, expires }
const boxCache = new Map();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours (extended for performance)

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Check subscription
    if (user.role !== 'admin') {
      const subs = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
      const activeSub = subs.find(s => s.status === 'active');
      if (!activeSub || !['pro', 'expert'].includes(activeSub.plan)) {
        return Response.json({ error: 'Pro subscription required for box prices' }, { status: 403 });
      }
    }

    const { category } = await req.json();
    if (!CATEGORY_MAP[category]) {
      return Response.json({ error: 'Invalid category' }, { status: 400 });
    }

    const { label } = CATEGORY_MAP[category];

    // Check cache first
    const cacheKey = `boxprices__${category}`;
    const cached = boxCache.get(cacheKey);
    if (cached && Date.now() < cached.expires) {
      console.log('Box price cache hit:', cacheKey);
      return Response.json(cached.data);
    }

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Build URL-encoded product name helper instruction
    const isTCG = ['pokemon', 'magic_the_gathering', 'yugioh', 'one_piece'].includes(CATEGORY_MAP[category].sport);
    const tcgPlayerGame = { pokemon: 'pokemon', magic_the_gathering: 'magic', yugioh: 'yugioh', one_piece: 'one-piece-card-game' }[CATEGORY_MAP[category].sport] || '';

    const prompt = `You are a trading card hobby market expert with access to live retailer websites. Today is ${todayStr}.

Find the top 8 most notable NEW or RECENTLY RELEASED sealed card box products for the "${label}" category. Focus on products released in the last 6 months or upcoming within 60 days.

Browse these retailer websites and find DIRECT product page URLs for each item:
${isTCG ? '- TCGPlayer (tcgplayer.com)\n' : ''}- Dave & Adam's Card World (dacardworld.com)
- Blowout Cards (blowoutcards.com)
- Steel City Collectibles (steelcitycollectibles.com)
- eBay (ebay.com — find the specific sealed listing)
- Amazon (amazon.com — specific ASIN product page)
- Target (target.com — specific product page)
- Walmart (walmart.com — specific product page)

IMPORTANT URL RULES:
- Use real, direct product page URLs you find on those sites (e.g. https://www.dacardworld.com/sports-cards/2025-topps-series-1-baseball-hobby-box)
- For eBay, link to a specific Buy It Now sealed listing (e.g. https://www.ebay.com/itm/...)
- For Amazon, link to the specific ASIN page (e.g. https://www.amazon.com/dp/ASIN)
- If you cannot find a direct product page for a seller, omit that seller entirely — do NOT fabricate URLs
- Only include sellers that actually have the item in stock at the price you list

Return JSON (keep all strings concise to avoid parse errors):
{
  "products": [
    {
      "product_name": "string",
      "set_name": "string",
      "product_type": "hobby_box|blaster_box|jumbo_box|booster_box|elite_box|set_box|tin|bundle|other",
      "release_date": "YYYY-MM-DD or Available Now",
      "is_upcoming": false,
      "msrp": 99.99,
      "cheapest_price": 79.99,
      "cheapest_seller": "string",
      "cheapest_seller_url": "string",
      "cheapest_free_shipping": true,
      "sellers": [
        { "name": "string", "price": 79.99, "free_shipping": true, "url": "string" }
      ],
      "cards_per_box": "string",
      "notable_hits": "string",
      "market_note": "string"
    }
  ],
  "generated_at": "${now.toISOString()}"
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          products: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_name: { type: 'string' },
                set_name: { type: 'string' },
                product_type: { type: 'string' },
                release_date: { type: 'string' },
                is_upcoming: { type: 'boolean' },
                msrp: { type: 'number' },
                cheapest_price: { type: 'number' },
                cheapest_seller: { type: 'string' },
                cheapest_seller_url: { type: 'string' },
                cheapest_free_shipping: { type: 'boolean' },
                sellers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      price: { type: 'number' },
                      free_shipping: { type: 'boolean' },
                      url: { type: 'string' },
                    }
                  }
                },
                cards_per_box: { type: 'string' },
                notable_hits: { type: 'string' },
                market_note: { type: 'string' },
              }
            }
          },
          generated_at: { type: 'string' },
        }
      }
    });

    const responseData = {
      category,
      label,
      products: result.products || [],
      generated_at: result.generated_at || now.toISOString(),
    };

    // Cache for 1 hour
    boxCache.set(cacheKey, { data: responseData, expires: Date.now() + CACHE_TTL_MS });
    console.log(`Box prices fetched for ${category}: ${responseData.products.length} products`);

    return Response.json(responseData);
  } catch (error) {
    console.error('fetchBoxPrices error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});