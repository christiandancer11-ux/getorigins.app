import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, QrCode, Download, MessageCircle, Share2, Pencil, RefreshCw, TrendingUp, Trash2 } from 'lucide-react';
import MobileHeader from '../components/layout/MobileHeader';
import QRCodeDisplay from '../components/shared/QRCodeDisplay';
import SportBadge from '../components/shared/SportBadge';
import VideoMessageCard from '../components/shared/VideoMessageCard.jsx';
import AddMessageForm from '../components/card-detail/AddMessageForm.jsx';
import EmptyState from '../components/shared/EmptyState';
import ShareCardModal from '../components/card-detail/ShareCardModal';
import EditCardModal from '../components/card-detail/EditCardModal';
import { useAuth } from '@/lib/AuthContext';
import { getCardById, getCardStories, deleteCard, getCardPriceSummary, createScanEvent, createOwnershipRequest, getOwnershipRequestsForCard } from '@/lib/db';

export default function CardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshingValue, setRefreshingValue] = useState(false);
  const [scanLogged, setScanLogged] = useState(false);
  const [ownershipRequests, setOwnershipRequests] = useState([]);
  const { data: analytics, isFetching: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['card-trade-analytics', id],
    queryFn: async () => {
      if (!card?.id) return null;
      const { data } = await getCardPriceSummary({
        card_name: card.name,
        set_name: card.set_name,
        year: card.year,
        card_number: card.card_number,
      });
      return data;
    },
    enabled: !!card?.id,
    staleTime: 5 * 60 * 1000,
  });
  const [requestMessage, setRequestMessage] = useState('');
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestError, setRequestError] = useState(null);
  const qc = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);

  const { data: card, isLoading: cardLoading } = useQuery({
    queryKey: ['card', id],
    queryFn: async () => {
      const { data } = await getCardById(id);
      return data;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['card-messages', id],
    queryFn: async () => {
      const { data } = await getCardStories(id);
      return data || [];
    },
  });

  useEffect(() => {
    if (!card?.id || scanLogged) return;
    const logEvent = async () => {
      await createScanEvent({ card_id: card.id, scanner_id: user?.id || null });
      setScanLogged(true);
    };
    logEvent();
  }, [card?.id, scanLogged, user?.id]);

  useEffect(() => {
    const loadRequests = async () => {
      if (!card?.id || !currentUser || card.user_id !== currentUser.id) {
        setOwnershipRequests([]);
        return;
      }

      const { data } = await getOwnershipRequestsForCard(card.id);
      setOwnershipRequests(data || []);
    };

    loadRequests();
  }, [card?.id, currentUser]);

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

  const qrDownloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(window.location.origin + '/cards/' + card.id)}&format=png`;

  const handleRefreshValue = async () => {
    setRefreshingValue(true);
    await refetchAnalytics();
    setRefreshingValue(false);
  };

  const handleDeleteCard = async () => {
    if (!window.confirm('Are you sure you want to delete this card? This action cannot be undone and will remove all associated stories.')) {
      return;
    }
    
    try {
      await deleteCard(card.id);
      qc.invalidateQueries({ queryKey: ['my-cards'] });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert('Failed to delete card. Please try again.');
    }
  };

  const handleSubmitOwnershipRequest = async () => {
    if (!currentUser) {
      setRequestError('Please sign in to request ownership of this card.');
      return;
    }

    if (!requestMessage.trim()) {
      setRequestError('Please include a short message with your request.');
      return;
    }

    setRequestError(null);
    setRequestStatus('sending');

    const { data, error } = await createOwnershipRequest({
      card_id: card.id,
      requester_id: currentUser.id,
      owner_id: card.user_id,
      message: requestMessage.trim(),
    });

    if (error) {
      setRequestError('Could not send ownership request. Please try again.');
      setRequestStatus(null);
      console.error(error);
      return;
    }

    setRequestStatus('sent');
    setRequestMessage('');
    setOwnershipRequests((prev) => [data, ...prev]);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <MobileHeader title={card.name} backTo="/dashboard" />
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="hidden lg:inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
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

            {/* Estimated Value */}
            <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-secondary/40 border border-border/50">
              <TrendingUp className="w-4 h-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Market Value</p>
                <p className="text-lg font-bold text-foreground">
                  {card.estimated_value != null ? `$${card.estimated_value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                </p>
                {analytics?.market_summary && (
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{analytics.market_summary}</p>
                )}
                {analytics?.average_price != null && (
                  <p className="text-xs text-muted-foreground mt-0.5">Average: ${analytics.average_price.toFixed(2)}</p>
                )}
                {analytics?.median_price != null && (
                  <p className="text-xs text-muted-foreground mt-0.5">Median: ${analytics.median_price.toFixed(2)}</p>
                )}
                {analytics?.trend_7d_pct != null && analytics?.trend_30d_pct != null && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Trend: {analytics.trend_7d_pct >= 0 ? '+' : ''}{analytics.trend_7d_pct.toFixed(1)}% (7d), {analytics.trend_30d_pct >= 0 ? '+' : ''}{analytics.trend_30d_pct.toFixed(1)}% (30d)
                  </p>
                )}
                {analytics?.estimated_next_low != null && analytics?.estimated_next_high != null && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Next sale estimate: ${analytics.estimated_next_low.toFixed(0)} - ${analytics.estimated_next_high.toFixed(0)}
                  </p>
                )}
              </div>
              {currentUser && card.user_id === currentUser.id && (
                <Button
                  onClick={handleRefreshValue}
                  disabled={refreshingValue || analyticsLoading}
                  variant="outline"
                  size="sm"
                  className="border-border/50 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${(refreshingValue || analyticsLoading) ? 'animate-spin' : ''}`} />
                  {(refreshingValue || analyticsLoading) ? 'Refreshing...' : 'Refresh'}
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 mt-auto">
              <Button onClick={() => setShowQR(!showQR)} variant="outline" className="border-border/50 hover:border-primary/30">
                <QrCode className="w-4 h-4 mr-2" />
                {showQR ? 'Hide QR Code' : 'View QR Code'}
              </Button>
              <a href={qrDownloadUrl} download={`origins-${card.id}.png`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-border/50 hover:border-primary/30">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
              </a>
              <Button onClick={() => setShowShare(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Share2 className="w-4 h-4 mr-2" />
                Share Story
              </Button>
              {currentUser && card.user_id === currentUser.id && (
                <>
                  <Button onClick={() => setShowEdit(true)} variant="outline" className="border-border/50 hover:border-primary/30">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Details
                  </Button>
                  <Button onClick={handleDeleteCard} variant="outline" className="border-red-500/30 text-red-600 hover:bg-red-50 hover:border-red-500/50">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Card
                  </Button>
                </>
              )}
              {(!currentUser || card.user_id !== currentUser.id) && (
                <div className="w-full">
                  <div className="rounded-2xl border border-border/50 bg-secondary/30 p-4 mt-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Request Ownership</h3>
                    <p className="text-xs text-muted-foreground mb-3">Ask the current owner to transfer this card to you.</p>
                    <textarea
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Add a short note to the owner"
                      rows={3}
                      className="w-full rounded-xl border border-border/50 bg-background/80 p-3 text-sm text-foreground"
                    />
                    {requestError && <p className="text-xs text-destructive mt-2">{requestError}</p>}
                    {requestStatus === 'sent' && <p className="text-xs text-green-400 mt-2">Ownership request sent. The owner can review it on the card page.</p>}
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        onClick={handleSubmitOwnershipRequest}
                        disabled={!currentUser || requestStatus === 'sending'}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {requestStatus === 'sending' ? 'Sending...' : 'Request Ownership'}
                      </Button>
                      {!currentUser && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/auth')}
                          className="border-border/50"
                        >
                          Sign in to Request
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {showQR && (
              <div className="mt-6 p-6 rounded-2xl bg-secondary/50 border border-border/50 inline-block">
                <QRCodeDisplay code={card.id} size={180} />
                <p className="text-xs text-muted-foreground mt-3 text-center max-w-[180px]">
                  Print this and stick it on the back of your card
                </p>
              </div>
            )}
          </div>
        </div>

        {ownershipRequests.length > 0 && currentUser && card.user_id === currentUser.id && (
          <div className="mb-10 rounded-3xl border border-amber-400/20 bg-amber-100/10 p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Pending Ownership Requests</h2>
                <p className="text-sm text-muted-foreground">Review requests submitted by collectors who want to claim this card.</p>
              </div>
            </div>
            <div className="space-y-3">
              {ownershipRequests.map((request) => (
                <div key={request.id} className="rounded-2xl border border-amber-400/20 bg-background/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">Request from {request.requester_id ? request.requester_id : 'a collector'}</p>
                      {request.message && <p className="text-xs text-muted-foreground mt-1">{request.message}</p>}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

      {showShare && (
        <ShareCardModal card={card} messages={messages} onClose={() => setShowShare(false)} />
      )}
      {showEdit && (
        <EditCardModal card={card} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
}