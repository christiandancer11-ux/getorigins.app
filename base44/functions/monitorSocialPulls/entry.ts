import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This is an admin/automation function - allow service role calls
    const { monitor_all = false } = await req.json();

    // Fetch verified trader accounts and major product releases
    const majorPulls = [];
    
    const prompt = `You are a trading card market analyst monitoring social media for major card pulls from new products.

Monitor these platforms for the LAST 24 hours ONLY:
- Whatnot live streams (card opening streams)
- Twitch streams (card content creators)
- TikTok (#casebreak #cards #openingpacks)
- Instagram (card collector accounts, verified accounts only)
- X/Twitter (card accounts, news, breaking pulls)
- Fanatics Live (official product openings and partnerships)

SEARCH FOR:
1. SPORTS CARDS: Any 1/1 pulls, autographs, patch autos, or ultra-rare hits from major 2025 releases
   - Focus on: Bowman Chrome, National Treasures, Gold Label, Limited, Immaculate, Flawless
   - Products with 1/1s are most likely to impact market sentiment

2. TCG CARDS: High-value pulls and chase cards from recently released sets
   - Pokémon: Alt-art rare, Gold Star, Illustration Rare, Hyper Rare, 1st Edition from new sets
   - Magic: The Gathering: Mythic rares, Secret Lair exclusive alt-arts, chase planeswalkers
   - Yu-Gi-Oh!: Ultra Rare Ultimates, Secret Rares, high-demand staples from new sets
   - One Piece: Alternate Art Rares, Super Rares, Rare Parallel Cards
   - Lorcana: Enchanted variants, Foil Rares from new sets

VERIFICATION REQUIREMENTS:
- Account must be verified/reputable (has significant followers, consistent history)
- Engagement score = (comments + likes + reposts/retweets) must be at least 100 for validity
- Multiple confirmations across platforms preferred (same pull confirmed by 2+ sources = high confidence)
- Exclude fake/obvious scams or unverified accounts

RETURN (for each verified pull found):
{
  "product_name": "product name",
  "product_category": "sports_cards or tcg",
  "sport": "baseball/basketball/etc (sports only)",
  "tcg_type": "pokemon/magic_the_gathering/etc (TCG only)",
  "card_name": "exact name of the chase card",
  "card_type": "1/1 or autograph or patch auto (sports) OR alt-art/secret rare/etc (TCG)",
  "estimated_value": number in dollars,
  "platforms": ["platform1", "platform2"],
  "engagement_score": total combined engagement,
  "verified_accounts": ["account1", "account2"],
  "authenticity_confidence": "high/medium/low",
  "impact_analysis": "1-2 sentences on how this may affect product pricing/demand"
}

If no major pulls found in the last 24 hours, return an empty array.

Return as JSON array of pulls. ONLY include pulls from the last 24 hours that meet verification requirements.`;

    const pullData = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          pulls: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_name: { type: 'string' },
                product_category: { type: 'string' },
                sport: { type: 'string' },
                tcg_type: { type: 'string' },
                card_name: { type: 'string' },
                card_type: { type: 'string' },
                estimated_value: { type: 'number' },
                platforms: { type: 'array', items: { type: 'string' } },
                engagement_score: { type: 'number' },
                verified_accounts: { type: 'array', items: { type: 'string' } },
                authenticity_confidence: { type: 'string' },
                impact_analysis: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Check for duplicates and store verified pulls
    const existingAlerts = await base44.asServiceRole.entities.MajorPullAlert.filter({
      status: { $ne: 'duplicate' }
    });

    const newPulls = [];
    for (const pull of (Array.isArray(pullData?.pulls) ? pullData.pulls : [])) {
      // Check if this pull already exists
      const isDuplicate = existingAlerts.some(existing =>
        existing.product_name === pull.product_name &&
        existing.card_name === pull.card_name &&
        new Date(existing.created_date).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );

      if (!isDuplicate && pull.authenticity_confidence === 'high') {
        const alert = await base44.asServiceRole.entities.MajorPullAlert.create({
          product_name: pull.product_name,
          product_category: pull.product_category,
          sport: pull.sport || null,
          tcg_type: pull.tcg_type || null,
          card_name: pull.card_name,
          card_type: pull.card_type,
          estimated_value: pull.estimated_value,
          social_platforms: pull.platforms || [],
          engagement_score: pull.engagement_score,
          source_url: '', // LLM doesn't always provide URL, would need refinement
          verified: true,
          impact_on_market: pull.impact_analysis,
          status: 'active'
        });
        newPulls.push(alert);
      }
    }

    console.log(`Found ${newPulls.length} new major pulls to alert users about`);

    // Notify users with matching preferences
    for (const pull of newPulls) {
      // Find users interested in this category
      let matchingUsers = [];

      if (pull.product_category === 'sports_cards') {
        matchingUsers = await base44.asServiceRole.entities.UserPullAlertPreference.filter({
          enabled: true,
          notify_sports: true,
          sports_categories: { $in: [pull.sport] }
        });
      } else {
        matchingUsers = await base44.asServiceRole.entities.UserPullAlertPreference.filter({
          enabled: true,
          notify_tcg: true,
          tcg_types: { $in: [pull.tcg_type] }
        });
      }

      // Filter by minimum value
      matchingUsers = matchingUsers.filter(pref => 
        pull.estimated_value >= (pref.min_value || 100)
      );

      // Send notifications
      for (const userPref of matchingUsers) {
        try {
          // Send email if enabled
          if (userPref.notify_email) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: userPref.user_email,
              subject: `🔥 Major Pull Alert: ${pull.card_name} from ${pull.product_name}`,
              body: `A collector just pulled ${pull.card_name} from ${pull.product_name}!\n\nEstimated Value: $${pull.estimated_value}\nVerified on: ${pull.social_platforms.join(', ')}\n\nImpact: ${pull.impact_on_market}\n\nThis might affect product pricing and availability.`
            });
          }

          // Increment alerts sent counter
          await base44.asServiceRole.entities.MajorPullAlert.update(pull.id, {
            alerts_sent: (pull.alerts_sent || 0) + 1
          });
        } catch (e) {
          console.error(`Failed to notify ${userPref.user_email}:`, e.message);
        }
      }
    }

    return Response.json({
      pulls_found: newPulls.length,
      alerts_sent: newPulls.reduce((sum, p) => sum + (p.alerts_sent || 0), 0)
    });

  } catch (error) {
    console.error('monitorSocialPulls error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});