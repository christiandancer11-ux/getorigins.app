import React, { useState, useEffect } from 'react';
import { legacyApi } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SPORTS = ['baseball', 'basketball', 'football', 'hockey', 'soccer', 'pokemon', 'magic_the_gathering', 'yugioh', 'other'];

function EditModal({ card, onClose, onSave }) {
  const [data, setData] = useState(card || {
    card_name: '',
    set_name: '',
    year: new Date().getFullYear().toString(),
    sport: 'baseball',
    card_number: '',
    parallels: [],
    short_prints: [],
    case_hits: [],
    key_visual_markers: [],
    rookie_card: false,
    production_notes: '',
    source: 'manual'
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6 space-y-4">
        <h2 className="text-lg font-bold text-foreground">{card ? 'Edit' : 'Add'} Card Knowledge</h2>
        
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Card Name" value={data.card_name} onChange={(e) => setData({ ...data, card_name: e.target.value })} />
          <Input placeholder="Set Name" value={data.set_name} onChange={(e) => setData({ ...data, set_name: e.target.value })} />
          <Input placeholder="Year" value={data.year} onChange={(e) => setData({ ...data, year: e.target.value })} />
          <select value={data.sport} onChange={(e) => setData({ ...data, sport: e.target.value })} className="px-3 py-2 rounded-md bg-secondary text-foreground border border-input">
            {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <Input placeholder="Card Number" value={data.card_number} onChange={(e) => setData({ ...data, card_number: e.target.value })} />
        
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Parallels (comma-separated)</label>
          <Input 
            placeholder="e.g. Refractor/50, Gold/25, Chrome/10"
            value={data.parallels.join(', ')}
            onChange={(e) => setData({ ...data, parallels: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Short Prints (comma-separated)</label>
          <Input 
            placeholder="e.g. SP, SSP, SuperShort"
            value={data.short_prints.join(', ')}
            onChange={(e) => setData({ ...data, short_prints: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Visual Markers (comma-separated)</label>
          <Input 
            placeholder="e.g. blue borders, holographic stamp, RC logo"
            value={data.key_visual_markers.join(', ')}
            onChange={(e) => setData({ ...data, key_visual_markers: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          />
        </div>

        <Input 
          placeholder="Production Notes" 
          value={data.production_notes} 
          onChange={(e) => setData({ ...data, production_notes: e.target.value })}
        />

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={data.rookie_card} onChange={(e) => setData({ ...data, rookie_card: e.target.checked })} />
          <span className="text-sm text-foreground">Rookie Card</span>
        </label>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(data); onClose(); }}>Save</Button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminCardKnowledge() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadCards = async () => {
      try {
        const result = await legacyApi.entities.CardKnowledge.list('-updated_date', 100);
        setCards(result);
      } catch (e) {
        toast.error('Failed to load card knowledge');
      }
      setLoading(false);
    };
    loadCards();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await legacyApi.functions.invoke('syncCardKnowledge', {});
      toast.success(`Synced! Created: ${result.data.created}, Updated: ${result.data.updated}`);
      // Reload cards
      const updated = await legacyApi.entities.CardKnowledge.list('-updated_date', 100);
      setCards(updated);
    } catch (e) {
      toast.error('Sync failed: ' + e.message);
    }
    setSyncing(false);
  };

  const handleSaveCard = async (cardData) => {
    try {
      if (editingCard) {
        await legacyApi.entities.CardKnowledge.update(editingCard.id, cardData);
        toast.success('Card updated');
      } else {
        await legacyApi.entities.CardKnowledge.create(cardData);
        toast.success('Card created');
      }
      const updated = await legacyApi.entities.CardKnowledge.list('-updated_date', 100);
      setCards(updated);
      setEditingCard(null);
    } catch (e) {
      toast.error('Save failed: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this card knowledge?')) return;
    try {
      await legacyApi.entities.CardKnowledge.delete(id);
      toast.success('Card deleted');
      setCards(cards.filter(c => c.id !== id));
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const filtered = cards.filter(c => 
    c.card_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.set_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Card Knowledge Database</h1>
          <p className="text-muted-foreground mt-1">Manage card parallels, variations, and AI training data</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setEditingCard({})}>
            <Plus className="w-4 h-4 mr-2" /> Add Card
          </Button>
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {syncing ? 'Syncing...' : 'Auto-Sync Now'}
          </Button>
        </div>
      </div>

      {/* Search */}
      <Input 
        placeholder="Search cards..." 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Cards Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Card Name</th>
                <th className="px-4 py-3 text-left font-semibold">Set</th>
                <th className="px-4 py-3 text-left font-semibold">Sport</th>
                <th className="px-4 py-3 text-left font-semibold">Parallels</th>
                <th className="px-4 py-3 text-left font-semibold">RC</th>
                <th className="px-4 py-3 text-left font-semibold">Source</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-muted-foreground">No cards found</td></tr>
              ) : (
                filtered.map(card => (
                  <tr key={card.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{card.card_name}</td>
                    <td className="px-4 py-3">{card.set_name}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{card.sport}</Badge></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{card.parallels?.length || 0} variants</td>
                    <td className="px-4 py-3">{card.rookie_card && <CheckCircle className="w-4 h-4 text-green-500" />}</td>
                    <td className="px-4 py-3 text-xs">{card.source}</td>
                    <td className="px-4 py-3 flex gap-2 justify-center">
                      <Button size="icon" variant="ghost" onClick={() => setEditingCard(card)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(card.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCard !== null && (
        <EditModal 
          card={editingCard.id ? editingCard : null}
          onClose={() => setEditingCard(null)}
          onSave={handleSaveCard}
        />
      )}
    </div>
  );
}

