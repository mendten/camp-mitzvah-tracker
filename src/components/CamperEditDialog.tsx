
import React, { useState } from 'react';
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
  const [editedCamper, setEditedCamper] = useState(camper || {
    id: '',
    name: '',
    bunk: '',
    progress: 0,
    missions: 0,
    code: ''
  });
  const { toast } = useToast();

  const handleSave = () => {
    if (!editedCamper.name.trim()) {
      toast({
        title: "Invalid Camper",
        description: "Camper name is required",
        variant: "destructive"
      });
      return;
    }

    onSave(editedCamper);
    toast({
      title: "Camper Updated",
      description: `${editedCamper.name} has been updated successfully`,
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
            Modify the camper details below
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
              <Label htmlFor="code">Camper Code</Label>
              <Input
                id="code"
                value={editedCamper.code || ''}
                onChange={(e) => setEditedCamper({ ...editedCamper, code: e.target.value })}
                placeholder="Enter camper code"
              />
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

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Camper Preview</h4>
            <div className="space-y-2">
              <p><strong>Name:</strong> {editedCamper.name || 'Camper Name'}</p>
              <p><strong>Bunk:</strong> {editedCamper.bunk || 'Not assigned'}</p>
              <p><strong>Code:</strong> {editedCamper.code || 'No code'}</p>
              <p><strong>Progress:</strong> {editedCamper.progress}%</p>
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
