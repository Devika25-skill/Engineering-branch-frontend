import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ticketService, Ticket } from "@/services/ticketService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, FileText, MessageSquare, Paperclip, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Navigation from "@/components/Navigation";

export default function MyTickets() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
      return;
    }

    fetchTickets();
  }, [isLoggedIn, navigate, user]);

  const fetchTickets = async () => {
    if (!user?.email || !user?.accessToken) return;

    try {
      setIsLoading(true);
      setError(null);
      const response = await ticketService.fetchUserTickets(user.email, user.accessToken);
      setTickets(response.data.tickets);
      setTotalTickets(response.data.total_tickets);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load tickets";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTicketExpansion = (ticketId: string) => {
    setExpandedTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy 'at' hh:mm a");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background py-8 px-4">
          <div className="max-w-4xl mx-auto">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-5 h-5" />
                Error Loading Tickets
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchTickets} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </>
    );
  }

  if (tickets.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-background py-8 px-4">
          <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Support Tickets</h1>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                No Tickets Found
              </CardTitle>
              <CardDescription>
                You haven't raised any support tickets yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/raise-issue")}>
                Raise a New Issue
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">My Support Tickets</h1>
            <p className="text-muted-foreground mt-1">
              Total: {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'}
            </p>
          </div>
          <Button onClick={() => navigate("/raise-issue")}>
            Raise New Issue
          </Button>
        </div>

        <div className="space-y-4">
          {tickets.map((ticket) => {
            const isExpanded = expandedTickets.has(ticket.ticket_id);
            const hasComments = ticket.comments && ticket.comments.length > 0;
            const hasAttachments = ticket.attachments && ticket.attachments.length > 0;

            return (
              <Card key={ticket.ticket_id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono">
                          {ticket.ticket_id}
                        </Badge>
                        <Badge 
                          variant={ticket.status === "Open" ? "default" : "secondary"}
                        >
                          {ticket.status}
                        </Badge>
                        {ticket.is_paid && (
                          <Badge variant="secondary">Premium</Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{ticket.product_type}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTicketExpansion(ticket.ticket_id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ticket.details}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(ticket.created_at)}</span>
                    </div>
                    {hasComments && (
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{ticket.comments.length} {ticket.comments.length === 1 ? 'comment' : 'comments'}</span>
                      </div>
                    )}
                    {hasAttachments && (
                      <div className="flex items-center gap-1">
                        <Paperclip className="w-4 h-4" />
                        <span>{ticket.attachments.length} {ticket.attachments.length === 1 ? 'attachment' : 'attachments'}</span>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Issue Details</h4>
                        <p className="text-sm whitespace-pre-wrap">{ticket.details}</p>
                      </div>

                      {hasAttachments && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Attachments</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {ticket.attachments.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative aspect-video rounded-lg overflow-hidden border hover:border-primary transition-colors"
                              >
                                <img
                                  src={url}
                                  alt={`Attachment ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasComments && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Comments</h4>
                          <ScrollArea className="h-64">
                            <div className="space-y-3 pr-4">
                              {ticket.comments.map((comment, index) => (
                                <div
                                  key={index}
                                  className={`p-3 rounded-lg border ${
                                    comment.user_type.toLowerCase() === 'support'
                                      ? 'bg-accent/50 border-accent'
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-2">
                                    <Badge variant={comment.user_type.toLowerCase() === 'support' ? 'default' : 'secondary'} className="text-xs">
                                      {comment.user_type}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(comment.commented_at)}
                                    </span>
                                  </div>
                                  <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                                  {comment.attachments && comment.attachments.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      {comment.attachments.map((url, idx) => (
                                        <a
                                          key={idx}
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="relative aspect-video rounded overflow-hidden border hover:border-primary transition-colors"
                                        >
                                          <img
                                            src={url}
                                            alt={`Comment attachment ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}

                      {ticket.updated_at && (
                        <p className="text-xs text-muted-foreground">
                          Last updated: {formatDate(ticket.updated_at)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        </div>
      </div>
    </>
  );
}
