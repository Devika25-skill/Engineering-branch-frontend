import { config } from "@/config/env";

interface FeedbackPayload {
  username: string;
  rating: number;
  feedback: string;
}

interface FeedbackResponse {
  message: string;
  success: boolean;
  data: Record<string, any>;
}

class FeedbackService {
  private baseUrl = `${config.apiBaseUrl}`;

  async submitFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/user/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FeedbackResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      return data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }
}

export const feedbackService = new FeedbackService();