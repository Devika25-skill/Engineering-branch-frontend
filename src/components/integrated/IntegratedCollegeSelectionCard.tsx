import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, GraduationCap, CheckCircle } from 'lucide-react';
import { integratedRecommendationApi, CollegeSearchByNameResponse } from '@/services/integratedRecommendationApi';
import { useToast } from '@/hooks/use-toast';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';

interface IntegratedCollegeSelectionCardProps {
  admissionType: IntegratedAdmissionType;
  onCollegeSelect: (college: {
    collegeCode: number;
    collegeName: string;
    courseCode: string;
    courseName: string;
  }) => void;
  selectedCollege?: {
    collegeCode: number;
    collegeName: string;
    courseCode: string;
    courseName: string;
  } | null;
}

export const IntegratedCollegeSelectionCard = ({ 
  admissionType, 
  onCollegeSelect, 
  selectedCollege 
}: IntegratedCollegeSelectionCardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CollegeSearchByNameResponse['data']>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Please enter a college name",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await integratedRecommendationApi.searchCollegeByName(
        admissionType,
        searchTerm.trim()
      );
      
      if (response.success) {
        setSearchResults(response.data);
        if (response.data.length === 0) {
          toast({
            title: "No colleges found",
            description: "Try searching with a different name"
          });
        }
      }
    } catch (error) {
      console.error('Error searching colleges:', error);
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCollegeSelect = (college: CollegeSearchByNameResponse['data'][0], course: { "Course Name": string; "Course Code": string }) => {
    onCollegeSelect({
      collegeCode: college["College Code"],
      collegeName: college["College Name"],
      courseCode: course["Course Code"],
      courseName: course["Course Name"]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Select Previous Round College Choice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedCollege ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-green-800">{selectedCollege.collegeName}</h4>
                <p className="text-sm text-green-700 mt-1">
                  <span className="font-medium">Course:</span> {selectedCollege.courseName}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  College Code: {selectedCollege.collegeCode} | Course Code: {selectedCollege.courseCode}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="college-search">Search College by Name</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="college-search"
                    placeholder="Enter college name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching}
                    size="icon"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <Label>Search Results:</Label>
                  {searchResults.map((college) => (
                    <Card key={college["College Code"]} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-primary">{college["College Name"]}</h4>
                            <p className="text-sm text-muted-foreground">
                              College Code: {college["College Code"]}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm">Available Courses:</Label>
                            <div className="space-y-2">
                              {college.Courses.map((course) => (
                                <div 
                                  key={course["Course Code"]}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                                >
                                  <div className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-primary" />
                                    <div>
                                      <span className="font-medium">{course["Course Name"]}</span>
                                      <Badge variant="outline" className="ml-2 text-xs">
                                        {course["Course Code"]}
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleCollegeSelect(college, course)}
                                  >
                                    Select
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};