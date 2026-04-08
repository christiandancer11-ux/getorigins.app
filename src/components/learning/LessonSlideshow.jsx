import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function LessonSlideshow({ lesson, onComplete, onBack }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Handle both direct slides and slides in lesson object
  let slides = [];
  if (Array.isArray(lesson.slides)) {
    slides = lesson.slides;
  } else if (lesson.slides && typeof lesson.slides === 'object') {
    slides = Object.values(lesson.slides);
  }
  
  const isFirstSlide = currentSlide === 0;
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (!isLastSlide) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstSlide) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">Loading lesson content...</p>
        <p className="text-xs text-muted-foreground">Lesson object: {JSON.stringify(lesson?.slides ? 'has slides' : 'no slides')}</p>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 mb-4">
          <ChevronLeft className="w-4 h-4" />
          Back to Lessons
        </Button>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-primary">Lesson {lesson.lesson_number}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{lesson.title}</h1>
          <p className="text-muted-foreground mt-2">{lesson.description}</p>
        </div>
      </div>

      {/* Slide Container */}
      <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 min-h-[500px] flex items-center justify-center border-2 border-primary/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            {/* Slide Content */}
            <div className="text-center space-y-6">
              {/* Emoji/Icon */}
              {slide.icon && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-7xl"
                >
                  {slide.icon}
                </motion.div>
              )}

              {/* Heading */}
              <h2 className="text-4xl font-bold text-foreground">{slide.title}</h2>

              {/* Main Content */}
              {slide.content && (
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {slide.content}
                </p>
              )}

              {/* Image */}
              {slide.image && (
                <motion.img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full max-w-md mx-auto rounded-lg"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                />
              )}

              {/* Visual Components */}
              {slide.visual && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {slide.visual}
                </motion.div>
              )}

              {/* Key Points */}
              {slide.points && slide.points.length > 0 && (
                <div className="space-y-2 text-left max-w-2xl mx-auto mt-6">
                  {slide.points.map((point, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-card/50"
                    >
                      <span className="text-primary text-xl shrink-0">✓</span>
                      <span className="text-foreground">{point}</span>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Quiz or Interactive */}
              {slide.quiz && (
                <div className="mt-6 space-y-3">
                  <p className="font-semibold text-foreground">{slide.quiz.question}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {slide.quiz.options.map((option, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        className="text-lg px-6 py-2 h-auto"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            className="h-full bg-primary"
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Slide {currentSlide + 1} of {slides.length}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={isFirstSlide}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2 justify-center">
          {slides.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentSlide ? 'bg-primary w-6' : 'bg-muted'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        {isLastSlide ? (
          <Button
            onClick={handleComplete}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete Lesson
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}