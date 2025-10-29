import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ticketService, Ticket } from "@/services/ticketService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, FileText, MessageSquare, Paperclip, Calendar, ChevronDown, ChevronUp, Send, X, Upload } from "lucide-react";
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
  const [commentText, setCommentText] = useState<{ [ticketId: string]: string }>({});
  const [selectedFiles, setSelectedFiles] = useState<{ [ticketId: string]: File[] }>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<{ [ticketId: string]: boolean }>({});
  const fileInputRefs = useRef<{ [ticketId: string]: HTMLInputElement | null }>({});

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

  const handleFileSelect = (ticketId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      return isImage || isVideo;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid file type",
        description: "Only images and videos are allowed",
        variant: "destructive",
      });
    }

    const currentFiles = selectedFiles[ticketId] || [];
    const newFiles = [...currentFiles, ...validFiles].slice(0, 2);
    
    if (currentFiles.length + validFiles.length > 2) {
      toast({
        title: "Maximum 2 files",
        description: "You can only upload up to 2 files",
        variant: "destructive",
      });
    }

    setSelectedFiles(prev => ({ ...prev, [ticketId]: newFiles }));
  };

  const removeFile = (ticketId: string, index: number) => {
    setSelectedFiles(prev => ({
      ...prev,
      [ticketId]: (prev[ticketId] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmitComment = async (ticketId: string) => {
    const comment = commentText[ticketId]?.trim();
    
    if (!comment) {
      toast({
        title: "Comment required",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    if (!user?.email || !user?.accessToken) return;

    try {
      setIsSubmittingComment(prev => ({ ...prev, [ticketId]: true }));
      
      const files = selectedFiles[ticketId] || [];
      const updatedTicket = await ticketService.addComment(
        ticketId,
        user.email,
        comment,
        files,
        user.accessToken
      );

      // Update the ticket in the list
      setTickets(prevTickets => 
        prevTickets.map(t => t.ticket_id === ticketId ? updatedTicket : t)
      );

      // Clear the form
      setCommentText(prev => ({ ...prev, [ticketId]: '' }));
      setSelectedFiles(prev => ({ ...prev, [ticketId]: [] }));
      if (fileInputRefs.current[ticketId]) {
        fileInputRefs.current[ticketId]!.value = '';
      }

      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add comment";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [ticketId]: false }));
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

                      {/* Add Comment Section */}
                      <div className="pt-4 border-t space-y-3">
                        <h4 className="font-semibold text-sm">Add Comment</h4>
                        <Textarea
                          placeholder="Type your comment here..."
                          value={commentText[ticket.ticket_id] || ''}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [ticket.ticket_id]: e.target.value }))}
                          className="min-h-[100px]"
                          disabled={isSubmittingComment[ticket.ticket_id]}
                        />
                        
                        {/* File Upload Section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fileInputRefs.current[ticket.ticket_id]?.click()}
                              disabled={isSubmittingComment[ticket.ticket_id] || (selectedFiles[ticket.ticket_id]?.length || 0) >= 2}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Files
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              Max 2 files (images/videos only)
                            </span>
                            <input
                              ref={el => fileInputRefs.current[ticket.ticket_id] = el}
                              type="file"
                              multiple
                              accept="image/*,video/*"
                              onChange={(e) => handleFileSelect(ticket.ticket_id, e)}
                              className="hidden"
                            />
                          </div>

                          {/* Selected Files Preview */}
                          {selectedFiles[ticket.ticket_id] && selectedFiles[ticket.ticket_id].length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {selectedFiles[ticket.ticket_id].map((file, index) => (
                                <div key={index} className="relative group">
                                  <div className="w-20 h-20 rounded border overflow-hidden bg-muted flex items-center justify-center">
                                    {file.type.startsWith('image/') ? (
                                      <img
                                        src={URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <FileText className="w-8 h-8 text-muted-foreground" />
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeFile(ticket.ticket_id, index)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-[80px]">
                                    {file.name}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleSubmitComment(ticket.ticket_id)}
                            disabled={isSubmittingComment[ticket.ticket_id] || !commentText[ticket.ticket_id]?.trim()}
                            size="sm"
                          >
                            {isSubmittingComment[ticket.ticket_id] ? (
                              <>Processing...</>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Comment
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
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
