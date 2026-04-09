import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Discord public key from your application settings
// Get it from: https://discord.com/developers/applications/{CLIENT_ID}
const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");

// Validate Discord request signature
async function verifyDiscordRequest(request) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  
  if (!signature || !timestamp) {
    return false;
  }

  const body = await request.text();
  const message = timestamp + body;

  try {
    const encoder = new TextEncoder();
    const keyData = await crypto.subtle.importKey(
      "raw",
      Uint8Array.from(Buffer.from(DISCORD_PUBLIC_KEY, "hex")),
      "Ed25519",
      false,
      ["verify"]
    );

    const signatureBytes = Uint8Array.from(Buffer.from(signature, "hex"));
    const messageBytes = encoder.encode(message);

    const isValid = await crypto.subtle.verify(
      "Ed25519",
      keyData,
      signatureBytes,
      messageBytes
    );

    return { isValid, body };
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    const verified = await verifyDiscordRequest(req.clone());
    if (!verified || !verified.isValid) {
      console.warn("Invalid Discord signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const interaction = JSON.parse(verified.body);

    // Handle PING for Discord verification
    if (interaction.type === 1) {
      return new Response(JSON.stringify({ type: 1 }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Handle command interactions
    if (interaction.type === 2) {
      const commandName = interaction.data.name;
      const base44 = createClientFromRequest(req);

      if (commandName === 'help') {
        return Response.json({
          type: 4,
          data: {
            embeds: [{
              title: '🃏 Origins Bot Commands',
              description: 'Your daily trading card market intelligence, powered by Origins.',
              color: 0xd4a017,
              fields: [
                { name: '/market', value: 'Get today\'s top Buy, Hold & Sell picks with price targets', inline: false },
                { name: '/trending', value: 'View the hottest cards in the market right now', inline: false },
                { name: '/help', value: 'Show this help message', inline: false }
              ],
              footer: { text: '✨ Free daily market insights from Origins • originscard.com' }
            }]
          }
        });
      }

      if (commandName === 'market') {
        const picks = await base44.asServiceRole.entities.MarketPick.list();
        const buyPick = picks.find(p => p.pick_type === 'buy');
        const holdPick = picks.find(p => p.pick_type === 'hold');
        const sellPick = picks.find(p => p.pick_type === 'sell');

        const fields = [];
        if (buyPick) fields.push({ name: `📈 BUY — ${buyPick.card_name}`, value: `${buyPick.set_name || ''} | $${buyPick.estimated_price} → Target: $${buyPick.price_target}\n${buyPick.reasoning}`, inline: false });
        if (holdPick) fields.push({ name: `⏸️ HOLD — ${holdPick.card_name}`, value: `${holdPick.set_name || ''} | $${holdPick.estimated_price}\n${holdPick.reasoning}`, inline: false });
        if (sellPick) fields.push({ name: `📉 SELL — ${sellPick.card_name}`, value: `${sellPick.set_name || ''} | $${sellPick.estimated_price}\n${sellPick.reasoning}`, inline: false });

        return Response.json({
          type: 4,
          data: {
            embeds: [{
              title: '📊 Today\'s Market Picks',
              color: 0xd4a017,
              fields: fields.length > 0 ? fields : [{ name: 'No picks yet', value: 'Check back soon!', inline: false }],
              footer: { text: '✨ Free daily market insights from Origins' }
            }]
          }
        });
      }

      if (commandName === 'trending') {
        const trending = await base44.asServiceRole.entities.TrendingCache.list();
        const cards = trending.length > 0 ? trending[0].cards?.slice(0, 5) || [] : [];

        return Response.json({
          type: 4,
          data: {
            embeds: [{
              title: '🔥 Trending Cards Right Now',
              color: 0xff6600,
              fields: cards.length > 0
                ? cards.map((c, i) => ({
                    name: `${i + 1}. ${c.name || c.card_name}`,
                    value: c.heat_score ? `Heat Score: ${c.heat_score}` : 'Trending',
                    inline: false
                  }))
                : [{ name: 'No trending data', value: 'Check back soon!', inline: false }],
              footer: { text: '✨ Free daily market insights from Origins' }
            }]
          }
        });
      }

      return Response.json({
        type: 4,
        data: { content: `Unknown command: ${commandName}` }
      });
    }

    // Handle component interactions (buttons, selects)
    if (interaction.type === 3) {
      const customId = interaction.data.custom_id;
      console.log(`Received component interaction: ${customId}`);

      return new Response(JSON.stringify({
        type: 4,
        data: {
          content: `Button interaction '${customId}' received!`
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Unknown interaction type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Discord interaction error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});