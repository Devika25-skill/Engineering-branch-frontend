
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const redirectTo = searchParams.get('redirect') || '/';
  const collegeId = searchParams.get('collegeId');

  const handleSignup = () => {
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    // Simulate signup
    localStorage.setItem('isLoggedIn', 'true');
    
    toast({
      title: "Account Created",
      description: "Welcome to College Finder!",
    });

    // New users always need to fill academic profile
    if (collegeId) {
      navigate(`/recommendations?collegeId=${collegeId}`);
    } else {
      navigate('/recommendations');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Sign Up</CardTitle>
              <CardDescription>
                Create your account to get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button onClick={handleSignup} className="w-full">
                Sign Up
              </Button>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <button 
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:underline"
                >
                  Login
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
