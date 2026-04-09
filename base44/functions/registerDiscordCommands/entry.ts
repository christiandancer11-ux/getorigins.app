import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CLIENT_ID = '1491553491498307624';

const commands = [
  {
    name: 'market',
    description: "Get today's top Buy, Hold & Sell picks with price targets"
  },
  {
    name: 'trending',
    description: 'View the hottest trading cards in the market right now'
  },
  {
    name: 'help',
    description: 'Learn about Origins bot features and available commands'
  },
  {
    name: 'setchannel',
    description: 'Admin only: restrict Origins bot commands to a specific channel',
    options: [
      {
        type: 7, // CHANNEL type
        name: 'channel',
        description: 'The channel to restrict bot commands to (defaults to current channel if not specified)',
        required: false
      }
    ]
  },
  {
    name: 'clearchannel',
    description: 'Admin only: remove channel restriction so bot works everywhere'
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const token = Deno.env.get('DISCORD_BOT_TOKEN');
    const response = await fetch(
      `https://discord.com/api/v10/applications/${CLIENT_ID}/commands`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(commands)
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error('Failed to register commands:', data);
      return Response.json({ error: data }, { status: 500 });
    }

    console.log('Commands registered:', data.map(c => c.name));
    return Response.json({ success: true, commands: data.map(c => c.name) });
  } catch (error) {
    console.error('registerDiscordCommands error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});