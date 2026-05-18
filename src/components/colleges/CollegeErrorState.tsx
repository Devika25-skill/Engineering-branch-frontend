
import { AlertCircle, RefreshCw, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CollegeErrorStateProps {
  onRetry: () => void;
  isOffline?: boolean;
}

const CollegeErrorState = ({ onRetry, isOffline = false }: CollegeErrorStateProps) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          {isOffline ? (
            <Wifi className="h-16 w-16 text-gray-400 mb-4" />
          ) : (
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          )}
          
          <h3 className="text-xl font-semibold mb-2">
            {isOffline ? 'No Internet Connection' : 'Failed to Load Colleges'}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {isOffline 
              ? 'Please check your internet connection and try again.'
              : 'We encountered an error while loading the colleges. Please try again.'
            }
          </p>
          
          <Button 
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default CollegeErrorState;
