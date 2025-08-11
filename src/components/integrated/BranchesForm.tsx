import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, BookOpen } from 'lucide-react';
import { IntegratedAdmissionType } from '@/types/integratedAdmission';
import { getBranchesForAdmissionType } from '@/data/integratedAdmissionConfig';

interface BranchesFormProps {
  admissionType: IntegratedAdmissionType;
  onSelectionChange: (selectedBranches: string[]) => void;
  initialSelection?: string[];
}

export const BranchesForm: React.FC<BranchesFormProps> = ({
  admissionType,
  onSelectionChange,
  initialSelection = []
}) => {
  const [selectedBranches, setSelectedBranches] = useState<string[]>(initialSelection);
  const branches = getBranchesForAdmissionType(admissionType);

  useEffect(() => {
    onSelectionChange(selectedBranches);
  }, [selectedBranches, onSelectionChange]);

  const handleBranchToggle = (branch: string) => {
    setSelectedBranches(prev => 
      prev.includes(branch)
        ? prev.filter(b => b !== branch)
        : [...prev, branch]
    );
  };

  const handleSelectAll = () => {
    setSelectedBranches(branches);
  };

  const handleClearAll = () => {
    setSelectedBranches([]);
  };

  const removeBranch = (branch: string) => {
    setSelectedBranches(prev => prev.filter(b => b !== branch));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Select Preferred Branches
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Choose the branches you're interested in for {admissionType.replace(/_/g, ' ')}
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
        {/* Selected branches display */}
        {selectedBranches.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Selected Branches ({selectedBranches.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedBranches.map((branch) => (
                <Badge
                  key={branch}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                  {branch}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-600"
                    onClick={() => removeBranch(branch)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Branch selection grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches.map((branch) => (
            <div
              key={branch}
              className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
              onClick={() => handleBranchToggle(branch)}
            >
              <Checkbox
                id={branch}
                checked={selectedBranches.includes(branch)}
                onChange={() => handleBranchToggle(branch)}
              />
              <label
                htmlFor={branch}
                className="text-sm font-medium cursor-pointer flex-1"
              >
                {branch}
              </label>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 mt-4">
          * You can select multiple branches. This will help us show you relevant colleges.
        </div>
      </CardContent>
    </Card>
  );
};