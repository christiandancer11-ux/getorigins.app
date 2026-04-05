import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const prompt = `You are a world-class sports card and TCG market analyst writing for serious collectors and investors.
Today is ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} Central Time.

Generate the single #1 BUY, #1 HOLD, and #1 SELL pick for the trading card hobby market RIGHT NOW.

Consider:
- Current sports seasons (MLB, NBA playoffs, NFL offseason/draft season, NHL playoffs, Pokemon/TCG tournament circuit)
- Recent player performance, awards, trades, injuries
- Pop report data and market saturation
- Upcoming catalysts (playoffs, draft, Hall of Fame announcements, Pokemon set releases)
- Current eBay sold data trends
- Collector sentiment and social media buzz

Rules:
- Picks can be any sport: baseball, basketball, football, hockey, soccer, pokemon, magic_the_gathering, yugioh
- Each pick should be a SPECIFIC card (include set, year, variant/grade)
- The reasoning must be data-driven and timely — reference actual market context
- Estimated prices should reflect real current market values
- Price targets are 30-90 day projections

Return a JSON object:
{
  "buy": {
    "card_name": "string",
    "set_name": "string", 
    "year": "string",
    "sport": "baseball|basketball|football|hockey|soccer|pokemon|magic_the_gathering|yugioh|other",
    "variant": "string (e.g. PSA 10 Silver Prizm RC)",
    "estimated_price": number,
    "price_target": number,
    "confidence": "high|medium|low",
    "reasoning": "2-3 sentences of market analysis"
  },
  "hold": {
    "card_name": "string",
    "set_name": "string",
    "year": "string", 
    "sport": "baseball|basketball|football|hockey|soccer|pokemon|magic_the_gathering|yugioh|other",
    "variant": "string",
    "estimated_price": number,
    "price_target": number,
    "confidence": "high|medium|low",
    "reasoning": "2-3 sentences of market analysis"
  },
  "sell": {
    "card_name": "string",
    "set_name": "string",
    "year": "string",
    "sport": "baseball|basketball|football|hockey|soccer|pokemon|magic_the_gathering|yugioh|other",
    "variant": "string",
    "estimated_price": number,
    "price_target": number,
    "confidence": "high|medium|low",
    "reasoning": "2-3 sentences of market analysis"
  }
}`;

    const rawText = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: "gemini_3_flash",
    });

    // Extract JSON from the response text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in AI response');
    const result = JSON.parse(jsonMatch[0]);

    // Delete old picks and insert new ones
    const existing = await base44.asServiceRole.entities.MarketPick.list();
    for (const pick of existing) {
      await base44.asServiceRole.entities.MarketPick.delete(pick.id);
    }

    const generatedAt = now.toISOString();

    for (const type of ['buy', 'hold', 'sell']) {
      const p = result[type];
      if (!p) continue;
      await base44.asServiceRole.entities.MarketPick.create({
        pick_type: type,
        card_name: p.card_name,
        set_name: p.set_name,
        year: p.year,
        sport: p.sport,
        variant: p.variant,
        estimated_price: p.estimated_price,
        price_target: p.price_target,
        confidence: p.confidence,
        reasoning: p.reasoning,
        generated_at: generatedAt
      });
    }

    console.log('Market picks updated at', generatedAt);
    return Response.json({ success: true, generated_at: generatedAt });
  } catch (error) {
    console.error('updateMarketPicks error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});