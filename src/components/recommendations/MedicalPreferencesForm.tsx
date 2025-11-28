import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, MapPin, X, Plus, GripVertical, Home, Building2, Car, ChevronDown } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface MedicalPreferencesFormProps {
  data: any;
  onUpdate: (data: any) => void;
  validationErrors?: string[];
}

export const MedicalPreferencesForm = ({ data, onUpdate, validationErrors = [] }: MedicalPreferencesFormProps) => {
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(data.preferredMedicalPrograms || []);
  const [selectedCities, setSelectedCities] = useState<string[]>(data.preferredCities || []);

  const availablePrograms = [
    "ALL",
    "MBBS",
    "BDS",
    "BAMS",
    "BHMS",
    "BUMS",
    "BNYS",
    "BPTH",
    "BOTH",
    "BASLP",
    "BP&O"
  ];

  const availableCities = [
    "ALL",
    "Ahmednagar",
    "Akola",
    "Amravati",
    "Beed",
    "Bhandara",
    "Buldhana",
    "Chandrapur",
    "Chh. Sambhaji Nagar (Aurangabad)",
    "Chikhli",
    "Dharashiv (Osmanabad)",
    "Dhule",
    "Ichalkaranji",
    "Jalgaon",
    "Jalna",
    "Kalyan",
    "Kolhapur",
    "Latur",
    "Mumbai",
    "Nagpur",
    "Nanded",
    "Nandurbar",
    "Nashik",
    "Palghar",
    "Pandharpur",
    "Parbhani",
    "Pune",
    "Raigad",
    "Ratnagiri",
    "Sangli",
    "Satara",
    "Sindhudurg",
    "Solapur",
    "Thane",
    "Ulhasnagar",
    "Wardha",
    "Washim",
    "Yavatmal"
  ];

  useEffect(() => {
    onUpdate({
      preferredMedicalPrograms: selectedPrograms,
      preferredCities: selectedCities,
      hostelPreference: data.hostelPreference,
      campusSetting: data.campusSetting,
      transportFacility: data.transportFacility
    });
  }, [selectedPrograms, selectedCities, data.hostelPreference, data.campusSetting, data.transportFacility]);

  const addProgram = (program: string) => {
    if (program === "ALL") {
      // If ALL is selected, clear other selections and set only ALL
      setSelectedPrograms(["ALL"]);
    } else {
      // If adding a non-ALL program
      if (selectedPrograms.includes("ALL")) {
        // If ALL is already selected, remove it and add the new program
        setSelectedPrograms([program]);
      } else if (selectedPrograms.length < 3 && !selectedPrograms.includes(program)) {
        // Normal add logic
        setSelectedPrograms([...selectedPrograms, program]);
      }
    }
  };

  const removeProgram = (program: string) => {
    setSelectedPrograms(selectedPrograms.filter(p => p !== program));
  };

  const addCity = (city: string) => {
    if (city === "ALL") {
      // If ALL is selected, clear other selections and set only ALL
      setSelectedCities(["ALL"]);
    } else {
      // If adding a non-ALL city
      if (selectedCities.includes("ALL")) {
        // If ALL is already selected, remove it and add the new city
        setSelectedCities([city]);
      } else if (selectedCities.length < 3 && !selectedCities.includes(city)) {
        // Normal add logic
        setSelectedCities([...selectedCities, city]);
      }
    }
  };

  const removeCity = (city: string) => {
    setSelectedCities(selectedCities.filter(c => c !== city));
  };

  const handleProgramDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedPrograms);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedPrograms(items);
  };

  const handleCityDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedCities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedCities(items);
  };

  return (
    <div className="space-y-8">
      {/* Core Preferences */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              Medical Programs
              <span className="text-red-500">*</span>
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">Select up to 3 programs</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Select 
              onValueChange={addProgram}
              disabled={selectedPrograms.length >= 3 || selectedPrograms.includes("ALL")}
            >
              <SelectTrigger className="h-12 rounded-xl border-2 bg-white">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-purple-600" />
                  <SelectValue placeholder={selectedPrograms.includes("ALL") ? "ALL programs selected" : selectedPrograms.length >= 3 ? "Maximum 3 programs selected" : "Add your preferred medical programs"} />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {availablePrograms.filter(program => !selectedPrograms.includes(program)).map((program) => (
                  <SelectItem key={program} value={program} className="hover:bg-purple-50 focus:bg-purple-50">
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedPrograms.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  🎯 Your Preferences ({selectedPrograms.length}/3 - drag to reorder by priority):
                </p>
                <div className="border-2 rounded-xl p-3 bg-white">
                  <DragDropContext onDragEnd={handleProgramDragEnd}>
                    <Droppable droppableId="programs">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {selectedPrograms.map((program, index) => (
                            <Draggable key={program} draggableId={program} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border shadow-sm hover:shadow-md transition-all"
                                >
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical size={16} className="text-slate-400 hover:text-slate-600" />
                                  </div>
                                  <span className="text-sm font-bold text-purple-700 bg-white px-2 py-1 rounded-full">
                                    #{index + 1}
                                  </span>
                                  <span className="flex-1 text-sm font-medium text-slate-700">{program}</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeProgram(program)}
                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-100 rounded-full"
                                  >
                                    <X size={14} />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BookOpen size={32} className="mx-auto mb-2 opacity-50" />
                <p>Select your preferred medical programs!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <MapPin className="text-white" size={20} />
              </div>
              Preferred Cities
              <span className="text-xs text-slate-500 font-normal ml-2">(Optional)</span>
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2">Select up to 3 cities</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {availableCities.length > 10 ? (
              <div className={selectedCities.length >= 3 || selectedCities.includes("ALL") ? 'opacity-50 pointer-events-none' : ''}>
                <SearchableSelect
                  options={availableCities
                    .filter(city => !selectedCities.includes(city))
                    .map(city => ({ value: city, label: city }))}
                  value=""
                  onValueChange={addCity}
                  placeholder={selectedCities.includes("ALL") ? "ALL cities selected" : selectedCities.length >= 3 ? "Maximum 3 cities selected" : "Add cities you'd love to study in"}
                  searchPlaceholder="Search cities..."
                  className="w-full"
                />
              </div>
            ) : (
              <Select 
                onValueChange={addCity}
                disabled={selectedCities.length >= 3 || selectedCities.includes("ALL")}
              >
                <SelectTrigger className="h-12 rounded-xl border-2 bg-white">
                  <div className="flex items-center gap-2">
                    <Plus size={16} className="text-green-600" />
                    <SelectValue placeholder={selectedCities.includes("ALL") ? "ALL cities selected" : selectedCities.length >= 3 ? "Maximum 3 cities selected" : "Add cities you'd love to study in"} />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {availableCities.filter(city => !selectedCities.includes(city)).map((city) => (
                    <SelectItem key={city} value={city} className="hover:bg-purple-50 focus:bg-purple-50">
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedCities.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  🗺️ Your Preferences ({selectedCities.length}/3 - drag to reorder by priority):
                </p>
                <div className="border-2 rounded-xl p-3 bg-white">
                  <DragDropContext onDragEnd={handleCityDragEnd}>
                    <Droppable droppableId="cities">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {selectedCities.map((city, index) => (
                            <Draggable key={city} draggableId={city} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border shadow-sm hover:shadow-md transition-all"
                                >
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical size={16} className="text-slate-400 hover:text-slate-600" />
                                  </div>
                                  <span className="text-sm font-bold text-green-700 bg-white px-2 py-1 rounded-full">
                                    #{index + 1}
                                  </span>
                                  <span className="flex-1 text-sm font-medium text-slate-700">{city}</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeCity(city)}
                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-100 rounded-full"
                                  >
                                    <X size={14} />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                <p>Pick your favorite cities!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campus Facilities - Optional Collapsible */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl overflow-hidden">
        <details className="group">
          <summary className="cursor-pointer p-6 pb-4 hover:bg-blue-50/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                <Building2 className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-slate-800">
                Campus Vibe <span className="text-sm text-slate-500 font-normal">(Optional - but good to know!)</span>
              </span>
              <div className="ml-auto transform transition-transform duration-200 group-open:rotate-180">
                <ChevronDown className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </summary>

          <div className="px-6 pb-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                  <Home size={16} className="text-blue-600" />
                  🏠 Hostel Needed?
                </Label>
                <Select onValueChange={(value) => onUpdate({ hostelPreference: value })} value={data.hostelPreference}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-white">
                    <SelectValue placeholder="Your hostel preference" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="required">Yes, definitely need it!</SelectItem>
                    <SelectItem value="preferred">Would be nice to have</SelectItem>
                    <SelectItem value="not-needed">No, I'm good</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                  <Building2 size={16} className="text-green-600" />
                  🌆 Campus Vibe
                </Label>
                <Select onValueChange={(value) => onUpdate({ campusSetting: value })} value={data.campusSetting}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-white">
                    <SelectValue placeholder="Your ideal setting" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="urban">City life (Urban)</SelectItem>
                    <SelectItem value="suburban">Best of both (Suburban)</SelectItem>
                    <SelectItem value="rural">Peaceful (Rural)</SelectItem>
                    <SelectItem value="no-preference">I'm flexible!</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                  <Car size={16} className="text-orange-600" />
                  🚌 Transportation
                </Label>
                <Select onValueChange={(value) => onUpdate({ transportFacility: value })} value={data.transportFacility}>
                  <SelectTrigger className="h-12 rounded-xl border-2 bg-white">
                    <SelectValue placeholder="Transport preference" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="required">Must have!</SelectItem>
                    <SelectItem value="preferred">Nice to have</SelectItem>
                    <SelectItem value="not-needed">Not needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </details>
      </Card>
    </div>
  );
};
