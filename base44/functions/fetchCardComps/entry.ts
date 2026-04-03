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

    const prompt = `You are a sports card & TCG market research assistant. Research recent SOLD prices for:

Card: ${query}

Search eBay completed/sold listings AND 130point.com for this specific card.

=== STRICT DATA QUALITY RULES — YOU MUST FOLLOW THESE EXACTLY ===

1. CONFIRMED SALES ONLY: Only include eBay listings that are CONFIRMED SOLD. Never include:
   - Listings that ended without a buyer (unsold)
   - Active or expired listings that did not sell
   - Relisted items (same item reposted after failing to sell)
   - "Best Offer" listings unless the offer was accepted and the item is marked sold
   - Buy-It-Now listings that were never purchased

2. ABOVE-MARKET OUTLIER RULE: If an eBay sale price is MORE than 100% above the established market average for this card:
   - Do NOT include it in ebay_avg, ebay_low, ebay_high calculations
   - Only include it if there are MULTIPLE confirmed sales (2 or more) of this same card within a similar price range (within 20-30% of each other) that all occurred MORE than 12 hours ago (before ${cutoffISO})
   - If only one sale exists above 100% of market value, or if it occurred within the last 12 hours, EXCLUDE it entirely from averages — it may be a price manipulation attempt
   - If you exclude a sale, note it in market_summary

3. Use 130point.com data as a trusted secondary source — apply the same confirmed-sale-only rule.

Return a JSON object with these fields:
- ebay_low: lowest recent eBay CONFIRMED sold price USD (number or null)
- ebay_high: highest recent eBay CONFIRMED sold price USD after outlier filtering (number or null)
- ebay_avg: average recent eBay CONFIRMED sold price USD after outlier filtering (number or null)
- ebay_sales_count: number of qualifying eBay sales included (number or null)
- ebay_recent_sales: array of up to 6 qualifying eBay sold listings, each with { date: "Mon DD YYYY", price: number, condition: string, title: string }
- point130_low: lowest confirmed price from 130point.com (number or null)
- point130_high: highest confirmed price from 130point.com (number or null)
- point130_avg: average confirmed price from 130point.com (number or null)
- point130_recent_sales: array of up to 6 recent 130point confirmed sold listings, each with { date: "Mon DD YYYY", price: number, condition: string, title: string }
- market_summary: 3-4 sentence plain English summary covering both platforms, price trends, and what condition affects value most. Be specific about dollar amounts and recency. Mention if any outlier sales were excluded and why.
- search_query_used: exact search query used

Use real data. If a platform has no qualifying data for this card, return null for its fields and empty array for its sales.`;

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
              },
            },
          },
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