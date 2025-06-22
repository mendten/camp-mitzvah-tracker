
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_MISSIONS } from '@/data/campData';

interface BulkCompleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCampers: string[];
  camperNames: { [key: string]: string };
  onBulkComplete: (camperIds: string[], missionIds: string[]) => void;
}

const BulkCompleteDialog: React.FC<BulkCompleteDialogProps> = ({
  isOpen,
  onClose,
  selectedCampers,
  camperNames,
  onBulkComplete
}) => {
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const { toast } = useToast();

  const activeMissions = DEFAULT_MISSIONS.filter(m => m.isActive);

  const handleMissionToggle = (missionId: string) => {
    setSelectedMissions(prev => 
      prev.includes(missionId)
        ? prev.filter(id => id !== missionId)
        : [...prev, missionId]
    );
  };

  const handleSubmit = () => {
    if (selectedMissions.length === 0) {
      toast({
        title: "No Missions Selected",
        description: "Please select at least one mission to complete",
        variant: "destructive"
      });
      return;
    }

    onBulkComplete(selectedCampers, selectedMissions);
    toast({
      title: "Bulk Complete Successful! 🎉",
      description: `Completed ${selectedMissions.length} missions for ${selectedCampers.length} campers`,
    });
    
    setSelectedMissions([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Complete Missions</DialogTitle>
          <DialogDescription>
            Select missions to complete for {selectedCampers.length} selected campers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Selected Campers:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedCampers.map(camperId => (
                <span 
                  key={camperId}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {camperNames[camperId]}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Select Missions to Complete:</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {activeMissions.map(mission => (
                <div key={mission.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={mission.id}
                    checked={selectedMissions.includes(mission.id)}
                    onCheckedChange={() => handleMissionToggle(mission.id)}
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{mission.icon}</span>
                    <div>
                      <Label htmlFor={mission.id} className="text-sm font-medium cursor-pointer">
                        {mission.title}
                      </Label>
                      <p className="text-xs text-gray-500 capitalize">{mission.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <span className="text-yellow-600">⚠️</span>
            <p className="text-sm text-yellow-800">
              This will mark selected missions as complete for all selected campers. This action cannot be undone.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={selectedMissions.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            Complete Selected Missions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkCompleteDialog;
