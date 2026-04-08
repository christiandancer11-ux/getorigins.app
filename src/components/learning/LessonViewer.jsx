import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft, CheckCircle2, ExternalLink, Lightbulb } from 'lucide-react';

export default function LessonViewer({ lesson, onComplete, onBack, onChangePlan }) {
  if (!lesson || !lesson.title) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Lesson data unavailable. Please try again.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Lessons
          </Button>
          <Button variant="outline" size="sm" onClick={onChangePlan} className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Change Plan
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{lesson.title}</h1>
        <p className="text-muted-foreground text-lg">{lesson.description}</p>
      </div>

      {/* Main Content */}
      {lesson.content && (
        <Card className="p-8 border-border/50 prose prose-sm prose-invert max-w-none">
          <ReactMarkdown>{lesson.content}</ReactMarkdown>
        </Card>
      )}

      {/* Key Takeaways */}
      {lesson.key_takeaways && lesson.key_takeaways.length > 0 && (
        <Card className="p-6 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3 mb-3">
            <Lightbulb className="w-5 h-5 text-primary shrink-0" />
            <h3 className="font-semibold text-foreground">Key Takeaways</h3>
          </div>
          <ul className="space-y-2">
            {lesson.key_takeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-bold mt-1">•</span>
                {takeaway}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Resources */}
      {lesson.learning_resources && lesson.learning_resources.length > 0 && (
        <Card className="p-6 border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Learning Resources</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {lesson.learning_resources.map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-all hover:bg-card/80"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary uppercase">{res.type}</span>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{res.title}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">{res.platform}</p>
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Origins Feature Integration */}
      {lesson.origins_feature_integration && (
        <Card className="p-6 border-border/50 bg-secondary/20">
          <h3 className="font-semibold text-foreground mb-2">Practice with Origins</h3>
          <p className="text-sm text-muted-foreground">{lesson.origins_feature_integration}</p>
        </Card>
      )}

      {/* Practical Exercise */}
      {lesson.practical_exercise && (
        <Card className="p-6 border-border/50">
          <h3 className="font-semibold text-foreground mb-2">Your Task</h3>
          <p className="text-sm text-muted-foreground mb-4">{lesson.practical_exercise}</p>
        </Card>
      )}

      {/* Complete Button */}
      <Button
        onClick={onComplete}
        size="lg"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 gap-2 text-base font-semibold"
      >
        <CheckCircle2 className="w-5 h-5" />
        Complete Lesson
      </Button>
    </motion.div>
  );
}