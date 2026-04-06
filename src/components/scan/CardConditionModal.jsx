import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

const GRADING_COMPANIES = [
  { id: 'psa', label: 'PSA' },
  { id: 'bgs', label: 'BGS' },
  { id: 'sgc', label: 'SGC' },
  { id: 'cgc', label: 'CGC' },
  { id: 'hga', label: 'HGA' },
];

const GRADES = [
  '1', '2', '3', '4', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'
];

export default function CardConditionModal({ onSubmit, onCancel }) {
  const [isRaw, setIsRaw] = useState(true);
  const [company, setCompany] = useState('psa');
  const [grade, setGrade] = useState('9');

  const handleSubmit = () => {
    onSubmit({
      is_raw: isRaw,
      grading_company: isRaw ? null : company,
      grade: isRaw ? null : grade,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full bg-card border-border">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Card Condition</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This helps us find accurate market comps. Graded and raw card prices are very different.
          </p>

          {/* Toggle: Raw vs Graded */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setIsRaw(true)}
              className={`w-full p-4 rounded-lg border transition-all ${
                isRaw
                  ? 'bg-primary/10 border-primary/50 text-foreground'
                  : 'bg-secondary/30 border-border/40 text-muted-foreground hover:border-primary/30'
              }`}
            >
              <div className="font-semibold text-sm">Raw Card</div>
              <div className="text-xs mt-1">Ungraded, loose card</div>
            </button>

            <button
              onClick={() => setIsRaw(false)}
              className={`w-full p-4 rounded-lg border transition-all ${
                !isRaw
                  ? 'bg-primary/10 border-primary/50 text-foreground'
                  : 'bg-secondary/30 border-border/40 text-muted-foreground hover:border-primary/30'
              }`}
            >
              <div className="font-semibold text-sm">Graded Card</div>
              <div className="text-xs mt-1">In a slab with a grade</div>
            </button>
          </div>

          {/* Grading options */}
          {!isRaw && (
            <div className="space-y-3 mb-6 p-4 bg-secondary/20 rounded-lg border border-border/30">
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Grading Company" />
                </SelectTrigger>
                <SelectContent>
                  {GRADING_COMPANIES.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-start gap-2 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">Only comps for {GRADING_COMPANIES.find(c => c.id === company)?.label} {grade} will be included</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-primary">
              Scan Card
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}