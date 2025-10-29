import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, AlertCircle } from "lucide-react";
import { config } from "@/config/env";

const RaiseIssue = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    productType: "First Year Engineering",
    details: "",
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      const validFiles = newFiles.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        return isImage || isVideo;
      });
      
      if (validFiles.length !== newFiles.length) {
        toast({
          title: "Invalid files",
          description: "Only images and videos are allowed",
          variant: "destructive",
        });
      }
      
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
      files.forEach(file => {
        formDataToSend.append('files', file);
      });

      // Construct URL with query parameters
      const url = new URL(`${config.apiBaseUrl}/api/v1/support/raise_issues`);
      url.searchParams.append('username', formData.email);
      url.searchParams.append('name', formData.name);
      url.searchParams.append('product_type', formData.productType);
      url.searchParams.append('user_origin', 'Future Bridge');
      url.searchParams.append('details', formData.details);

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'accept': 'application/json',
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to submit issue');
      }

      toast({
        title: "Success!",
        description: "Your issue has been submitted successfully. We'll get back to you soon.",
      });

      // Reset form
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        productType: "Standard",
        details: "",
      });
      setFiles([]);
      
      // Navigate back or to home
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Error submitting issue:', error);
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
                <Button onClick={() => navigate('/')} className="w-full">
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
                We're here to help! Please provide details about your concern or issue.
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
                  <Select
                    value={formData.productType}
                    onValueChange={(value) => setFormData({ ...formData, productType: value })}
                  >
                    <SelectTrigger id="productType">
                      <SelectValue />
                    </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="First Year Engineering">First Year Engineering</SelectItem>
                    <SelectItem value="Direct Second Year">Direct Second Year</SelectItem>
                    <SelectItem value="BCA/MCA (Integrated)">BCA/MCA (Integrated)</SelectItem>
                    <SelectItem value="BBA/BMS/BBM/MBA (Int.)">BBA/BMS/BBM/MBA (Int.)</SelectItem>
                    <SelectItem value="B.Pharmacy/Pharm D">B.Pharmacy/Pharm D</SelectItem>
                  </SelectContent>
                  </Select>
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <Label htmlFor="details">
                    Concern / Issue Details <span className="text-red-500">*</span>
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
                  <Label>
                    Attachments (Screenshots / Videos)
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Images and videos only
                      </p>
                    </label>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Upload size={16} className="text-gray-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="flex-shrink-0"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
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
