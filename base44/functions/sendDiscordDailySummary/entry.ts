import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Fetch top 5 Buy/Hold/Sell picks
    const picks = await base44.asServiceRole.entities.MarketPick.list();
    const buyPicks = picks.filter(p => p.pick_type === 'buy').slice(0, 5);
    const holdPicks = picks.filter(p => p.pick_type === 'hold').slice(0, 5);
    const sellPicks = picks.filter(p => p.pick_type === 'sell').slice(0, 5);

    // Fetch trending cards from cache
    const trending = await base44.asServiceRole.entities.TrendingCache.list();
    const trendingCards = trending.length > 0 ? trending[0].cards?.slice(0, 5) || [] : [];

    // Format embeds for Discord
    const embeds = [
      {
        title: '📈 Buy Picks',
        description: 'Top cards to buy right now',
        color: 0x00ff00,
        fields: buyPicks.map((p, i) => ({
          name: `${i + 1}. ${p.card_name} (${p.set_name})`,
          value: `💰 $${p.estimated_price} | Target: $${p.price_target}`,
          inline: false
        }))
      },
      {
        title: '⏸️ Hold Picks',
        description: 'Cards worth holding',
        color: 0xffff00,
        fields: holdPicks.map((p, i) => ({
          name: `${i + 1}. ${p.card_name} (${p.set_name})`,
          value: `💰 $${p.estimated_price}`,
          inline: false
        }))
      },
      {
        title: '📉 Sell Picks',
        description: 'Top cards to sell',
        color: 0xff0000,
        fields: sellPicks.map((p, i) => ({
          name: `${i + 1}. ${p.card_name} (${p.set_name})`,
          value: `💰 $${p.estimated_price}`,
          inline: false
        }))
      },
      {
        title: '🔥 Trending Now',
        description: 'Hottest cards today',
        color: 0xff8800,
        fields: trendingCards.slice(0, 5).map((c, i) => ({
          name: `${i + 1}. ${c.name || c.card_name}`,
          value: c.heat_score ? `Heat Score: ${c.heat_score}` : 'Trending',
          inline: false
        }))
      }
    ];

    // Get all active webhooks
    const webhooks = await base44.asServiceRole.entities.DiscordWebhook.filter({
      is_active: true
    });

    let successCount = 0;
    let failureCount = 0;

    // Send to each webhook
    for (const webhook of webhooks) {
      const response = await fetch(webhook.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'Origins Daily Update',
          embeds: embeds.map(e => ({ ...e, fields: e.fields.slice(0, 5) }))
        })
      });

      if (response.ok) {
        // Update last_posted
        await base44.asServiceRole.entities.DiscordWebhook.update(webhook.id, {
          last_posted: new Date().toISOString()
        });
        successCount++;
      } else {
        console.error(`Failed to post to webhook ${webhook.id}:`, response.status);
        failureCount++;
      }
    }

    return Response.json({
      success: true,
      posted: successCount,
      failed: failureCount,
      total_webhooks: webhooks.length
    });
  } catch (error) {
    console.error('Discord summary error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});