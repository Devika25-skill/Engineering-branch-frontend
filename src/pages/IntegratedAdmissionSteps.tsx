import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { IntegratedAdmissionForm } from '@/components/integrated/IntegratedAdmissionForm';
import LoginDialog from '@/components/auth/LoginDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { integratedAdmissionApi } from '@/services/integratedAdmissionApi';
import { IntegratedAdmissionFormData, IntegratedAdmissionType } from '@/types/integratedAdmission';

const IntegratedAdmissionSteps = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();
  
  const [admissionType, setAdmissionType] = useState<IntegratedAdmissionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<IntegratedAdmissionFormData | null>(null);

  useEffect(() => {
    // Get admission type from URL params or localStorage
    const typeFromParams = searchParams.get('type') as IntegratedAdmissionType;
    const typeFromStorage = localStorage.getItem('integrated_admission_type') as IntegratedAdmissionType;
    
    const selectedType = typeFromParams || typeFromStorage;
    
  
    if (!selectedType || !['BCA_MCA_Int', 'BBA_BMS_BBM_MBA_Int', 'B_and_D_Pharmacy'].includes(selectedType)) {
      // Add a small delay to prevent immediate redirect race conditions
      setTimeout(() => {
        navigate('/');
      }, 100);
      return;
    }
    
    setAdmissionType(selectedType);
  }, [searchParams, navigate]);

  useEffect(() => {
    // Check if user has existing configuration when logged in
    if (isLoggedIn && admissionType) {
      checkExistingConfiguration();
    }
  }, [isLoggedIn, admissionType]);

  const checkExistingConfiguration = async () => {
    try {
      const response = await integratedAdmissionApi.getConfiguration();
      if (response.success && response.data.length > 0) {
        // Check if current admission type has data AND user has completed the form submission
        const hasCurrentTypeData = response.data.some(config => config.exam_type === admissionType);
        const hasCompletedForm = localStorage.getItem(`integrated_form_completed_${admissionType}`) === 'true';
        
        if (hasCurrentTypeData && hasCompletedForm) {
          // Navigate to rounds page only if coming from elsewhere, not if user explicitly came to form
          const fromForm = searchParams.get('from') === 'form';
          if (!fromForm) {
            navigate(`/integrated-rounds?type=${admissionType}`);
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing configuration:', error);
    }
  };

  const handleFormSubmit = async (formData: IntegratedAdmissionFormData) => {
    if (!isLoggedIn) {
      setPendingFormData(formData);
      setShowLoginDialog(true);
      return;
    }

    await saveConfiguration(formData);
  };

  const saveConfiguration = async (formData: IntegratedAdmissionFormData) => {
    setIsLoading(true);
    
    try {
      const configData = {
        exam_type: formData.exam_type,
        district: formData.district,
        score: formData.score,
        tenth_percentage: formData.tenth_percentage || 0,
        twelth_percentage: formData.twelth_percentage || 0,
        category: formData.category
      };

      const result = await integratedAdmissionApi.saveConfiguration(configData);
      if (result.success) {
        // Mark form as completed only after successful save
        localStorage.setItem(`integrated_form_completed_${admissionType}`, 'true');
        
        toast({
          title: "Success",
          description: "Your preferences have been saved successfully!",
        });
        
        // Navigate to rounds page
        navigate(`/integrated-rounds?type=${formData.exam_type}`);
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginDialog(false);
    if (pendingFormData) {
      saveConfiguration(pendingFormData);
      setPendingFormData(null);
    }
  };

  if (!admissionType) {
    return null; // Loading or redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <Navigation />
      
      <div className="container mx-auto py-6 px-4">
        <IntegratedAdmissionForm
          admissionType={admissionType}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
        />
      </div>

      <LoginDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default IntegratedAdmissionSteps;