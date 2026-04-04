import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Layers, BarChart2, History, Award, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CardGridItem from '../components/dashboard/CardGridItem';
import CertLookupEntry from '../components/grading/CertLookupEntry';
import EmptyState from '../components/shared/EmptyState';
import CollectionStats from '../components/dashboard/CollectionStats';
import CollectionValueWidget from '../components/dashboard/CollectionValueWidget';
import CardValueBreakdown from '../components/dashboard/CardValueBreakdown';
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
  const [showCertLookup, setShowCertLookup] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(u => { if (u?.email) setCurrentUserEmail(u.email); }).catch(() => {});
  }, []);

  const { data: allCards = [], isLoading } = useQuery({
    queryKey: ['my-cards'],
    queryFn: () => base44.entities.Card.list('-created_date', 500),
    staleTime: 60000,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['user-messages', currentUserEmail],
    queryFn: async () => {
      if (!currentUserEmail) return [];
      const userCards = allCards.map(c => c.id);
      if (userCards.length === 0) return [];
      const allMsgs = await base44.entities.VideoMessage.list();
      return allMsgs.filter(m => userCards.includes(m.card_id));
    },
    enabled: !!currentUserEmail && allCards.length > 0,
    staleTime: 60000,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['my-cards'] });
    queryClient.invalidateQueries({ queryKey: ['all-messages'] });
  };

  const { containerRef, PullIndicator } = usePullToRefresh(refresh);

  const getMessageCount = (cardId) => messages.filter(m => m.card_id === cardId).length;

  const ownedCards = React.useMemo(
    () => allCards.filter(c => !c.status || c.status === 'owned'),
    [allCards]
  );
  
  const soldTradedCards = React.useMemo(
    () => allCards.filter(c => c.status === 'sold' || c.status === 'traded'),
    [allCards]
  );
  
  const totalValue = React.useMemo(
    () => ownedCards.reduce((sum, c) => sum + (c.estimated_value || 0), 0),
    [ownedCards]
  );

  return (
    <div ref={containerRef} className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <PullIndicator />

        {/* Ownership Transfer Requests */}
        {currentUserEmail && <OwnershipRequests userEmail={currentUserEmail} />}

        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">My Collection</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {ownedCards.length} card{ownedCards.length !== 1 ? 's' : ''} {totalValue > 0 && <span className="text-primary font-medium">${totalValue.toLocaleString()}</span>}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Button 
              variant="outline" 
              onClick={() => setShowCertLookup(v => !v)} 
              className="border-border/50 gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none"
              size="sm"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />Grading Lookup
            </Button>
            <Link to="/register" className="flex-1 sm:flex-none">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full gap-1.5 text-xs sm:text-sm" size="sm">
                <Plus className="w-3.5 h-3.5" />Add Card
              </Button>
            </Link>
          </div>
        </div>

        {/* Cert lookup panel */}
        {showCertLookup && (
          <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 relative">
            <button onClick={() => setShowCertLookup(false)} className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <CertLookupEntry onClose={() => setShowCertLookup(false)} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary/30 rounded-lg border border-border/40 w-fit mb-6">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.id === 'history' && soldTradedCards.length > 0 && (
                  <span className="text-[9px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full font-semibold">{soldTradedCards.length}</span>
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
                 <>
                   <CollectionValueWidget userEmail={currentUserEmail} />
                   <div className="mt-6">
                     <CollectionStats cards={allCards} />
                   </div>
                   <div className="mt-6">
                     <h2 className="font-semibold text-foreground mb-4">Individual Card Values</h2>
                     <CardValueBreakdown cards={allCards} />
                   </div>
                 </>
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