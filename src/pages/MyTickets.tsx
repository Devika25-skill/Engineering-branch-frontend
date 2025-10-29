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
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="space-y-2 animate-fade-in">
              <Skeleton className="h-10 w-64 rounded-lg" />
              <Skeleton className="h-5 w-40 rounded-lg" />
            </div>
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-fade-in animation-delay-300 border-border/50 shadow-sm">
                <CardHeader>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <Skeleton className="h-6 w-full max-w-xs rounded-lg" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full rounded-lg" />
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
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <Card className="border-destructive/50 bg-destructive/5 shadow-lg animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-6 h-6" />
                  Error Loading Tickets
                </CardTitle>
                <CardDescription className="text-base">{error}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={fetchTickets} variant="outline" className="gap-2">
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
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 animate-fade-in">My Support Tickets</h1>
            <Card className="text-center py-12 shadow-lg animate-scale-in border-border/50">
              <CardHeader>
                <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">No Tickets Found</CardTitle>
                <CardDescription className="text-base">
                  You haven't raised any support tickets yet. Start by creating your first ticket.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/raise-issue")} size="lg" className="gap-2">
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
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                My Support Tickets
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {totalTickets}
                </span>
                {totalTickets === 1 ? 'ticket' : 'tickets'}
              </p>
            </div>
            <Button onClick={() => navigate("/raise-issue")} size="lg" className="gap-2 shadow-md hover:shadow-lg transition-shadow">
              Raise New Issue
            </Button>
          </div>

          <div className="space-y-4 animate-fade-in">
            {tickets.map((ticket, index) => {
              const isExpanded = expandedTickets.has(ticket.ticket_id);
              const hasComments = ticket.comments && ticket.comments.length > 0;
              const hasAttachments = ticket.attachments && ticket.attachments.length > 0;

              return (
                <Card 
                  key={ticket.ticket_id} 
                  className="overflow-hidden border-border/50 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-4 bg-gradient-to-r from-card to-muted/10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="font-mono text-xs px-3 py-1 bg-background/50">
                            {ticket.ticket_id}
                          </Badge>
                          <Badge 
                            variant={ticket.status === "Open" ? "default" : "secondary"}
                            className={ticket.status === "Open" ? "bg-primary shadow-sm" : ""}
                          >
                            {ticket.status}
                          </Badge>
                          {ticket.is_paid && (
                            <Badge variant="secondary" className="bg-accent shadow-sm">Premium</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg md:text-xl">{ticket.product_type}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTicketExpansion(ticket.ticket_id)}
                        className="rounded-full hover:bg-accent transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 pt-2">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <p className="text-sm text-foreground/80 line-clamp-2">
                        {ticket.details}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs md:text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>
                      {hasComments && (
                        <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                          <MessageSquare className="w-4 h-4" />
                          <span>{ticket.comments.length} {ticket.comments.length === 1 ? 'comment' : 'comments'}</span>
                        </div>
                      )}
                      {hasAttachments && (
                        <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                          <Paperclip className="w-4 h-4" />
                          <span>{ticket.attachments.length} {ticket.attachments.length === 1 ? 'attachment' : 'attachments'}</span>
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="space-y-6 pt-4 border-t border-border/50 animate-fade-in">
                        <div className="bg-accent/20 rounded-lg p-4">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Issue Details
                          </h4>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{ticket.details}</p>
                        </div>

                        {hasAttachments && (
                          <div>
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                              <Paperclip className="w-4 h-4" />
                              Attachments
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {ticket.attachments.map((url, index) => (
                                <a
                                  key={index}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative aspect-video rounded-lg overflow-hidden border border-border/50 hover:border-primary transition-all duration-300 hover:shadow-lg hover:scale-105"
                                >
                                  <img
                                    src={url}
                                    alt={`Attachment ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {hasComments && (
                          <div>
                            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Comments ({ticket.comments.length})
                            </h4>
                            <ScrollArea className="h-80 rounded-lg border border-border/50 bg-muted/20 p-3">
                              <div className="space-y-3 pr-3">
                                {ticket.comments.map((comment, index) => (
                                  <div
                                    key={index}
                                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                                      comment.user_type.toLowerCase() === 'support'
                                        ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
                                        : 'bg-card border-border/50 hover:border-border'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                      <Badge 
                                        variant={comment.user_type.toLowerCase() === 'support' ? 'default' : 'secondary'} 
                                        className="text-xs shadow-sm"
                                      >
                                        {comment.user_type}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                        {formatDate(comment.commented_at)}
                                      </span>
                                    </div>
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{comment.comment}</p>
                                    {comment.attachments && comment.attachments.length > 0 && (
                                      <div className="grid grid-cols-2 gap-2 mt-3">
                                        {comment.attachments.map((url, idx) => (
                                          <a
                                            key={idx}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative aspect-video rounded-lg overflow-hidden border border-border/50 hover:border-primary transition-all duration-300 hover:shadow-lg hover:scale-105"
                                          >
                                            <img
                                              src={url}
                                              alt={`Comment attachment ${idx + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
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
                          <p className="text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-full inline-block">
                            Last updated: {formatDate(ticket.updated_at)}
                          </p>
                        )}

                        {/* Add Comment Section */}
                        <div className="pt-6 border-t border-border/50 space-y-4 bg-accent/10 rounded-lg p-4">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Add Comment
                          </h4>
                          <Textarea
                            placeholder="Type your comment here..."
                            value={commentText[ticket.ticket_id] || ''}
                            onChange={(e) => setCommentText(prev => ({ ...prev, [ticket.ticket_id]: e.target.value }))}
                            className="min-h-[100px] bg-background border-border/50 focus:border-primary transition-colors"
                            disabled={isSubmittingComment[ticket.ticket_id]}
                          />
                          
                          {/* File Upload Section */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRefs.current[ticket.ticket_id]?.click()}
                                disabled={isSubmittingComment[ticket.ticket_id] || (selectedFiles[ticket.ticket_id]?.length || 0) >= 2}
                                className="gap-2 shadow-sm hover:shadow-md transition-shadow"
                              >
                                <Upload className="w-4 h-4" />
                                Upload Files
                              </Button>
                              <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
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
                              <div className="flex gap-3 flex-wrap">
                                {selectedFiles[ticket.ticket_id].map((file, index) => (
                                  <div key={index} className="relative group animate-scale-in">
                                    <div className="w-24 h-24 rounded-lg border border-border/50 overflow-hidden bg-muted flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
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
                                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeFile(ticket.ticket_id, index)}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                    <p className="text-xs text-muted-foreground mt-1.5 truncate max-w-[96px] text-center">
                                      {file.name}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end pt-2">
                            <Button
                              onClick={() => handleSubmitComment(ticket.ticket_id)}
                              disabled={isSubmittingComment[ticket.ticket_id] || !commentText[ticket.ticket_id]?.trim()}
                              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
                            >
                              {isSubmittingComment[ticket.ticket_id] ? (
                                <>Processing...</>
                              ) : (
                                <>
                                  <Send className="w-4 h-4" />
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
