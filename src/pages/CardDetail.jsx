import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, QrCode, Download, MessageCircle } from 'lucide-react';
import QRCodeDisplay from '../components/shared/QRCodeDisplay';
import SportBadge from '../components/shared/SportBadge';
import VideoMessageCard from '../components/shared/VideoMessageCard';
import AddMessageForm from '../components/card-detail/AddMessageForm';
import EmptyState from '../components/shared/EmptyState';

export default function CardDetail() {
  const { id } = useParams();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const { data: card, isLoading: cardLoading } = useQuery({
    queryKey: ['card', id],
    queryFn: async () => {
      const cards = await base44.entities.Card.filter({ id });
      return cards[0];
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['card-messages', id],
    queryFn: () => base44.entities.VideoMessage.filter({ card_id: id }, '-created_date'),
  });

  if (cardLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-3xl mx-auto">
          <EmptyState icon={QrCode} title="Card Not Found" description="This card doesn't exist or has been removed." />
        </div>
      </div>
    );
  }

  const qrDownloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(window.location.origin + '/scan/' + card.unique_code)}&format=png`;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to My Cards
        </Link>

        {/* Card Header */}
        <div className="grid md:grid-cols-[280px_1fr] gap-8 mb-12">
          {/* Card Image */}
          <div>
            <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-border/50 bg-muted/30">
              {card.image_url ? (
                <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-muted-foreground/20" />
                </div>
              )}
            </div>
          </div>

          {/* Card Info */}
          <div className="flex flex-col">
            <div className="mb-4">
              <SportBadge sport={card.sport} />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">{card.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              {card.set_name && <span>{card.set_name}</span>}
              {card.year && <span>• {card.year}</span>}
              {card.card_number && <span>• #{card.card_number}</span>}
            </div>
            {card.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">{card.description}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-auto">
              <Button onClick={() => setShowQR(!showQR)} variant="outline" className="border-border/50 hover:border-primary/30">
                <QrCode className="w-4 h-4 mr-2" />
                {showQR ? 'Hide QR Code' : 'View QR Code'}
              </Button>
              <a href={qrDownloadUrl} download={`origins-${card.unique_code}.png`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-border/50 hover:border-primary/30">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
              </a>
            </div>

            {showQR && (
              <div className="mt-6 p-6 rounded-2xl bg-secondary/50 border border-border/50 inline-block">
                <QRCodeDisplay code={card.unique_code} size={180} />
                <p className="text-xs text-muted-foreground mt-3 text-center max-w-[180px]">
                  Print this and stick it on the back of your card
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Messages Timeline */}
        <div className="border-t border-border/50 pt-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Card Timeline</h2>
              <p className="text-sm text-muted-foreground mt-1">{messages.length} message{messages.length !== 1 ? 's' : ''} from previous owners</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Message
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
              title="No Messages Yet"
              description="Be the first to leave a video message for this card's timeline."
            >
              <Button onClick={() => setShowAddForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Leave the First Message
              </Button>
            </EmptyState>
          ) : (
            <div>
              {messages.map((msg, i) => (
                <VideoMessageCard key={msg.id} message={msg} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}