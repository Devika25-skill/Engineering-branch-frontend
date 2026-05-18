import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Wrench, Sparkles } from "lucide-react";

interface PreferencesConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: {
    preferredStreams?: string[];
    preferredCities?: string[];
  };
}

const PreferencesConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  formData 
}: PreferencesConfirmationDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Confirm Your Preferences
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="w-5 h-5 text-purple-600" />
                Engineering Branches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.preferredStreams && formData.preferredStreams.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.preferredStreams.map((stream, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-purple-100 text-purple-700 hover:bg-purple-200"
                    >
                      {stream}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No engineering branches selected</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
                Preferred Cities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.preferredCities && formData.preferredCities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.preferredCities.map((city, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      {city}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic">No preferred cities selected</p>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Edit Preferences
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Recommendations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreferencesConfirmationDialog;