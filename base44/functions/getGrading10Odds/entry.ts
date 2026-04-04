import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

const CARD_SCHEMA = {
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
};

async function queryCompany(base44, company, sport) {
  const sportLine = sport && sport !== 'all'
    ? `Focus ONLY on: ${sport}`
    : 'Cover: baseball, basketball, football, hockey, soccer, pokemon, magic_the_gathering, yugioh — pick the 2-3 best cards per sport/TCG that fit the criteria.';

  const prompt = `You are a trading card grading expert with deep knowledge of ${company}'s population report data.

Task: Find the TOP 10 cards most likely to receive a PERFECT 10 grade when submitted to ${company} right now.

${sportLine}

Selection criteria:
- Cards that historically receive a "${company === 'BGS' ? 'BGS 10 (Pristine or Black Label)' : company + ' 10'}" grade at a HIGH rate — approximately 80–95% of qualifying submissions
- Cards with SIGNIFICANT recent submission volume in the last 3 months (most-submitted = most popular/valuable to grade)
- Cards where getting a 10 meaningfully INCREASES the value over raw

For each card return exactly:
- card_name: player name or card title
- set_name: the specific set or collection (be specific, e.g. "1986-87 Fleer" not just "Fleer")
- year: year as string
- sport_or_tcg: one of baseball/basketball/football/hockey/soccer/pokemon/magic_the_gathering/yugioh/other
- grading_company: "${company}"
- perfect_10_rate_pct: your best estimate of the % of submissions that grade a 10 (must be 80-95)
- total_submissions_3mo: your best estimate of submissions to ${company} in the last 3 months
- current_raw_value: approximate raw/ungraded market value in USD
- graded_10_value: approximate ${company} 10 market value in USD
- value_increase_pct: ((graded_10_value - current_raw_value) / current_raw_value) * 100
- why_grades_well: 1 sentence on print quality, era, surface characteristics etc.
- notes: 1 short tip for submitting (e.g. centering, corners to check)

Return exactly 10 cards. Use your best knowledge of ${company} pop report trends. Do NOT return empty arrays.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        cards: { type: 'array', items: CARD_SCHEMA },
      },
    },
  });

  return (result?.cards || []).map(c => ({ ...c, grading_company: company }));
}

async function queryBGSBlackLabel(base44, sport) {
  const sportLine = sport && sport !== 'all'
    ? `Focus ONLY on the sport/TCG: ${sport}`
    : 'Cover a mix of sports and TCGs: baseball, basketball, football, hockey, pokemon, magic_the_gathering — pick the best 1-2 cards per category.';

  const prompt = `You are a Beckett Grading Services (BGS) population report expert. Search the ACTUAL BGS population report at beckett.com/pop to find real data.

Task: Find the TOP 10 cards with the HIGHEST documented BGS Black Label Pristine 10 population counts — meaning cards where Beckett has actually awarded the most Black Labels relative to total submissions.

CRITICAL — BGS DATA ONLY:
- Use ONLY Beckett (BGS) population report data. Do NOT reference PSA, SGC, CGC, or any other grading company.
- Black Label = BGS Pristine 10 where ALL four subgrades (centering, corners, edges, surface) are each a perfect 10.
- Look up beckett.com/pop for real Black Label population numbers.
- Rank by: (Black Label pop count / total BGS submissions) — highest ratio wins.

${sportLine}

For each card return exactly:
- card_name: player name or card title
- set_name: the specific set or collection (e.g. "1986-87 Fleer" not just "Fleer")
- year: year as string
- sport_or_tcg: one of baseball/basketball/football/hockey/soccer/pokemon/magic_the_gathering/yugioh/other
- grading_company: "BGS Black Label"
- perfect_10_rate_pct: the realistic BGS Black Label rate as a % of total BGS submissions for this card (1-15, based on actual pop data)
- total_submissions_3mo: estimated recent BGS submission volume for this card
- current_raw_value: approximate raw/ungraded market value in USD
- graded_10_value: approximate BGS Black Label Pristine 10 market value in USD (check recent eBay sales of BGS Black Label copies)
- value_increase_pct: ((graded_10_value - current_raw_value) / current_raw_value) * 100
- why_grades_well: cite the specific print/manufacturing reason this card earns Black Labels (centering consistency, surface quality, etc.)
- notes: the single most critical thing a submitter must verify before sending for Black Label consideration

Return exactly 10 cards ranked best-to-worst Black Label odds. Do NOT return empty arrays. BGS data ONLY.`;

  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    model: 'gemini_3_flash',
    response_json_schema: {
      type: 'object',
      properties: {
        cards: { type: 'array', items: CARD_SCHEMA },
      },
    },
  });

  return (result?.cards || []).map(c => ({ ...c, grading_company: 'BGS Black Label' }));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const rl = checkRateLimit(`getGrading10Odds:${user.email}`, 8, 60 * 60 * 1000);
    if (!rl.allowed) {
      return Response.json({ error: `Too many requests. Please wait ${rl.retryAfterSec} seconds.` }, { status: 429 });
    }

    const body = await req.json();
    const sport = body?.sport || 'all';

    // Run all 4 grading companies + BGS Black Label in parallel
    const [psaCards, bgsCards, sgcCards, cgcCards, blackLabelCards] = await Promise.all([
      queryCompany(base44, 'PSA', sport),
      queryCompany(base44, 'BGS', sport),
      queryCompany(base44, 'SGC', sport),
      queryCompany(base44, 'CGC', sport),
      queryBGSBlackLabel(base44, sport),
    ]);

    const allCards = [...psaCards, ...bgsCards, ...sgcCards, ...cgcCards, ...blackLabelCards];
    console.log('getGrading10Odds done. Cards:', allCards.length, 'PSA:', psaCards.length, 'BGS:', bgsCards.length, 'SGC:', sgcCards.length, 'CGC:', cgcCards.length, 'BGS Black Label:', blackLabelCards.length);

    return Response.json({
      cards: allCards,
      generated_at: new Date().toISOString(),
      sport_filter: sport,
      methodology_note: 'Cards selected based on high PSA/BGS/SGC/CGC population report grade-10 rates (80-95%) and recent submission volume. Values are market estimates.',
    });
  } catch (error) {
    console.error('getGrading10Odds error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});