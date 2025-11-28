import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface MedicalCollegeSelectionCardProps {
  onCollegeSelect: (college: any) => void;
  onSkip: () => void;
  token: string;
}

export const MedicalCollegeSelectionCard = ({ onCollegeSelect, onSkip, token }: MedicalCollegeSelectionCardProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Try searching by college code first (if numeric)
      const numericCode = parseInt(searchQuery);
      if (!isNaN(numericCode)) {
        const response = await apiService.searchMedicalCollegeByCode(numericCode, token);
        if (response.success && response.data) {
          setSearchResults(Array.isArray(response.data) ? response.data : [response.data]);
          return;
        }
      }

      // Search by name
      const response = await apiService.searchMedicalCollegeByName(searchQuery, token);
      if (response.success && response.data) {
        setSearchResults(Array.isArray(response.data) ? response.data : [response.data]);
      } else {
        setSearchResults([]);
        toast({
          title: "No Results",
          description: "No colleges found matching your search.",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      toast({
        title: "Search Failed",
        description: "Failed to search colleges. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="text-xl text-blue-800">Search Your Round 1 Allotted College</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter college name or code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-400"
          />
          <Button 
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {searchResults.map((college) => (
              <Card 
                key={college.college_code}
                className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-400"
                onClick={() => onCollegeSelect(college)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{college.college_name}</p>
                      <p className="text-sm text-slate-600">Code: {college.college_code} | {college.city}</p>
                      <p className="text-sm text-slate-600">Course: {college.course_type}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={onSkip}
          className="w-full"
        >
          Skip for Now
        </Button>
      </CardContent>
    </Card>
  );
};
