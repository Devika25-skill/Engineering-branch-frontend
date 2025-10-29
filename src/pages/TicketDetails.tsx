import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, Hash, Paperclip, Send, X, Image, Video, FileText, Upload, AlertCircle } from "lucide-react";
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
  const [fileError, setFileError] = useState<string>("");

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
    setFileError("");
    const selectedFiles = Array.from(e.target.files || []);
    
    // Check if adding these files would exceed the limit
    if (files.length + selectedFiles.length > 2) {
      setFileError("You can only upload a maximum of 2 files");
      e.target.value = "";
      return;
    }
    
    // Validate each file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/quicktime', 'video/x-msvideo'];
    const allowedExtensions = ['.jpeg', '.jpg', '.png', '.mp4', '.mov', '.avi'];
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    
    for (const file of selectedFiles) {
      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setFileError("Only jpeg, jpg, png, mp4, mov, and avi files are allowed");
        e.target.value = "";
        return;
      }
      
      // Check file size
      if (file.size > maxSize) {
        setFileError(`File "${file.name}" exceeds 100 MB limit`);
        e.target.value = "";
        return;
      }
    }
    
    setFiles(prev => [...prev, ...selectedFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setFileError("");
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast.error("Please add a comment");
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
          className="max-w-full max-h-full object-contain"
        >
          <source src={url} />
        </video>
      );
    } else if (isImage) {
      return (
        <img
          src={url}
          alt="Attachment"
          className="max-w-full max-h-full object-contain"
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
                  <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
                </div>
                {ticket.updated_at && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Updated: {new Date(ticket.updated_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ticket.attachments.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-video bg-card rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all hover:shadow-lg animate-scale-in flex items-center justify-center"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="w-full h-full flex items-center justify-center p-2">
                          {renderMedia(url)}
                        </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {comment.attachments.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative aspect-video bg-card rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-all hover:shadow-lg flex items-center justify-center"
                            >
                              <div className="w-full h-full flex items-center justify-center p-2">
                                {renderMedia(url)}
                              </div>
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
              <Label htmlFor="comment">Your Comment *</Label>
              <Textarea
                id="comment"
                placeholder="Type your comment here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="resize-none border-2 border-purple-200 focus:border-purple-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                Attachments (Screenshots / Videos)
              </Label>
              <p className="text-sm text-muted-foreground">
                Upload up to 2 files (jpeg, jpg, png, mp4, mov, avi). Max 100MB per file.
              </p>
              
              {/* Error Message */}
              {fileError && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{fileError}</p>
                </div>
              )}
              
              {/* Upload Area - Only show if less than 2 files */}
              {files.length < 2 && (
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors bg-card">
                  <input
                    type="file"
                    multiple
                    accept=".jpeg,.jpg,.png,.mp4,.mov,.avi"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-foreground font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {files.length === 0 ? "Up to 2 files" : `${2 - files.length} file remaining`}
                    </p>
                  </label>
                </div>
              )}

              {/* File Previews */}
              {files.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {files.map((file, index) => {
                    const isVideo = file.type.startsWith('video/');
                    const previewUrl = URL.createObjectURL(file);
                    
                    return (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary/50 bg-muted/30 hover:shadow-lg transition-all duration-300"
                      >
                        {/* Preview */}
                        <div className="aspect-video bg-muted/50 flex items-center justify-center p-4">
                          {isVideo ? (
                            <video
                              src={previewUrl}
                              controls
                              className="max-w-full max-h-full object-contain rounded"
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : (
                            <img
                              src={previewUrl}
                              alt={file.name}
                              className="max-w-full max-h-full object-contain rounded"
                            />
                          )}
                        </div>
                        
                        {/* File Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              {isVideo ? (
                                <Video className="h-4 w-4 text-white flex-shrink-0" />
                              ) : (
                                <Image className="h-4 w-4 text-white flex-shrink-0" />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-white font-medium truncate">
                                  {file.name}
                                </p>
                                <p className="text-xs text-white/80">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            
                            {/* Remove Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                              className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white flex-shrink-0 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !comment.trim()}
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
