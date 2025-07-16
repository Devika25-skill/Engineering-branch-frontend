import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { feedbackService } from "@/services/feedbackService";

export const FeedbackSection = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

      // Reset form
      setRating(0);
      setEmail('');
      setFeedback('');
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

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-background via-muted/30 to-accent/20 border border-border shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="p-2 rounded-full bg-primary/10">
            <MessageSquare className="text-primary" size={20} />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            We Value Your Feedback
          </CardTitle>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your input helps us create better experiences for everyone
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              Rate your experience *
            </Label>
            <div className="flex gap-2 justify-center sm:justify-start p-2 bg-muted/30 rounded-lg">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md"
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
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                {rating === 1 && "We're sorry to hear that. Please let us know how we can improve."}
                {rating === 2 && "Thank you for your feedback. We'll work on improving."}
                {rating === 3 && "Thanks for your feedback! We appreciate your honesty."}
                {rating === 4 && "Great! We're glad you had a good experience."}
                {rating === 5 && "Amazing! Thank you for the excellent rating!"}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback-email" className="text-sm font-medium text-foreground">
                Email Address *
              </Label>
              <Input
                id="feedback-email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 bg-background border-border focus:border-primary"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="feedback-message" className="text-sm font-medium text-foreground">
                Your Feedback (Optional)
              </Label>
              <Textarea
                id="feedback-message"
                placeholder="Tell us what you think, what can we improve, or what you loved about your experience..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="mt-2 min-h-[120px] bg-background border-border focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="flex justify-center sm:justify-start pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="px-8 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </form>
      </CardContent>
    </Card>
  );
};