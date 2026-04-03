import React from 'react';
import { Mail, MessageCircle, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Support() {
  const resources = [
    {
      icon: BookOpen,
      title: 'Documentation',
      description: 'Learn how to register cards, create QR codes, and manage your collection.',
      action: 'View Guides'
    },
    {
      icon: MessageCircle,
      title: 'FAQ',
      description: 'Find answers to common questions about Origins and card management.',
      action: 'Browse FAQ'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get in touch with our support team for personalized help.',
      action: 'Contact Us'
    },
    {
      icon: AlertCircle,
      title: 'Report an Issue',
      description: 'Let us know if you encounter any bugs or problems.',
      action: 'Report Now'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Support Center</h1>
          <p className="text-lg text-muted-foreground">We're here to help you get the most out of Origins</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {resources.map((resource, i) => {
            const Icon = resource.icon;
            return (
              <div key={i} className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-colors">
                <Icon className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-2">{resource.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                <Button variant="outline" size="sm">{resource.action}</Button>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-secondary/20 p-8">
          <h2 className="font-semibold text-foreground mb-3">Still need help?</h2>
          <p className="text-muted-foreground mb-6">
            Email us at <span className="text-primary">support@origins.app</span> and we'll get back to you within 24 hours.
          </p>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Contact Support</Button>
        </div>
      </div>
    </div>
  );
}