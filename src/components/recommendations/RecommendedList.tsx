
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, GraduationCap, TrendingUp, Building, Heart, HeartOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useColleges } from "@/hooks/useColleges";
import { College } from "@/types/college";

interface RecommendedListProps {
  preferences: {
    preferredStreams?: string[];
    preferredCities?: string[];
    maxBudget?: number;
    collegeTypes?: string[];
  };
  limit?: number;
}

export const RecommendedList = ({ preferences, limit = 6 }: RecommendedListProps) => {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Build filters based on preferences
  const filters = {
    city: preferences.preferredCities || [],
    streams: preferences.preferredStreams || [],
    type: preferences.collegeTypes || [],
    ...(preferences.maxBudget && {
      feesRange: [0, preferences.maxBudget] as [number, number]
    }),
    sortBy: 'rating' as const,
    limit
  };

  const { data: colleges = [], isLoading: loading, error } = useColleges(filters);

  const toggleFavorite = (collegeId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(collegeId)) {
      newFavorites.delete(collegeId);
    } else {
      newFavorites.add(collegeId);
    }
    setFavorites(newFavorites);
    
    // Store in localStorage
    localStorage.setItem('favoriteColleges', JSON.stringify([...newFavorites]));
  };

  // Load favorites from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favoriteColleges');
    if (storedFavorites) {
      try {
        setFavorites(new Set(JSON.parse(storedFavorites)));
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error);
      }
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || colleges.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <TrendingUp size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Recommendations Available</h3>
          <p className="text-gray-600">
            Try adjusting your preferences to see more colleges.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Recommended for You</h2>
        <Badge variant="secondary" className="text-sm">
          {colleges.length} colleges found
        </Badge>
      </div>

      <div className="grid gap-4">
        {colleges.map((college: College) => (
          <Card key={college.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {college.logo && (
                      <img 
                        src={college.logo} 
                        alt={`${college.name} logo`}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg mb-1">{college.name}</CardTitle>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} />
                          {college.city}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building size={12} />
                          {college.college_type}
                        </div>
                        {college.rating && (
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-500" />
                            {college.rating}/5
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(college.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    {favorites.has(college.id) ? (
                      <Heart size={18} className="text-red-500 fill-current" />
                    ) : (
                      <HeartOff size={18} />
                    )}
                  </Button>
                  <Link to={`/college/${college.id}`}>
                    <Button size="sm" className="rounded-lg">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Annual Fees</p>
                    <p className="text-sm font-medium">₹{college.fees?.toLocaleString() || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Placement Rate</p>
                    <p className="text-sm font-medium">{college.placement ? `${college.placement}%` : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building size={14} className="text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Total Intake</p>
                    <p className="text-sm font-medium">{college.totalIntake || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {college.streams && college.streams.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">Available Streams:</p>
                  <div className="flex flex-wrap gap-1">
                    {college.streams.slice(0, 3).map((stream, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {stream}
                      </Badge>
                    ))}
                    {college.streams.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{college.streams.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
