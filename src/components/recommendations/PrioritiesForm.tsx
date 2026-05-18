
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { IndianRupee, Building, Star, X, Plus, GripVertical, AlertCircle, Edit3, ChevronDown } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface PrioritiesFormProps {
  data: any;
  onUpdate: (data: any) => void;
  validationErrors?: string[];
  collegeTypeOptions?: string[];
}

export const PrioritiesForm = ({ data, onUpdate, validationErrors = [], collegeTypeOptions }: PrioritiesFormProps) => {
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(data.priorities || []);
  const [selectedCollegeTypes, setSelectedCollegeTypes] = useState<string[]>(data.collegeTypes || []);
  const [budgetValue, setBudgetValue] = useState<number[]>([data.maxBudget || 250000]);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState<string>((data.maxBudget || 250000).toString());

  const isFieldError = (fieldName: string) => {
    return validationErrors.some(error => error.toLowerCase().includes(fieldName.toLowerCase()));
  };

  const availablePriorities = [
    "High Placement Rate", "Low Fees", "College Rating", "Location", "Infrastructure",
    "Faculty Quality", "Industry Connections", "Research Opportunities", "Alumni Network",
    "Campus Life", "Hostel Facilities", "Sports Facilities"
  ];

  const defaultCollegeTypes = [
    "Government", "Autonomous", "Private", "Deemed University", "University Department"
  ];
  
  const availableCollegeTypes = collegeTypeOptions || defaultCollegeTypes;

  useEffect(() => {
    onUpdate({
      priorities: selectedPriorities,
      collegeTypes: selectedCollegeTypes,
      maxBudget: budgetValue[0]
    });
  }, [selectedPriorities, selectedCollegeTypes, budgetValue, onUpdate]);

  const addPriority = (priority: string) => {
    if (!selectedPriorities.includes(priority)) {
      setSelectedPriorities([...selectedPriorities, priority]);
    }
  };

  const removePriority = (priority: string) => {
    setSelectedPriorities(selectedPriorities.filter(p => p !== priority));
  };

  const addCollegeType = (type: string) => {
    if (!selectedCollegeTypes.includes(type)) {
      setSelectedCollegeTypes([...selectedCollegeTypes, type]);
    }
  };

  const removeCollegeType = (type: string) => {
    setSelectedCollegeTypes(selectedCollegeTypes.filter(t => t !== type));
  };

  const handlePriorityDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedPriorities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedPriorities(items);
  };

  const handleCollegeTypeDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(selectedCollegeTypes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSelectedCollegeTypes(items);
  };

  const handleBudgetEdit = () => {
    setIsEditingBudget(true);
    setBudgetInput(budgetValue[0].toString());
  };

  const handleBudgetSave = () => {
    const value = parseInt(budgetInput);
    if (!isNaN(value) && value >= 50000 && value <= 1000000) {
      setBudgetValue([value]);
      setIsEditingBudget(false);
    }
  };

  const handleBudgetCancel = () => {
    setIsEditingBudget(false);
    setBudgetInput(budgetValue[0].toString());
  };

  const formatBudget = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)} Lakhs`;
    }
    return `₹${(value / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-8">
      {/* Budget Section */}
      <Card className={`border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl ${isFieldError('Annual Budget') ? 'ring-2 ring-red-300' : ''}`}>
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <IndianRupee className="text-white" size={20} />
            </div>
            Annual Budget
            <Badge variant="destructive" className="text-xs px-2 py-0.5">Required</Badge>
            {isFieldError('Annual Budget') && <AlertCircle size={16} className="text-red-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="px-4">
            <Slider
              value={budgetValue}
              onValueChange={setBudgetValue}
              max={1000000}
              min={50000}
              step={25000}
              className="w-full"
            />
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="text-3xl font-bold text-green-700">
                {isEditingBudget ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-32 text-center text-lg font-bold"
                      min="50000"
                      max="1000000"
                    />
                    <Button size="sm" onClick={handleBudgetSave} className="h-8">
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleBudgetCancel} className="h-8">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    {formatBudget(budgetValue[0])}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleBudgetEdit}
                      className="ml-2 h-8 w-8 p-0 text-green-600 hover:bg-green-100"
                    >
                      <Edit3 size={16} />
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="text-sm text-slate-600">per year</div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white rounded-xl border">
              <div className="text-xs font-semibold text-green-600">₹0.5-1L</div>
              <div className="text-xs text-slate-500">Budget Friendly</div>
            </div>
            <div className="p-3 bg-white rounded-xl border">
              <div className="text-xs font-semibold text-blue-600">₹1-3L</div>
              <div className="text-xs text-slate-500">Affordable</div>
            </div>
            <div className="p-3 bg-white rounded-xl border">
              <div className="text-xs font-semibold text-purple-600">₹3-5L</div>
              <div className="text-xs text-slate-500">Moderate</div>
            </div>
            <div className="p-3 bg-white rounded-xl border">
              <div className="text-xs font-semibold text-orange-600">₹5L+</div>
              <div className="text-xs text-slate-500">Premium</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional Preferences - Collapsible */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl overflow-hidden">
          <details className="group">
            <summary className="cursor-pointer p-6 pb-4 hover:bg-indigo-50/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Building className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold text-slate-800">
                  College Types <span className="text-sm text-slate-500 font-normal">(Optional)</span>
                </span>
                <div className="ml-auto transform transition-transform duration-200 group-open:rotate-180">
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </summary>
            
            <div className="px-6 pb-6 space-y-6">
              <Select onValueChange={addCollegeType}>
                <SelectTrigger className="h-12 rounded-xl border-2 bg-white">
                  <div className="flex items-center gap-2">
                    <Plus size={16} className="text-indigo-600" />
                    <SelectValue placeholder="Add preferred college types" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {availableCollegeTypes.filter(type => !selectedCollegeTypes.includes(type)).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedCollegeTypes.length > 0 ? (
                <ScrollArea className="h-48 border-2 rounded-xl p-3 bg-white">
                  <DragDropContext onDragEnd={handleCollegeTypeDragEnd}>
                    <Droppable droppableId="collegeTypes">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {selectedCollegeTypes.slice(0, 5).map((type, index) => (
                            <Draggable key={type} draggableId={type} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl border shadow-sm hover:shadow-md transition-all"
                                >
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical size={16} className="text-slate-400 hover:text-slate-600" />
                                  </div>
                                  <span className="text-sm font-bold text-indigo-700 bg-white px-2 py-1 rounded-full">
                                    #{index + 1}
                                  </span>
                                  <span className="flex-1 text-sm font-medium text-slate-700">{type}</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeCollegeType(type)}
                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-100 rounded-full"
                                  >
                                    <X size={14} />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {selectedCollegeTypes.length > 5 && (
                            <div className="text-center text-sm text-slate-500 py-2 bg-indigo-50 rounded-xl">
                              +{selectedCollegeTypes.length - 5} more selected
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Building size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Select college types you prefer!</p>
                </div>
              )}
            </div>
          </details>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl overflow-hidden">
          <details className="group">
            <summary className="cursor-pointer p-6 pb-4 hover:bg-yellow-50/50 transition-colors list-none [&::-webkit-details-marker]:hidden">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Star className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold text-slate-800">
                  What Matters Most? <span className="text-sm text-slate-500 font-normal">(Optional)</span>
                </span>
                <div className="ml-auto transform transition-transform duration-200 group-open:rotate-180">
                  <ChevronDown className="w-5 h-5 text-slate-600" />
                </div>
              </div>
            </summary>
            
            <div className="px-6 pb-6 space-y-6">
              <Select onValueChange={addPriority}>
                <SelectTrigger className="h-12 rounded-xl border-2 bg-white">
                  <div className="flex items-center gap-2">
                    <Plus size={16} className="text-yellow-600" />
                    <SelectValue placeholder="Add your priority factors" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {availablePriorities.filter(priority => !selectedPriorities.includes(priority)).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedPriorities.length > 0 ? (
                <ScrollArea className="h-48 border-2 rounded-xl p-3 bg-white">
                  <DragDropContext onDragEnd={handlePriorityDragEnd}>
                    <Droppable droppableId="priorities">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {selectedPriorities.slice(0, 5).map((priority, index) => (
                            <Draggable key={priority} draggableId={priority} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border shadow-sm hover:shadow-md transition-all"
                                >
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical size={16} className="text-slate-400 hover:text-slate-600" />
                                  </div>
                                  <span className="text-sm font-bold text-yellow-700 bg-white px-2 py-1 rounded-full">
                                    #{index + 1}
                                  </span>
                                  <span className="flex-1 text-sm font-medium text-slate-700">{priority}</span>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removePriority(priority)}
                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-100 rounded-full"
                                  >
                                    <X size={14} />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {selectedPriorities.length > 5 && (
                            <div className="text-center text-sm text-slate-500 py-2 bg-yellow-50 rounded-xl">
                              +{selectedPriorities.length - 5} more selected
                            </div>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Star size={32} className="mx-auto mb-2 opacity-50" />
                  <p>What's most important to you?</p>
                </div>
              )}
            </div>
          </details>
        </Card>
      </div>
    </div>
  );
};
