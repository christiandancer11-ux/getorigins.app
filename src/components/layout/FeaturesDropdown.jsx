import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, QrCode, BarChart3, TrendingUp, AlertCircle, Tag, BookOpen, Zap, Users, MessageSquare, Award, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeaturesDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const features = [
    { icon: QrCode, label: 'Card QR Codes', path: '/dashboard', desc: 'Register & track your cards' },
    { icon: BarChart3, label: 'Market Value', path: '/market', desc: 'Live pricing & comps' },
    { icon: TrendingUp, label: 'Trending Cards', path: '/trending', desc: 'Hottest cards by category' },
    { icon: AlertCircle, label: 'Price Alerts', path: '/alerts', desc: 'Get notified on price moves' },
    { icon: Tag, label: 'BOLO Alerts', path: '/bolo', desc: 'Watch for stolen cards' },
    { icon: BookOpen, label: 'Learning Center', path: '/learn', desc: 'Free educational paths' },
    { icon: Zap, label: 'Card Flipper', path: '/flipper', desc: 'Find flip opportunities' },
    { icon: Users, label: 'Leaderboard', path: '/leaderboard', desc: 'Top collectors & trades' },
    { icon: MessageSquare, label: 'Social Feed', path: '/feed', desc: 'Community activity' },
    { icon: Award, label: 'Card Show', path: '/card-show', desc: 'Trade comps & analysis' },
    { icon: Tag, label: 'Watchlist', path: '/watchlist', desc: 'Cards you\'re tracking' },
    { icon: HelpCircle, label: 'Support', path: '/support', desc: 'Help & resources' },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-1 text-muted-foreground hover:text-foreground"
      >
        Features
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 rounded-xl bg-card border border-border/50 shadow-xl p-2 z-50"
          >
            <div className="grid grid-cols-1 gap-1">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={feature.path}
                    to={feature.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{feature.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{feature.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}