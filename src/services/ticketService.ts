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
}

export const ticketService = new TicketService();
