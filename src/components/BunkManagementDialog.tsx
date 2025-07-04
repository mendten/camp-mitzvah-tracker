
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Plus, Users } from 'lucide-react';

interface BunkManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bunk: any;
}

const BunkManagementDialog: React.FC<BunkManagementDialogProps> = ({
  isOpen,
  onClose,
  bunk
}) => {
  const [editingCamper, setEditingCamper] = useState<any>(null);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [newCamperName, setNewCamperName] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const { toast } = useToast();

  // Show first bunk if none provided (for testing)
  const displayBunk = bunk || {
    id: 'kevutzah-alef',
    displayName: 'Kevutzah Alef',
    campers: [],
    staff: []
  };

  const handleEditCamper = (camper: any) => {
    setEditingCamper({ ...camper });
  };

  const handleSaveCamper = () => {
    toast({
      title: "Camper Updated",
      description: `${editingCamper.name} has been updated successfully`,
    });
    setEditingCamper(null);
  };

  const handleDeleteCamper = (camperId: string, camperName: string) => {
    toast({
      title: "Camper Removed",
      description: `${camperName} has been removed from the bunk`,
      variant: "destructive"
    });
  };

  const handleAddCamper = () => {
    if (newCamperName.trim()) {
      toast({
        title: "Camper Added",
        description: `${newCamperName} has been added to the bunk`,
      });
      setNewCamperName('');
    }
  };

  const handleEditStaff = (staff: any) => {
    setEditingStaff({ ...staff });
  };

  const handleSaveStaff = () => {
    toast({
      title: "Staff Updated",
      description: `${editingStaff.name} has been updated successfully`,
    });
    setEditingStaff(null);
  };

  const handleAddStaff = () => {
    if (newStaffName.trim()) {
      toast({
        title: "Staff Added",
        description: `${newStaffName} has been added to the bunk`,
      });
      setNewStaffName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Bunk {displayBunk.displayName}</DialogTitle>
          <DialogDescription>
            Add, edit, or remove campers and staff from this bunk
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="campers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="campers">Campers ({displayBunk.campers.length})</TabsTrigger>
            <TabsTrigger value="staff">Staff ({displayBunk.staff.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="campers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add New Camper</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Camper name"
                    value={newCamperName}
                    onChange={(e) => setNewCamperName(e.target.value)}
                  />
                  <Button onClick={handleAddCamper} disabled={!newCamperName.trim()}>
                    Add Camper
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Campers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {displayBunk.campers.map((camper: any) => (
                    <div key={camper.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{camper.name}</p>
                        <p className="text-xs text-gray-500">ID: {camper.id}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCamper(camper)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCamper(camper.id, camper.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add New Staff</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Staff name"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                  />
                  <Button onClick={handleAddStaff} disabled={!newStaffName.trim()}>
                    Add Staff
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {displayBunk.staff.map((staff: any) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-xs text-gray-500">ID: {staff.id}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStaff(staff)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast({ title: "Staff Removed", description: `${staff.name} removed from bunk`, variant: "destructive" })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {editingCamper && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle>Edit Camper: {editingCamper.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingCamper.name}
                    onChange={(e) => setEditingCamper({ ...editingCamper, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Camper ID</Label>
                  <Input
                    value={editingCamper.id}
                    onChange={(e) => setEditingCamper({ ...editingCamper, id: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveCamper}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingCamper(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {editingStaff && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle>Edit Staff: {editingStaff.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editingStaff.name}
                    onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Staff ID</Label>
                  <Input
                    value={editingStaff.id}
                    onChange={(e) => setEditingStaff({ ...editingStaff, id: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveStaff}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingStaff(null)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BunkManagementDialog;
