import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { card_name, set_name, year, card_number, condition } = await req.json();
    if (!card_name) return Response.json({ error: 'card_name is required' }, { status: 400 });

    const condLabel = condition && condition !== 'raw' ? condition.toUpperCase().replace(/_/g, ' ') : '';
    const query = [year, card_name, set_name, card_number, condLabel].filter(Boolean).join(' ').trim();

    const now = new Date();
    const cutoffISO = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const prompt = `You are a sports card & TCG market research assistant. Research recent SOLD prices for:

Card: ${query}

Search THREE sources: eBay completed/sold listings (last 24 hours from ${yesterday}), 130point.com confirmed sales, and PSA's Price Guide / SMR (Sports Market Report).

=== STRICT DATA QUALITY RULES — FOLLOW EXACTLY ===

1. EBAY CONFIRMED SALES ONLY — EXCLUDE ALL OF THE FOLLOWING:
   - Any listing that ended without a buyer (unsold, expired, relisted)
   - Any listing that shows signs of being relisted (same card, same seller, same condition listed multiple times)
   - Any sale where the buyer did not pay (marked as unpaid, relisted, or non-paying buyer dispute)
   - Any cancelled transaction or order
   - "Best Offer" or "Make Offer" listings where NO offer was accepted and the item did NOT reach sold status
   - Buy-It-Now listings that were viewed but never purchased
   Only include eBay sales where the transaction is definitively confirmed SOLD and COMPLETED.

2. OFFER-ACCEPTED REPLACEMENT RULE (VERY IMPORTANT):
   - On eBay, when a seller accepts a Best Offer, eBay hides the actual sold price and only shows the original listing price.
   - 130point.com tracks these same sales and DOES show the actual accepted offer price.
   - If you find a sale that appears on BOTH eBay (showing only listing price) AND 130point.com (showing actual offer price):
     * REMOVE that sale from the eBay list entirely
     * KEEP only the 130point.com version with the real accepted price
     * Do NOT double-count it in any averages
   - This prevents inflated eBay averages caused by hidden offer-accepted prices.

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

Return a JSON object with:
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
- psa_value: PSA Price Guide / SMR value — ONLY include this if the search query explicitly mentions "PSA" as the grading company (e.g. "PSA 10", "PSA 9"). If the card is raw, ungraded, or graded by BGS/SGC/CGC/HGA/CSG or any other company that is NOT PSA, set psa_value to null and psa_grade_used to null. IMPORTANT: psa_value is a SEPARATE reference figure and must NOT be included in or influence ebay_avg, point130_avg, or any other average calculation.
- psa_grade_used: which PSA grade the psa_value corresponds to (string or null, e.g. "PSA 9") — only set if psa_value is non-null
- market_summary: 3-4 sentence plain English summary. Focus on eBay and 130point data only. If psa_value is present, mention it as a separate reference figure at the end. Include any offer-accepted replacements made and any outliers excluded.
- search_query_used: exact search query used

Use real data only. If a source has no qualifying data, return null for its fields and empty array for sales.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
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