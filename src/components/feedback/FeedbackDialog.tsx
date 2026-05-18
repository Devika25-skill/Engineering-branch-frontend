import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, X, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { feedbackService } from "@/services/feedbackService";

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSkipSession: () => void;
}

export const FeedbackDialog = ({ isOpen, onClose, onSkipSession }: FeedbackDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Auto-populate email from localStorage userData
  useEffect(() => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        if (parsedUserData.email) {
          setEmail(parsedUserData.email);
        }
      }
    } catch (error) {
      console.error('Error parsing userData from localStorage:', error);
    }
  }, []);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please provide your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        username: email.trim(),
        rating,
        feedback: feedback.trim()
      });

      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });

      // Reset form and close
      setRating(0);
      setEmail('');
      setFeedback('');
      onClose();
      onSkipSession();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
    onSkipSession();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] w-[calc(100vw-2rem)] sm:w-full overflow-y-auto p-4 sm:p-6" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 rounded-full bg-primary/10">
                <MessageSquare className="text-primary" size={18} />
              </div>
              <DialogTitle className="text-lg sm:text-xl font-semibold text-foreground">Share Your Feedback</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-10 w-10 p-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full flex-shrink-0"
              aria-label="Close feedback dialog"
            >
              <X size={18} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-left">
            Help us improve your experience
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              How would you rate your experience? *
            </Label>
            <div className="flex gap-2 justify-center p-4 bg-muted/30 rounded-lg">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md touch-manipulation"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    size={24}
                    className={`transition-all duration-200 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-500 fill-yellow-500 drop-shadow-sm'
                        : 'text-muted-foreground hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {rating <= 2 && "We're sorry to hear that. Please let us know how we can improve."}
                {rating === 3 && "Thanks for your feedback! We appreciate your honesty."}
                {rating >= 4 && "Great! We're glad you had a good experience."}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 bg-background border-border focus:border-primary"
              required
            />
          </div>

          <div>
            <Label htmlFor="feedback" className="text-sm font-medium text-foreground">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Tell us what you think or how we can improve..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-2 min-h-[80px] bg-background border-border focus:border-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};