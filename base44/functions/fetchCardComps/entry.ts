import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { card_name, set_name, year, card_number, condition } = await req.json();

    if (!card_name) return Response.json({ error: 'card_name is required' }, { status: 400 });

    const query = [year, card_name, set_name, card_number, condition && condition !== 'raw' ? condition.toUpperCase().replace('_', ' ') : '']
      .filter(Boolean).join(' ').trim();

    const prompt = `You are a sports card market research assistant. Research recent sold prices for the following card:

Card: ${query}

Please search for recent sold listings on eBay and 130point.com for this specific card.

Return a JSON object with:
- ebay_low: lowest recent eBay sold price in USD (number, null if not found)
- ebay_high: highest recent eBay sold price in USD (number, null if not found)  
- ebay_avg: average recent eBay sold price in USD (number, null if not found)
- ebay_sales_count: approximate number of recent eBay sales found (number)
- market_summary: 2-3 sentence plain English summary of what the card is selling for, referencing both eBay and 130point data if available. Be specific about price ranges and recent trends.
- search_query_used: the exact search query you used

Be as accurate as possible using real market data. If the card is rare or data is limited, note that.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          ebay_low: { type: 'number' },
          ebay_high: { type: 'number' },
          ebay_avg: { type: 'number' },
          ebay_sales_count: { type: 'number' },
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