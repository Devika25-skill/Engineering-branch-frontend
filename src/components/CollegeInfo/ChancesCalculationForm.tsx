import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { categoryMapping } from "./CategoryMapping";

interface ChancesCalculationFormProps {
  cetPercentile: string;
  setCetPercentile: (value: string) => void;
  selectedStream: string;
  setSelectedStream: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  availableStreams: string[];
  onCalculate: () => void;
  isLoading: boolean;
  collegeName: string;
}

const ChancesCalculationForm = ({
  cetPercentile,
  setCetPercentile,
  selectedStream,
  setSelectedStream,
  selectedCategory,
  setSelectedCategory,
  availableStreams,
  onCalculate,
  isLoading,
  collegeName,
}: ChancesCalculationFormProps) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Enter your academic details to calculate your admission probability for{" "}
        {collegeName}
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="stream">Branch/Stream</Label>
          <Select value={selectedStream} onValueChange={setSelectedStream}>
            <SelectTrigger>
              <SelectValue placeholder="Select your preferred branch" />
            </SelectTrigger>
            <SelectContent>
              {availableStreams.map((stream) => (
                <SelectItem key={stream} value={stream}>
                  {stream}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryMapping).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cet">MH-CET Percentile</Label>
          <Input
            id="cet"
            type="number"
            placeholder="Enter your CET percentile (0-100)"
            value={cetPercentile}
            onChange={(e) => setCetPercentile(e.target.value)}
            min="0"
            max="100"
            step="0.0000001"
          />
        </div>
      </div>

      <Button
        onClick={onCalculate}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Calculating...
          </>
        ) : (
          "Calculate Chances"
        )}
      </Button>
    </div>
  );
};

export default ChancesCalculationForm;
