import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Layers, BarChart2, History } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CardGridItem from '../components/dashboard/CardGridItem';
import EmptyState from '../components/shared/EmptyState';
import CollectionStats from '../components/dashboard/CollectionStats';
import SoldTradedGrid from '../components/dashboard/SoldTradedGrid';
import MarkSoldModal from '../components/dashboard/MarkSoldModal';
import OwnershipRequests from '../components/dashboard/OwnershipRequests';
import { usePullToRefresh } from '../hooks/usePullToRefresh.jsx';

const TABS = [
  { id: 'collection', label: 'Collection', icon: Layers },
  { id: 'portfolio',  label: 'Portfolio',  icon: BarChart2 },
  { id: 'history',   label: 'Sold / Traded', icon: History },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('collection');
  const [markSoldCard, setMarkSoldCard] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => { if (u?.email) setCurrentUserEmail(u.email); }).catch(() => {});
  }, []);

  const { data: allCards = [], isLoading } = useQuery({
    queryKey: ['my-cards'],
    queryFn: () => base44.entities.Card.list('-created_date'),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['all-messages'],
    queryFn: () => base44.entities.VideoMessage.list(),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['my-cards'] });
    queryClient.invalidateQueries({ queryKey: ['all-messages'] });
  };

  const { containerRef, PullIndicator } = usePullToRefresh(refresh);

  const getMessageCount = (cardId) => messages.filter(m => m.card_id === cardId).length;

  const ownedCards = allCards.filter(c => !c.status || c.status === 'owned');
  const soldTradedCards = allCards.filter(c => c.status === 'sold' || c.status === 'traded');
  const totalValue = ownedCards.reduce((sum, c) => sum + (c.estimated_value || 0), 0);

  return (
    <div ref={containerRef} className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <PullIndicator />

        {/* Ownership Transfer Requests */}
        {currentUserEmail && <OwnershipRequests userEmail={currentUserEmail} />}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">My Collection</h1>
            <p className="text-sm text-muted-foreground">
              {ownedCards.length} card{ownedCards.length !== 1 ? 's' : ''}
              {totalValue > 0 && <> · <span className="text-primary font-medium">${totalValue.toLocaleString()} total value</span></>}
            </p>
          </div>
          <Link to="/register">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />Register Card
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary/40 rounded-xl border border-border/40 w-fit mb-8">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-card text-foreground shadow border border-border/40' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Icon className="w-3.5 h-3.5" />{tab.label}
                {tab.id === 'history' && soldTradedCards.length > 0 && (
                  <span className="ml-0.5 text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full">{soldTradedCards.length}</span>
                )}
              </button>
            );
          })}
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

        {!isLoading && (
          <>
            {/* Collection Tab */}
            {activeTab === 'collection' && (
              <>
                {ownedCards.length === 0 ? (
                  <EmptyState icon={Layers} title="No Cards Yet" description="Register your first card to generate a QR code and start building its story.">
                    <Link to="/register">
                      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="w-4 h-4 mr-2" />Register Your First Card
                      </Button>
                    </Link>
                  </EmptyState>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {ownedCards.map((card, i) => (
                      <CardGridItem
                        key={card.id}
                        card={card}
                        messageCount={getMessageCount(card.id)}
                        index={i}
                        onMarkSold={setMarkSoldCard}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              allCards.length === 0 ? (
                <EmptyState icon={BarChart2} title="No Cards Yet" description="Register cards and add estimated values to see your portfolio breakdown." />
              ) : (
                <CollectionStats cards={allCards} />
              )
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              soldTradedCards.length === 0 ? (
                <EmptyState icon={History} title="Nothing Here Yet" description="When you mark a card as sold or traded, it will appear here." />
              ) : (
                <SoldTradedGrid cards={soldTradedCards} onRestored={refresh} />
              )
            )}
          </>
        )}
      </div>

      {markSoldCard && (
        <MarkSoldModal
          card={markSoldCard}
          onClose={() => setMarkSoldCard(null)}
          onDone={refresh}
        />
      )}
    </div>
  );
}