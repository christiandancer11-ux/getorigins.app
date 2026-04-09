import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");

async function verifyDiscordRequest(request) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  if (!signature || !timestamp) return false;

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
    const isValid = await crypto.subtle.verify(
      "Ed25519",
      keyData,
      Uint8Array.from(Buffer.from(signature, "hex")),
      encoder.encode(message)
    );
    return { isValid, body };
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

async function followUp(applicationId, token, data) {
  await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${token}/messages/@original`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

async function handleCommand(interaction, base44) {
  const commandName = interaction.data.name;
  const guildId = interaction.guild_id;
  const channelId = interaction.channel_id;
  const applicationId = interaction.application_id;
  const token = interaction.token;

  // /setchannel — admin only
  if (commandName === 'setchannel') {
    const memberPermissions = BigInt(interaction.member?.permissions || '0');
    if (!(memberPermissions & BigInt(0x8))) {
      await followUp(applicationId, token, { content: '❌ Only server administrators can use this command.' });
      return;
    }
    const channelOption = interaction.data.options?.find(o => o.name === 'channel');
    const targetChannelId = channelOption?.value || channelId;
    const targetChannelName = `<#${targetChannelId}>`;

    const existing = await base44.asServiceRole.entities.DiscordGuildConfig.filter({ guild_id: guildId });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.DiscordGuildConfig.update(existing[0].id, {
        allowed_channel_id: targetChannelId,
        allowed_channel_name: targetChannelName
      });
    } else {
      await base44.asServiceRole.entities.DiscordGuildConfig.create({
        guild_id: guildId,
        allowed_channel_id: targetChannelId,
        allowed_channel_name: targetChannelName
      });
    }
    await followUp(applicationId, token, { content: `✅ Origins bot commands are now restricted to ${targetChannelName}.` });
    return;
  }

  // /clearchannel — admin only
  if (commandName === 'clearchannel') {
    const memberPermissions = BigInt(interaction.member?.permissions || '0');
    if (!(memberPermissions & BigInt(0x8))) {
      await followUp(applicationId, token, { content: '❌ Only server administrators can use this command.' });
      return;
    }
    const existing = await base44.asServiceRole.entities.DiscordGuildConfig.filter({ guild_id: guildId });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.DiscordGuildConfig.update(existing[0].id, {
        allowed_channel_id: '',
        allowed_channel_name: ''
      });
    }
    await followUp(applicationId, token, { content: '✅ Channel restriction removed. Bot commands now work in all channels.' });
    return;
  }

  // For all other commands — check channel restriction in parallel with data fetch
  const configPromise = guildId
    ? base44.asServiceRole.entities.DiscordGuildConfig.filter({ guild_id: guildId })
    : Promise.resolve([]);

  if (commandName === 'help') {
    const [configs] = await Promise.all([configPromise]);
    const config = configs[0];
    if (config?.allowed_channel_id && config.allowed_channel_id !== channelId) {
      await followUp(applicationId, token, { content: `⚠️ Origins commands are only allowed in <#${config.allowed_channel_id}>.` });
      return;
    }
    await followUp(applicationId, token, {
      embeds: [{
        title: '🃏 Origins Bot Commands',
        description: 'Your daily trading card market intelligence, powered by Origins.',
        color: 0xd4a017,
        fields: [
          { name: '/market', value: "Get today's top Buy, Hold & Sell picks with price targets", inline: false },
          { name: '/trending', value: 'View the hottest cards in the market right now', inline: false },
          { name: '/help', value: 'Show this help message', inline: false },
          { name: '/setchannel [channel]', value: 'Admins only: restrict bot to a specific channel', inline: false },
          { name: '/clearchannel', value: 'Admins only: remove channel restriction', inline: false }
        ],
        footer: { text: '✨ Free daily market insights from Origins • originscard.com' }
      }]
    });
    return;
  }

  if (commandName === 'market') {
    const [configs, picks] = await Promise.all([
      configPromise,
      base44.asServiceRole.entities.MarketPick.list()
    ]);
    const config = configs[0];
    if (config?.allowed_channel_id && config.allowed_channel_id !== channelId) {
      await followUp(applicationId, token, { content: `⚠️ Origins commands are only allowed in <#${config.allowed_channel_id}>.` });
      return;
    }

    const buyPick = picks.find(p => p.pick_type === 'buy');
    const holdPick = picks.find(p => p.pick_type === 'hold');
    const sellPick = picks.find(p => p.pick_type === 'sell');
    const fields = [];
    if (buyPick) fields.push({ name: `📈 BUY — ${buyPick.card_name}`, value: `${buyPick.set_name || ''} | $${buyPick.estimated_price} → Target: $${buyPick.price_target}\n${buyPick.reasoning}`, inline: false });
    if (holdPick) fields.push({ name: `⏸️ HOLD — ${holdPick.card_name}`, value: `${holdPick.set_name || ''} | $${holdPick.estimated_price}\n${holdPick.reasoning}`, inline: false });
    if (sellPick) fields.push({ name: `📉 SELL — ${sellPick.card_name}`, value: `${sellPick.set_name || ''} | $${sellPick.estimated_price}\n${sellPick.reasoning}`, inline: false });

    await followUp(applicationId, token, {
      embeds: [{
        title: "📊 Today's Market Picks",
        color: 0xd4a017,
        fields: fields.length > 0 ? fields : [{ name: 'No picks yet', value: 'Check back soon!', inline: false }],
        footer: { text: '✨ Free daily market insights from Origins' }
      }]
    });
    return;
  }

  if (commandName === 'trending') {
    const [configs, trending] = await Promise.all([
      configPromise,
      base44.asServiceRole.entities.TrendingCache.list()
    ]);
    const config = configs[0];
    if (config?.allowed_channel_id && config.allowed_channel_id !== channelId) {
      await followUp(applicationId, token, { content: `⚠️ Origins commands are only allowed in <#${config.allowed_channel_id}>.` });
      return;
    }

    const cards = trending.length > 0 ? trending[0].cards?.slice(0, 5) || [] : [];
    await followUp(applicationId, token, {
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
    });
    return;
  }

  await followUp(applicationId, token, { content: `Unknown command: ${commandName}` });
}

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const verified = await verifyDiscordRequest(req.clone());
    if (!verified || !verified.isValid) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
    }

    const interaction = JSON.parse(verified.body);

    // PING
    if (interaction.type === 1) {
      return Response.json({ type: 1 });
    }

    // Slash commands — respond with deferred immediately, process in background
    if (interaction.type === 2) {
      const base44 = createClientFromRequest(req);
      // Fire and forget — runs after response is sent
      handleCommand(interaction, base44).catch(e => console.error("Command error:", e));
      // Return deferred response immediately (satisfies Discord's 3s timeout)
      return Response.json({ type: 5 });
    }

    return new Response(JSON.stringify({ error: "Unknown interaction type" }), { status: 400 });
  } catch (error) {
    console.error("Discord interaction error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});