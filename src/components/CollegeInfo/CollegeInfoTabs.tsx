
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  IndianRupee, 
  Building, 
  TrendingUp,
  Calendar,
  Lock,
  MapPin,
  Train,
  Plane
} from "lucide-react";
import type { College } from "@/types/college";
import { useAuth } from "@/contexts/AuthContext";
import LoginDialog from "@/components/auth/LoginDialog";

interface CollegeInfoTabsProps {
  college: College;
}

const CollegeInfoTabs = ({ college }: CollegeInfoTabsProps) => {
  const { isLoggedIn } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  
  // Helper function to format values - ALL null values become '--'
  const formatValue = (value?: number | string | null): string => {
    if (value === null || value === undefined || value === 0 || value === '') return '--';
    return value.toString();
  };

  // Helper function to format ranges - ALL null values become '--'
  const formatRange = (min?: number | null, max?: number | null): string => {
    if (min === null || min === undefined || min === 0) {
      if (max === null || max === undefined || max === 0) return '--';
      return max.toString();
    }
    if (max === null || max === undefined || max === 0) {
      return min.toString();
    }
    if (min <= 0) return max.toString();
    return `${min} - ${max}`;
  };

  const LockedContent = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      <div className="blur-sm pointer-events-none">{children}</div>
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
        <Button
          onClick={() => setLoginDialogOpen(true)}
          className="bg-white/90 text-gray-800 hover:bg-white shadow-lg"
        >
          <Lock className="mr-2 h-4 w-4" />
          Login to View Details
        </Button>
      </div>
    </div>
  );

  const renderTabContent = (content: React.ReactNode) => {
    return isLoggedIn ? content : <LockedContent>{content}</LockedContent>;
  };

  return (
    <>
      <Tabs defaultValue="courses" className="w-full">
        <div className="w-full overflow-x-auto">
          <TabsList className="grid grid-cols-5 w-full min-w-[500px] h-auto p-1">
            <TabsTrigger value="courses" className={`px-2 py-2 text-xs sm:text-sm ${!isLoggedIn ? "opacity-60" : ""}`}>
              <div className="flex flex-col items-center gap-1">
                {!isLoggedIn && <Lock className="h-3 w-3" />}
                <span>Courses</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="fees" className={`px-2 py-2 text-xs sm:text-sm ${!isLoggedIn ? "opacity-60" : ""}`}>
              <div className="flex flex-col items-center gap-1">
                {!isLoggedIn && <Lock className="h-3 w-3" />}
                <span>Fees</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="facilities" className={`px-2 py-2 text-xs sm:text-sm ${!isLoggedIn ? "opacity-60" : ""}`}>
              <div className="flex flex-col items-center gap-1">
                {!isLoggedIn && <Lock className="h-3 w-3" />}
                <span>Facilities</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="placements" className={`px-2 py-2 text-xs sm:text-sm ${!isLoggedIn ? "opacity-60" : ""}`}>
              <div className="flex flex-col items-center gap-1">
                {!isLoggedIn && <Lock className="h-3 w-3" />}
                <span>Placements</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="admission" className={`px-2 py-2 text-xs sm:text-sm ${!isLoggedIn ? "opacity-60" : ""}`}>
              <div className="flex flex-col items-center gap-1">
                {!isLoggedIn && <Lock className="h-3 w-3" />}
                <span>Admission</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="courses" className="mt-6">
          {renderTabContent(
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap size={20} />
                  Courses Offered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="text-sm text-gray-600">Total Engineering Streams</span>
                      <div className="font-semibold">{formatValue(college.coursesOffered)}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Total Intake</span>
                      <div className="font-semibold">{formatValue(college.totalIntake)}</div>
                    </div>
                  </div>
                  
                  {college.departments && college.departments.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Department Name</TableHead>
                            <TableHead>NBA Accredited</TableHead>
                            <TableHead>Placement Rate</TableHead>
                            <TableHead>Intake</TableHead>
                            <TableHead>CET %</TableHead>
                            <TableHead>JEE %</TableHead>
                            <TableHead>Other %</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {college.departments.map((dept, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{dept.name}</TableCell>
                              <TableCell>
                                {dept.nbaAccredited === null ? (
                                  <span className="text-gray-500">--</span>
                                ) : (
                                  <Badge variant={dept.nbaAccredited ? "default" : "secondary"}>
                                    {dept.nbaAccredited ? "Yes" : "No"}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-green-600">
                                  {dept.placementRate && dept.placementRate > 0 ? `${dept.placementRate}%` : '--'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold">
                                  {formatValue(dept.intake)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-blue-600">
                                  {dept.cetPercent && dept.cetPercent > 0 ? `${dept.cetPercent}%` : '--'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-purple-600">
                                  {dept.jeePercent && dept.jeePercent > 0 ? `${dept.jeePercent}%` : '--'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="font-semibold text-orange-600">
                                  {dept.otherPercent && dept.otherPercent > 0 ? `${dept.otherPercent}%` : '--'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Department details not available</p>
                    </div>
                  )}
                  
                  {college.streams && college.streams.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm text-gray-600">All Streams Available</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {college.streams.map((stream, index) => (
                          <Badge key={index} variant="secondary">{stream}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fees" className="mt-6">
          {renderTabContent(
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee size={20} />
                  Fee Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-700 mb-2">
                      {college.fees ? `₹${(college.fees / 100000).toFixed(1)}L` : '--'}
                    </div>
                    <div className="text-sm text-gray-600">Annual Fees (INR)</div>
                  </div>
                  
                  {college.hasHostel && (
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-700">Hostel Available</div>
                      <div className="text-sm text-gray-600">Accommodation facilities provided</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="facilities" className="mt-6">
          {renderTabContent(
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building size={20} />
                  Campus Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {college.facilities ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(college.facilities).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">Facility information not available</p>
                    </div>
                  )}

                  {/* Location Details */}
                  {college.locationDetails && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <MapPin className="mr-2" size={16} />
                        Location & Transportation
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Train className="text-blue-600" size={16} />
                          <div>
                            <span className="text-gray-600">Nearest Railway: </span>
                            <span className="font-medium">
                              {formatValue(college.locationDetails.nearestRailwayStation)}
                            </span>
                            {college.locationDetails.distanceFromRailway && college.locationDetails.distanceFromRailway > 0 && (
                              <span className="text-gray-500 ml-1">
                                ({college.locationDetails.distanceFromRailway} km)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Plane className="text-green-600" size={16} />
                          <div>
                            <span className="text-gray-600">Nearest Airport: </span>
                            <span className="font-medium">
                              {formatValue(college.locationDetails.nearestAirport)}
                            </span>
                            {college.locationDetails.distanceFromAirport && college.locationDetails.distanceFromAirport > 0 && (
                              <span className="text-gray-500 ml-1">
                                ({college.locationDetails.distanceFromAirport} km)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="placements" className="mt-6">
          {renderTabContent(
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp size={20} />
                  Placement Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {college.placement && college.placement > 0 ? `${college.placement}%` : '--'}
                      </div>
                      <div className="text-sm text-gray-600">Overall Placement Rate</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {college.placementDetails?.averagePackage && college.placementDetails.averagePackage > 0
                          ? `₹${college.placementDetails.averagePackage.toFixed(1)}L`
                          : '--'
                        }
                      </div>
                      <div className="text-sm text-gray-600">Average Package</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {college.placementDetails?.highestPackage && college.placementDetails.highestPackage > 0
                          ? `₹${college.placementDetails.highestPackage.toFixed(1)}L`
                          : '--'
                        }
                      </div>
                      <div className="text-sm text-gray-600">Highest Package</div>
                    </div>
                  </div>
                  
                  {college.placementDetails?.majorRecruiters && college.placementDetails.majorRecruiters.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Top Recruiters</h4>
                      <div className="flex flex-wrap gap-2">
                        {college.placementDetails.majorRecruiters.map((recruiter, index) => (
                          <Badge key={index} variant="outline">{recruiter}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="admission" className="mt-6">
          {renderTabContent(
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  Admission Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Admission Process</span>
                    <div className="font-semibold">
                      {formatValue(college.admission?.process)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Faculty Student Ratio</span>
                    <div className="font-semibold">{formatValue(college.totalFaculty)}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">NIRF Ranking</span>
                    <div className="font-semibold">
                      {formatValue(college.nirf_ranking)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      <LoginDialog 
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
      />
    </>
  );
};

export default CollegeInfoTabs;
