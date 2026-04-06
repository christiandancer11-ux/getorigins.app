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
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Step 1: Identify card from image
    const identification = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are an expert sports card and TCG card identifier. Analyze the provided card image(s).${correctionContext}

You are seeing ${imageUrls.length === 2 ? 'the FRONT and BACK of a single trading card' : 'the front of a trading card'}.

Identify ALL visible details:
1. Player/character name
2. Card set and year
3. Sport or TCG type
4. Card number if visible
5. Is this card GRADED (inside a hard plastic slab from PSA, BGS, SGC, CGC, HGA, etc.) or RAW (loose card)?
   - GRADED: inside a slab with a numeric grade on the label
   - RAW: not in a slab
6. Any special variants (rookie card, prizm, refractor, holo, auto, patch, 1st edition, etc.)
7. If graded: read the exact grading company name, numeric grade, and certification number from the label

Return a JSON object:
{
  "identified": true or false,
  "card_name": "string",
  "set_name": "string or null",
  "year": "string or null",
  "sport": "baseball|basketball|football|hockey|soccer|golf|ufc|wwe|f1|pokemon|magic_the_gathering|yugioh|other",
  "card_number": "string or null",
  "variant": "string or null",
  "is_graded": true or false,
  "grading_company": "string or null",
  "grade": "string or null",
  "cert_number": "string or null",
  "condition_label": "string (e.g. Raw NM, Raw EX, PSA 10, BGS 9.5)"
}`,
      file_urls: imageUrls,
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
          cert_number: { type: 'string' },
          condition_label: { type: 'string' },
        },
      },
    });

    console.log(`Card ${cardIndex} identified:`, identification?.card_name, identification?.condition_label);

    if (!identification.identified || !identification.card_name) {
      return Response.json({
        result: {
          identified: false,
          card_name: 'Unknown',
          is_graded: false,
          estimated_value: 0,
          value_range_low: 0,
          value_range_high: 0,
          confidence: 'low',
          notes: 'Could not identify this card from the image provided.',
        }
      });
    }

    // Step 2: Pull Origins card show trades for this card
    let internalTrades = [];
    try {
      const allTrades = await base44.asServiceRole.entities.CardTrade.list('-created_date', 200);
      const q = identification.card_name.toLowerCase();
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

    const isGraded = identification.is_graded;
    const gradedLabel = isGraded ? `${identification.grading_company} ${identification.grade}` : '';
    const query = [identification.year, identification.card_name, identification.set_name, identification.card_number, gradedLabel]
      .filter(Boolean).join(' ').trim();

    const isTCG = ['pokemon', 'magic_the_gathering', 'yugioh'].includes(identification.sport) ||
      /pokemon|charizard|pikachu|mewtwo|magic|yugioh|yu-gi-oh|mtg/i.test(query);

    // Step 3: Market valuation with full multi-source research
    const marketPrompt = `You are an expert sports card and trading card market analyst with internet access to look up ACTUAL recent sold prices.

Card identified: ${query}
Condition: ${identification.condition_label || (isGraded ? gradedLabel : 'Raw')}
${identification.variant ? `Variant: ${identification.variant}` : ''}
${internalTradeContext}

=== SEARCH QUERY FORMAT (SPORTS CARDS) ===
When searching eBay and 130point.com for sports cards, always format your search query as:
  [Year] [Manufacturer/Brand] [Product Name] [Player Name] [Card Type: RPA/Auto/Patch Auto/Base/Variation] [Serial Number e.g. /25 or SP or variation]
Example: "2022 Panini National Treasures Treylon Burks RPA /25"
- Card Type: RPA (rookie patch auto), Auto, Patch Auto, Base (no shine/color/numbering), or specific variation name
- Always include the serial number or print run if known (e.g. /25, /99, /10, /1)
- If it's a short print (SP) or super short print (SSP), include that
- Do NOT include condition/grade in the search string itself — apply condition as a filter after pulling results
- For graded cards, search by card identity first then filter to only graded copies at the exact same grade

Search ${isTCG ? 'FOUR' : 'THREE'} sources: eBay completed/sold listings, 130point.com confirmed sales, PSA Price Guide / SMR${isTCG ? ', and TCGPlayer.com verified market prices' : ''}.

=== STRICT CONDITION MATCHING — CRITICAL ===
${isGraded
  ? `This card is GRADED (${gradedLabel}). ONLY use sold prices for this EXACT grade. Do NOT mix grades or include raw sales.`
  : `This card is RAW (ungraded). ONLY use raw/ungraded sold prices. Do NOT include or reference graded (PSA/BGS/SGC) sold prices.`}

=== TIME WINDOW — FOLLOW IN ORDER ===
1. PRIMARY: eBay confirmed sold + 130point.com sales from the last 90 days (since ${threeMonthsAgo}).
2. FALLBACK: If fewer than 3 qualifying sales exist in 90 days, expand to 180 days (since ${sixMonthsAgo}) and note the older dates.
3. If you had to use sales older than 90 days, note those in the notes field with their actual dates.

=== DATA QUALITY RULES ===

1. EBAY CONFIRMED SALES ONLY — EXCLUDE:
   - Listings that ended without a buyer (unsold, expired, relisted)
   - Cancelled transactions or non-paying buyer disputes
   - Best Offer listings where NO offer was accepted and item did NOT reach SOLD status
   - Buy-It-Now listings that were viewed but never purchased
   Only include sales definitively CONFIRMED SOLD AND COMPLETED.

2. OFFER-ACCEPTED REPLACEMENT RULE (IMPORTANT):
   - eBay hides the real price when a Best Offer is accepted (shows original listing price instead).
   - 130point.com shows the actual accepted offer price for these same sales.
   - If a sale appears on BOTH eBay (inflated listing price) AND 130point.com (real price):
     * REMOVE it from eBay list entirely
     * KEEP only the 130point.com version
     * Do NOT double-count in any averages

3. DUPLICATE REMOVAL:
   - Same physical sale on both eBay and 130point.com → count it ONCE using the 130point.com price.
   - Match duplicates by: same approximate date + same card + same price range (within 10%).

4. OUTLIER FILTERING:
   - Exclude any sale more than 100% above the established average unless supported by 2+ other sales in the same range.

5. AVERAGE CALCULATION:
   - Calculate average_sold_price as the mean of ALL qualifying confirmed sales from both eBay and 130point.com combined (after deduplication and outlier removal).
   - This single combined average is the primary basis for estimated_value.

${isTCG ? `6. TCGPLAYER (REQUIRED for TCG cards):
   - Look up TCGPlayer.com Market Price for this exact card (NM condition unless query specifies otherwise).
   - TCGPlayer Market Price = weighted average of ACTUAL completed verified sales. This is the most reliable TCG benchmark.
   - Return tcgplayer_market_price, tcgplayer_low, tcgplayer_high.
   - Include up to 4 recent TCGPlayer sales in tcgplayer_recent_sales.` : ''}

${internalTrades.length > 0 ? `7. ORIGINS CARD SHOW TRADES:
   - The in-person trade data above is ground-truth. Use it to validate your estimates.
   - If Origins trade prices differ from online comps, note it.` : ''}

Return this JSON:
{
  "ebay_low": number or null,
  "ebay_high": number or null,
  "ebay_avg": number or null,
  "ebay_sales_count": number or null,
  "ebay_recent_sales": [ { "date": "Mon DD YYYY", "price": number, "condition": "string", "title": "string", "source": "ebay" } ],
  "point130_low": number or null,
  "point130_high": number or null,
  "point130_avg": number or null,
  "point130_recent_sales": [ { "date": "Mon DD YYYY", "price": number, "condition": "string", "title": "string", "source": "130point" } ],
  "tcgplayer_market_price": number or null,
  "tcgplayer_low": number or null,
  "tcgplayer_high": number or null,
  "tcgplayer_recent_sales": [ { "date": "Mon DD YYYY", "price": number, "condition": "string", "title": "string", "source": "tcgplayer" } ],
  "average_sold_price": number or null,
  "estimated_value": number,
  "value_range_low": number,
  "value_range_high": number,
  "sales_count_90_days": number or null,
  "confidence": "high|medium|low",
  "notes": "2-3 sentences: what comps were found, date range used, any older sales listed with dates. If raw card, do NOT mention graded values."
}`;

    const saleItemSchema = {
      type: 'object',
      properties: {
        date: { type: 'string' },
        price: { type: 'number' },
        condition: { type: 'string' },
        title: { type: 'string' },
        source: { type: 'string' },
      }
    };

    const marketData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: marketPrompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          ebay_low: { type: 'number' },
          ebay_high: { type: 'number' },
          ebay_avg: { type: 'number' },
          ebay_sales_count: { type: 'number' },
          ebay_recent_sales: { type: 'array', items: saleItemSchema },
          point130_low: { type: 'number' },
          point130_high: { type: 'number' },
          point130_avg: { type: 'number' },
          point130_recent_sales: { type: 'array', items: saleItemSchema },
          tcgplayer_market_price: { type: 'number' },
          tcgplayer_low: { type: 'number' },
          tcgplayer_high: { type: 'number' },
          tcgplayer_recent_sales: { type: 'array', items: saleItemSchema },
          average_sold_price: { type: 'number' },
          estimated_value: { type: 'number' },
          value_range_low: { type: 'number' },
          value_range_high: { type: 'number' },
          sales_count_90_days: { type: 'number' },
          confidence: { type: 'string' },
          notes: { type: 'string' },
        },
      },
    });

    console.log(`Card ${cardIndex} valued:`, identification.card_name, '$' + marketData?.estimated_value, 'avg: $' + marketData?.average_sold_price);

    return Response.json({
      result: {
        ...identification,
        ...marketData,
        condition: identification.condition_label,
        internal_trades: internalTrades.slice(0, 5),
      }
    });

  } catch (error) {
    console.error('Bulk Deal Calculator error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});