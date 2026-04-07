import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Layers, BarChart2, History, Award, X, Store } from 'lucide-react';
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
import MarketPicksWidget from '../components/dashboard/MarketPicksWidget';
import ListToStoreModal from '../components/dashboard/ListToStoreModal';
import { usePullToRefresh } from '../hooks/usePullToRefresh.jsx';
import { useSubscription } from '../hooks/useSubscription';

const TABS = [
  { id: 'collection', label: 'Cards',        icon: Layers,    hint: 'Cards you own' },
  { id: 'portfolio',  label: 'Portfolio',    icon: BarChart2, hint: 'Value & stats' },
  { id: 'history',   label: 'Sold/Traded',  icon: History,   hint: 'Past sales' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('collection');
  const [markSoldCard, setMarkSoldCard] = useState(null);
  const [showCertLookup, setShowCertLookup] = useState(false);
  const [showListToStore, setShowListToStore] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [signals, setSignals] = useState({}); // cardId -> { signal, reason }
  const [signalsLoading, setSignalsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { isPro } = useSubscription();

  useEffect(() => {
    base44.auth.me().then(u => { if (u?.email) { setCurrentUserEmail(u.email); setCurrentUser(u); } }).catch(() => {});
  }, []);

  const { data: allCards = [], isLoading } = useQuery({
    queryKey: ['my-cards', currentUserEmail],
    queryFn: () => {
      if (!currentUserEmail) return [];
      return base44.entities.Card.filter({ created_by: currentUserEmail }, '-created_date', 500);
    },
    enabled: !!currentUserEmail,
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

  // Fetch AI signals for owned cards once loaded
  useEffect(() => {
    if (ownedCards.length === 0) return;
    setSignalsLoading(true);
    const cardPayload = ownedCards.map(c => ({
      id: c.id,
      name: c.name,
      set_name: c.set_name,
      year: c.year,
      sport: c.sport,
      grading_company: c.grading_company,
      grade: c.grade,
      price_paid: c.price_paid,
      estimated_value: c.estimated_value,
    }));
    base44.functions.invoke('cardSignals', { cards: cardPayload })
      .then(res => {
        if (res.data?.signals) {
          const map = {};
          res.data.signals.forEach(s => {
            const card = ownedCards[s.index];
            if (card) map[card.id] = { signal: s.signal, reason: s.reason };
          });
          setSignals(map);
        }
      })
      .catch(() => {})
      .finally(() => setSignalsLoading(false));
  }, [ownedCards.length]);

  return (
    <div ref={containerRef} className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <PullIndicator />

        {/* Ownership Transfer Requests */}
        {currentUserEmail && <OwnershipRequests userEmail={currentUserEmail} />}

        {/* AI Market Picks Widget */}
        <MarketPicksWidget isPro={isPro} />

        {/* Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">My Collection</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {ownedCards.length === 0
                ? 'Add your first card below to get started'
                : <>{ownedCards.length} card{ownedCards.length !== 1 ? 's' : ''} {totalValue > 0 && <span className="text-primary font-medium">· ${totalValue.toLocaleString()} est. value</span>}</>
              }
            </p>
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Button 
              variant="outline" 
              onClick={() => setShowCertLookup(v => !v)} 
              className="border-border/50 gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none"
              size="sm"
              title="Look up a graded card by its certification number"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />Cert Lookup
            </Button>
            {currentUser && ['ebay_store', 'fanatics_live', 'whatnot'].some(k => currentUser[k]) && ownedCards.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowListToStore(true)}
                className="border-border/50 gap-1.5 text-xs sm:text-sm flex-1 sm:flex-none border-primary/30 text-primary hover:bg-primary/10"
                size="sm"
                title="List cards to your linked store"
              >
                <Store className="w-3.5 h-3.5" />List to Store
              </Button>
            )}
            <Link to="/register" className="flex-1 sm:flex-none">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full gap-1.5 text-xs sm:text-sm" size="sm">
                <Plus className="w-3.5 h-3.5" />Add Card
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick tip for new users */}
        {ownedCards.length === 0 && !isLoading && (
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-start gap-3">
            <span className="text-xl shrink-0">👋</span>
            <div>
              <p className="text-sm font-semibold text-foreground">Welcome to Origins!</p>
              <p className="text-xs text-muted-foreground mt-0.5">Start by tapping <strong>Add Card</strong> — take a photo and AI will identify it automatically. Each card gets a unique QR code you can share or attach to the slab.</p>
            </div>
          </div>
        )}

        {/* Cert lookup panel */}
        {showCertLookup && (
          <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 relative">
            <button onClick={() => setShowCertLookup(false)} className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary transition-colors">
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <p className="text-xs text-muted-foreground mb-3">Enter a PSA, BGS, or SGC certification number to look up a graded card.</p>
            <CertLookupEntry onClose={() => setShowCertLookup(false)} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary/30 rounded-xl border border-border/40 mb-6 w-fit">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.hint}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${active ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id === 'history' && soldTradedCards.length > 0 && (
                  <span className="text-[9px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-full font-semibold">{soldTradedCards.length}</span>
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
                        signal={signals[card.id]?.signal}
                        signalReason={signals[card.id]?.reason}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Portfolio Tab */}
             {activeTab === 'portfolio' && (
               allCards.length === 0 ? (
                 <EmptyState icon={BarChart2} title="No Cards Yet" description="Add cards and fill in their estimated value to see your portfolio breakdown here." />
               ) : (
                 <>
                   <p className="text-xs text-muted-foreground mb-4">Your collection's estimated total value, profit/loss, and breakdown by sport. Update card values from each card's detail page.</p>
                   <CollectionValueWidget userEmail={currentUserEmail} />
                   <div className="mt-6">
                     <CollectionStats cards={allCards} />
                   </div>
                   <div className="mt-6">
                     <h2 className="font-semibold text-foreground mb-1">Card-by-Card Breakdown</h2>
                     <p className="text-xs text-muted-foreground mb-4">Each card's cost vs. estimated value and ROI.</p>
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

      {showListToStore && currentUser && (
        <ListToStoreModal
          cards={ownedCards}
          user={currentUser}
          onClose={() => setShowListToStore(false)}
        />
      )}
    </div>
  );
}