
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface MissionRequirementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (requirements: { dailyRequired: number; weeklyRequired: number }) => void;
}

const MissionRequirementDialog: React.FC<MissionRequirementDialogProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [dailyRequired, setDailyRequired] = useState(3);
  const [weeklyRequired, setWeeklyRequired] = useState(15);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing requirements from localStorage
    const savedDaily = localStorage.getItem('mission_daily_required');
    const savedWeekly = localStorage.getItem('mission_weekly_required');
    
    if (savedDaily) setDailyRequired(parseInt(savedDaily));
    if (savedWeekly) setWeeklyRequired(parseInt(savedWeekly));
  }, [isOpen]);

  const handleSave = () => {
    const requirements = { dailyRequired, weeklyRequired };
    
    // Save to localStorage
    localStorage.setItem('mission_daily_required', dailyRequired.toString());
    localStorage.setItem('mission_weekly_required', weeklyRequired.toString());
    
    onSave(requirements);
    toast({
      title: "Requirements Updated",
      description: `Daily: ${dailyRequired}, Weekly: ${weeklyRequired} missions required`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mission Requirements</DialogTitle>
          <DialogDescription>
            Set the required number of missions campers must complete
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="daily">Daily Required Missions</Label>
            <Input
              id="daily"
              type="number"
              min="1"
              max="10"
              value={dailyRequired}
              onChange={(e) => setDailyRequired(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekly">Weekly Required Missions</Label>
            <Input
              id="weekly"
              type="number"
              min="1"
              max="50"
              value={weeklyRequired}
              onChange={(e) => setWeeklyRequired(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Requirements
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MissionRequirementDialog;
