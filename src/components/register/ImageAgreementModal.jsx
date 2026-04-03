import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

export default function ImageAgreementModal({ isOpen, onAgree, onDisagree }) {
  const [checked, setChecked] = useState(false);

  const handleAgree = () => {
    if (checked) {
      localStorage.setItem('origins_image_agreement_accepted', 'true');
      onAgree();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onDisagree();
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Image Usage Agreement
          </DialogTitle>
          <DialogDescription>Please review and accept our terms</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-64 overflow-y-auto">
          <div className="bg-secondary/50 rounded-lg p-4 space-y-3 text-sm text-foreground">
            <p>
              By uploading images and likenesses to the Origins app, you grant us permission to use any images, photos, and likenesses you provide for:
            </p>
            <ul className="space-y-2 ml-4 list-disc text-muted-foreground">
              <li>Marketing and promotional materials for the Origins app</li>
              <li>Social media content and advertisements</li>
              <li>App features, case studies, and testimonials</li>
              <li>Future content and platform enhancements</li>
              <li>Website and media publications related to Origins</li>
            </ul>
            <p className="pt-2">
              This is a non-exclusive right, meaning you retain ownership of your images and may use them elsewhere.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox 
            id="agree"
            checked={checked}
            onCheckedChange={setChecked}
            className="border-border"
          />
          <Label htmlFor="agree" className="text-sm cursor-pointer">
            I agree to the image usage terms
          </Label>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onDisagree}
            className="flex-1 border-border"
          >
            Decline
          </Button>
          <Button 
            onClick={handleAgree}
            disabled={!checked}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            I Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}