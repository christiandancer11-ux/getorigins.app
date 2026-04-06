import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// In-memory rate limit store: key -> { count, windowStart }
const rateLimitStore = new Map();
function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (entry.count >= maxRequests) {
    const retryAfterSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSec };
  }
  entry.count += 1;
  return { allowed: true };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit: 10 searches per user per 10 minutes
    const rl = checkRateLimit(`fetchCardComps:${user.email}`, 10, 10 * 60 * 1000);
    if (!rl.allowed) {
      return Response.json({ error: `Too many requests. Please wait ${rl.retryAfterSec} seconds before searching again.` }, { status: 429 });
    }

    const { card_name, set_name, year, card_number, condition, sport } = await req.json();
    if (!card_name) return Response.json({ error: 'card_name is required' }, { status: 400 });

    // Input length validation
    if (card_name.length > 200) return Response.json({ error: 'Search query is too long.' }, { status: 400 });
    if (set_name && set_name.length > 200) return Response.json({ error: 'Set name is too long.' }, { status: 400 });
    if (year && (year.length > 4 || !/^\d{4}$/.test(year))) return Response.json({ error: 'Invalid year.' }, { status: 400 });

    const condLabel = condition && condition !== 'raw' ? condition.toUpperCase().replace(/_/g, ' ') : '';
    const query = [year, set_name, card_name, card_number, condLabel].filter(Boolean).join(' ').trim();

    // Pull Origins card show trades for this card name
    let internalTrades = [];
    try {
      const allTrades = await base44.asServiceRole.entities.CardTrade.list('-created_date', 200);
      const q = card_name.toLowerCase();
      internalTrades = allTrades.filter(t =>
        [t.card_name, t.set_name].filter(Boolean).some(v => v.toLowerCase().includes(q))
      );
    } catch (e) {
      console.warn('Could not fetch internal trades:', e.message);
    }

    const internalTradeContext = internalTrades.length > 0
      ? `\n\nOrigins card show community trades (VERIFIED IN-PERSON SALES — use as ground-truth data):\n` +
        internalTrades.slice(0, 8).map(t =>
          `- ${t.card_name} ${t.set_name || ''} ${t.year || ''}: $${t.total_value || t.cash_paid || 0} (${t.condition || 'raw'})${t.ebay_comp_avg ? `, eBay avg at time: $${t.ebay_comp_avg}` : ''}${t.verified ? ' [VERIFIED FAIR MARKET VALUE]' : ''}`
        ).join('\n')
      : '';

    const isTCG = ['pokemon', 'magic_the_gathering', 'yugioh', 'one_piece', 'lorcana', 'digimon', 'flesh_and_blood'].includes(sport) ||
      /pokemon|charizard|pikachu|eevee|mewtwo|magic|yugioh|yu-gi-oh|mtg|blue-eyes|dark magician|lorcana|one piece|digimon|flesh and blood|dragon ball super|naruto|weiss|cardfight|vanguard/i.test(query);

    const now = new Date();
    const cutoffISO = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const prompt = `You are a sports card & TCG market research assistant. Research recent SOLD prices for:

Card: ${query}
${internalTradeContext}

=== SEARCH QUERY FORMAT (SPORTS CARDS) ===
When searching eBay and 130point.com for sports cards, always format your search query as:
  [Year] [Manufacturer/Brand] [Product Name] [Player Name] [Card Type: RPA/Auto/Patch Auto/Base/Variation] [Serial Number e.g. /25 or SP or variation]
Example: "2022 Panini National Treasures Treylon Burks RPA /25"
- Card Type should be one of: RPA (rookie patch auto), Auto, Patch Auto, Base (no shine/color/numbering), or the specific variation name
- Always include the serial number or print run if known (e.g. /25, /99, /10, /1)
- If it's a short print (SP) or super short print (SSP), include that
- Do NOT include condition (raw/graded) in the search query — filter by condition separately after pulling results

=== CRITICAL: GRADED vs RAW SEPARATION ===
BEFORE calculating any averages, you MUST separate graded and raw sales:
- If the card being researched is RAW (ungraded): EXCLUDE ALL sales of graded copies (PSA, BGS, SGC, CGC, HGA, etc.). Only use raw/ungraded sold listings. Graded copies sell for significantly more and will skew the average.
- If the card being researched is GRADED: ONLY use sales of the same grade and grading company (e.g. PSA 10 only, not PSA 9 or raw). Do not mix grades.
- Never mix raw and graded sales in any average calculation. This is the most common source of inaccurate valuations.

Search ${isTCG ? 'FOUR' : 'THREE'} sources: eBay completed/sold listings, 130point.com confirmed sales, PSA's Price Guide / SMR (Sports Market Report)${isTCG ? ', and TCGPlayer.com verified dealer listed/sold market prices' : ''}.

=== HOW TO SEARCH EBAY CORRECTLY ===
To find all sold listings on eBay, you must use Advanced Search:
1. Go to eBay Advanced Search
2. Type in the card details using the format above
3. Check BOTH "Sold listings" AND "Completed listings" checkboxes
4. Click Search
This returns ALL transactions that ended — sold and unsold. You then filter to only confirmed sold ones.

=== HOW TO IDENTIFY STRIKETHROUGH (OFFER-ACCEPTED) PRICES ON EBAY ===
When a seller accepts a Best Offer on eBay, the final sold price is hidden — eBay shows the original listing price with a strikethrough. These strikethrough prices are NOT the real sale price.
For every eBay listing where the price appears struck through (offer accepted):
- DO NOT use the eBay listing price — it is wrong.
- FIND that same sale on 130point.com, which records the actual accepted offer price.
- Use ONLY the 130point.com price for that sale.
- Remove it from the eBay list and put it in the 130point list.

=== MINIMUM DATA THRESHOLD ===
Count the total number of qualifying confirmed sold listings across eBay and 130point.com combined (after deduplication and graded/raw filtering):
- If the total is FEWER THAN 3 confirmed sales, set insufficient_data: true and explain in market_summary that there is not enough recent sales data to determine a reliable value for this card. Still report whatever sales were found.
- If total sales are between 3 and 9, set low_data: true and note in market_summary that the value estimate is based on limited data and may not reflect the full market.
- If 10 or more confirmed sales are found, set insufficient_data: false and low_data: false.

=== STRICT DATA QUALITY RULES — FOLLOW EXACTLY ===

1. EBAY CONFIRMED SALES ONLY — EXCLUDE ALL OF THE FOLLOWING:
   - Any listing that ended without a buyer (unsold, expired, relisted)
   - Any listing that shows signs of being relisted (same card, same seller, same condition listed multiple times)
   - Any sale where the buyer did not pay (marked as unpaid, relisted, or non-paying buyer dispute)
   - Any cancelled transaction or order
   - "Best Offer" or "Make Offer" listings where NO offer was accepted and the item did NOT reach sold status
   - Buy-It-Now listings that were viewed but never purchased
   Only include eBay sales where the transaction is definitively confirmed SOLD and COMPLETED.

2. STRIKETHROUGH / OFFER-ACCEPTED REPLACEMENT RULE (VERY IMPORTANT):
   - On eBay, when a seller accepts a Best Offer, the sold price shows as a strikethrough — this is NOT the real price.
   - 130point.com records the actual accepted offer price for these same sales.
   - For every eBay sale with a strikethrough price:
     * REMOVE it from the eBay list entirely
     * Find it on 130point.com and use the real accepted price
     * Do NOT double-count it in any averages
   - This is the most common cause of inflated eBay averages.

3. DUPLICATE REMOVAL:
   - If the same physical sale appears on both eBay and 130point.com, count it only ONCE — use the 130point.com price (it's more accurate).
   - Match duplicates by: same approximate date + same card + same approximate price range (within 10%).

4. ABOVE-MARKET OUTLIER RULE:
   - If a sale price is MORE than 100% above the established market average, exclude it from averages unless at least 2 other confirmed sales support that price range.
   - If excluded, note it in market_summary.

5. EBAY 24-HOUR AVERAGE:
   - For ebay_avg_24h, ONLY include eBay sales from the last 24 hours (since ${yesterday}).
   - If fewer than 2 confirmed sales exist in 24 hours, set ebay_avg_24h to null and note it.

6. PSA VALUATION:
   - Look up the PSA Price Guide (psacard.com/smr or psacard.com/price-guide) for this card.
   - Find the PSA grade that most closely matches the card's condition (or the specific grade if it's a graded card).
   - Return the PSA SMR value for that grade as psa_value.
   - Also return psa_grade_used (e.g. "PSA 9", "PSA 10") so the user knows which grade was used.

${isTCG ? `7. TCGPLAYER VERIFIED SALES & MARKET PRICE (TCG cards only — REQUIRED, not optional):
   - Go to TCGPlayer.com (tcgplayer.com) and search for this exact card.
   - TCGPlayer "Market Price" = the weighted average of ACTUAL completed sales by verified sellers over the last 30 days. This is the most reliable TCG price. You MUST return this.
   - TCGPlayer "Low Price" = the lowest current buylist/listing price from a verified seller. Return this as tcgplayer_low.
   - TCGPlayer "High" = the highest recent verified sale price. Return as tcgplayer_high.
   - For tcgplayer_recent_sales: find up to 5 ACTUAL sold transactions (not just current listings) from TCGPlayer's sales history for this card. Each entry: { date: "Mon DD YYYY", price: number, condition: string (e.g. "Near Mint", "Lightly Played"), title: string (full card name + set), source: "tcgplayer" }.
   - Condition tiers on TCGPlayer: Near Mint (NM), Lightly Played (LP), Moderately Played (MP), Heavily Played (HP), Damaged (DMG). Return the specific condition for each sale.
   - IMPORTANT: By default return NM (Near Mint) prices unless the query specifies a different condition or a PSA/BGS grade.
   - Cross-reference with CardMarket (cardmarket.com) if TCGPlayer data is thin — note the source.
   - If this card genuinely does not exist on TCGPlayer (rare cases), set all tcgplayer fields to null and explain in market_summary.
   - DO NOT return null just because you are uncertain — make a best-effort search on TCGPlayer and return what you find.` : ''}

Return a JSON object with:
- insufficient_data: true if fewer than 3 total confirmed sold listings found (boolean)
- low_data: true if between 3 and 9 total confirmed sold listings found (boolean)
- total_confirmed_sales_count: total number of confirmed sold listings found across all sources (number)
- ebay_low: lowest recent eBay CONFIRMED sold price USD (number or null)
- ebay_high: highest recent eBay CONFIRMED sold price USD after outlier filtering (number or null)
- ebay_avg: average of ALL qualifying eBay sold prices (number or null)
- ebay_avg_24h: average of eBay confirmed sales in the last 24 hours ONLY (number or null)
- ebay_sales_count: number of qualifying eBay sales included (number or null)
- ebay_recent_sales: array of up to 6 qualifying eBay sold listings: { date: "Mon DD YYYY", price: number, condition: string, title: string, source: "ebay" }
- point130_low: lowest confirmed price from 130point.com (number or null)
- point130_high: highest confirmed price from 130point.com (number or null)
- point130_avg: average confirmed price from 130point.com (number or null)
- point130_recent_sales: array of up to 6 recent 130point confirmed sold listings: { date: "Mon DD YYYY", price: number, condition: string, title: string, source: "130point" }
- tcgplayer_market_price: TCGPlayer market price for this card (number or null — only for TCG cards)
- tcgplayer_low: lowest verified dealer listing on TCGPlayer (number or null)
- tcgplayer_high: highest recent verified dealer sale on TCGPlayer (number or null)
- tcgplayer_recent_sales: array of up to 4 recent TCGPlayer verified dealer sales: { date: "Mon DD YYYY", price: number, condition: string, title: string, source: "tcgplayer" }
- psa_value: PSA Price Guide / SMR value — ONLY include this if the search query explicitly mentions "PSA" as the grading company (e.g. "PSA 10", "PSA 9"). If the card is raw, ungraded, or graded by BGS/SGC/CGC/HGA/CSG or any other company that is NOT PSA, set psa_value to null and psa_grade_used to null. IMPORTANT: psa_value is a SEPARATE reference figure and must NOT be included in or influence ebay_avg, point130_avg, or any other average calculation.
- psa_grade_used: which PSA grade the psa_value corresponds to (string or null, e.g. "PSA 9") — only set if psa_value is non-null
- market_summary: 3-5 sentence plain English summary. Focus on eBay and 130point data. ${isTCG ? 'REQUIRED for TCG cards: explicitly state the TCGPlayer Market Price and whether it aligns with or differs from eBay comps. Mention the NM condition TCGPlayer price and any notable condition-based price differences.' : ''} If psa_value is present, mention it as a separate reference figure at the end. Include any offer-accepted replacements made and any outliers excluded. ${internalTrades.length > 0 ? 'Also mention how the Origins in-person card show trade data compares to online market prices.' : ''}
- search_query_used: exact search query used

${internalTrades.length > 0 ? `${isTCG ? '8' : '7'}. ORIGINS CARD SHOW TRADES (in-person verified sales):
   - The Origins community trade data above represents REAL in-person card show transactions with AI-verified fair market values.
   - Use this data to cross-reference and calibrate your estimated value.
   - If Origins trade prices diverge from online comps, note that in market_summary — in-person card show prices can differ from online markets.` : ''}

Use real data only. If a source has no qualifying data, return null for its fields and empty array for sales.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          insufficient_data: { type: 'boolean' },
          low_data: { type: 'boolean' },
          total_confirmed_sales_count: { type: 'number' },
          ebay_low: { type: 'number' },
          ebay_high: { type: 'number' },
          ebay_avg: { type: 'number' },
          ebay_avg_24h: { type: 'number' },
          ebay_sales_count: { type: 'number' },
          ebay_recent_sales: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                price: { type: 'number' },
                condition: { type: 'string' },
                title: { type: 'string' },
                source: { type: 'string' },
              },
            },
          },
          point130_low: { type: 'number' },
          point130_high: { type: 'number' },
          point130_avg: { type: 'number' },
          point130_recent_sales: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                price: { type: 'number' },
                condition: { type: 'string' },
                title: { type: 'string' },
                source: { type: 'string' },
              },
            },
          },
          tcgplayer_market_price: { type: 'number' },
          tcgplayer_low: { type: 'number' },
          tcgplayer_high: { type: 'number' },
          tcgplayer_recent_sales: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                price: { type: 'number' },
                condition: { type: 'string' },
                title: { type: 'string' },
                source: { type: 'string' },
              },
            },
          },
          psa_value: { type: 'number' },
          psa_grade_used: { type: 'string' },
          market_summary: { type: 'string' },
          search_query_used: { type: 'string' },
        },
      },
    });

    console.log('Comp result for:', query, JSON.stringify(result));
    return Response.json(result);
  } catch (error) {
    console.error('fetchCardComps error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});