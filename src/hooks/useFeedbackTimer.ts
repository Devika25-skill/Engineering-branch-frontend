import { useState, useEffect } from 'react';

export const useFeedbackTimer = (delayMs: number = 40000) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    // Check if feedback was already skipped in this session
    const feedbackSkipped = sessionStorage.getItem('feedbackSkipped');
    if (feedbackSkipped === 'true') {
      setIsSkipped(true);
      return;
    }

    const timer = setTimeout(() => {
      if (!isSkipped) {
        setShowFeedback(true);
      }
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs, isSkipped]);

  const handleSkipSession = () => {
    setIsSkipped(true);
    setShowFeedback(false);
    sessionStorage.setItem('feedbackSkipped', 'true');
  };

  const handleClose = () => {
    setShowFeedback(false);
  };

  return {
    showFeedback,
    handleClose,
    handleSkipSession,
    isSkipped
  };
};