import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { recommendationStorage } from '@/services/recommendationStorage';
import { sessionStorageService } from '@/services/sessionStorage';

interface User {
  email: string;
  name: string;
  mobile?: string;
  profileIcon: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  needsUserDetails: boolean;
  login: (email: string, otp: number) => Promise<void>;
  logout: () => void;
  sendOTP: (email: string) => Promise<void>;
  updateUserDetails: (name: string, mobile?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [needsUserDetails, setNeedsUserDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    
    if (storedUser && accessToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser({ ...userData, accessToken });
        
        // Check if user details are missing
        if (!userData.name || userData.name === 'Guest User') {
          setNeedsUserDetails(true);
        }
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
  }, []);

  const sendOTP = async (email: string) => {
    await apiService.sendOTP(email);
  };

  const login = async (email: string, otp: number) => {
    const response = await apiService.validateOTP(email, otp);
    
    if (response.isValidOtp) {
      const userData: User = {
        email,
        name: response.name || 'Guest User',
        profileIcon: response.profileIcon || '',
        accessToken: response.accessToken
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify({
        email: userData.email,
        name: userData.name,
        profileIcon: userData.profileIcon,
        mobile: userData.mobile
      }));
      localStorage.setItem('accessToken', response.accessToken);
      
      // Check if user details are missing
      if (!response.name || response.name === 'Guest User') {
        setNeedsUserDetails(true);
      }
    } else {
      throw new Error('Invalid OTP');
    }
  };

  const updateUserDetails = async (name: string, mobile?: string) => {
    if (!user) return;
    
    // Call API to store user details
    await apiService.storeUser(user.email, name, mobile);
    
    const updatedUser = {
      ...user,
      name,
      mobile
    };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify({
      email: updatedUser.email,
      name: updatedUser.name,
      profileIcon: updatedUser.profileIcon,
      mobile: updatedUser.mobile
    }));
    
    setNeedsUserDetails(false);
  };

  const logout = () => {
    setUser(null);
    setNeedsUserDetails(false);
    
    // Clear all localStorage data
    localStorage.clear();
    
    // Clear all sessionStorage data
    sessionStorage.clear();
    
    // Clear recommendation data
    recommendationStorage.clearHistory();
    recommendationStorage.clearFormData();
    
    // Clear session storage data
    sessionStorageService.clearCache();
    
    
    // Navigate to landing page
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      needsUserDetails,
      login,
      logout,
      sendOTP,
      updateUserDetails
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
