import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// In-memory rate limit store
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

    // Rate limit: 10 registrations per user per hour
    const rl = checkRateLimit(`registerCardAI:${user.email}`, 10, 60 * 60 * 1000);
    if (!rl.allowed) {
      return Response.json({ error: `Too many card registrations. Please wait ${rl.retryAfterSec} seconds before trying again.` }, { status: 429 });
    }

    const { front_url, back_url } = await req.json();
    if (!front_url) return Response.json({ error: 'front_url required' }, { status: 400 });
    if (typeof front_url !== 'string' || front_url.length > 2000) return Response.json({ error: 'Invalid front image URL.' }, { status: 400 });
    if (back_url && (typeof back_url !== 'string' || back_url.length > 2000)) return Response.json({ error: 'Invalid back image URL.' }, { status: 400 });

    const fileUrls = [front_url];
    if (back_url) fileUrls.push(back_url);

    // Step 1: Validate that images are actually trading cards / graded slabs
    const validation = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content moderation and trading card expert. Analyze the uploaded image(s) and determine if they show a trading card or a graded slab from a grading company (PSA, BGS, SGC, CGC, HGA, etc.).

Return a JSON object:
- is_valid_card: true if the image clearly shows a trading card (sports card, TCG card) or a graded slab — false for anything else (people, nature, obscene content, documents, food, etc.)
- rejection_reason: if is_valid_card is false, briefly explain why (e.g. "Image does not appear to be a trading card"). null if valid.`,
      file_urls: fileUrls,
      response_json_schema: {
        type: 'object',
        properties: {
          is_valid_card: { type: 'boolean' },
          rejection_reason: { type: 'string' },
        },
      },
    });

    console.log('Validation result:', JSON.stringify(validation));

    if (!validation.is_valid_card) {
      return Response.json({
        error: validation.rejection_reason || 'Image does not appear to be a trading card or graded slab. Please upload a clear photo of your card.',
        validation_failed: true,
      });
    }

    // Step 2: Full AI identification — including grading info
    const identification = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert sports card and TCG card identifier and grading specialist. Analyze the provided card image(s) (front${back_url ? ' and back' : ''}).

Extract ALL information visible. If this is a graded slab, read ALL label information very carefully.

Return a JSON object:
- name: Player name or card title (string — required)
- set_name: Set or collection name (string or null)
- sport: one of: baseball, basketball, football, hockey, soccer, golf, ufc, wwe, f1, pokemon, magic_the_gathering, yugioh, other
- year: 4-digit year (string or null)
- card_number: card number with # prefix if visible (string or null)
- description: 1-2 sentence description of this card including any notable features (string)
- grading_company: grading company name if graded slab (e.g. "PSA", "BGS", "SGC", "CGC", "HGA") — null if raw
- grade: numeric grade if graded (e.g. "10", "9.5", "9") — null if raw
- cert_number: exact certification/serial number from the slab label — null if not graded
- rarity: one of: common, uncommon, rare, ultra_rare, legendary, 1_of_1 — or null if unclear
- confidence: "high", "medium", or "low"`,
      file_urls: fileUrls,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          set_name: { type: 'string' },
          sport: { type: 'string' },
          year: { type: 'string' },
          card_number: { type: 'string' },
          description: { type: 'string' },
          grading_company: { type: 'string' },
          grade: { type: 'string' },
          cert_number: { type: 'string' },
          rarity: { type: 'string' },
          confidence: { type: 'string' },
        },
      },
    });

    console.log('Identification result:', JSON.stringify(identification));

    // Step 3: If graded with a cert number, try to find official grading company images
    let grading_images = null;
    const isGraded = !!(identification.grading_company && identification.cert_number);

    if (isGraded) {
      try {
        const imgLookup = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a trading card grading expert. Look up the certification number "${identification.cert_number}" on the ${identification.grading_company} registry website.

For PSA: check psacard.com/cert/${identification.cert_number}
For BGS/Beckett: check beckett.com
For SGC: check gosgc.com
For CGC: check cgccards.com

Return a JSON object:
- front_image_url: the direct URL to the front card image from the grading company's registry (string or null)
- back_image_url: the direct URL to the back card image from the grading company's registry (string or null)
- registry_url: the URL of the cert lookup page (string or null)
- found: true if you found a valid registry entry with images, false otherwise`,
          add_context_from_internet: true,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              front_image_url: { type: 'string' },
              back_image_url: { type: 'string' },
              registry_url: { type: 'string' },
              found: { type: 'boolean' },
            },
          },
        });

        if (imgLookup.found && imgLookup.front_image_url) {
          grading_images = imgLookup;
          console.log('Grading images found:', JSON.stringify(imgLookup));
        }
      } catch (e) {
        console.warn('Could not fetch grading images:', e.message);
      }
    }

    return Response.json({
      identification,
      grading_images,
      is_graded: isGraded,
    });

  } catch (error) {
    console.error('registerCardAI error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});