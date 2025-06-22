
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface MissionEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mission: any;
  onSave: (mission: any) => void;
  onDelete: (missionId: string) => void;
}

const MissionEditDialog: React.FC<MissionEditDialogProps> = ({
  isOpen,
  onClose,
  mission,
  onSave,
  onDelete
}) => {
  const [editedMission, setEditedMission] = useState(mission || {
    id: '',
    title: '',
    type: 'prayer',
    icon: '🙏',
    isMandatory: false,
    isActive: true
  });
  const { toast } = useToast();

  const missionTypes = [
    { value: 'prayer', label: 'Prayer' },
    { value: 'learning', label: 'Learning' },
    { value: 'mitzvah', label: 'Mitzvah' },
    { value: 'activity', label: 'Activity' },
    { value: 'reflection', label: 'Reflection' },
    { value: 'shabbat', label: 'Shabbat' }
  ];

  const handleSave = () => {
    if (!editedMission.title.trim()) {
      toast({
        title: "Invalid Mission",
        description: "Mission title is required",
        variant: "destructive"
      });
      return;
    }

    onSave(editedMission);
    toast({
      title: "Mission Saved",
      description: `${editedMission.title} has been updated successfully`,
    });
    onClose();
  };

  const handleDelete = () => {
    if (editedMission.id) {
      onDelete(editedMission.id);
      toast({
        title: "Mission Deleted",
        description: `${editedMission.title} has been deleted`,
        variant: "destructive"
      });
      onClose();
    }
  };

  if (!mission && !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mission ? 'Edit Mission' : 'Create New Mission'}
          </DialogTitle>
          <DialogDescription>
            {mission ? 'Modify the mission details below' : 'Fill in the details for the new mission'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Mission Title</Label>
              <Input
                id="title"
                value={editedMission.title}
                onChange={(e) => setEditedMission({ ...editedMission, title: e.target.value })}
                placeholder="Enter mission title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Mission Icon</Label>
              <Input
                id="icon"
                value={editedMission.icon}
                onChange={(e) => setEditedMission({ ...editedMission, icon: e.target.value })}
                placeholder="🙏"
                maxLength={2}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mission Type</Label>
            <Select
              value={editedMission.type}
              onValueChange={(value) => setEditedMission({ ...editedMission, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mission type" />
              </SelectTrigger>
              <SelectContent>
                {missionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mandatory"
                checked={editedMission.isMandatory}
                onCheckedChange={(checked) => 
                  setEditedMission({ ...editedMission, isMandatory: checked as boolean })
                }
              />
              <Label htmlFor="mandatory">This is a mandatory mission</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="active"
                checked={editedMission.isActive}
                onCheckedChange={(checked) => 
                  setEditedMission({ ...editedMission, isActive: checked as boolean })
                }
              />
              <Label htmlFor="active">Mission is currently active</Label>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Mission Preview</h4>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-2xl">
                {editedMission.icon}
              </div>
              <div>
                <h3 className="font-semibold">{editedMission.title || 'Mission Title'}</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="px-2 py-1 bg-gray-100 rounded-full capitalize">
                    {editedMission.type}
                  </span>
                  {editedMission.isMandatory && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      Mandatory
                    </span>
                  )}
                  {!editedMission.isActive && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {mission && (
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete Mission
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {mission ? 'Save Changes' : 'Create Mission'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MissionEditDialog;
