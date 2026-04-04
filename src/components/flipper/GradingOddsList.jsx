import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Loader2, RefreshCw, AlertCircle, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

const SPORT_EMOJI = {
  baseball: '⚾', basketball: '🏀', football: '🏈', hockey: '🏒',
  soccer: '⚽', pokemon: '🎴', magic_the_gathering: '🧙', yugioh: '⚡', other: '🃏',
};

const SPORT_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'baseball', label: '⚾ Baseball' },
  { id: 'basketball', label: '🏀 Basketball' },
  { id: 'football', label: '🏈 Football' },
  { id: 'hockey', label: '🏒 Hockey' },
  { id: 'soccer', label: '⚽ Soccer' },
  { id: 'pokemon', label: '🎴 Pokémon' },
  { id: 'magic_the_gathering', label: '🧙 MTG' },
  { id: 'yugioh', label: '⚡ Yu-Gi-Oh' },
];

const COMPANY_COLORS = {
  PSA: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  BGS: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  SGC: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  CGC: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'BGS Black Label': 'text-white bg-gradient-to-r from-amber-500 to-yellow-300 border-amber-400/60',
};

function GradeCard({ card, index }) {
  const [expanded, setExpanded] = useState(false);
  const companyStyle = COMPANY_COLORS[card.grading_company] || 'text-primary bg-primary/10 border-primary/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left px-4 py-4 flex items-center gap-3"
      >
        {/* Card info — full width */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md border shrink-0 ${companyStyle}`}>
              {card.grading_company}
            </span>
            {card.perfect_10_rate_pct != null && (
              <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full whitespace-nowrap ml-auto shrink-0">
                {Math.round(card.perfect_10_rate_pct)}% PST10
              </span>
            )}
            {expanded ? <ChevronUp className="w-3 h-3 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3 h-3 text-muted-foreground shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-sm shrink-0">{SPORT_EMOJI[card.sport_or_tcg] || '🃏'}</span>
            <p className="text-sm font-semibold text-foreground">{card.card_name}</p>
          </div>
          <p className="text-xs text-muted-foreground truncate">{[card.year, card.set_name].filter(Boolean).join(' · ')}</p>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Grade 10 Rate</p>
                  <p className="text-sm font-bold text-primary">{Math.round(card.perfect_10_rate_pct ?? 0)}%</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Submissions (3mo)</p>
                  <p className="text-sm font-bold text-foreground">{card.total_submissions_3mo?.toLocaleString() ?? '—'}</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Raw Value</p>
                  <p className="text-sm font-bold text-foreground">${card.current_raw_value?.toLocaleString() ?? '—'}</p>
                </div>
                <div className="rounded-lg bg-emerald-400/5 border border-emerald-400/20 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">Graded 10 Value</p>
                  <p className="text-sm font-bold text-emerald-400">${card.graded_10_value?.toLocaleString() ?? '—'}</p>
                </div>
              </div>

              {card.value_increase_pct != null && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-400/5 border border-emerald-400/20">
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-sm text-emerald-400 font-semibold">+{Math.round(card.value_increase_pct)}% value increase if graded a {card.grading_company} 10</p>
                </div>
              )}

              {card.why_grades_well && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Why It Grades Well</p>
                  <p className="text-sm text-foreground leading-relaxed">{card.why_grades_well}</p>
                </div>
              )}
              {card.notes && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Tips</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function groupByCompanyAndSport(cards) {
  const grouped = {};
  for (const card of cards) {
    const company = card.grading_company || 'Other';
    if (company === 'BGS Black Label') continue; // handled separately
    const sport = card.sport_or_tcg || 'other';
    const key = `${company}__${sport}`;
    if (!grouped[key]) grouped[key] = { company, sport, cards: [] };
    grouped[key].cards.push(card);
  }
  Object.values(grouped).forEach(g => {
    g.cards.sort((a, b) => (b.total_submissions_3mo || 0) - (a.total_submissions_3mo || 0));
    g.cards = g.cards.slice(0, 10);
  });
  return Object.values(grouped).sort((a, b) => {
    const companyOrder = ['PSA', 'BGS', 'SGC', 'CGC'];
    return (companyOrder.indexOf(a.company) - companyOrder.indexOf(b.company)) || a.sport.localeCompare(b.sport);
  });
}

export default function GradingOddsList() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState({});

  const fetchData = async (sport) => {
    setLoading(true);
    setError(null);
    const res = await base44.functions.invoke('getGrading10Odds', { sport: sport || 'all' });
    if (res.data?.error) setError(res.data.error);
    else setData(res.data);
    setLoading(false);
  };

  const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const allCards = data?.cards || [];
  const filteredCards = selectedSport === 'all' ? allCards : allCards.filter(c => c.sport_or_tcg === selectedSport);
  const groups = groupByCompanyAndSport(filteredCards);

  const COMPANY_COLORS_BORDER = {
    PSA: 'border-blue-400/30',
    BGS: 'border-amber-400/30',
    SGC: 'border-emerald-400/30',
    CGC: 'border-purple-400/30',
    'BGS Black Label': 'border-amber-400/60',
  };

  const blackLabelCards = (data?.cards || []).filter(c => c.grading_company === 'BGS Black Label');
  const [blackLabelOpen, setBlackLabelOpen] = useState(true);

  return (
    <div className="space-y-5">
      {/* Description */}
      <div className="rounded-xl bg-amber-400/5 border border-amber-400/20 p-4">
        <p className="text-sm text-foreground/90 leading-relaxed">
          <span className="font-semibold text-amber-400">AI analyzes PSA, BGS, SGC & CGC population reports from the last 3 months</span> to find cards with 80–95% odds of grading a perfect 10, filtered to the most submitted (most popular to grade).
        </p>
      </div>

      {/* Sport filter */}
      {!data && !loading && (
        <>
          <div className="flex flex-wrap gap-2">
            {SPORT_OPTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSport(s.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  selectedSport === s.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/40 border-border/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <Button onClick={() => fetchData(selectedSport)} className="w-full h-12 bg-amber-500 hover:bg-amber-500/90 text-white gap-2">
            <Award className="w-4 h-4" />Find Perfect 10 Candidates
          </Button>
        </>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground mb-1">Analyzing grading population reports...</p>
            <p className="text-sm text-muted-foreground">Querying PSA, BGS, SGC & CGC data from the last 3 months</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-foreground">Perfect 10 Candidates</h2>
              <p className="text-xs text-muted-foreground">
                Updated {data.generated_at ? new Date(data.generated_at).toLocaleString() : '—'}
              </p>
            </div>
            <button onClick={() => { setData(null); setExpandedGroups({}); }} className="text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Sport filter (post-fetch) */}
          <div className="flex flex-wrap gap-2">
            {SPORT_OPTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSport(s.id)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  selectedSport === s.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-secondary/40 border-border/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {data.methodology_note && (
            <div className="rounded-xl bg-secondary/30 border border-border/30 px-4 py-3">
              <p className="text-xs text-muted-foreground leading-relaxed">{data.methodology_note}</p>
            </div>
          )}

          {/* BGS Black Label — pinned special section */}
          {blackLabelCards.length > 0 && (
            <div className="rounded-2xl border-2 border-amber-400/50 overflow-hidden shadow-lg shadow-amber-400/10">
              <button
                onClick={() => setBlackLabelOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500/20 to-yellow-400/10 hover:from-amber-500/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg border bg-gradient-to-r from-amber-500 to-yellow-300 border-amber-400/60 text-black">
                    ⭐ BGS Black Label
                  </span>
                  <span className="text-sm font-semibold text-amber-300">Rarest Grade in the Hobby</span>
                  <span className="text-xs text-muted-foreground">({blackLabelCards.length} cards)</span>
                </div>
                {blackLabelOpen ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-amber-400" />}
              </button>
              <div className="px-4 py-2 bg-amber-400/5 border-b border-amber-400/20">
                <p className="text-xs text-amber-300/80">All 4 subgrades must score a perfect 10 · Centering, Corners, Edges & Surface · Extremely rare</p>
              </div>
              <AnimatePresence>
                {blackLabelOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="p-3 space-y-2">
                      {blackLabelCards.map((card, i) => (
                        <GradeCard key={i} card={card} index={i} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {groups.length === 0 && blackLabelCards.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">No data found for this filter.</p>
          )}

          {groups.map(group => {
            const groupKey = `${group.company}__${group.sport}`;
            const isOpen = expandedGroups[groupKey] !== false;
            const companyBorder = COMPANY_COLORS_BORDER[group.company] || 'border-border/40';
            const companyStyle = COMPANY_COLORS[group.company] || 'text-primary bg-primary/10 border-primary/20';

            return (
              <div key={groupKey} className={`rounded-2xl border ${companyBorder} overflow-hidden`}>
                <button
                  onClick={() => toggleGroup(groupKey)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-secondary/20 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${companyStyle}`}>{group.company}</span>
                    <span className="text-sm font-semibold text-foreground capitalize">
                      {SPORT_EMOJI[group.sport] || '🃏'} {group.sport.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">({group.cards.length} cards)</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-3 space-y-2">
                        {group.cards.map((card, i) => (
                          <GradeCard key={i} card={card} index={i} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <p className="text-xs text-muted-foreground text-center">
            Population data from PSA, BGS, SGC & CGC registries. 80–95% grade 10 rate filter applied. BGS Black Label odds reflect all-4-subgrades-perfect requirement. Not grading advice.
          </p>
        </div>
      )}
    </div>
  );
}