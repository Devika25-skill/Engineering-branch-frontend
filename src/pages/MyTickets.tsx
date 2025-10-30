import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Hash, MapPin, MessageSquare, ChevronRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import { ticketService, Ticket } from "@/services/ticketService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MyTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTickets = async () => {
      try {
        setIsLoading(true);
        const response = await ticketService.fetchUserTickets(user.email, user.accessToken);
        setTickets(response.data.tickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        toast.error("Failed to load tickets");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">My Tickets</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-purple-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">My Tickets</h1>
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground text-lg">
                Please log in to view your tickets.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 animate-fade-in">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            {tickets.length === 0 ? 'No tickets found' : `${tickets.length} ticket${tickets.length === 1 ? '' : 's'} found`}
          </p>
        </div>
        
        {tickets.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <div className="mb-4">
                <Hash size={64} className="mx-auto text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tickets Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't raised any support tickets yet.
              </p>
              <Link to="/raise-issue">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all">
                  Raise Your First Ticket
                </button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
            {tickets.map((ticket, index) => (
              <Link 
                key={ticket.ticket_id} 
                to={`/ticket/${ticket.ticket_id}`}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card className="group bg-white/90 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer h-full">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Hash size={18} className="text-purple-600 flex-shrink-0" />
                        <span className="font-mono text-xs text-muted-foreground">
                          {ticket.ticket_id}
                        </span>
                      </div>
                      <ChevronRight className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" size={20} />
                    </div>

                    <h3 className="font-bold text-gray-800 text-base md:text-lg mb-3 line-clamp-1 group-hover:text-purple-600 transition-colors">
                      {ticket.product_type}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {ticket.details}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`${getStatusColor(ticket.status)} border text-xs`}>
                          {ticket.status}
                        </Badge>
                        {ticket.is_paid && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 text-xs">
                            Premium
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {ticket.comments && ticket.comments.length > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare size={14} className="text-purple-600" />
                            <span>{ticket.comments.length}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar size={14} className="text-purple-600" />
                          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-purple-100">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin size={12} className="text-purple-600" />
                        <span>{ticket.user_origin}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;
