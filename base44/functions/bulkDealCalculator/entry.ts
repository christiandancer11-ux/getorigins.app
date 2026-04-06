import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrls, cardIndex, correctionHint } = await req.json();

    if (!imageUrls || imageUrls.length === 0) {
      return Response.json({ error: 'No images provided' }, { status: 400 });
    }

    const correctionContext = correctionHint
      ? `\n\n=== USER CORRECTION ===\nThe user says the previous AI identification was wrong. Their correction: "${correctionHint}"\nUse this hint to correctly identify the card and re-value it accordingly.\n`
      : '';

    const today = new Date();
    const threeMonthsAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const sixMonthsAgo = new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const prompt = `You are an expert sports card and trading card market analyst. You have internet access to look up ACTUAL recent sold prices.${correctionContext}

You are being shown ${imageUrls.length === 2 ? 'the FRONT and BACK of a single trading card' : 'the front of a trading card'}.

=== STEP 1: IDENTIFY THE CARD ===
Examine the card image(s) and identify:
1. Player/character name
2. Card set and year
3. Sport or TCG type
4. Card number if visible
5. Is this card GRADED or RAW?
   - GRADED = it is inside a hard plastic slab from PSA, BGS, SGC, CGC, HGA, or any other grading company. The label will show a numeric grade (e.g. PSA 10, BGS 9.5).
   - RAW = it is NOT in a slab. It is a loose card, possibly in a sleeve or toploader.
6. Any special variant (rookie card, prizm, refractor, holo, auto, patch, 1st edition, etc.)

=== STEP 2: LOOK UP ACTUAL SOLD PRICES ===
Search eBay completed/sold listings and 130point.com for this EXACT card in the SAME condition (graded or raw).

CRITICAL CONDITION MATCHING RULES:
- If the card is RAW: ONLY look up sold prices for RAW (ungraded) copies of this card. Do NOT include or reference graded (PSA/BGS/SGC) sold prices. Do NOT mention what the graded version is worth.
- If the card is GRADED: ONLY look up sold prices for copies graded at the EXACT same grade (e.g. if PSA 10, only use PSA 10 sales). Do not mix grades.

TIME WINDOW RULES — FOLLOW IN ORDER:
1. PRIMARY: Focus on eBay confirmed sold listings and 130point.com sales from the last 90 days (since ${threeMonthsAgo}). This is your main data source.
2. FALLBACK: If fewer than 3 qualifying sales exist in the last 90 days, expand your search to the last 180 days (since ${sixMonthsAgo}) and note the older dates.
3. If you had to use older sales (beyond 90 days), you MUST mention this in the notes field — list those older sales with their actual sold dates and prices, and note they may be less accurate due to age.

DATA QUALITY:
- Only use CONFIRMED SOLD listings (not active listings, unsold, or expired).
- Exclude outliers more than 100% above the established average unless supported by 2+ other sales.
- For TCG cards (Pokémon, MTG, Yu-Gi-Oh), also check TCGPlayer.com Market Price for the matching condition.

=== STEP 3: CALCULATE VALUE ===
Base estimated_value ONLY on comparable sales matching the card's exact condition (raw or the specific grade).
Be realistic and conservative.

Return this JSON:
{
  "identified": true,
  "card_name": "string",
  "set_name": "string",
  "year": "string",
  "sport": "baseball|basketball|football|hockey|soccer|pokemon|magic_the_gathering|yugioh|other",
  "card_number": "string or null",
  "variant": "string or null (e.g. Silver Prizm RC, Holo, Auto)",
  "is_graded": true or false,
  "grading_company": "string or null (e.g. PSA, BGS, SGC)",
  "grade": "string or null (e.g. 10, 9.5)",
  "condition": "string (e.g. Raw NM, Raw EX, PSA 10, BGS 9.5)",
  "estimated_value": number,
  "value_range_low": number,
  "value_range_high": number,
  "sales_count_90_days": number or null,
  "confidence": "high|medium|low",
  "notes": "2-3 sentences: explain what comps were found, the date range used, and if any sales were older than 90 days list them with dates and prices. Do NOT mention graded values if the card is raw."
}

If you cannot identify the card at all:
{
  "identified": false,
  "card_name": "Unknown",
  "is_graded": false,
  "estimated_value": 0,
  "value_range_low": 0,
  "value_range_high": 0,
  "confidence": "low",
  "notes": "Could not identify this card from the image provided"
}`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: imageUrls,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          identified: { type: 'boolean' },
          card_name: { type: 'string' },
          set_name: { type: 'string' },
          year: { type: 'string' },
          sport: { type: 'string' },
          card_number: { type: 'string' },
          variant: { type: 'string' },
          is_graded: { type: 'boolean' },
          grading_company: { type: 'string' },
          grade: { type: 'string' },
          condition: { type: 'string' },
          estimated_value: { type: 'number' },
          value_range_low: { type: 'number' },
          value_range_high: { type: 'number' },
          sales_count_90_days: { type: 'number' },
          confidence: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    });

    console.log(`Card ${cardIndex} analyzed:`, result?.card_name, '$' + result?.estimated_value);
    return Response.json({ result });
  } catch (error) {
    console.error('Bulk Deal Calculator error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});