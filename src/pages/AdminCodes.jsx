import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Plus, Trash2, CheckCircle, Loader2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const TYPE_LABELS = {
  admin_gift: '🎁 Gift (3mo Expert Free)',
  creator: '🎨 Creator (50% off 3mo)',
  referral: '🤝 Referral (7 days free)',
};

export default function AdminCodes() {
  const [genType, setGenType] = useState('admin_gift');
  const [genCount, setGenCount] = useState(1);
  const [genNotes, setGenNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [newCodes, setNewCodes] = useState([]);
  const [copied, setCopied] = useState('');
  const qc = useQueryClient();

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ['promo-codes'],
    queryFn: () => base44.entities.PromoCode.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PromoCode.update(id, { is_active: false }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['promo-codes'] }),
  });

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await base44.functions.invoke('generateAdminCode', {
      type: genType, count: genCount, notes: genNotes, max_uses: genType === 'admin_gift' ? 1 : null,
    });
    if (res.data?.codes) {
      setNewCodes(res.data.codes.map(c => c.code));
      qc.invalidateQueries({ queryKey: ['promo-codes'] });
    }
    setGenerating(false);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Promo Code Manager</h1>
            <p className="text-xs text-muted-foreground">Admin only — generate and manage codes</p>
          </div>
        </div>

        {/* Generator */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-4">Generate New Codes</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Code Type</label>
              <Select value={genType} onValueChange={setGenType}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">How Many</label>
              <Input type="number" min={1} max={50} value={genCount} onChange={e => setGenCount(Number(e.target.value))} className="bg-secondary border-border" />
            </div>
          </div>
          <Input placeholder="Notes (optional)" value={genNotes} onChange={e => setGenNotes(e.target.value)} className="bg-secondary border-border mb-4" />
          <Button onClick={handleGenerate} disabled={generating} className="bg-primary text-primary-foreground">
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            Generate Codes
          </Button>

          {newCodes.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs font-semibold text-primary mb-2">Generated codes — click to copy:</p>
              <div className="flex flex-wrap gap-2">
                {newCodes.map(c => (
                  <button key={c} onClick={() => copyCode(c)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border font-mono text-sm text-foreground hover:border-primary/50 transition-colors">
                    {copied === c ? <CheckCircle className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Code list */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">All Codes ({codes.length})</h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto" /></div>
          ) : codes.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No codes yet.</div>
          ) : (
            <div className="divide-y divide-border/30">
              {codes.map(code => (
                <motion.div key={code.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">{code.code}</span>
                      {!code.is_active && <span className="text-xs text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">Inactive</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{TYPE_LABELS[code.type] || code.type} · Used {code.use_count || 0}{code.max_uses != null ? `/${code.max_uses}` : ''} times{code.notes ? ` · ${code.notes}` : ''}</p>
                  </div>
                  <button onClick={() => copyCode(code.code)} className="text-muted-foreground hover:text-foreground p-1.5">
                    {copied === code.code ? <CheckCircle className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </button>
                  {code.is_active !== false && (
                    <button onClick={() => deleteMutation.mutate(code.id)} className="text-muted-foreground hover:text-destructive p-1.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}