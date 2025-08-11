import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, X, Plus, GripVertical, AlertCircle } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';
import { getBranchesForAdmissionType } from '@/data/integratedAdmissionConfig';

interface IntegratedBranchesFormProps {
  admissionType: IntegratedAdmissionType;
  onSelectionChange: (branches: string[]) => void;
  initialSelection?: string[];
  validationErrors?: string[];
}

export const IntegratedBranchesForm = ({ 
  admissionType, 
  onSelectionChange, 
  initialSelection = [],
  validationErrors = [] 
}: IntegratedBranchesFormProps) => {
  const [selectedBranches, setSelectedBranches] = useState<string[]>(initialSelection);
  
  const availableBranches = getBranchesForAdmissionType(admissionType);

  const isFieldError = (fieldName: string) => {
    return validationErrors.some(error => error.toLowerCase().includes(fieldName.toLowerCase()));
  };

  useEffect(() => {
    onSelectionChange(selectedBranches);
  }, [selectedBranches, onSelectionChange]);

  const addBranch = (branch: string) => {
    if (!selectedBranches.includes(branch)) {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const removeBranch = (branch: string) => {
    setSelectedBranches(selectedBranches.filter(b => b !== branch));
  };

  const handleBranchDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedBranches);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedBranches(items);
  };

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl ${isFieldError('Branches') ? 'ring-2 ring-red-300' : ''}`}>
      <CardHeader className="pb-6">
        <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <BookOpen className="text-white" size={20} />
          </div>
          Engineering Branches
          <span className="text-red-500">*</span>
          {isFieldError('Branches') && <AlertCircle size={16} className="text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {availableBranches.length > 10 ? (
          <SearchableSelect
            options={availableBranches
              .filter(branch => !selectedBranches.includes(branch))
              .map(branch => ({ value: branch, label: branch }))}
            value=""
            onValueChange={addBranch}
            placeholder="Add your favorite engineering branches"
            searchPlaceholder="Search branches..."
            className="w-full"
          />
        ) : (
          <Select onValueChange={addBranch}>
            <SelectTrigger className="h-12 rounded-xl border-2 bg-white">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-purple-600" />
                <SelectValue placeholder="Add your favorite engineering branches" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {availableBranches.filter(branch => !selectedBranches.includes(branch)).map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {selectedBranches.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
              🎯 Your Preferences (drag to reorder by priority):
            </p>
            <div className={`border-2 rounded-xl p-3 bg-white ${selectedBranches.length > 5 ? 'max-h-80 overflow-y-auto' : ''}`}>
              <DragDropContext onDragEnd={handleBranchDragEnd}>
                <Droppable droppableId="branches">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {selectedBranches.map((branch, index) => (
                        <Draggable key={branch} draggableId={branch} index={index}>
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
                              <span className="flex-1 text-sm font-medium text-slate-700">{branch}</span>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => removeBranch(branch)}
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
            <p>Select your dream engineering branches!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};