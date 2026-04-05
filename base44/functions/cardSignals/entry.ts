import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { cards } = body;

    if (!cards || cards.length === 0) {
      return Response.json({ signals: [] });
    }

    // Build a concise card list for the AI prompt
    const cardSummaries = cards.map((c, i) => {
      const pricePaid = c.price_paid ? `$${c.price_paid}` : 'unknown cost basis';
      const currentValue = c.estimated_value ? `$${c.estimated_value}` : 'unknown value';
      const gainLoss = (c.price_paid && c.estimated_value)
        ? `${c.estimated_value >= c.price_paid ? '+' : ''}${(((c.estimated_value - c.price_paid) / c.price_paid) * 100).toFixed(0)}% ROI`
        : '';
      return `${i + 1}. ${c.name} | ${c.year || ''} ${c.set_name || ''} | Sport: ${c.sport || 'unknown'} | Grade: ${c.grading_company ? c.grading_company + ' ' + c.grade : 'raw'} | Cost: ${pricePaid} | Value: ${currentValue} ${gainLoss}`;
    }).join('\n');

    const prompt = `You are an expert sports card and trading card game (TCG) market analyst. 
Today's date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.

A collector has the following cards in their portfolio. For each card, assign a signal: "buy" (add more copies / don't sell, great upside), "hold" (keep the card, stable or uncertain outlook), or "sell" (good time to exit, price likely peaked or declining).

Base your analysis on:
- Current hobby market trends (rookie card demand, player performance, TCG meta relevance)
- ROI already captured vs remaining upside
- Rarity and population scarcity
- Market timing (off-season vs in-season, post-award hype, etc.)
- Whether the card is graded and what grade

Cards:
${cardSummaries}

Return a JSON object with this exact structure:
{
  "signals": [
    {
      "index": 0,
      "signal": "buy" | "hold" | "sell",
      "reason": "One sentence explaining why"
    }
  ]
}

The "index" matches the card number minus 1 (0-based). Return exactly ${cards.length} signal objects.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          signals: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "number" },
                signal: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    });

    return Response.json({ signals: result.signals || [] });
  } catch (error) {
    console.error('cardSignals error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});