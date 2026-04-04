import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { card_id } = await req.json();
    if (!card_id) return Response.json({ error: 'card_id is required' }, { status: 400 });

    // Fetch the card
    const cards = await base44.entities.Card.filter({ id: card_id });
    const card = cards[0];
    if (!card) return Response.json({ error: 'Card not found' }, { status: 404 });

    // Only the card owner can refresh value
    if (card.created_by !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build a rich search query
    const gradePart = card.grading_company && card.grade
      ? `${card.grading_company} ${card.grade}`
      : '';
    const query = [card.year, card.name, card.set_name, card.card_number ? `#${card.card_number}` : '', gradePart]
      .filter(Boolean).join(' ').trim();

    const prompt = `You are a sports card & TCG pricing assistant. Find the current fair market value for this card:

"${query}"

Search eBay recently sold listings (last 30 days), 130point.com, and PSA Price Guide for this specific card.

Rules:
- Only include CONFIRMED SOLD listings (not active listings)
- If graded, match the specific grade (${gradePart || 'raw/ungraded'})
- Return the best single estimated_value in USD as a number (the most representative current market price)
- Base it on the median/average of recent sales, not outliers

Return JSON: { "estimated_value": <number or null>, "confidence": "high|medium|low", "source_summary": "<1-2 sentence explanation of what data was found>" }`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          estimated_value: { type: 'number' },
          confidence: { type: 'string' },
          source_summary: { type: 'string' },
        },
      },
    });

    console.log('updateCardValue result for:', query, JSON.stringify(result));

    if (result?.estimated_value != null) {
      await base44.entities.Card.update(card_id, {
        estimated_value: result.estimated_value,
      });
    }

    return Response.json({
      success: true,
      estimated_value: result?.estimated_value ?? null,
      confidence: result?.confidence ?? null,
      source_summary: result?.source_summary ?? null,
      query_used: query,
    });
  } catch (error) {
    console.error('updateCardValue error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});