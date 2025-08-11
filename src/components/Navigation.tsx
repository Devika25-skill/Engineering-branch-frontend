
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, User, Heart, Sparkles, Building, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "@/components/auth/LoginDialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProgramSelectionDialog } from "@/components/common/ProgramSelectionDialog";
import type { ProgramType } from "@/components/common/ProgramSelectionDialog";

const Navigation = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProgramDialog, setShowProgramDialog] = useState(false);

  const handleLogin = () => {
    setLoginDialogOpen(true);
  };

  const handleProgramSelect = (program: ProgramType) => {
    if (program === 'first-year' || program === 'direct-second-year') {
      localStorage.setItem('recommendation_type', program);
      localStorage.removeItem('integrated_admission_type');
    } else {
      localStorage.setItem('integrated_admission_type', program);
      localStorage.removeItem('recommendation_type');
    }
    
    switch (program) {
      case 'first-year':
        navigate('/recommendations');
        break;
      case 'direct-second-year':
        navigate('/diploma-recommendations/steps');
        break;
      case 'BCA_MCA_Int':
      case 'BBA_BMS_BBM_MBA_Int':
      case 'B_and_D_Pharmacy':
        navigate(`/integrated-steps?type=${program}`);
        break;
      default:
        break;
    }
  };
  
  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <button 
        onClick={() => {
          navigate('/colleges');
          if (mobile) setMobileMenuOpen(false);
        }}
        className={`flex items-center text-gray-600 hover:text-blue-600 transition-all duration-300 group relative ${mobile ? 'w-full text-left p-3 rounded-lg hover:bg-blue-50' : 'py-2'}`}
      >
        <Building size={18} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
        <span className="font-medium">Browse Colleges</span>
        {!mobile && <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></div>}
      </button>
      <button 
        onClick={() => {
          // Check saved preference and navigate accordingly
          const savedRecommendationType = localStorage.getItem('recommendation_type');
          const savedIntegratedType = localStorage.getItem('integrated_admission_type');
          
          if (savedRecommendationType === 'direct-second-year') {
            const hasExistingData = sessionStorage.getItem('cachedDiplomaRecommendations');
            navigate(hasExistingData ? '/diploma-recommendations/results' : '/diploma-recommendations/steps');
          } else if (savedRecommendationType === 'first-year') {
            navigate('/recommendations');
          } else if (savedIntegratedType) {
            navigate(`/integrated-rounds?type=${savedIntegratedType}`);
          } else {
            // No preference saved, show dialog
            setShowProgramDialog(true);
          }
          if (mobile) setMobileMenuOpen(false);
        }}
        className={`flex items-center text-gray-600 hover:text-purple-600 transition-all duration-300 group relative ${mobile ? 'w-full text-left p-3 rounded-lg hover:bg-purple-50' : 'py-2'}`}
      >
        <div className="relative mr-2">
          <Heart size={18} className="group-hover:scale-110 transition-transform duration-200" />
          <Sparkles size={12} className="absolute -top-1 -right-1 text-pink-400 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300" />
        </div>
        <span className="font-medium">AI CAP Recommendations</span>
        {!mobile && <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300"></div>}
      </button>
    </>
  );

  return (
    <>
      <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer group transition-all duration-300 hover:scale-105" 
              onClick={() => navigate('/')}
            >
              <div className="relative">
                <img 
                  src="/lovable-uploads/3eef3d0d-75a9-46a2-9c43-12a8251e55b6.png" 
                  alt="FutureBridge Logo" 
                  className="h-[60px]  w-15 group-hover:scale-110 transition-transform duration-300"
                />
                
                {/* Blinking star effect */}
                {/* <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-pulse opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div> */}
              </div>
              <div className="flex flex-col ml-2">
                
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <NavLinks />
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarImage src={user?.profileIcon || ""} alt={user?.name || "User"} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-bold text-xs sm:text-sm">
                          {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white z-50" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user?.name || 'Guest User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={handleLogin}
                  className="hidden sm:flex bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 sm:px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                >
                  <User size={16} className="mr-2 group-hover:animate-pulse" />
                  Login
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-white z-50">
                  <div className="flex flex-col space-y-4 mt-8">
                    <NavLinks mobile />
                    
                    {!isLoggedIn && (
                      <div className="border-t pt-4">
                        <Button 
                          onClick={() => {
                            handleLogin();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg"
                        >
                          <User size={16} className="mr-2" />
                          Login
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
      
      <LoginDialog 
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
      />
      
      <ProgramSelectionDialog
        open={showProgramDialog}
        onOpenChange={setShowProgramDialog}
        onSelectProgram={handleProgramSelect}
      />
    </>
  );
};

export default Navigation;
