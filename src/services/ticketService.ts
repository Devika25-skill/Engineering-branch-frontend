import { config } from "@/config/env";

export interface TicketComment {
  email: string;
  user_type: string;
  comment: string;
  attachments: string[];
  commented_at: string;
}

export interface Ticket {
  ticket_id: string;
  username: string;
  name: string;
  product_type: string;
  user_origin: string;
  details: string;
  attachments: string[];
  browser_info: string;
  created_at: string;
  updated_at: string | null;
  status: string;
  is_paid: boolean;
  comments: TicketComment[];
}

interface TicketsResponse {
  message: string;
  success: boolean;
  data: {
    total_tickets: number;
    tickets: Ticket[];
  };
}

class TicketService {
  private baseUrl = `${config.apiBaseUrl}`;

  async fetchUserTickets(username: string, accessToken: string): Promise<TicketsResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/support/tickets/username?username=${encodeURIComponent(username)}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TicketsResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch tickets');
      }

      return data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async addComment(
    ticketId: string,
    email: string,
    comment: string,
    files: File[],
    accessToken: string
  ): Promise<Ticket> {
    try {
      const formData = new FormData();
      
      files.forEach(file => {
        formData.append('files', file);
      });

      const url = `${this.baseUrl}/api/v1/support/tickets/${ticketId}/comments?email=${encodeURIComponent(email)}&user_type=User&comment=${encodeURIComponent(comment)}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to add comment');
      }

      return data.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async closeTickets(ticketIds: string[], accessToken: string): Promise<{ modified_count: number }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/support/tickets/bulk-action`,
        {
          method: 'PATCH',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'Close',
            ticket_ids: ticketIds,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to close tickets');
      }

      return data.data;
    } catch (error) {
      console.error('Error closing tickets:', error);
      throw error;
    }
  }
}

export const ticketService = new TicketService();
