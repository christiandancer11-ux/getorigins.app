import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all graded cards (those with a grading_company set)
    const allCards = await base44.asServiceRole.entities.Card.list('-created_date', 500);
    const gradedCards = allCards.filter(c => c.grading_company && c.grade && c.name);

    console.log(`Found ${gradedCards.length} graded cards to update pop reports for.`);

    let updated = 0;
    let failed = 0;

    for (const card of gradedCards) {
      try {
        const query = `${card.grading_company} ${card.grade} ${card.name} ${card.set_name || ''} ${card.year || ''} population report`.trim();

        const popData = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a trading card grading expert. Look up the current population report for this graded card:

Card: ${card.name}
Set: ${card.set_name || 'Unknown'}
Year: ${card.year || 'Unknown'}
Card Number: ${card.card_number || 'Unknown'}
Grading Company: ${card.grading_company}
Grade: ${card.grade}
Cert Number: ${card.cert_number || 'N/A'}

Search for the latest population report from ${card.grading_company}'s registry or any reputable source.

Return a JSON object:
- pop_at_grade: number of cards at this exact grade (number or null)
- pop_higher: number of cards graded higher than this grade (number or null)
- pop_total: total population graded by this company for this card (number or null)
- summary: 1-2 sentence plain English summary of the pop report (e.g. "PSA 10 Pop: 125. Higher grades (none exist). Total PSA graded: 1,847.")
- source_note: brief note about where this data comes from`,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              pop_at_grade: { type: 'number' },
              pop_higher: { type: 'number' },
              pop_total: { type: 'number' },
              summary: { type: 'string' },
              source_note: { type: 'string' },
            },
          },
        });

        const now = new Date().toISOString();
        const popReport = popData.summary
          ? `${popData.summary}${popData.source_note ? ` (${popData.source_note})` : ''} — Last updated: ${now.split('T')[0]}`
          : null;

        if (popReport) {
          await base44.asServiceRole.entities.Card.update(card.id, {
            pop_report: popReport,
            pop_report_updated: now,
          });
          updated++;
          console.log(`Updated pop report for: ${card.name} ${card.grading_company} ${card.grade}`);
        }
      } catch (err) {
        console.error(`Failed to update pop report for card ${card.id} (${card.name}):`, err.message);
        failed++;
      }
    }

    return Response.json({ success: true, updated, failed, total: gradedCards.length });
  } catch (error) {
    console.error('updatePopReports error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});