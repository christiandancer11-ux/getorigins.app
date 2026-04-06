import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CATEGORY_MAP = {
  football:    { sport: 'football',  label: 'Football' },
  baseball:    { sport: 'baseball',  label: 'Baseball' },
  basketball:  { sport: 'basketball', label: 'Basketball' },
  soccer:      { sport: 'soccer',    label: 'Soccer' },
  hockey:      { sport: 'hockey',    label: 'Hockey' },
  f1:          { sport: 'f1',        label: 'F1' },
  pokemon:     { sport: 'pokemon',   label: 'Pokémon' },
  one_piece:   { sport: 'one_piece', label: 'One Piece' },
  mtg:         { sport: 'magic_the_gathering', label: 'Magic: The Gathering' },
  yugioh:      { sport: 'yugioh',   label: 'Yu-Gi-Oh!' },
};

// In-memory cache: key -> { data, expires }
const boxCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const subs = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
    const isAdmin = user.role === 'admin';
    const activeSub = subs.find(s => s.status === 'active');
    if (!isAdmin && (!activeSub || !['pro', 'expert'].includes(activeSub.plan))) {
      return Response.json({ error: 'Pro subscription required' }, { status: 403 });
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

    const prompt = `You are a trading card hobby market expert. Today is ${todayStr}.

Find the top 8 most notable NEW or RECENTLY RELEASED card box products for the "${label}" category that collectors are buying right now. Focus on products released in the last 6 months or highly anticipated upcoming releases within the next 60 days.

For each product, search these specific retailer websites and return real current prices:
- TCGPlayer.com (for TCG products like Pokémon, MTG, Yu-Gi-Oh!, One Piece)
- Dave & Adam's Card World (dacardworld.com)
- Steel City Collectibles (steelcitycollectibles.com)
- Blowout Cards (blowoutcards.com)
- eBay (new/sealed listings)
- Amazon (new/sealed listings)
- Target.com
- Walmart.com
- Shop.tcgplayer.com
- Miniature Market (miniaturemarket.com, for TCG)
- CardboardConnection.com
- Breakaway Cards
- Collector's Cache
- Hobby Haven / local hobby shops (generic)

PRICING RULES:
1. MSRP = the manufacturer's suggested retail price. This is the "official" price the manufacturer publishes. Always include it.
2. For each seller, only report CURRENT IN-STOCK prices for NEW/SEALED products. Do NOT include out-of-stock, pre-order (unless explicitly a pre-order product), or sold listings.
3. If a product is sold out somewhere, skip that seller for that product.
4. Report prices in USD.
5. Find at minimum 3 and ideally 5+ sellers per product showing their current price.
6. The "cheapest_price" and "cheapest_seller" fields must be the verified lowest current in-stock price you found across all sellers.
7. Note if a seller offers free shipping (this affects true total cost).

Return a JSON object:
{
  "products": [
    {
      "product_name": "Full official product name (e.g. 2025 Topps Series 1 Baseball Hobby Box)",
      "set_name": "Short set/series name",
      "product_type": "hobby_box | blaster_box | jumbo_box | booster_box | elite_box | set_box | tin | bundle | other",
      "release_date": "YYYY-MM-DD or 'Available Now'",
      "is_upcoming": false,
      "msrp": 99.99,
      "cheapest_price": 79.99,
      "cheapest_seller": "Name of cheapest seller",
      "cheapest_seller_url": "Direct URL to product if known",
      "cheapest_free_shipping": true,
      "sellers": [
        { "name": "Seller Name", "price": 79.99, "free_shipping": true, "url": "https://..." },
        { "name": "Seller Name 2", "price": 84.99, "free_shipping": false, "url": "https://..." }
      ],
      "cards_per_box": "24 packs / 10 cards per pack",
      "notable_hits": "What big hits can be found (e.g. autographs, relics, 1/1s)",
      "market_note": "1 sentence on demand/collectibility right now"
    }
  ],
  "generated_at": "${now.toISOString()}"
}

Focus on products with real collector demand. Mix of price tiers (hobby, blaster, etc.) is fine. Prioritize products that are actively selling well.`;

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