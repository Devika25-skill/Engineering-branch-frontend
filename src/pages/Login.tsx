
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectTo = searchParams.get('redirect') || '/';
  const collegeId = searchParams.get('collegeId');

  const handleLogin = () => {
    // Simulate login
    localStorage.setItem('isLoggedIn', 'true');
    
    toast({
      title: "Login Successful",
      description: "Welcome back!",
    });

    // Check if user has academic profile
    const hasAcademicProfile = localStorage.getItem('userAcademicProfile');
    
    if (collegeId && hasAcademicProfile) {
      // Redirect back to college details page
      navigate(`/college/${collegeId}`);
    } else if (collegeId && !hasAcademicProfile) {
      // Redirect to recommendations page to fill profile
      navigate(`/recommendations?collegeId=${collegeId}`);
    } else {
      // Default redirect
      navigate(redirectTo);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
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
              <Button onClick={handleLogin} className="w-full">
                Login
              </Button>
              <p className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button 
                  onClick={() => navigate('/signup')}
                  className="text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
