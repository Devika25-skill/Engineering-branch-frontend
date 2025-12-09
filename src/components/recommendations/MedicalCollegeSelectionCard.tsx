import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Building2, Hash, Loader2, CheckCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface MedicalCollegeSelectionCardProps {
  onCollegeSelect: (college: any) => void;
  onSkip: () => void;
  token: string;
  selectedCollege?: any;
}

export const MedicalCollegeSelectionCard = ({ onCollegeSelect, onSkip, token, selectedCollege }: MedicalCollegeSelectionCardProps) => {
  const { toast } = useToast();
  const [searchType, setSearchType] = useState<'college_name' | 'college_code'>('college_name');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a search value",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    setIsSearching(true);
    setSearchResults([]);

    try {
      let response;
      
      switch (searchType) {
        case 'college_code':
          const numericCode = parseInt(searchQuery);
          if (isNaN(numericCode)) {
            toast({
              title: "Invalid College Code",
              description: "College code must be a number",
              variant: "destructive",
              duration: 3000
            });
            setIsSearching(false);
            return;
          }
          const stateForCode = localStorage.getItem('selected_state') || '';
          response = await apiService.searchMedicalCollegeByCode(numericCode, token, stateForCode);
          break;
          
        case 'college_name':
          const stateForName = localStorage.getItem('selected_state') || '';
          response = await apiService.searchMedicalCollegeByName(searchQuery, token, stateForName);
          break;
      }

      if (response.success && response.data) {
        setSearchResults(Array.isArray(response.data) ? response.data : [response.data]);
        if ((!Array.isArray(response.data) && !response.data) || (Array.isArray(response.data) && response.data.length === 0)) {
          toast({
            title: "No Results",
            description: "No colleges found matching your search.",
            duration: 3000
          });
        }
      } else {
        setSearchResults([]);
        toast({
          title: "No Results",
          description: "No colleges found matching your search.",
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      toast({
        title: "Search Failed",
        description: "Failed to search colleges. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCollegeSelect = (college: any) => {
    setPendingSelection(college);
    setShowConfirmDialog(true);
  };

  const confirmSelection = () => {
    if (pendingSelection) {
      onCollegeSelect(pendingSelection);
      setShowConfirmDialog(false);
      setPendingSelection(null);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  const clearResults = () => {
    setSearchResults([]);
    setSearchQuery('');
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case 'college_name':
        return 'Enter college name...';
      case 'college_code':
        return 'Enter college code...';
      default:
        return 'Enter search value...';
    }
  };

  const getInputLabel = () => {
    switch (searchType) {
      case 'college_name':
        return 'College Name';
      case 'college_code':
        return 'College Code';
      default:
        return 'Search';
    }
  };

  if (selectedCollege) {
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-800 mb-2">Selected Round 1 College</h4>
              <div className="space-y-2">
                <p className="font-medium text-green-700">{selectedCollege.college_name}</p>
                <div className="text-sm text-green-600 space-y-1">
                  <p><span className="font-medium">City:</span> {selectedCollege.city}</p>
                  <p><span className="font-medium">Course:</span> {selectedCollege.course_type}</p>
                  <p><span className="font-medium">College Code:</span> {selectedCollege.college_code}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Search Your Round 1 College
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search-type">Search Type</Label>
              <Select value={searchType} onValueChange={(value: any) => {
                setSearchType(value);
                clearResults();
              }}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select search method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="college_name">College Name</SelectItem>
                  <SelectItem value="college_code">College Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search-input">{getInputLabel()}</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="search-input"
                  placeholder={getPlaceholder()}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button 
                  onClick={handleSearch} 
                  disabled={isSearching}
                  className="px-6"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Search</>}
                </Button>
              </div>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <Label>Search Results ({searchResults.length} found):</Label>
              {searchResults.map((college) => (
                <Card 
                  key={college.college_code}
                  className="border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleCollegeSelect(college)}
                >
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-primary">{college.college_name}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>College Code: {college.college_code}</p>
                        <p>City: {college.city}</p>
                        <p>Course Type: {college.course_type}</p>
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button size="sm">Select</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm College Selection</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to select this college for Round 2 recommendations:
              {pendingSelection && (
                <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                  <p className="font-semibold text-foreground">{pendingSelection.college_name}</p>
                  <div className="text-sm space-y-1">
                    <p>College Code: {pendingSelection.college_code}</p>
                    <p>City: {pendingSelection.city}</p>
                    <p>Course: {pendingSelection.course_type}</p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSelection}>Confirm Selection</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
