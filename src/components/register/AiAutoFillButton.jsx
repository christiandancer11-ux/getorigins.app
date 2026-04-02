import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function AiAutoFillButton({ imageUrl, onFill }) {
  const [loading, setLoading] = useState(false);

  const handleAutoFill = async () => {
    if (!imageUrl) return;
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a sports card and TCG expert. Analyze this card image and extract the following details with high accuracy. Return ONLY a JSON object with these exact keys (leave blank string "" if unsure):
- name: Player name or card title
- set_name: Set or collection name
- sport: one of: baseball, basketball, football, hockey, soccer, pokemon, magic_the_gathering, yugioh, other
- year: 4-digit year if visible
- card_number: card number if visible (include # prefix)
- description: brief 1-sentence note about the card

Be precise. For TCG cards, use the card's actual name. For sports cards, use the player's full name.`,
        file_urls: [imageUrl],
        response_json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            set_name: { type: 'string' },
            sport: { type: 'string' },
            year: { type: 'string' },
            card_number: { type: 'string' },
            description: { type: 'string' },
          },
        },
      });
      onFill(result);
    } catch (e) {
      console.error('AI fill failed', e);
    }
    setLoading(false);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleAutoFill}
      disabled={loading || !imageUrl}
      className="border-primary/30 text-primary hover:bg-primary/10 gap-2 mt-2"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
      {loading ? 'Identifying card...' : 'Auto-fill with AI'}
    </Button>
  );
}