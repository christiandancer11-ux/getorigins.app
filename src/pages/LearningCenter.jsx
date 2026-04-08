import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import InterestSelector from '@/components/learning/InterestSelector';
import LessonViewer from '@/components/learning/LessonViewer';
import AchievementBadge from '@/components/learning/AchievementBadge';
import { BookOpen, CheckCircle2, Zap, ExternalLink } from 'lucide-react';

export default function LearningCenter() {
  const { user } = useAuth();
  const [learningPath, setLearningPath] = useState(null);
  const [plan, setPlan] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showInterestSelector, setShowInterestSelector] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLearningPath = async () => {
      try {
        const paths = await base44.asServiceRole.entities.LearningPath.filter({
          user_email: user.email
        });

        if (paths.length > 0) {
          const path = paths[0];
          setLearningPath(path);

          // Load the associated plan
          const plans = await base44.asServiceRole.entities.LearningPlan.filter({
            id: path.plan_id
          });
          if (plans.length > 0) {
            setPlan(plans[0]);
          }

          // Load achievements
          const userAchievements = await base44.asServiceRole.entities.LearningAchievement.filter({
            user_email: user.email
          });
          setAchievements(userAchievements);
        } else {
          setShowInterestSelector(true);
        }
      } catch (e) {
        console.error('Failed to load learning path:', e);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadLearningPath();
    }
  }, [user]);

  const handleSelectInterests = async (selection) => {
    try {
      setLoading(true);
      
      // Generate a new learning plan
      const planResponse = await base44.functions.invoke('generateLearningPlan', {
        card_interests: selection.cardInterests,
        use_case: selection.useCase
      });

      const selectedPlan = planResponse.data;

      if (!selectedPlan) {
        alert('Failed to generate learning plan. Please try again.');
        setLoading(false);
        return;
      }

      // Create learning path
      const newPath = await base44.asServiceRole.entities.LearningPath.create({
        user_email: user.email,
        card_interests: selection.cardInterests,
        use_case: selection.useCase,
        plan_id: selectedPlan.id,
        lessons_completed: 0,
        total_lessons: selectedPlan.total_lessons,
        completion_percentage: 0,
        achievements_unlocked: [],
        current_lesson_index: 0,
        started_at: new Date().toISOString(),
        last_accessed: new Date().toISOString()
      });

      setLearningPath(newPath);
      setPlan(selectedPlan);
      setShowInterestSelector(false);
      } catch (e) {
      console.error('Failed to create learning path:', e);
      alert('Error creating learning path. Please try again.');
      } finally {
      setLoading(false);
      }
      };

  const completeLesson = async () => {
    if (!learningPath) return;

    const newIndex = learningPath.current_lesson_index + 1;
    const completedCount = learningPath.lessons_completed + 1;
    const completionPct = (completedCount / learningPath.total_lessons) * 100;

    // Update path
    const updated = await base44.asServiceRole.entities.LearningPath.update(learningPath.id, {
      current_lesson_index: newIndex,
      lessons_completed: completedCount,
      completion_percentage: completionPct,
      last_accessed: new Date().toISOString()
    });

    setLearningPath(updated);

    // Check for milestone achievements
    if (completedCount === 5) {
      await unlockAchievement('lesson_5_completed', '5 Lessons Completed', 3);
    } else if (completedCount === 10) {
      await unlockAchievement('lesson_10_completed', '10 Lessons Completed', 7);
    } else if (completedCount === 15) {
      await unlockAchievement('lesson_15_completed', '15 Lessons Completed', 7);
    } else if (completedCount === learningPath.total_lessons) {
      await unlockAchievement('plan_completed', 'Completed Learning Path', 14);
    }
  };

  const unlockAchievement = async (type, description, rewardDays) => {
    const achievement = await base44.asServiceRole.entities.LearningAchievement.create({
      user_email: user.email,
      achievement_type: type,
      reward_type: 'pro_days',
      reward_value: rewardDays,
      unlocked_at: new Date().toISOString(),
      description
    });
    setAchievements([...achievements, achievement]);
  };

  const changeInterests = () => {
    setShowInterestSelector(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!learningPath || !plan) {
    return <InterestSelector onSelect={handleSelectInterests} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-foreground">{plan.name}</h1>
                <p className="text-xs text-muted-foreground">{learningPath.use_case.replace(/_/g, ' ').toUpperCase()}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={changeInterests} className="border-border/50">
              Change Interests
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold text-foreground">{learningPath.lessons_completed}/{learningPath.total_lessons}</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${learningPath.completion_percentage}%` }}
                className="h-full bg-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedLesson !== null ? (
              <LessonViewer
                lesson={plan.lessons[selectedLesson]}
                onComplete={completeLesson}
                onBack={() => setSelectedLesson(null)}
              />
            ) : (
              <div className="space-y-4">
                {plan.lessons.map((lesson, idx) => {
                  const isCompleted = idx < learningPath.lessons_completed;
                  const isCurrent = idx === learningPath.current_lesson_index;

                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedLesson(idx)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-primary bg-primary/10'
                          : isCompleted
                          ? 'border-green-500/30 bg-green-500/5'
                          : 'border-border/50 bg-card hover:border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-muted-foreground">
                              Lesson {lesson.lesson_number}
                            </span>
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          </div>
                          <h3 className="font-semibold text-foreground truncate">{lesson.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lesson.description}</p>
                        </div>
                        {isCurrent && <Zap className="w-5 h-5 text-primary shrink-0" />}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar: Achievements & Resources */}
          <div className="space-y-6">
            {/* Achievements */}
            {achievements.length > 0 && (
              <Card className="p-4 border-border/50">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Achievements Unlocked
                </h3>
                <div className="space-y-2">
                  {achievements.map(ach => (
                    <AchievementBadge key={ach.id} achievement={ach} />
                  ))}
                </div>
              </Card>
            )}

            {/* Quick Links */}
            {selectedLesson !== null && plan.lessons[selectedLesson]?.learning_resources.length > 0 && (
              <Card className="p-4 border-border/50">
                <h3 className="font-semibold text-foreground mb-3">Resources</h3>
                <div className="space-y-2">
                  {plan.lessons[selectedLesson].learning_resources.slice(0, 5).map((res, idx) => (
                    <a
                      key={idx}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-xs text-muted-foreground hover:text-primary"
                    >
                      <span className="text-xs">{res.platform === 'youtube' ? '▶' : res.platform === 'reddit' ? '🔗' : '📄'}</span>
                      <span className="truncate flex-1">{res.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              </Card>
            )}

            {/* Card Interests */}
            <Card className="p-4 border-border/50">
              <h3 className="font-semibold text-foreground mb-2">Your Interests</h3>
              <div className="flex flex-wrap gap-2">
                {learningPath.card_interests.map(interest => (
                  <span key={interest} className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                    {interest.replace(/_/g, ' ').toUpperCase()}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}