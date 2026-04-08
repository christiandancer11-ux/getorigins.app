import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { createHash } from 'node:crypto';

// In-memory cache for grading analysis
const gradingCache = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription
    if (user.role !== 'admin') {
      const subs = await base44.asServiceRole.entities.UserSubscription.filter({ user_email: user.email });
      const activeSub = subs.find(s => s.status === 'active');
      if (!activeSub || !['pro', 'expert'].includes(activeSub.plan)) {
        return Response.json({ error: 'Pro subscription required for AI grading' }, { status: 403 });
      }
    }

    const { imageUrls, step, stepId, cardType, analysisMode } = await req.json();

    if (!imageUrls || imageUrls.length === 0) {
      return Response.json({ error: 'No images provided' }, { status: 400 });
    }

    // Check cache (except final step which is aggregation)
    if (step !== 'final') {
      const cacheKey = createHash('md5').update(imageUrls.join('|') + '_' + step).digest('hex');
      const now = Date.now();
      if (gradingCache.has(cacheKey)) {
        const cached = gradingCache.get(cacheKey);
        if (now - cached.timestamp < 7 * 24 * 60 * 60 * 1000) { // 7d cache
          console.log('Cache hit for grading step:', step);
          return Response.json(cached.data);
        }
      }
    }

    let prompt = '';
    const isTCG = cardType === 'tcg';
    const cardTypeLabel = isTCG ? 'TCG card (Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece, etc.)' : 'sports trading card (baseball, basketball, football, hockey, etc.)';

    if (step === 'centering') {
      const side = stepId === 'back' ? 'back' : 'front';
      prompt = `You are an expert card grading analyst trained on thousands of PSA, BGS, SGC, CGC, and TAG graded cards — both sports cards and TCG cards (Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece, Lorcana, etc.).

The card being analyzed is a ${cardTypeLabel}. This is an image of the card ${side}.

Analyze the centering of this card image carefully AND also note any visible surface or corner condition issues you can see from this full card photo.

Evaluate:
1. Left-to-right centering ratio (e.g. 55/45, 60/40, 70/30)
2. Top-to-bottom centering ratio
3. Whether the centering meets standards for top grades
4. Any surface issues visible (scratches, scuffs, holo damage)
5. Corner condition visible from this angle

Centering standards:
- PSA 10: 55/45 or better on all sides (applies to both sports and TCG)
- BGS 10 Black Label: 50/50 on all sides
- SGC 10: approximately 55/45 or better
- CGC 10 (TCG): 55/45 or better — CGC primarily grades TCG cards
- TAG 10 (TCG): very strict, near-perfect centering required

Respond in JSON with:
{
  "side": "${side}",
  "lr_ratio": "55/45",
  "tb_ratio": "50/50",
  "centering_score": 8.5,
  "centering_notes": "brief explanation",
  "psa_centering_ok": true,
  "bgs_black_label_ok": false,
  "visible_surface_notes": "any surface or corner observations from this full card view",
  "overall_condition_impression": "brief general condition notes"
}`;
    } else if (step === 'surface') {
      prompt = `You are an expert card grading analyst trained on thousands of PSA, BGS, SGC, CGC, and TAG graded cards — both sports cards and TCG cards.

The card being analyzed is a ${cardTypeLabel}.

Analyze this surface inspection media (photo or video still) for surface defects. The user has tilted the card under light to reveal any issues on the front and/or back surface.

Evaluate:
1. Scratches (none / minor / moderate / major)
2. Print defects or print lines
3. Stains or smudges
4. Holo or foil surface integrity — IMPORTANT for TCG cards (Pokémon holos, Magic foils, etc.): check for holo scratches, foil peeling, swirl patterns, or silvering
5. Loss of gloss or surface texture issues
6. Any back surface issues visible
7. Overall surface grade impact

Respond in JSON with:
{
  "scratches": "none|minor|moderate|major",
  "print_defects": "none|minor|moderate|major",
  "stains": "none|minor|moderate|major",
  "holo_issues": "none|minor|moderate|major",
  "surface_score": 9.0,
  "surface_notes": "brief explanation of what you see, including any holo/foil observations"
}`;
    } else if (step === 'corners') {
      // Determine which corner this is (for in-depth mode individual corner shots)
      const cornerLabel = (() => {
        if (stepId === 'corner_tl') return 'top-left';
        if (stepId === 'corner_tr') return 'top-right';
        if (stepId === 'corner_bl') return 'bottom-left';
        if (stepId === 'corner_br') return 'bottom-right';
        return 'all four corners'; // quick mode fallback
      })();
      const isSingleCorner = stepId && stepId.startsWith('corner_');

      prompt = `You are an expert card grading analyst trained on thousands of PSA, BGS, SGC, CGC, and TAG graded cards — both sports cards and TCG cards.

The card being analyzed is a ${cardTypeLabel}.

Analyze ${isSingleCorner ? `the ${cornerLabel} corner` : 'all four corners'} of this card in close-up detail.

Evaluate corner condition:
- Sharp and perfect (10)
- Slight wear or fraying (8-9)
- Moderate wear (6-7)
- Heavy wear (below 6)

Note: TCG cards (especially Pokémon) are often more prone to corner whitening on dark-bordered cards. Sports cards with white borders may show different wear patterns. Account for card type when evaluating.

PSA 10 / CGC 10 / SGC 10 / BGS 10: All corners sharp with no visible wear
PSA 9 / CGC 9: Corners show slight wear at one or two points only

Respond in JSON with:
{
  "corner_analyzed": "${cornerLabel}",
  ${isSingleCorner ? `"condition": "sharp|slight_wear|moderate_wear|heavy_wear",
  "corner_score": 9.5,` : `"top_left": "sharp|slight_wear|moderate_wear|heavy_wear",
  "top_right": "sharp|slight_wear|moderate_wear|heavy_wear",
  "bottom_left": "sharp|slight_wear|moderate_wear|heavy_wear",
  "bottom_right": "sharp|slight_wear|moderate_wear|heavy_wear",
  "corners_score": 9.5,`}
  "corners_notes": "brief explanation of what you see, note if corner whitening is present for dark-bordered TCG cards"
}`;
    } else if (step === 'final') {
      const analysisData = imageUrls[0];
      const modeContext = analysisMode === 'quick'
        ? 'This was a Quick Analysis using only front and back card photos.'
        : 'This was an In-Depth Analysis using front, back, individual corner close-ups, and a surface inspection video.';

      prompt = `You are an expert card grading analyst with deep knowledge of PSA, BGS, SGC, CGC, and TAG grading standards for both sports cards and TCG cards (Pokémon, Magic: The Gathering, Yu-Gi-Oh!, One Piece, Lorcana, etc.).

${modeContext}

Based on the following analysis data collected from examining this ${cardTypeLabel}:

${analysisData}

Provide your expert grading opinion. Be honest and realistic — grade inflation helps no one.${analysisMode === 'quick' ? ' Note: since this is a quick analysis from only 2 photos, express appropriate uncertainty in your confidence ratings.' : ''}

Important context:
- PSA grades all card types (sports + TCG). Very popular for Pokémon and sports.
- BGS (Beckett) grades both sports and TCG with subgrades.
- SGC grades primarily sports cards but also some TCG.
- CGC grades primarily TCG cards (Pokémon, MTG, Yu-Gi-Oh!, etc.) — very relevant for TCG collectors.
- TAG is an emerging TCG-focused grader.

Consider the combined impact of centering, surface (including holo/foil), and corner wear on the final grade.

Respond in JSON with:
{
  "psa_grade": 9,
  "psa_confidence": "high|medium|low",
  "psa_notes": "explanation",
  "bgs_grade": 8.5,
  "bgs_subgrades": {
    "centering": 9.0,
    "corners": 8.5,
    "edges": 9.0,
    "surface": 8.5
  },
  "bgs_confidence": "high|medium|low",
  "bgs_notes": "explanation",
  "sgc_grade": 9,
  "sgc_confidence": "high|medium|low",
  "sgc_notes": "explanation",
  "cgc_grade": 9,
  "cgc_confidence": "high|medium|low",
  "cgc_notes": "explanation (note: CGC is most relevant for TCG cards)",
  "overall_assessment": "2-3 sentence honest summary of the card's condition and grading outlook, accounting for card type and analysis depth",
  "recommendation": "submit|raw_ok|not_worth_grading"
}`;
    } else {
      return Response.json({ error: 'Invalid step' }, { status: 400 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: step === 'final' ? [] : imageUrls,
      response_json_schema: { type: 'object' },
      model: 'gpt_5', // Vision-capable model required for image analysis
    });

    // Cache result (except final step)
    if (step !== 'final') {
      const cacheKey = createHash('md5').update(imageUrls.join('|') + '_' + step).digest('hex');
      const cacheTime = Date.now();
      gradingCache.set(cacheKey, { data: { result }, timestamp: cacheTime });
    }

    return Response.json({ result });
  } catch (error) {
    console.error('AI Card Grading error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});