import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Hash, MapPin, Globe, Monitor, Paperclip, Send, X, Image as ImageIcon, Video, FileText } from "lucide-react";
import Navigation from "@/components/Navigation";
import { ticketService, Ticket } from "@/services/ticketService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const TicketDetails = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !ticketId) return;
    
    const fetchTicketDetails = async () => {
      try {
        setIsLoading(true);
        const response = await ticketService.fetchUserTickets(user.email, user.accessToken);
        const foundTicket = response.data.tickets.find(t => t.ticket_id === ticketId);
        
        if (foundTicket) {
          setTicket(foundTicket);
        } else {
          toast.error("Ticket not found");
          navigate('/my-tickets');
        }
      } catch (error) {
        console.error("Error fetching ticket details:", error);
        toast.error("Failed to load ticket details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicketDetails();
  }, [user, ticketId, navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitComment = async () => {
    if (!comment.trim() && files.length === 0) {
      toast.error("Please add a comment or attachment");
      return;
    }

    if (!user || !ticketId) return;

    try {
      setIsSubmitting(true);
      await ticketService.addComment(
        ticketId,
        user.email,
        comment,
        files,
        user.accessToken
      );

      toast.success("Comment added successfully");
      setComment("");
      setFiles([]);

      // Refresh ticket details
      const response = await ticketService.fetchUserTickets(user.email, user.accessToken);
      const updatedTicket = response.data.tickets.find(t => t.ticket_id === ticketId);
      if (updatedTicket) {
        setTicket(updatedTicket);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const renderMedia = (url: string) => {
    const isVideo = url.match(/\.(mp4|webm|ogg)$/i);
    const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isVideo) {
      return (
        <video 
          controls 
          className="w-full h-full object-contain"
        >
          <source src={url} />
        </video>
      );
    } else if (isImage) {
      return (
        <img
          src={url}
          alt="Attachment"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2">
        <FileText size={32} className="text-muted-foreground" />
        <span className="text-xs text-muted-foreground">File attachment</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-purple-200 rounded w-1/4"></div>
            <div className="h-64 bg-purple-200 rounded"></div>
            <div className="h-32 bg-purple-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 animate-fade-in">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Back Button */}
        <Link to="/my-tickets">
          <Button variant="ghost" className="mb-4 hover:bg-purple-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to My Tickets
          </Button>
        </Link>

        {/* Ticket Header */}
        <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm animate-scale-in">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Hash size={20} className="text-purple-600" />
                  <span className="font-mono text-sm text-muted-foreground">{ticket.ticket_id}</span>
                  <Badge className={`${getStatusColor(ticket.status)} border`}>
                    {ticket.status}
                  </Badge>
                  {ticket.is_paid && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl md:text-2xl text-gray-800">
                  {ticket.product_type}
                </CardTitle>
              </div>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
                {ticket.updated_at && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Updated: {new Date(ticket.updated_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-purple-600" />
                <span className="font-medium">Origin:</span>
                <span className="text-muted-foreground">{ticket.user_origin}</span>
              </div>
              <div className="flex items-center gap-2">
                <Monitor size={16} className="text-purple-600" />
                <span className="font-medium">Browser:</span>
                <span className="text-muted-foreground">{ticket.browser_info}</span>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Issue Details</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{ticket.details}</p>
            </div>

            {ticket.attachments && ticket.attachments.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Paperclip size={16} className="text-purple-600" />
                    <h3 className="font-semibold text-gray-800">
                      Attachments ({ticket.attachments.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {ticket.attachments.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-purple-100 hover:border-purple-300 transition-all hover:scale-105 animate-scale-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {renderMedia(url)}
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-gray-800">
              Comments ({ticket.comments?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ticket.comments && ticket.comments.length > 0 ? (
                ticket.comments.map((comment, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {comment.user_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{comment.email}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.commented_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{comment.comment}</p>
                    
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Paperclip size={14} className="text-purple-600" />
                          <span className="text-xs font-medium text-gray-700">
                            Attachments ({comment.attachments.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {comment.attachments.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative aspect-video bg-white rounded-lg overflow-hidden border border-purple-200 hover:border-purple-400 transition-all hover:scale-105"
                            >
                              {renderMedia(url)}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No comments yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Comment Section */}
        <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-gray-800">Add Comment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comment">Your Comment</Label>
              <Textarea
                id="comment"
                placeholder="Type your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none border-2 border-purple-200 focus:border-purple-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Attachments (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={files.length >= 5}
                  className="border-2 border-purple-200 hover:border-purple-400"
                >
                  <Paperclip className="mr-2 h-4 w-4" />
                  Choose Files ({files.length}/5)
                </Button>
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {files.map((file, index) => {
                    const isVideo = file.type.startsWith('video/');
                    const isImage = file.type.startsWith('image/');
                    const previewUrl = URL.createObjectURL(file);

                    return (
                      <div
                        key={index}
                        className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-purple-100 group"
                      >
                        {isVideo ? (
                          <div className="w-full h-full flex items-center justify-center bg-black/5">
                            <Video size={32} className="text-muted-foreground" />
                          </div>
                        ) : isImage ? (
                          <img
                            src={previewUrl}
                            alt={file.name}
                            className="w-full h-full object-contain"
                          />
                        ) : null}
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center p-2">
                            <p className="text-white text-xs font-medium truncate max-w-full">
                              {file.name}
                            </p>
                            <p className="text-white/80 text-xs">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting || (!comment.trim() && files.length === 0)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Comment
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TicketDetails;
