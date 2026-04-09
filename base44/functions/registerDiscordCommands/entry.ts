import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const CLIENT_ID = '1491553491498307624';

const commands = [
  {
    name: 'market',
    description: "Get today's top Buy, Hold & Sell picks with price targets"
  },
  {
    name: 'trending',
    description: 'View the top 3 hottest cards for a specific sport or TCG category',
    options: [
      {
        type: 3, // STRING type
        name: 'category',
        description: 'Which sport or TCG type to view trending cards for',
        required: true,
        choices: [
          { name: 'Football', value: 'football' },
          { name: 'Baseball', value: 'baseball' },
          { name: 'Basketball', value: 'basketball' },
          { name: 'Soccer', value: 'soccer' },
          { name: 'Hockey', value: 'hockey' },
          { name: 'Golf', value: 'golf' },
          { name: 'UFC', value: 'ufc' },
          { name: 'WWE', value: 'wwe' },
          { name: 'F1', value: 'f1' },
          { name: 'Pokémon', value: 'pokemon' },
          { name: 'One Piece', value: 'one_piece' },
          { name: 'Magic: The Gathering', value: 'magic_the_gathering' },
          { name: 'Yu-Gi-Oh!', value: 'yugioh' },
          { name: 'Lorcana', value: 'lorcana' }
        ]
      }
    ]
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