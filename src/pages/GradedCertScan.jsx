import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { legacyApi } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Award, QrCode, Plus, MessageCircle, CheckCircle2, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SportBadge from '@/components/shared/SportBadge';
import VideoMessageCard from '@/components/shared/VideoMessageCard';
import AddMessageForm from '@/components/card-detail/AddMessageForm';
import EmptyState from '@/components/shared/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { getCompany } from '@/lib/gradingCompanies';

export default function GradedCertScan() {
  const { company: companyKey, cert } = useParams();
  const navigate = useNavigate();
  const cfg = getCompany(companyKey);

  const [currentUser, setCurrentUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);

  useEffect(() => {
    legacyApi.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  // Find card in Origins by cert_number + grading_company
  const { data: card, isLoading } = useQuery({
    queryKey: ['card-by-cert', companyKey, cert],
    queryFn: async () => {
      // Search by cert number (also check grading_company matches)
      const cards = await legacyApi.entities.Card.filter({ cert_number: cert });
      // Prefer one from the matching grading company, fall back to any match
      const exact = cards.find(c => c.grading_company?.toUpperCase() === companyKey.toUpperCase());
      return exact || cards[0] || null;
    },
    enabled: !!cert,
  });

  // Fetch user's cards without a cert for linking
  const { data: myCards = [] } = useQuery({
    queryKey: ['my-cards-uncerted', currentUser?.email],
    queryFn: async () => {
      const all = await legacyApi.entities.Card.filter({ created_by: currentUser.email });
      return all.filter(c => !c.cert_number);
    },
    enabled: !!currentUser,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['card-messages', card?.id],
    queryFn: () => legacyApi.entities.VideoMessage.filter({ card_id: card.id }, '-created_date'),
    enabled: !!card?.id,
  });

  const handleLink = async () => {
    if (!selectedCardId) return;
    setLinking(true);
    await legacyApi.entities.Card.update(selectedCardId, {
      cert_number: cert,
      grading_company: companyKey.toUpperCase(),
    });
    setLinkSuccess(true);
    setLinking(false);
    setTimeout(() => navigate(`/cards/${selectedCardId}`), 1500);
  };

  const colorCls = cfg?.color || 'text-amber-400';
  const bgCls = cfg?.bg || 'bg-amber-400/10';
  const borderCls = cfg?.border || 'border-amber-400/20';
  const displayName = cfg?.name || companyKey.toUpperCase();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // ── CARD FOUND — show story ──────────────────────────────────────────────
  if (card) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative pt-20 pb-12 px-6">
          <div className={`absolute inset-0 bg-gradient-to-b ${bgCls.replace('bg-', 'from-').replace('/10', '/5')} to-transparent`} />
          <div className="relative max-w-2xl mx-auto text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bgCls} ${borderCls} border ${colorCls} text-xs font-semibold mb-5`}>
              <Award className="w-3.5 h-3.5" />{displayName} Cert #{cert}
            </div>

            {card.image_url && (
              <div className={`w-32 h-44 mx-auto rounded-xl overflow-hidden border-2 ${borderCls} shadow-xl mb-6`}>
                <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
              </div>
            )}

            <SportBadge sport={card.sport} />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-2">{card.name}</h1>
            <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground mb-3">
              {card.set_name && <span>{card.set_name}</span>}
              {card.year && <span>• {card.year}</span>}
              {card.card_number && <span>• #{card.card_number}</span>}
            </div>

            {card.grading_company && card.grade && (
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${bgCls} border ${borderCls} mb-5`}>
                <Award className={`w-3.5 h-3.5 ${colorCls}`} />
                <span className={`text-sm font-semibold ${colorCls}`}>{card.grading_company} {card.grade}</span>
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border/50 text-sm text-muted-foreground">
              <QrCode className="w-4 h-4 text-primary" />
              <span className="font-display font-semibold text-foreground">Origins</span>
              <span>— This card's journey</span>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 pb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-xl font-bold text-foreground">
              {messages.length} Message{messages.length !== 1 ? 's' : ''}
            </h2>
            <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />Add Yours
            </Button>
          </div>

          {showAddForm && (
            <div className="mb-8">
              <AddMessageForm cardId={card.id} onClose={() => setShowAddForm(false)} />
            </div>
          )}

          {messages.length === 0 && !showAddForm ? (
            <EmptyState icon={MessageCircle} title="Be the First" description="No one has left a message for this card yet.">
              <Button onClick={() => setShowAddForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />Leave a Message
              </Button>
            </EmptyState>
          ) : (
            messages.map((msg, i) => <VideoMessageCard key={msg.id} message={msg} index={i} />)
          )}
        </div>
      </div>
    );
  }

  // ── NO CARD FOUND ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl ${bgCls} border ${borderCls} flex items-center justify-center mx-auto mb-4`}>
            <Award className={`w-7 h-7 ${colorCls}`} />
          </div>
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bgCls} border ${borderCls} ${colorCls} text-xs font-semibold mb-4`}>
            {displayName} Cert #{cert}
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Not on Origins Yet</h1>
          <p className="text-sm text-muted-foreground">
            This {displayName} slab hasn't been registered on Origins. Be the first to add it and start its story.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!currentUser && (
            <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <Button onClick={() => legacyApi.auth.redirectToLogin(window.location.href)} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                Sign in to Register This Card <ArrowRight className="w-4 h-4" />
              </Button>
              {cfg?.registryUrl && (
                <a href={cfg.registryUrl(cert)} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full border-border/50 gap-2">
                    <ExternalLink className="w-4 h-4" />View on {displayName} Registry
                  </Button>
                </a>
              )}
            </motion.div>
          )}

          {currentUser && !linkSuccess && (
            <motion.div key="options" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Register new */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-primary" />Register as New Card
                </h3>
                <p className="text-sm text-muted-foreground">AI will identify the card from your photos and auto-link to this {displayName} cert.</p>
                <Button onClick={() => navigate(`/register?cert=${cert}&grader=${displayName}`)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  Register This Card <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Link to existing */}
              {myCards.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Award className={`w-4 h-4 ${colorCls}`} />Link to an Existing Card
                  </h3>
                  <p className="text-sm text-muted-foreground">Already have this card in Origins? Link the {displayName} cert to it.</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {myCards.map(c => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCardId(c.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${selectedCardId === c.id ? `${borderCls.replace('border-', 'border-')} ${bgCls}` : 'border-border/50 hover:border-border bg-secondary/30'}`}
                      >
                        {c.image_url && <img src={c.image_url} alt={c.name} className="w-10 h-14 object-cover rounded-lg shrink-0" />}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{[c.year, c.set_name].filter(Boolean).join(' · ')}</p>
                        </div>
                        {selectedCardId === c.id && <CheckCircle2 className={`w-4 h-4 ${colorCls} ml-auto shrink-0`} />}
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={handleLink}
                    disabled={!selectedCardId || linking}
                    className={`w-full gap-2`}
                  >
                    {linking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                    {linking ? 'Linking...' : `Link ${displayName} Cert to This Card`}
                  </Button>
                </div>
              )}

              {cfg?.registryUrl && (
                <a href={cfg.registryUrl(cert)} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full border-border/50 gap-2">
                    <ExternalLink className="w-4 h-4" />View on {displayName} Registry
                  </Button>
                </a>
              )}
            </motion.div>
          )}

          {linkSuccess && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="font-semibold text-foreground">{displayName} cert linked!</p>
              <p className="text-sm text-muted-foreground mt-1">Redirecting to your card...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

