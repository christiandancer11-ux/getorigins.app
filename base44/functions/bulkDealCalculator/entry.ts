import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrls, cardIndex } = await req.json();

    if (!imageUrls || imageUrls.length === 0) {
      return Response.json({ error: 'No images provided' }, { status: 400 });
    }

    const prompt = `You are an expert sports card and trading card market analyst with deep knowledge of current eBay sold prices, PSA/BGS pop reports, and collector market values.

You are being shown ${imageUrls.length === 2 ? 'the FRONT and BACK of a single trading card' : 'the front of a trading card'}.

Carefully examine the card image(s) and identify:
1. Player/character name
2. Card set and year
3. Sport or TCG type
4. Card number if visible
5. Any visible grade or condition (raw, PSA 10, BGS 9.5, etc.)
6. Any special variant (rookie card, prizm, refractor, holo, auto, patch, etc.)

Then estimate the current market value based on:
- Recent eBay sold comparables for this exact card
- Current collector demand
- Card condition as visible in the photo

Be realistic and conservative in your estimate. If you cannot identify the card clearly, say so.

Respond ONLY in this JSON format:
{
  "identified": true,
  "card_name": "string",
  "set_name": "string",
  "year": "string",
  "sport": "baseball|basketball|football|hockey|soccer|pokemon|magic_the_gathering|yugioh|other",
  "card_number": "string or null",
  "variant": "string or null (e.g. Silver Prizm RC, PSA 10, Holo, Auto)",
  "condition": "string (e.g. Raw NM, PSA 10, BGS 9.5)",
  "estimated_value": number,
  "value_range_low": number,
  "value_range_high": number,
  "confidence": "high|medium|low",
  "notes": "brief explanation of identification and valuation"
}

If you cannot identify the card at all, return:
{
  "identified": false,
  "card_name": "Unknown",
  "estimated_value": 0,
  "value_range_low": 0,
  "value_range_high": 0,
  "confidence": "low",
  "notes": "Could not identify this card from the image provided"
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: imageUrls,
      response_json_schema: { type: 'object' },
      model: 'gpt_5',
    });

    console.log(`Card ${cardIndex} analyzed:`, result?.card_name, '$' + result?.estimated_value);
    return Response.json({ result });
  } catch (error) {
    console.error('Bulk Deal Calculator error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});