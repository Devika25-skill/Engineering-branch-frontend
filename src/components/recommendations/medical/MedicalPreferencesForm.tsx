import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, AlertCircle, Heart, MapPin } from "lucide-react";
import { medicalPrograms } from "@/types/medical";

interface MedicalPreferencesFormProps {
  data: any;
  onUpdate: (data: any) => void;
  validationErrors?: string[];
}

export const MedicalPreferencesForm = ({ data, onUpdate, validationErrors = [] }: MedicalPreferencesFormProps) => {
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(data.preferredPrograms || []);
  const [selectedCities, setSelectedCities] = useState<string[]>(data.preferredCities || []);

  const isFieldError = (fieldNames: string[]) => {
    return validationErrors.some(error => 
      fieldNames.some(field => error.toLowerCase().includes(field.toLowerCase()))
    );
  };

  useEffect(() => {
    onUpdate({
      preferredPrograms: selectedPrograms,
      preferredCities: selectedCities,
    });
  }, [selectedPrograms, selectedCities]);

  const addProgram = (program: string) => {
    if (program && !selectedPrograms.includes(program) && selectedPrograms.length < 3) {
      setSelectedPrograms([...selectedPrograms, program]);
    }
  };

  const removeProgram = (program: string) => {
    setSelectedPrograms(selectedPrograms.filter(p => p !== program));
  };

  const addCity = (city: string) => {
    if (city && !selectedCities.includes(city) && selectedCities.length < 3) {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const removeCity = (city: string) => {
    setSelectedCities(selectedCities.filter(c => c !== city));
  };

  const availablePrograms = medicalPrograms.filter(
    program => !selectedPrograms.includes(program)
  );

  const cities = [
    'ALL',
    'Mumbai',
    'Pune',
    'Nagpur',
    'Nashik',
    'Aurangabad',
    'Solapur',
    'Kolhapur',
    'Amravati',
    'Nanded',
    'Akola'
  ];

  const availableCities = cities.filter(
    city => !selectedCities.includes(city)
  );

  return (
    <div className="space-y-6">
      {/* Medical Programs */}
      <Card className="border-2 border-red-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Heart className="h-5 w-5" />
            Medical Programs (Select up to 3) <span className="text-red-500">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Add Program</Label>
            <div className="flex gap-2">
              <Select
                onValueChange={addProgram}
                disabled={selectedPrograms.length >= 3}
              >
                <SelectTrigger className={isFieldError(['program', 'medical program']) ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a medical program" />
                </SelectTrigger>
                <SelectContent>
                  {availablePrograms.map((program) => (
                    <SelectItem key={program} value={program}>
                      {program}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Note: You can select "ALL" along with other specific programs for comprehensive recommendations
            </p>
          </div>

          {selectedPrograms.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Programs ({selectedPrograms.length}/3)</Label>
              <div className="flex flex-wrap gap-2">
                {selectedPrograms.map((program) => (
                  <Badge
                    key={program}
                    variant="secondary"
                    className="text-sm py-2 px-3 bg-red-100 text-red-900 hover:bg-red-200"
                  >
                    {program}
                    <button
                      onClick={() => removeProgram(program)}
                      className="ml-2 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {isFieldError(['program', 'medical program']) && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Please select at least one medical program</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferred Cities */}
      <Card className="border-2 border-red-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <MapPin className="h-5 w-5" />
            Preferred Cities (Select up to 3)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Add City</Label>
            <div className="flex gap-2">
              <Select
                onValueChange={addCity}
                disabled={selectedCities.length >= 3}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Select "ALL" to see colleges from all cities, or choose specific cities
            </p>
          </div>

          {selectedCities.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Cities ({selectedCities.length}/3)</Label>
              <div className="flex flex-wrap gap-2">
                {selectedCities.map((city) => (
                  <Badge
                    key={city}
                    variant="secondary"
                    className="text-sm py-2 px-3 bg-red-100 text-red-900 hover:bg-red-200"
                  >
                    {city}
                    <button
                      onClick={() => removeCity(city)}
                      className="ml-2 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
