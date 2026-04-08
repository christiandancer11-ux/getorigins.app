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
      console.log(`Received command: ${commandName}`);

      // Respond with a deferred message while you process
      return new Response(JSON.stringify({
        type: 4,
        data: {
          content: `Command '${commandName}' received! Processing...`
        }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
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