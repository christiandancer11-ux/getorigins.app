import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RotateCcw, TrendingUp, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

const GRADE_COLORS = {
  10: 'text-yellow-400',
  9.5: 'text-green-400',
  9: 'text-green-400',
  8.5: 'text-blue-400',
  8: 'text-blue-400',
};

const CONFIDENCE_BADGE = {
  high: { label: 'High Confidence', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
  medium: { label: 'Medium Confidence', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  low: { label: 'Low Confidence', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const RECOMMENDATION = {
  submit: { label: 'Worth Submitting', icon: CheckCircle2, color: 'text-green-400' },
  raw_ok: { label: 'Fine Raw', icon: TrendingUp, color: 'text-blue-400' },
  not_worth_grading: { label: 'Not Worth Grading', icon: XCircle, color: 'text-red-400' },
};

function GradeCard({ company, grade, confidence, notes, subgrades }) {
  const color = GRADE_COLORS[grade] || 'text-muted-foreground';
  const conf = CONFIDENCE_BADGE[confidence] || CONFIDENCE_BADGE.medium;

  return (
    <Card className="p-4 border-border bg-card/60">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">{company}</span>
        <Badge className={`text-xs ${conf.class}`}>{conf.label}</Badge>
      </div>
      <div className={`text-4xl font-display font-bold mb-2 ${color}`}>{grade}</div>
      {subgrades && (
        <div className="grid grid-cols-2 gap-1 mb-3">
          {Object.entries(subgrades).map(([key, val]) => (
            <div key={key} className="text-xs text-muted-foreground flex justify-between bg-muted/40 rounded px-2 py-1">
              <span className="capitalize">{key}</span>
              <span className="text-foreground font-medium">{val}</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-muted-foreground leading-relaxed">{notes}</p>
    </Card>
  );
}

export default function GradingResults({ result, images, onReset }) {
  const rec = RECOMMENDATION[result?.recommendation] || RECOMMENDATION.raw_ok;
  const RecIcon = rec.icon;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="mb-6 pt-2">
            <h1 className="text-2xl font-bold font-display">Grading Analysis</h1>
            <p className="text-muted-foreground text-sm mt-1">AI opinion based on your card photos</p>
          </div>

          {/* Overall Assessment */}
          <Card className="p-5 border-primary/20 bg-primary/5 mb-5">
            <div className={`flex items-center gap-2 mb-3 font-semibold ${rec.color}`}>
              <RecIcon className="w-5 h-5" />
              {rec.label}
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{result?.overall_assessment}</p>
          </Card>

          {/* Disclaimer */}
          <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-3 mb-5 text-xs text-muted-foreground">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-500" />
            <span>This is an AI opinion for educational purposes only. Actual graded results may vary. Always verify with a professional grader.</span>
          </div>

          {/* Grade Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <GradeCard
              company="PSA"
              grade={result?.psa_grade}
              confidence={result?.psa_confidence}
              notes={result?.psa_notes}
            />
            <GradeCard
              company="BGS"
              grade={result?.bgs_grade}
              confidence={result?.bgs_confidence}
              notes={result?.bgs_notes}
              subgrades={result?.bgs_subgrades}
            />
            <GradeCard
              company="SGC"
              grade={result?.sgc_grade}
              confidence={result?.sgc_confidence}
              notes={result?.sgc_notes}
            />
            <GradeCard
              company="CGC"
              grade={result?.cgc_grade}
              confidence={result?.cgc_confidence}
              notes={result?.cgc_notes}
            />
          </div>

          {/* Captured Images */}
          {images && Object.keys(images).length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Analyzed Photos</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(images).map(([key, val]) => (
                  <img key={key} src={val.url} alt={key} className="w-full aspect-square object-cover rounded-lg" />
                ))}
              </div>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-2" /> Grade Another Card
          </Button>
        </motion.div>
      </div>
    </div>
  );
}