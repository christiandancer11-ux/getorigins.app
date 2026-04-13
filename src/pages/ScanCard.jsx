import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QrCode, Plus, MessageCircle, DollarSign, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import SportBadge from '../components/shared/SportBadge';
import VideoMessageCard from '../components/shared/VideoMessageCard.jsx';
import EmptyState from '../components/shared/EmptyState';
import AddMessageForm from '../components/card-detail/AddMessageForm.jsx';
import BuyFromOwnerPanel from '../components/scan/BuyFromOwnerPanel.jsx';

import { detectGradingQR } from '@/lib/gradingCompanies';
import { getCardByUniqueCode, updateCard, createScanEvent } from '@/lib/db';

export default function ScanCard() {
  const { code } = useParams();
  const navigate = useNavigate();

  // Detect any grading company QR code and redirect to unified cert page
  useEffect(() => {
    const detected = detectGradingQR(code);
    if (detected) {
      navigate(`/graded/${detected.company.toLowerCase()}/${detected.cert}`, { replace: true });
    }
  }, [code, navigate]);
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: card, isLoading: cardLoading } = useQuery({
    queryKey: ['card-by-code', code],
    queryFn: async () => {
      const res = await getCardByUniqueCode(code);
      return res.data ?? null;
    },
  });

  // Increment scan count and log scan event once per page load
  useEffect(() => {
    if (card?.id) {
      updateCard(card.id, { scan_count: (card.scan_count || 0) + 1 });

      let visitorId = localStorage.getItem('origins_visitor_id');
      if (!visitorId) {
        visitorId = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('origins_visitor_id', visitorId);
      }

      createScanEvent({
        card_id: card.id,
        scanner_id: visitorId,
      });
    }
  }, [card?.id]);

  const messages = [];

  if (cardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-background">
        <EmptyState icon={QrCode} title="Card Not Found" description="This QR code doesn't match any registered card." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative pt-20 pb-12 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative max-w-2xl mx-auto text-center">
          {/* Card Info */}
          <div className="mb-6">
            {card.image_url && (
              <div className="w-32 h-44 mx-auto rounded-xl overflow-hidden border-2 border-primary/20 shadow-xl shadow-primary/10 mb-6">
                <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
              </div>
            )}
            <SportBadge sport={card.sport} />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-2">{card.name}</h1>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
              {card.set_name && <span>{card.set_name}</span>}
              {card.year && <span>• {card.year}</span>}
              {card.card_number && <span>• #{card.card_number}</span>}
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border/50 text-sm text-muted-foreground">
            <QrCode className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-foreground">Origins</span>
            <span>— This card's journey</span>
          </div>

          {/* Card Value & Owner Info */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5 max-w-sm mx-auto">
            {card.estimated_value != null && (
              <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
                <DollarSign className="w-4 h-4 text-primary shrink-0" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Est. Value</p>
                  <p className="text-sm font-bold text-primary">${card.estimated_value.toLocaleString()}</p>
                </div>
              </div>
            )}
            {card.created_by && (
              <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary border border-border/50">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Current Owner</p>
                  <p className="text-sm font-medium text-foreground truncate">{card.created_by.split('@')[0]}</p>
                </div>
              </div>
            )}
          </div>

          {/* Buy from owner */}
          <div className="max-w-sm mx-auto">
            <BuyFromOwnerPanel card={card} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-xl font-bold text-foreground">
            {messages.length} Message{messages.length !== 1 ? 's' : ''}
          </h2>
          <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Add Yours
          </Button>
        </div>

        {showAddForm && (
          <div className="mb-8">
            <AddMessageForm cardId={card.id} onClose={() => setShowAddForm(false)} />
          </div>
        )}

        {messages.length === 0 && !showAddForm ? (
          <EmptyState
            icon={MessageCircle}
            title="Be the First"
            description="No one has left a message for this card yet. Be the first to share your story!"
          >
            <Button onClick={() => setShowAddForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Leave a Message
            </Button>
          </EmptyState>
        ) : (
          messages.map((msg, i) => (
            <VideoMessageCard key={msg.id} message={msg} index={i} />
          ))
        )}
      </div>
    </div>
  );
}

