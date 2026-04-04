import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { image_url, back_image_url } = await req.json();
    if (!image_url) return Response.json({ error: 'image_url required' }, { status: 400 });

    const fileUrls = [image_url];
    if (back_image_url) fileUrls.push(back_image_url);

    // Step 1: Identify the card from the image(s)
    const identification = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert sports card and TCG card grader and identifier. Analyze the provided card image(s) (front${back_image_url ? ' and back' : ''}) carefully.

Also check if this is a GRADED card (in a PSA, BGS, SGC, CGC, HGA, or any other grading company slab).

Identify the card and return a JSON object with:
- card_name: player name or card title (string)
- set_name: card set or collection name (string or null)
- year: year of the card (string or null)
- card_number: card number if visible (string or null)
- sport: one of baseball/basketball/football/hockey/soccer/pokemon/magic_the_gathering/yugioh/other
- condition_estimate: visual condition estimate — e.g. "Near Mint", "PSA 8-9 equivalent" (string)
- grading_company: name of grading company if this is a graded slab (e.g. "PSA", "BGS", "SGC", "CGC", "HGA") — null if raw
- grade: the numeric grade if graded (e.g. "10", "9.5") — null if raw
- cert_number: certification/serial number visible on the slab label — null if not graded
- visible_attributes: array of notable attributes (e.g. ["rookie card", "autograph", "refractor", "1st edition"])
- identified: true if you can confidently identify the card, false if too unclear
- confidence: "high", "medium", or "low"
- needs_back_image: true ONLY if you could NOT identify the card and you think the back would significantly help — false otherwise
- notes: any additional observations about condition, centering, surface, corners, edges

Be as specific as possible. For graded slabs, extract ALL label information carefully.`,
      file_urls: fileUrls,
      response_json_schema: {
        type: 'object',
        properties: {
          card_name: { type: 'string' },
          set_name: { type: 'string' },
          year: { type: 'string' },
          card_number: { type: 'string' },
          sport: { type: 'string' },
          condition_estimate: { type: 'string' },
          grading_company: { type: 'string' },
          grade: { type: 'string' },
          cert_number: { type: 'string' },
          visible_attributes: { type: 'array', items: { type: 'string' } },
          identified: { type: 'boolean' },
          confidence: { type: 'string' },
          needs_back_image: { type: 'boolean' },
          notes: { type: 'string' },
        },
      },
    });

    console.log('Card identified:', JSON.stringify(identification));

    // If AI needs the back and we don't have it, signal the frontend
    if (identification.needs_back_image && !back_image_url) {
      return Response.json({ needs_back_image: true, identification });
    }

    if (!identification.identified || !identification.card_name) {
      return Response.json({ error: 'Could not identify card from image. Please ensure the card is clearly visible and well-lit, or try adding the back image.', identification });
    }

    const isGraded = !!(identification.grading_company && identification.grade);

    // Step 2: Fetch pop report if graded
    let popReport = null;
    if (isGraded) {
      try {
        const popData = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a trading card grading expert. Look up the current population report for:

Card: ${identification.card_name}
Set: ${identification.set_name || 'Unknown'}
Year: ${identification.year || 'Unknown'}
Card Number: ${identification.card_number || 'Unknown'}
Grading Company: ${identification.grading_company}
Grade: ${identification.grade}
${identification.cert_number ? `Cert Number: ${identification.cert_number}` : ''}

Search for the latest population report from ${identification.grading_company}'s registry or any reputable source.

Return a JSON object:
- pop_at_grade: number of cards at this exact grade (number or null)
- pop_higher: number of cards graded higher than this grade (number or null)
- pop_total: total population graded by this company for this card (number or null)
- summary: 1-2 sentence plain English summary (e.g. "${identification.grading_company} ${identification.grade} Pop: 125. Higher: None. Total graded: 1,847.")`,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              pop_at_grade: { type: 'number' },
              pop_higher: { type: 'number' },
              pop_total: { type: 'number' },
              summary: { type: 'string' },
            },
          },
        });
        popReport = popData.summary || null;
        identification.pop_report = popReport;
        console.log('Pop report fetched:', popReport);
      } catch (e) {
        console.warn('Could not fetch pop report:', e.message);
      }
    }

    // Step 3: Pull market data
    const gradedLabel = isGraded ? `${identification.grading_company} ${identification.grade}` : '';
    const query = [identification.year, identification.card_name, identification.set_name, identification.card_number, gradedLabel]
      .filter(Boolean).join(' ').trim();

    let internalTrades = [];
    try {
      const q = identification.card_name.toLowerCase();
      const allTrades = await base44.asServiceRole.entities.CardTrade.list('-created_date', 200);
      internalTrades = allTrades.filter(t =>
        [t.card_name, t.set_name].filter(Boolean).some(v => v.toLowerCase().includes(q))
      );
    } catch (e) {
      console.warn('Could not fetch internal trades:', e.message);
    }

    let collectionCards = [];
    try {
      const allCards = await base44.asServiceRole.entities.Card.list('-created_date', 200);
      const q = identification.card_name.toLowerCase();
      collectionCards = allCards.filter(c =>
        [c.name, c.set_name].filter(Boolean).some(v => v.toLowerCase().includes(q))
      );
    } catch (e) {
      console.warn('Could not fetch collection cards:', e.message);
    }

    const internalContext = internalTrades.length > 0
      ? `\n\nInternal Origins app trade history for similar cards (${internalTrades.length} trades found):\n` +
        internalTrades.slice(0, 5).map(t =>
          `- ${t.card_name} ${t.set_name || ''} ${t.year || ''}: $${t.total_value || t.cash_paid || 0} (${t.condition || 'raw'})${t.ebay_comp_avg ? `, eBay avg was $${t.ebay_comp_avg}` : ''}`
        ).join('\n')
      : '';

    const popContext = popReport ? `\nPop Report: ${popReport}` : '';

    const marketPrompt = `You are a sports card & TCG market analyst. Research current market value for:

Card: ${query}
Visual condition: ${identification.condition_estimate || 'Unknown'}
${isGraded ? `Graded: ${identification.grading_company} ${identification.grade}${popContext}` : ''}
Notable attributes: ${(identification.visible_attributes || []).join(', ') || 'None noted'}
${internalContext}

Search eBay completed/sold listings AND 130point.com for this specific card.

Return a JSON object with:
- ebay_low: lowest recent eBay sold price USD (number or null)
- ebay_high: highest recent eBay sold price USD (number or null)
- ebay_avg: average recent eBay sold price USD (number or null)
- ebay_sales_count: number of recent eBay sales found (number or null)
- ebay_recent_sales: up to 5 recent eBay sold listings, each { date, price, condition, title }
- point130_low: lowest 130point.com price (number or null)
- point130_high: highest 130point.com price (number or null)
- point130_avg: average 130point.com price (number or null)
- point130_recent_sales: up to 5 recent 130point listings, each { date, price, condition, title }
- estimated_value: your best single-number estimate of current value in USD (number)
- value_range_low: conservative low estimate USD (number)
- value_range_high: optimistic high estimate USD (number)
- market_summary: 3-4 sentences covering current market, condition impact, trend direction${isGraded ? ', and how the pop count affects value' : ''}
- search_query_used: the exact search query used`;

    const marketData = await base44.integrations.Core.InvokeLLM({
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
          ebay_recent_sales: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, price: { type: 'number' }, condition: { type: 'string' }, title: { type: 'string' } } } },
          point130_low: { type: 'number' },
          point130_high: { type: 'number' },
          point130_avg: { type: 'number' },
          point130_recent_sales: { type: 'array', items: { type: 'object', properties: { date: { type: 'string' }, price: { type: 'number' }, condition: { type: 'string' }, title: { type: 'string' } } } },
          estimated_value: { type: 'number' },
          value_range_low: { type: 'number' },
          value_range_high: { type: 'number' },
          market_summary: { type: 'string' },
          search_query_used: { type: 'string' },
        },
      },
    });

    console.log('Market data fetched for:', query);

    return Response.json({
      identification,
      market: marketData,
      internal_trades: internalTrades.slice(0, 10),
      collection_count: collectionCards.length,
    });

  } catch (error) {
    console.error('analyzeCardImage error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});