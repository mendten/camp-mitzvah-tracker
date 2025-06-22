import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CAMP_DATA } from '@/data/campData';

interface CamperEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  camper: any;
  onSave: (camper: any) => void;
}

const CamperEditDialog: React.FC<CamperEditDialogProps> = ({
  isOpen,
  onClose,
  camper,
  onSave
}) => {
  const [editedCamper, setEditedCamper] = useState({
    id: '',
    name: '',
    bunk: '',
    progress: 0,
    missions: 0,
    code: ''
  });
  const { toast } = useToast();

  // Update form when camper prop changes
  useEffect(() => {
    if (camper) {
      setEditedCamper({
        id: camper.id || '',
        name: camper.name || '',
        bunk: camper.bunk || '',
        progress: camper.progress || 0,
        missions: camper.missions || 0,
        code: camper.code || camper.id || '' // Use code if available, fallback to id
      });
    }
  }, [camper]);

  const handleSave = () => {
    if (!editedCamper.name.trim()) {
      toast({
        title: "Invalid Camper",
        description: "Camper name is required",
        variant: "destructive"
      });
      return;
    }

    if (!editedCamper.code.trim()) {
      toast({
        title: "Invalid Camper",
        description: "Camper code is required for identification",
        variant: "destructive"
      });
      return;
    }

    onSave(editedCamper);
    toast({
      title: "Camper Updated",
      description: `${editedCamper.name} (Code: ${editedCamper.code}) has been updated successfully`,
    });
    onClose();
  };

  if (!camper) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Camper</DialogTitle>
          <DialogDescription>
            Modify the camper details below. The code is used for camper identification and login.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Camper Name</Label>
              <Input
                id="name"
                value={editedCamper.name}
                onChange={(e) => setEditedCamper({ ...editedCamper, name: e.target.value })}
                placeholder="Enter camper name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Camper Code (ID)</Label>
              <Input
                id="code"
                value={editedCamper.code}
                onChange={(e) => setEditedCamper({ ...editedCamper, code: e.target.value })}
                placeholder="Enter unique camper code"
              />
              <p className="text-xs text-gray-500">This code is used for camper login and identification</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bunk Assignment</Label>
            <Select
              value={editedCamper.bunk}
              onValueChange={(value) => setEditedCamper({ ...editedCamper, bunk: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bunk" />
              </SelectTrigger>
              <SelectContent>
                {CAMP_DATA.map(bunk => (
                  <SelectItem key={bunk.id} value={bunk.displayName}>
                    Bunk {bunk.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={editedCamper.progress}
                onChange={(e) => setEditedCamper({ ...editedCamper, progress: parseInt(e.target.value) || 0 })}
                placeholder="Enter progress percentage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="missions">Completed Missions</Label>
              <Input
                id="missions"
                type="number"
                min="0"
                value={editedCamper.missions}
                onChange={(e) => setEditedCamper({ ...editedCamper, missions: parseInt(e.target.value) || 0 })}
                placeholder="Enter completed missions"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Camper Preview</h4>
            <div className="space-y-2">
              <p><strong>Name:</strong> {editedCamper.name || 'Camper Name'}</p>
              <p><strong>Bunk:</strong> {editedCamper.bunk || 'Not assigned'}</p>
              <p><strong>Login Code:</strong> {editedCamper.code || 'No code'}</p>
              <p><strong>Progress:</strong> {editedCamper.progress}%</p>
              <p><strong>Missions:</strong> {editedCamper.missions}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CamperEditDialog;
