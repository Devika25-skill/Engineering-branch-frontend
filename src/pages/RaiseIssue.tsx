import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, AlertCircle, Image, Video } from "lucide-react";
import { config } from "@/config/env";

const RaiseIssue = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    productType: "",
    details: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileError, setFileError] = useState<string>("");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.details.trim()) {
      newErrors.details = "Please describe your concern or issue";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Check if adding new files would exceed the limit
      if (files.length + newFiles.length > 2) {
        setFileError("You can upload a maximum of 2 files");
        return;
      }

      // Allowed file extensions
      const allowedExtensions = ["jpeg", "jpg", "png", "mp4", "mov", "avi"];
      const maxFileSize = 100 * 1024 * 1024; // 100MB in bytes

      const validFiles: File[] = [];
      const newPreviews: string[] = [];
      let errorMessage = "";

      for (const file of newFiles) {
        // Check file extension
        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
        if (!allowedExtensions.includes(fileExtension)) {
          errorMessage = `Invalid file type. Allowed types: ${allowedExtensions.join(", ")}`;
          continue;
        }

        // Check file size
        if (file.size > maxFileSize) {
          errorMessage = `File "${file.name}" exceeds 100MB limit`;
          continue;
        }

        validFiles.push(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);
      }

      if (errorMessage) {
        setFileError(errorMessage);
        // Don't return, still add valid files
      } else {
        setFileError("");
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
        setFilePreviews((prev) => [...prev, ...newPreviews]);
      }

      // Reset input
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    // Revoke the preview URL to free up memory
    URL.revokeObjectURL(filePreviews[index]);

    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
    setFileError(""); // Clear error when removing files
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!isLoggedIn || !user?.accessToken) {
      toast({
        title: "Authentication required",
        description: "Please login to raise an issue",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Append files
      files.forEach((file) => {
        formDataToSend.append("files", file);
      });

      // Construct URL with query parameters
      const url = new URL(`${config.apiBaseUrl}/api/v1/support/raise_issues`);
      url.searchParams.append("username", formData.email);
      url.searchParams.append("name", formData.name);
      url.searchParams.append("product_type", formData.productType);
      url.searchParams.append("user_origin", "Future Bridge");
      url.searchParams.append("details", formData.details);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          accept: "application/json",
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to submit issue");
      }

      toast({
        title: "Success!",
        description:
          "Your issue has been submitted successfully. We'll get back to you soon.",
      });

      // Reset form
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        productType: "",
        details: "",
      });

      // Clean up preview URLs
      filePreviews.forEach((url) => URL.revokeObjectURL(url));
      setFiles([]);
      setFilePreviews([]);
      setFileError("");

      // Navigate back or to home
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error submitting issue:", error);
      toast({
        title: "Error",
        description: "Failed to submit your issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20">
          <div className="container mx-auto px-4">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Login Required</CardTitle>
                <CardDescription>
                  Please login to raise a support issue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/")} className="w-full">
                  Go to Home
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Raise a Support Issue
              </CardTitle>
              <CardDescription>
                We're here to help! Please provide details about your concern or
                issue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: "" });
                    }}
                    placeholder="Enter your name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors({ ...errors, email: "" });
                    }}
                    placeholder="Enter your email"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Product Type */}
                <div className="space-y-2">
                  <Label htmlFor="productType">
                    Product Type <span className="text-red-500">*</span>
                  </Label>
                  <SearchableSelect
                    options={[
                      {
                        value: "First Year Medical",
                        label: "First Year Medical",
                      },
                      {
                        value: "First Year Engineering",
                        label: "First Year Engineering",
                      },
                      {
                        value: "Direct Second Year",
                        label: "Direct Second Year",
                      },
                      {
                        value: "BCA/MCA (Integrated)",
                        label: "BCA/MCA (Integrated)",
                      },
                      {
                        value: "BBA/BMS/BBM/MBA (Int.)",
                        label: "BBA/BMS/BBM/MBA (Int.)",
                      },
                      {
                        value: "B.Pharmacy/Pharm D",
                        label: "B.Pharmacy/Pharm D",
                      },
                    ]}
                    value={formData.productType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, productType: value })
                    }
                    placeholder="Select your product type"
                    searchPlaceholder="Search product types..."
                  />
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <Label htmlFor="details">
                    Concern / Issue Details{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="details"
                    value={formData.details}
                    onChange={(e) => {
                      setFormData({ ...formData, details: e.target.value });
                      setErrors({ ...errors, details: "" });
                    }}
                    placeholder="Please describe your concern or issue in detail..."
                    className={`min-h-[150px] ${errors.details ? "border-red-500" : ""}`}
                  />
                  {errors.details && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.details}
                    </p>
                  )}
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Attachments (Screenshots / Videos)</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload up to 2 files (jpeg, jpg, png, mp4, mov, avi). Max
                    100MB per file.
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
                        onChange={handleFileChange}
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
                          {files.length === 0
                            ? "Up to 2 files"
                            : `${2 - files.length} file remaining`}
                        </p>
                      </label>
                    </div>
                  )}

                  {/* File Previews */}
                  {files.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {files.map((file, index) => {
                        const isVideo = file.type.startsWith("video/");

                        return (
                          <div
                            key={index}
                            className="relative group rounded-lg overflow-hidden border-2 border-border/50 hover:border-primary/50 bg-muted/30 hover:shadow-lg transition-all duration-300"
                          >
                            {/* Preview */}
                            <div className="aspect-video bg-muted/50 flex items-center justify-center p-4">
                              {isVideo ? (
                                <video
                                  src={filePreviews[index]}
                                  controls
                                  className="max-w-full max-h-full object-contain rounded"
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <img
                                  src={filePreviews[index]}
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
                                      {(file.size / (1024 * 1024)).toFixed(2)}{" "}
                                      MB
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

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Issue"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default RaiseIssue;
