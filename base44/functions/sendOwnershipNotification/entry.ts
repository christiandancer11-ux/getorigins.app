import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { request_id } = await req.json();

    const requests = await base44.asServiceRole.entities.CardOwnershipRequest.filter({ id: request_id });
    const request = requests[0];
    if (!request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    // Find owner user info
    const owners = await base44.asServiceRole.entities.User.filter({ email: request.owner_email });
    const owner = owners[0];
    const ownerName = owner?.full_name || 'Collector';

    const buyerDisplay = request.buyer_name || request.buyer_email;
    const priceText = request.sale_price ? ` for $${request.sale_price}` : '';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: request.owner_email,
      subject: `Someone bought your card: ${request.card_name}`,
      body: `Hi ${ownerName},

${buyerDisplay} scanned the QR code on your card "${request.card_name}" and says they purchased it from you${priceText}.

Can you confirm this sale?

Please log in to Origins and go to your Dashboard to respond — you'll see a "Pending Transfer Requests" section where you can confirm or deny this.

If you confirm, the card will be moved to your Sold/Traded history and added to the new owner's collection.
If you deny, nothing will change.

— The Origins Team`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendOwnershipNotification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});