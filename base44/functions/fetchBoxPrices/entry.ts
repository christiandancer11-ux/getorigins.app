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

    const prompt = `You are a trading card hobby market expert. Today is ${todayStr}.

Find the top 8 most notable NEW or RECENTLY RELEASED card box products for the "${label}" category that collectors are buying right now. Focus on products released in the last 6 months or highly anticipated upcoming releases within the next 60 days.

For each product, search these specific retailer websites and return real current prices:
- TCGPlayer.com (for TCG: Pokémon, MTG, Yu-Gi-Oh!, One Piece)
- Dave & Adam's Card World (dacardworld.com)
- Steel City Collectibles (steelcitycollectibles.com)
- Blowout Cards (blowoutcards.com)
- eBay (new/sealed listings — use eBay search)
- Amazon (new/sealed listings)
- Target.com
- Walmart.com
- Miniature Market (miniaturemarket.com, for TCG)

PRICING RULES:
1. MSRP = the manufacturer's suggested retail price. Always include it.
2. Only report CURRENT IN-STOCK prices for NEW/SEALED products. Skip out-of-stock sellers.
3. Report prices in USD. Find at minimum 3 sellers per product.
4. The "cheapest_price" and "cheapest_seller" fields must be the verified lowest current in-stock price.
5. Note if a seller offers free shipping.

=== URL RULES — CRITICAL ===
You CANNOT reliably verify direct product page URLs, so use SEARCH URLs that are GUARANTEED to work and show the product at the listed price. Use these exact URL formats:

For eBay (REQUIRED for every product — always works):
  Use: https://www.ebay.com/sch/i.html?_nkw=PRODUCT+NAME+ENCODED&LH_BIN=1&LH_ItemCondition=1000&_sop=15
  Replace spaces in the product name with + signs. LH_BIN=1 = Buy It Now only, LH_ItemCondition=1000 = New, _sop=15 = lowest price first.
  Example for "2025 Topps Series 1 Baseball Hobby Box":
  https://www.ebay.com/sch/i.html?_nkw=2025+Topps+Series+1+Baseball+Hobby+Box&LH_BIN=1&LH_ItemCondition=1000&_sop=15

For TCGPlayer (TCG products only):
  Use: https://www.tcgplayer.com/search/all/product?q=PRODUCT+NAME+ENCODED&productLineName=GAME
  Replace spaces with +. productLineName options: pokemon, magic, yugioh, one-piece-card-game
  Example: https://www.tcgplayer.com/search/all/product?q=Surging+Sparks+Booster+Box&productLineName=pokemon

For Dave & Adam's:
  Use: https://www.dacardworld.com/catalogsearch/result/?q=PRODUCT+NAME+ENCODED
  Example: https://www.dacardworld.com/catalogsearch/result/?q=2025+Topps+Series+1+Hobby+Box

For Blowout Cards:
  Use: https://www.blowoutcards.com/catalogsearch/result/?q=PRODUCT+NAME+ENCODED

For Steel City Collectibles:
  Use: https://www.steelcitycollectibles.com/catalogsearch/result/?q=PRODUCT+NAME+ENCODED

For Amazon:
  Use: https://www.amazon.com/s?k=PRODUCT+NAME+ENCODED&rh=n%3A166704011%2Cp_n_condition-type%3A1294777011
  (This filters to new condition Toys & Games / Trading Cards category)

For Target:
  Use: https://www.target.com/s?searchTerm=PRODUCT+NAME+ENCODED

For Walmart:
  Use: https://www.walmart.com/search?q=PRODUCT+NAME+ENCODED

RULES FOR URL GENERATION:
- ALWAYS URL-encode the product name (replace spaces with +, remove special characters like ™ © ® / \\ etc.)
- Use these search URL templates ONLY — do NOT invent or guess direct product page URLs.
- Every seller entry MUST have a url using the search template above.
- The cheapest_seller_url MUST also use the search template for that seller.
- If a seller is not in the list above (e.g. a local shop), set url to null.

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
      "cheapest_seller_url": "Search URL using template above",
      "cheapest_free_shipping": true,
      "sellers": [
        { "name": "Seller Name", "price": 79.99, "free_shipping": true, "url": "Search URL using template above" },
        { "name": "eBay", "price": 84.99, "free_shipping": false, "url": "https://www.ebay.com/sch/i.html?_nkw=..." }
      ],
      "cards_per_box": "24 packs / 10 cards per pack",
      "notable_hits": "What big hits can be found (e.g. autographs, relics, 1/1s)",
      "market_note": "1 sentence on demand/collectibility right now"
    }
  ],
  "generated_at": "${now.toISOString()}"
}

Focus on products with real collector demand. Mix of price tiers (hobby, blaster, etc.) is fine. Prioritize actively selling products.`;

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