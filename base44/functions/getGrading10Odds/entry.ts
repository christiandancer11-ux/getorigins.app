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
    ? `Focus ONLY on: ${sport}`
    : 'Cover: baseball, basketball, football, hockey, soccer, pokemon, magic_the_gathering, yugioh — pick the best 1-2 cards per sport/TCG that fit the criteria.';

  const prompt = `You are a Beckett (BGS) grading expert. The BGS Black Label Pristine 10 is the rarest, most prestigious grade in the hobby — awarded ONLY when all four subgrades (centering, corners, edges, surface) score a perfect 10.

Task: Find the TOP 10 cards that have the BEST realistic chance of receiving a BGS Black Label Pristine 10 when submitted today.

${sportLine}

Selection criteria:
- Cards known for exceptional print/manufacturing quality that produces near-perfect centering, sharp corners, clean edges, and flawless surfaces
- Cards with documented BGS Black Label pops (even if very small — 1 or more confirmed Black Labels exist)
- Cards worth submitting for Black Label (raw value must be meaningful enough to justify premium grading cost)
- Prefer cards from modern print runs with consistent quality OR vintage cards known for specific clean printings
- Black Label rate will naturally be VERY low (1–10% of all BGS submissions) — that's expected and realistic

For each card return exactly:
- card_name: player name or card title
- set_name: the specific set or collection
- year: year as string
- sport_or_tcg: one of baseball/basketball/football/hockey/soccer/pokemon/magic_the_gathering/yugioh/other
- grading_company: "BGS Black Label"
- perfect_10_rate_pct: estimated % chance of receiving a Black Label specifically (1-10, be realistic)
- total_submissions_3mo: estimated BGS submissions for this card in last 3 months
- current_raw_value: approximate raw/ungraded value in USD
- graded_10_value: approximate BGS Black Label Pristine 10 market value in USD
- value_increase_pct: ((graded_10_value - current_raw_value) / current_raw_value) * 100
- why_grades_well: 1 sentence on WHY this specific card is known to produce Black Labels (print quality, era, etc.)
- notes: the single most important thing to check before submitting for Black Label (e.g. "Centering must be 50/50 front and back", "Look for surface scratches under UV light")

Return exactly 10 cards. Do NOT return empty arrays.`;

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