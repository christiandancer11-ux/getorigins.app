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

    const prompt = `You are a sports card & TCG market research assistant. Research recent SOLD prices for:

Card: ${query}

Search eBay completed/sold listings AND 130point.com for this specific card.

Return a JSON object with these fields:
- ebay_low: lowest recent eBay sold price USD (number or null)
- ebay_high: highest recent eBay sold price USD (number or null)
- ebay_avg: average recent eBay sold price USD (number or null)
- ebay_sales_count: number of recent eBay sales found (number or null)
- ebay_recent_sales: array of up to 6 recent eBay sold listings, each with { date: "Mon DD YYYY", price: number, condition: string, title: string }
- point130_low: lowest price from 130point.com (number or null)
- point130_high: highest price from 130point.com (number or null)
- point130_avg: average price from 130point.com (number or null)
- point130_recent_sales: array of up to 6 recent 130point sold listings, each with { date: "Mon DD YYYY", price: number, condition: string, title: string }
- market_summary: 3-4 sentence plain English summary covering both platforms, price trends, and what condition affects value most. Be specific about dollar amounts and recency.
- search_query_used: exact search query used

Use real data. If a platform has no data for this card, return null for its fields and empty array for its sales.`;

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