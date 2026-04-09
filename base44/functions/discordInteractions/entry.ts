import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { verifyKey } from 'npm:discord-interactions@3.4.0';

const DISCORD_PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY");

async function verifyDiscordRequest(signature, timestamp, rawBody) {
  if (!signature || !timestamp) return false;
  try {
    return await verifyKey(rawBody, signature, timestamp, DISCORD_PUBLIC_KEY);
  } catch (e) {
    console.error("Verification error:", e);
    return false;
  }
}

async function buildResponse(interaction, base44) {
  const commandName = interaction.data?.name;
  const guildId = interaction.guild_id;
  const channelId = interaction.channel_id;

  // /setchannel — admin only
  if (commandName === 'setchannel') {
    const memberPermissions = BigInt(interaction.member?.permissions || '0');
    if (!(memberPermissions & BigInt(0x8))) {
      return { type: 4, data: { content: '❌ Only server administrators can use this command.', flags: 64 } };
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
    return { type: 4, data: { content: `✅ Origins bot commands are now restricted to <#${targetChannelId}>.` } };
  }

  // /clearchannel — admin only
  if (commandName === 'clearchannel') {
    const memberPermissions = BigInt(interaction.member?.permissions || '0');
    if (!(memberPermissions & BigInt(0x8))) {
      return { type: 4, data: { content: '❌ Only server administrators can use this command.', flags: 64 } };
    }
    const existing = await base44.asServiceRole.entities.DiscordGuildConfig.filter({ guild_id: guildId });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.DiscordGuildConfig.update(existing[0].id, { allowed_channel_id: '', allowed_channel_name: '' });
    }
    return { type: 4, data: { content: '✅ Channel restriction removed. Bot commands now work in all channels.' } };
  }

  // Channel restriction check
  if (guildId) {
    const configs = await base44.asServiceRole.entities.DiscordGuildConfig.filter({ guild_id: guildId });
    const config = configs[0];
    if (config?.allowed_channel_id && config.allowed_channel_id !== channelId) {
      return {
        type: 4,
        data: { content: `⚠️ Origins commands are only allowed in <#${config.allowed_channel_id}>.`, flags: 64 }
      };
    }
  }

  if (commandName === 'help') {
    return {
      type: 4,
      data: {
        embeds: [{
          title: '🃏 Origins Bot Commands',
          description: 'Your daily trading card market intelligence, powered by Origins.',
          color: 0xd4a017,
          fields: [
            { name: '/market', value: "Get today's top Buy, Hold & Sell picks with price targets", inline: false },
            { name: '/trending [category]', value: 'View top 3 trending cards for a sport or TCG (football, baseball, basketball, soccer, hockey, golf, ufc, wwe, f1, pokemon, one_piece, mtg, yugioh, lorcana)', inline: false },
            { name: '/help', value: 'Show this help message', inline: false },
            { name: '/setchannel [channel]', value: 'Admins only: restrict bot to a specific channel', inline: false },
            { name: '/clearchannel', value: 'Admins only: remove channel restriction', inline: false }
          ],
          footer: { text: '✨ Free daily market insights from Origins • originscard.com' }
        }]
      }
    };
  }

  if (commandName === 'market') {
    const picks = await base44.asServiceRole.entities.MarketPick.list();
    const buyPick = picks.find(p => p.pick_type === 'buy');
    const holdPick = picks.find(p => p.pick_type === 'hold');
    const sellPick = picks.find(p => p.pick_type === 'sell');
    const fields = [];
    if (buyPick) {
      const upside = buyPick.price_target && buyPick.estimated_price
        ? Math.round(((buyPick.price_target - buyPick.estimated_price) / buyPick.estimated_price) * 100)
        : null;
      fields.push({
        name: `📈 BUY — ${buyPick.card_name}`,
        value: [
          buyPick.set_name || '',
          `💵 **Current Market Price:** $${Number(buyPick.estimated_price).toLocaleString()}`,
          buyPick.price_target ? `🎯 **30–90 Day Target:** $${Number(buyPick.price_target).toLocaleString()}${upside !== null ? ` (+${upside}%)` : ''}` : null,
          buyPick.confidence ? `Confidence: ${buyPick.confidence}` : null,
          buyPick.reasoning
        ].filter(Boolean).join('\n'),
        inline: false
      });
    }
    if (holdPick) {
      fields.push({
        name: `⏸️ HOLD — ${holdPick.card_name}`,
        value: [
          holdPick.set_name || '',
          `💵 **Current Market Price:** $${Number(holdPick.estimated_price).toLocaleString()}`,
          holdPick.confidence ? `Confidence: ${holdPick.confidence}` : null,
          holdPick.reasoning
        ].filter(Boolean).join('\n'),
        inline: false
      });
    }
    if (sellPick) {
      const downside = sellPick.price_target && sellPick.estimated_price
        ? Math.round(((sellPick.price_target - sellPick.estimated_price) / sellPick.estimated_price) * 100)
        : null;
      fields.push({
        name: `📉 SELL — ${sellPick.card_name}`,
        value: [
          sellPick.set_name || '',
          `💵 **Current Market Price:** $${Number(sellPick.estimated_price).toLocaleString()}`,
          sellPick.price_target ? `🎯 **30–90 Day Target:** $${Number(sellPick.price_target).toLocaleString()}${downside !== null ? ` (${downside}%)` : ''}` : null,
          sellPick.confidence ? `Confidence: ${sellPick.confidence}` : null,
          sellPick.reasoning
        ].filter(Boolean).join('\n'),
        inline: false
      });
    }
    return {
      type: 4,
      data: {
        embeds: [{
          title: "📊 Today's Market Picks",
          color: 0xd4a017,
          fields: fields.length > 0 ? fields : [{ name: 'No picks yet', value: 'Check back soon!', inline: false }],
          footer: { text: '✨ Free daily market insights from Origins • originscard.com' }
        }]
      }
    };
  }

  if (commandName === 'trending') {
    const categoryOption = interaction.data.options?.find(o => o.name === 'category');
    const category = categoryOption?.value || 'football';

    const categoryLabels = {
      football: 'Football', baseball: 'Baseball', basketball: 'Basketball',
      soccer: 'Soccer', hockey: 'Hockey', golf: 'Golf', ufc: 'UFC', wwe: 'WWE',
      f1: 'F1', pokemon: 'Pok\u00e9mon', one_piece: 'One Piece',
      magic_the_gathering: 'Magic: The Gathering', yugioh: 'Yu-Gi-Oh!', lorcana: 'Lorcana'
    };
    const label = categoryLabels[category] || category;

    // Find cache entry matching this category
    const allCache = await base44.asServiceRole.entities.TrendingCache.list();
    const match = allCache.find(c =>
      c.category === category ||
      (c.cache_key && c.cache_key.toLowerCase().startsWith(category.toLowerCase()))
    );
    const cards = match?.cards?.slice(0, 3) || [];

    const gradedKeywords = ['psa', 'bgs', 'sgc', 'cgc', 'hga', 'beckett'];
    const isGraded = (variant) => variant && gradedKeywords.some(k => variant.toLowerCase().includes(k));

    return {
      type: 4,
      data: {
        embeds: [{
          title: `\uD83D\uDD25 Top Trending ${label} Cards`,
          color: 0xff6600,
          fields: cards.length > 0
            ? cards.map((c, i) => {
                const variant = c.variant || '';
                const graded = isGraded(variant);
                const conditionLabel = graded ? `\uD83D\uDCE6 Graded (${variant})` : '\uD83D\uDCCB Raw (Ungraded)';
                const price = graded
                  ? (c.estimated_value_avg_graded || c.estimated_value_avg)
                  : (c.estimated_value_avg_raw || c.estimated_value_avg);
                const priceStr = price ? `$${Number(price).toLocaleString()}` : 'N/A';
                const rawAndGraded = c.estimated_value_avg_raw && c.estimated_value_avg_graded
                  ? `\n\uD83D\uDCCB Raw: $${Number(c.estimated_value_avg_raw).toLocaleString()} | \uD83D\uDCE6 Graded: $${Number(c.estimated_value_avg_graded).toLocaleString()}`
                  : '';
                return {
                  name: `${i + 1}. ${c.player_or_name || c.card_name || 'Unknown'} \u2014 ${c.year || ''} ${c.set_name || ''}`.trim(),
                  value: [
                    conditionLabel,
                    `\uD83D\uDCB5 Current Market Price: **${priceStr}** (${graded ? 'graded comp' : 'raw comp'})`,
                    rawAndGraded || null,
                    c.heat_score ? `\uD83D\uDD25 Heat: ${c.heat_score}/100` : null,
                    c.why_hot ? `_${c.why_hot}_` : null
                  ].filter(Boolean).join('\n'),
                  inline: false
                };
              })
            : [{ name: 'No data yet', value: `No trending ${label} cards cached. Check back soon!`, inline: false }],
          footer: { text: '\u2728 Free daily market insights from Origins \u2022 getorigins.app' }
        }]
      }
    };
  }

  return { type: 4, data: { content: `Unknown command: ${commandName}` } };
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
    console.log("Interaction type:", interaction.type, "command:", interaction.data?.name);

    // PING
    if (interaction.type === 1) {
      return Response.json({ type: 1 });
    }

    // Slash commands — respond synchronously within 3s using cached data
    if (interaction.type === 2) {
      const base44 = createClientFromRequest(req);
      const responseData = await buildResponse(interaction, base44);
      return Response.json(responseData);
    }

    return new Response("Unknown interaction type", { status: 400 });
  } catch (error) {
    console.error("Discord interaction error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});