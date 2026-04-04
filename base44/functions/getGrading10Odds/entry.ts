import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// In-memory rate limit
const rateLimitStore = new Map();
function checkRateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return { allowed: true };
  }
  if (entry.count >= maxRequests) {
    const retryAfterSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    return { allowed: false, retryAfterSec };
  }
  entry.count += 1;
  return { allowed: true };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit: 5 requests per hour (very expensive multi-source AI call)
    const rl = checkRateLimit(`getGrading10Odds:${user.email}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return Response.json({ error: `Too many requests. Please wait ${rl.retryAfterSec} seconds.` }, { status: 429 });
    }

    const { sport } = await req.json();
    const sportFilter = sport || 'all';

    const prompt = `You are an expert trading card grading analyst. Your task is to find the TOP 10 cards per category that have the BEST odds of receiving a PERFECT 10 grade when submitted to major grading companies.

RESEARCH METHODOLOGY — follow exactly:

1. Look at PSA, BGS, SGC, and CGC population reports from the LAST 3 MONTHS.
2. For each grading company, find cards that have been submitted in HIGH VOLUME (indicating popular submission targets).
3. Calculate the approximate percentage of submissions that received a "10" (PSA 10, BGS 10 Black Label/Pristine, SGC 10, CGC 10).
4. ONLY include cards where the "perfect 10" rate is between 80% and 95% — these are cards that:
   - Are frequently submitted because collectors know they grade well
   - Have high enough production quality to receive 10s consistently
   - Are NOT so easy to get a 10 that the grade has no premium value
5. After filtering to 80-95% range, rank by TOTAL SUBMISSION VOLUME (most submitted = most popular/valuable to grade).
6. Return the top 10 per grading company per category.

${sportFilter !== 'all' ? `Focus on: ${sportFilter}` : 'Cover ALL categories: baseball, basketball, football, hockey, soccer, pokemon, magic_the_gathering, yugioh'}

For each card entry return:
- card_name: player name or card title
- set_name: set or collection
- year: year (string)
- sport_or_tcg: category
- grading_company: "PSA" | "BGS" | "SGC" | "CGC"
- perfect_10_rate_pct: estimated percentage of submissions that received a 10 (number, 80-95 range)
- total_submissions_3mo: approximate number submitted in last 3 months (number)
- current_raw_value: approximate raw card value in USD (number)
- graded_10_value: approximate value IF graded a 10 in USD (number)
- value_increase_pct: percentage value increase from raw to graded 10 (number)
- why_grades_well: 1 sentence on why this card consistently grades well (print quality, production era, etc.)
- notes: any relevant notes (e.g. "Centering is key", "Watch for print lines")

Return the data organized with all results in a flat array. Sort within each company/sport group by total_submissions_3mo descending, then by perfect_10_rate_pct descending.

Use REAL population report data only. If you cannot verify a card's pop data, exclude it.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          cards: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                card_name: { type: 'string' },
                set_name: { type: 'string' },
                year: { type: 'string' },
                sport_or_tcg: { type: 'string' },
                grading_company: { type: 'string' },
                perfect_10_rate_pct: { type: 'number' },
                total_submissions_3mo: { type: 'number' },
                current_raw_value: { type: 'number' },
                graded_10_value: { type: 'number' },
                value_increase_pct: { type: 'number' },
                why_grades_well: { type: 'string' },
                notes: { type: 'string' },
              },
            },
          },
          methodology_note: { type: 'string' },
        },
      },
    });

    console.log('getGrading10Odds completed, found:', result?.cards?.length, 'cards');
    return Response.json({ ...result, generated_at: new Date().toISOString(), sport_filter: sportFilter });
  } catch (error) {
    console.error('getGrading10Odds error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});