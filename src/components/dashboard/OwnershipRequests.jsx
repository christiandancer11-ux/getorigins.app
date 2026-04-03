import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2, XCircle, Loader2, ShoppingBag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function OwnershipRequests({ userEmail }) {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState(null);

  const { data: requests = [] } = useQuery({
    queryKey: ['ownership-requests', userEmail],
    queryFn: () => base44.entities.CardOwnershipRequest.filter({ owner_email: userEmail, status: 'pending' }, '-created_date'),
    enabled: !!userEmail,
  });

  if (requests.length === 0) return null;

  const handleConfirm = async (request) => {
    setProcessingId(request.id);

    // 1. Mark the current card as sold/traded and update sold info
    await base44.entities.Card.update(request.card_id, {
      status: 'sold',
      sold_traded_date: new Date().toISOString(),
      sold_traded_value: request.sale_price || undefined,
      sold_traded_notes: `Sold to ${request.buyer_name || request.buyer_email}`,
    });

    // 2. Mark the request as confirmed
    await base44.entities.CardOwnershipRequest.update(request.id, { status: 'confirmed' });

    // 3. Notify buyer by email
    await base44.integrations.Core.SendEmail({
      to: request.buyer_email,
      subject: `Ownership confirmed: ${request.card_name}`,
      body: `Great news! The previous owner has confirmed the sale of "${request.card_name}".

If you have an Origins account (${request.buyer_email}), the card has been added to your collection automatically.

If you don't have an account yet, sign up at Origins to track your collection and generate QR codes for your cards!

— The Origins Team`,
    });

    // 4. If buyer has an Origins account, add the card to their collection
    const buyers = await base44.entities.User.filter({ email: request.buyer_email });
    if (buyers.length > 0) {
      // Find the original card to copy its details
      const cards = await base44.entities.Card.filter({ id: request.card_id });
      const originalCard = cards[0];
      if (originalCard) {
        await base44.entities.Card.create({
          name: originalCard.name,
          set_name: originalCard.set_name,
          sport: originalCard.sport,
          year: originalCard.year,
          card_number: originalCard.card_number,
          image_url: originalCard.image_url,
          description: originalCard.description,
          rarity: originalCard.rarity,
          estimated_value: request.sale_price || originalCard.estimated_value,
          unique_code: Math.random().toString(36).slice(2).toUpperCase() + Date.now().toString(36).toUpperCase(),
          status: 'owned',
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: ['ownership-requests', userEmail] });
    queryClient.invalidateQueries({ queryKey: ['cards'] });
    setProcessingId(null);
  };

  const handleReject = async (request) => {
    setProcessingId(request.id);

    await base44.entities.CardOwnershipRequest.update(request.id, { status: 'rejected' });

    // Notify buyer it was denied
    await base44.integrations.Core.SendEmail({
      to: request.buyer_email,
      subject: `Transfer request denied: ${request.card_name}`,
      body: `The current owner of "${request.card_name}" has indicated this sale did not happen.

The card will remain in their collection. If you believe this is an error, please contact the owner directly.

— The Origins Team`,
    });

    queryClient.invalidateQueries({ queryKey: ['ownership-requests', userEmail] });
    setProcessingId(null);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Bell className="w-5 h-5 text-primary" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-destructive rounded-full text-[9px] flex items-center justify-center text-white font-bold">
            {requests.length}
          </span>
        </div>
        <h2 className="font-display text-lg font-bold text-foreground">Pending Transfer Requests</h2>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {requests.map(request => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4"
            >
              <div className="flex items-start gap-3">
                {request.card_image_url ? (
                  <img src={request.card_image_url} alt={request.card_name} className="w-12 h-16 object-cover rounded-lg border border-border/50 shrink-0" />
                ) : (
                  <div className="w-12 h-16 rounded-lg bg-secondary border border-border/50 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{request.card_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <span className="font-medium text-amber-400">{request.buyer_name || request.buyer_email}</span> says they bought this card from you
                    {request.sale_price ? <span> for <span className="text-primary font-semibold">${request.sale_price}</span></span> : ''}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(request.created_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-amber-400/10">
                <p className="text-xs text-muted-foreground mb-3">Can you confirm that this card has been sold?</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleConfirm(request)}
                    disabled={processingId === request.id}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs h-8"
                  >
                    {processingId === request.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <><CheckCircle2 className="w-3 h-3 mr-1" />Yes, Confirm Sale</>}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(request)}
                    disabled={processingId === request.id}
                    className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 text-xs h-8"
                  >
                    {processingId === request.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <><XCircle className="w-3 h-3 mr-1" />No, This Didn't Happen</>}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}