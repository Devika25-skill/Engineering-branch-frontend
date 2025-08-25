import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Building2, GraduationCap, CheckCircle, Hash, FileText, Sparkles } from 'lucide-react';
import { 
  integratedRecommendationApi, 
  CollegeSearchByNameResponse,
  CollegeSearchByCodeResponse,
  CollegeSearchByChoiceCodeResponse 
} from '@/services/integratedRecommendationApi';
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
  onSkipSelection: () => void;
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
  onSkipSelection,
  selectedCollege 
}: IntegratedCollegeSelectionCardProps) => {
  const [activeTab, setActiveTab] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');
  const [nameResults, setNameResults] = useState<CollegeSearchByNameResponse['data']>([]);
  const [codeResults, setCodeResults] = useState<CollegeSearchByCodeResponse['data']>([]);
  const [choiceResult, setChoiceResult] = useState<CollegeSearchByChoiceCodeResponse['data'] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearchByName = async () => {
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
        setNameResults(response.data);
        if (response.data.length === 0) {
          toast({
            title: "No colleges found",
            description: "Try searching with a different name"
          });
        }
      }
    } catch (error) {
      console.error('Error searching colleges by name:', error);
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchByCode = async () => {
    const code = parseInt(searchTerm.trim());
    if (!searchTerm.trim() || isNaN(code)) {
      toast({
        title: "Please enter a valid college code",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await integratedRecommendationApi.searchCollegeByCode(
        admissionType,
        code
      );
      
      if (response.success) {
        setCodeResults(response.data);
        if (response.data.length === 0) {
          toast({
            title: "No college found",
            description: "Try searching with a different code"
          });
        }
      }
    } catch (error) {
      console.error('Error searching college by code:', error);
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchByChoiceCode = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Please enter a choice code",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await integratedRecommendationApi.searchCollegeByChoiceCode(
        admissionType,
        searchTerm.trim()
      );
      
      if (response.success) {
        setChoiceResult(response.data);
      }
    } catch (error) {
      console.error('Error searching college by choice code:', error);
      toast({
        title: "Search failed",
        description: "Please try again",
        variant: "destructive"
      });
      setChoiceResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCollegeSelectFromName = (college: CollegeSearchByNameResponse['data'][0], course: { "Course Name": string; "Course Code": string }) => {
    onCollegeSelect({
      collegeCode: college["College Code"],
      collegeName: college["College Name"],
      courseCode: course["Course Code"],
      courseName: course["Course Name"]
    });
  };

  const handleCollegeSelectFromCode = (college: CollegeSearchByCodeResponse['data'][0], course: { "Course Name": string; "Course Code": string }) => {
    onCollegeSelect({
      collegeCode: college["College Code"],
      collegeName: college["College Name"],
      courseCode: course["Course Code"],
      courseName: course["Course Name"]
    });
  };

  const handleCollegeSelectFromChoice = (result: CollegeSearchByChoiceCodeResponse['data']) => {
    onCollegeSelect({
      collegeCode: result["College Code"],
      collegeName: result["College Name"],
      courseCode: result["Course Code"],
      courseName: result["Course Name"]
    });
  };

  const handleSearch = () => {
    switch (activeTab) {
      case 'name':
        handleSearchByName();
        break;
      case 'code':
        handleSearchByCode();
        break;
      case 'choice':
        handleSearchByChoiceCode();
        break;
    }
  };

  const clearResults = () => {
    setNameResults([]);
    setCodeResults([]);
    setChoiceResult(null);
    setSearchTerm('');
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'name':
        return 'Enter college name...';
      case 'code':
        return 'Enter college code...';
      case 'choice':
        return 'Enter choice code...';
      default:
        return 'Search...';
    }
  };

  return (
    <div className="space-y-6">
      {selectedCollege ? (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 mb-2">Selected Previous Round College</h4>
                <div className="space-y-2">
                  <p className="font-medium text-green-700">{selectedCollege.collegeName}</p>
                  <div className="text-sm text-green-600 space-y-1">
                    <p><span className="font-medium">Course:</span> {selectedCollege.courseName}</p>
                    <p><span className="font-medium">College Code:</span> {selectedCollege.collegeCode}</p>
                    <p><span className="font-medium">Course Code:</span> {selectedCollege.courseCode}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Fresh Recommendations Option */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Generate Fresh Recommendations
                  </h3>
                  <p className="text-blue-700 text-sm mb-4">
                    Get new recommendations without considering any previous round choices
                  </p>
                  <Button 
                    onClick={onSkipSelection}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Generate Fresh List
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-muted-foreground">
            <span className="text-sm">OR</span>
          </div>

          {/* College Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Search Previous Round College Choice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={(value) => {
                setActiveTab(value);
                clearResults();
              }}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="name" className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">By Name</span>
                  </TabsTrigger>
                  <TabsTrigger value="code" className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    <span className="hidden sm:inline">By Code</span>
                  </TabsTrigger>
                  <TabsTrigger value="choice" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">By Choice</span>
                  </TabsTrigger>
                </TabsList>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search-input">
                      {activeTab === 'name' && 'College Name'}
                      {activeTab === 'code' && 'College Code'}
                      {activeTab === 'choice' && 'Choice Code'}
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="search-input"
                        placeholder={getPlaceholder()}
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

                  {/* Search Results */}
                  <TabsContent value="name" className="mt-4">
                    {nameResults.length > 0 && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        <Label>Search Results ({nameResults.length} found):</Label>
                        {nameResults.map((college) => (
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
                                          onClick={() => handleCollegeSelectFromName(college, course)}
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
                  </TabsContent>

                  <TabsContent value="code" className="mt-4">
                    {codeResults.length > 0 && (
                      <div className="space-y-3">
                        <Label>Search Results ({codeResults.length} found):</Label>
                        {codeResults.map((college) => (
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
                                          onClick={() => handleCollegeSelectFromCode(college, course)}
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
                  </TabsContent>

                  <TabsContent value="choice" className="mt-4">
                    {choiceResult && (
                      <Card className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-primary">{choiceResult["College Name"]}</h4>
                              <div className="text-sm text-muted-foreground space-y-1">
                                <p>College Code: {choiceResult["College Code"]}</p>
                                <p>Course: {choiceResult["Course Name"]}</p>
                                <p>Course Code: {choiceResult["Course Code"]}</p>
                                <p>Location: {choiceResult["City"]}, {choiceResult["District"]}</p>
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button
                                onClick={() => handleCollegeSelectFromChoice(choiceResult)}
                              >
                                Select This College
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};