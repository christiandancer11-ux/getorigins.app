import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");

function hexToUint8Array(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

async function verifyDiscordRequest(signature, timestamp, rawBody) {
  if (!signature || !timestamp) return false;
  try {
    const keyData = await crypto.subtle.importKey(
      "raw",
      hexToUint8Array(DISCORD_PUBLIC_KEY),
      "Ed25519",
      false,
      ["verify"]
    );
    return await crypto.subtle.verify(
      "Ed25519",
      keyData,
      hexToUint8Array(signature),
      new TextEncoder().encode(timestamp + rawBody)
    );
  } catch (e) {
    console.error("Verification error:", e);
    return false;
  }
}

async function followUp(applicationId, token, data) {
  const res = await fetch(`https://discord.com/api/v10/webhooks/${applicationId}/${token}/messages/@original`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    console.error("followUp failed:", await res.text());
  }
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

    const existing = await base44.asServiceRole.entities.DiscordGuildConfig.filter({ guild_id: guildId });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.DiscordGuildConfig.update(existing[0].id, {
        allowed_channel_id: targetChannelId,
        allowed_channel_name: `<#${targetChannelId}>`
      });
    } else {
      await base44.asServiceRole.entities.DiscordGuildConfig.create({
        guild_id: guildId,
        allowed_channel_id: targetChannelId,
        allowed_channel_name: `<#${targetChannelId}>`
      });
    }
    await followUp(applicationId, token, { content: `✅ Origins bot commands are now restricted to <#${targetChannelId}>.` });
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
      await base44.asServiceRole.entities.DiscordGuildConfig.update(existing[0].id, { allowed_channel_id: '', allowed_channel_name: '' });
    }
    await followUp(applicationId, token, { content: '✅ Channel restriction removed. Bot commands now work in all channels.' });
    return;
  }

  // Channel restriction check + data fetch in parallel
  const configPromise = guildId
    ? base44.asServiceRole.entities.DiscordGuildConfig.filter({ guild_id: guildId })
    : Promise.resolve([]);

  async function checkChannel(configs) {
    const config = configs[0];
    if (config?.allowed_channel_id && config.allowed_channel_id !== channelId) {
      await followUp(applicationId, token, {
        content: `⚠️ Origins commands are only allowed in <#${config.allowed_channel_id}>.`,
        flags: 64
      });
      return false;
    }
    return true;
  }

  if (commandName === 'help') {
    const configs = await configPromise;
    if (!await checkChannel(configs)) return;
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
    const [configs, picks] = await Promise.all([configPromise, base44.asServiceRole.entities.MarketPick.list()]);
    if (!await checkChannel(configs)) return;

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
    const [configs, trending] = await Promise.all([configPromise, base44.asServiceRole.entities.TrendingCache.list()]);
    if (!await checkChannel(configs)) return;

    const cards = trending.length > 0 ? trending[0].cards?.slice(0, 5) || [] : [];
    await followUp(applicationId, token, {
      embeds: [{
        title: '🔥 Trending Cards Right Now',
        color: 0xff6600,
        fields: cards.length > 0
          ? cards.map((c, i) => ({ name: `${i + 1}. ${c.name || c.card_name}`, value: c.heat_score ? `Heat Score: ${c.heat_score}` : 'Trending', inline: false }))
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
      return new Response("Method not allowed", { status: 405 });
    }

    const signature = req.headers.get("x-signature-ed25519");
    const timestamp = req.headers.get("x-signature-timestamp");
    const rawBody = await req.text();

    const isValid = await verifyDiscordRequest(signature, timestamp, rawBody);
    if (!isValid) {
      console.warn("Invalid Discord signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const interaction = JSON.parse(rawBody);

    // PING — must respond synchronously
    if (interaction.type === 1) {
      return Response.json({ type: 1 });
    }

    // Slash commands — defer immediately, process in background
    if (interaction.type === 2) {
      const base44 = createClientFromRequest(req);
      handleCommand(interaction, base44).catch(e => console.error("Command handler error:", e));
      return Response.json({ type: 5 }); // Deferred channel message
    }

    return new Response("Unknown interaction type", { status: 400 });
  } catch (error) {
    console.error("Discord interaction error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});