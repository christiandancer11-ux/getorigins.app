import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plus, Layers } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CardGridItem from '../components/dashboard/CardGridItem';
import EmptyState from '../components/shared/EmptyState';

export default function Dashboard() {
  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['my-cards'],
    queryFn: () => base44.entities.Card.list('-created_date'),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.VideoMessage.list(),
  });

  const getMessageCount = (cardId) => messages.filter(m => m.card_id === cardId).length;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">My Cards</h1>
            <p className="text-sm text-muted-foreground">{cards.length} card{cards.length !== 1 ? 's' : ''} registered</p>
          </div>
          <Link to="/register">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Register Card
            </Button>
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border/50 overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-muted/30" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted/50 rounded w-3/4" />
                  <div className="h-3 bg-muted/30 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && cards.length === 0 && (
          <EmptyState
            icon={Layers}
            title="No Cards Yet"
            description="Register your first card to generate a QR code and start building its story."
          >
            <Link to="/register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Register Your First Card
              </Button>
            </Link>
          </EmptyState>
        )}

        {/* Grid */}
        {!isLoading && cards.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {cards.map((card, i) => (
              <CardGridItem key={card.id} card={card} messageCount={getMessageCount(card.id)} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}