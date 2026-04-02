import React, { useState } from 'react';
import { X, Tag, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';

export default function RedeemCodeModal({ onClose, onSuccess }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    const res = await base44.functions.invoke('redeemCode', { code: code.trim() });
    if (res.data?.error) {
      setError(res.data.error);
    } else if (res.data?.success) {
      setResult(res.data);
      if (res.data.type !== 'creator') {
        setTimeout(() => { onSuccess && onSuccess(res.data); onClose(); }, 2500);
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-card border border-border/50 rounded-2xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Redeem a Code</h2>
            <p className="text-xs text-muted-foreground">Referral, gift, or creator code</p>
          </div>
        </div>

        {!result ? (
          <>
            <Input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. GIFT-ABC12345"
              className="mb-3 bg-secondary border-border font-mono"
              onKeyDown={e => e.key === 'Enter' && handleRedeem()}
            />
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            <Button onClick={handleRedeem} disabled={loading || !code.trim()} className="w-full bg-primary text-primary-foreground">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Checking...</> : 'Redeem Code'}
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-1">Code Applied!</p>
            <p className="text-sm text-muted-foreground">{result.benefit}</p>
            {result.type === 'creator' && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-3">Your discount will be applied at checkout.</p>
                <Button onClick={() => { onSuccess && onSuccess(result); onClose(); }} className="w-full bg-primary text-primary-foreground">
                  Continue to Checkout
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}