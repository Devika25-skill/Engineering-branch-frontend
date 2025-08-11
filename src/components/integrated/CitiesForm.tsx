import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, MapPin } from 'lucide-react';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';
import { getCitiesForAdmissionType } from '@/data/integratedAdmissionConfig';

interface CitiesFormProps {
  admissionType?: IntegratedAdmissionType;
  onSelectionChange: (selectedCities: string[]) => void;
  initialSelection?: string[];
}

export const CitiesForm: React.FC<CitiesFormProps> = ({
  admissionType = 'BCA_MCA_Int',
  onSelectionChange,
  initialSelection = []
}) => {
  const [selectedCities, setSelectedCities] = useState<string[]>(initialSelection);
  const cityOptions = getCitiesForAdmissionType(admissionType);

  useEffect(() => {
    onSelectionChange(selectedCities);
  }, [selectedCities, onSelectionChange]);

  const handleCityToggle = (city: string) => {
    setSelectedCities(prev => 
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const handleSelectAll = () => {
    setSelectedCities(cityOptions);
  };

  const handleClearAll = () => {
    setSelectedCities([]);
  };

  const removeCity = (city: string) => {
    setSelectedCities(prev => prev.filter(c => c !== city));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Select Preferred Cities
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Choose the cities where you'd like to study
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSelectAll}
              className="text-xs"
            >
              Select All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected cities display */}
        {selectedCities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Cities ({selectedCities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedCities.map((city) => (
                <Badge
                  key={city}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200"
                >
                  {city}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-600"
                    onClick={() => removeCity(city)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* City selection grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {cityOptions.map((city) => (
            <div
              key={city}
              className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer"
              onClick={() => handleCityToggle(city)}
            >
              <Checkbox
                id={city}
                checked={selectedCities.includes(city)}
                onChange={() => handleCityToggle(city)}
              />
              <label
                htmlFor={city}
                className="text-sm font-medium cursor-pointer flex-1"
              >
                {city}
              </label>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 mt-4">
          * You can select multiple cities. This will help us find colleges in your preferred locations.
        </div>
      </CardContent>
    </Card>
  );
};