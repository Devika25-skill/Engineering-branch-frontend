import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, X, Plus, GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface DiplomaCitiesFormProps {
  data: any;
  onUpdate: (data: any) => void;
  validationErrors?: string[];
}

export const DiplomaCitiesForm = ({ data, onUpdate, validationErrors = [] }: DiplomaCitiesFormProps) => {
  const [selectedCities, setSelectedCities] = useState<string[]>(data.selectedCities || []);

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
      selectedCities: selectedCities
    });
  }, [selectedCities, onUpdate]);

  const addCity = (city: string) => {
    if (!selectedCities.includes(city)) {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const removeCity = (city: string) => {
    setSelectedCities(selectedCities.filter(c => c !== city));
  };

  const handleCityDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedCities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedCities(items);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <MapPin className="text-white" size={20} />
            </div>
            Preferred Cities
            <span className="text-xs text-slate-500 font-normal ml-2">(Optional)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {availableCities.length > 10 ? (
            <SearchableSelect
              options={availableCities
                .filter(city => !selectedCities.includes(city))
                .map(city => ({ value: city, label: city }))}
              value=""
              onValueChange={addCity}
              placeholder="Add cities you'd love to study in"
              searchPlaceholder="Search cities..."
              className="w-full"
            />
          ) : (
            <Select onValueChange={addCity}>
              <SelectTrigger className="h-12 rounded-xl border-2 bg-white">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-green-600" />
                  <SelectValue placeholder="Add cities you'd love to study in" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {availableCities.filter(city => !selectedCities.includes(city)).map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedCities.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                🗺️ Your Preferences (drag to reorder by priority):
              </p>
              <div className={`border-2 rounded-xl p-3 bg-white ${selectedCities.length > 5 ? 'max-h-80 overflow-y-auto' : ''}`}>
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
  );
};