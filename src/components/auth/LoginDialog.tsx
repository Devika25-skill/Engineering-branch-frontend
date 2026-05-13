
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import UserDetailsDialog from './UserDetailsDialog';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  canClose?: boolean;
  origin?: string;
}

const LoginDialog = ({ open, onOpenChange, onSuccess, canClose = true, origin }: LoginDialogProps) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { sendOTP, login, needsUserDetails, updateUserDetails } = useAuth();

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await sendOTP(email);
      setStep('otp');
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const needsDetails = await login(email, parseInt(otp));
      // Don't close dialog immediately if user details are needed
      if (!needsDetails) {
        onOpenChange(false);
        resetForm();
        onSuccess?.();
      }
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUserDetailsSave = async (name: string, mobile?: string) => {
    await updateUserDetails(name, mobile, origin);
    onOpenChange(false);
    resetForm();
    onSuccess?.();
  };

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setError('');
  };

  const handleClose = () => {
    if (!needsUserDetails) {
      onOpenChange(false);
      resetForm();
    }
  };

  // Show user details dialog if needed and the dialog is actually open
  if (open && needsUserDetails) {
    return (
      <UserDetailsDialog
        open={true}
        onSave={handleUserDetailsSave}
        canClose={canClose}
        onOpenChange={handleClose}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        hideCloseButton={!canClose}
        className="sm:max-w-md w-[95vw] max-h-[90vh] top-[10%] translate-y-0 sm:top-[50%] sm:translate-y-[-50%] overflow-y-auto z-[99999]"
        onPointerDownOutside={(e) => {
          if (!canClose) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (!canClose) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Login to Access College Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pb-4">
          {step === 'email' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              
              <Button 
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </>
          )}
          
          {step === 'otp' && (
            <>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('email')}
                  className="mb-2 p-0 h-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to email
                </Button>
                
                <p className="text-xs text-gray-600 mb-4">
                  We've sent a 6-digit code to {email}. 
                </p>
                <p className="text-xs text-gray-600 mb-4">
                  If you still don't receive it, check your spam folder or check if you've enough space in your inbox.
                  If you continue to have issues, contact us at <a href="mailto:support@skilljourney.in" className="text-blue-600">support@skilljourney.in</a>.
                </p>
                
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              
              <Button 
                onClick={handleVerifyOTP}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full"
              >
                Resend OTP
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
