
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Target, Plus, Edit2, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';

interface ExtendedMission {
  id: string;
  title: string;
  type: string;
  icon: string;
  isMandatory: boolean;
  isActive: boolean;
  sortOrder?: number;
}

const MissionManagement = () => {
  const { toast } = useToast();
  const [missions, setMissions] = useState<ExtendedMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMission, setSelectedMission] = useState<ExtendedMission | null>(null);
  const [newMission, setNewMission] = useState({
    title: '',
    type: 'general',
    icon: '⭐',
    isActive: true,
    isMandatory: false
  });

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    console.log('Loading missions from Supabase...');
    setLoading(true);
    try {
      const supabaseMissions = await supabaseService.getAllMissions();
      console.log('Loaded missions:', supabaseMissions);
      setMissions(supabaseMissions);
    } catch (error) {
      console.error('Error loading missions:', error);
      toast({
        title: "Error",
        description: "Failed to load missions from Supabase.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMission = async () => {
    if (!newMission.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the mission title.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create mission ID
      const missionId = `mission_${Date.now()}`;
      
      // For now, we'll use the supabase client directly since the service doesn't have a create method
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('missions')
        .insert({
          id: missionId,
          title: newMission.title,
          type: newMission.type,
          icon: newMission.icon,
          is_active: newMission.isActive,
          is_mandatory: newMission.isMandatory,
          sort_order: missions.length
        });

      if (error) {
        throw error;
      }

      // Reload missions to show the new one
      await loadMissions();
      
      setNewMission({
        title: '',
        type: 'general',
        icon: '⭐',
        isActive: true,
        isMandatory: false
      });
      setShowAddDialog(false);
      
      toast({
        title: "Mission Added",
        description: `"${newMission.title}" has been added successfully.`,
      });
    } catch (error) {
      console.error('Error adding mission:', error);
      toast({
        title: "Error",
        description: "Failed to add mission. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditMission = async () => {
    if (!selectedMission || !selectedMission.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in the mission title.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('missions')
        .update({
          title: selectedMission.title,
          type: selectedMission.type,
          icon: selectedMission.icon,
          is_active: selectedMission.isActive,
          is_mandatory: selectedMission.isMandatory
        })
        .eq('id', selectedMission.id);

      if (error) {
        throw error;
      }

      // Reload missions to show the updates
      await loadMissions();
      
      setSelectedMission(null);
      setShowEditDialog(false);
      
      toast({
        title: "Mission Updated",
        description: `"${selectedMission.title}" has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating mission:', error);
      toast({
        title: "Error",
        description: "Failed to update mission. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMission = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    if (!confirm(`Are you sure you want to delete "${mission.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', missionId);

      if (error) {
        throw error;
      }

      // Reload missions to reflect the deletion
      await loadMissions();
      
      toast({
        title: "Mission Deleted",
        description: `"${mission.title}" has been removed successfully.`,
      });
    } catch (error) {
      console.error('Error deleting mission:', error);
      toast({
        title: "Error",
        description: "Failed to delete mission. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleActive = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { error } = await supabase
        .from('missions')
        .update({
          is_active: !mission.isActive
        })
        .eq('id', missionId);

      if (error) {
        throw error;
      }

      // Reload missions to reflect the change
      await loadMissions();
      
      toast({
        title: `Mission ${mission.isActive ? 'Deactivated' : 'Activated'}`,
        description: `"${mission.title}" is now ${mission.isActive ? 'inactive' : 'active'}.`,
      });
    } catch (error) {
      console.error('Error toggling mission status:', error);
      toast({
        title: "Error",
        description: "Failed to update mission status. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading missions from Supabase...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeMissions = missions.filter(m => m.isActive);
  const inactiveMissions = missions.filter(m => !m.isActive);

  return (
    <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-6 w-6 text-purple-600" />
            <span>Mission Management</span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={loadMissions}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Mission
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Mission</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Mission Title</Label>
                    <Input
                      id="title"
                      value={newMission.title}
                      onChange={(e) => setNewMission(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter mission title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="icon">Icon/Emoji</Label>
                      <Input
                        id="icon"
                        value={newMission.icon}
                        onChange={(e) => setNewMission(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="⭐"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Input
                        id="type"
                        value={newMission.type}
                        onChange={(e) => setNewMission(prev => ({ ...prev, type: e.target.value }))}
                        placeholder="general"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={newMission.isActive}
                        onCheckedChange={(checked) => setNewMission(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mandatory"
                        checked={newMission.isMandatory}
                        onCheckedChange={(checked) => setNewMission(prev => ({ ...prev, isMandatory: checked }))}
                      />
                      <Label htmlFor="mandatory">Mandatory</Label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddMission}>
                      Add Mission
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{activeMissions.length}</div>
            <p className="text-sm text-gray-600">Active Missions</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{inactiveMissions.length}</div>
            <p className="text-sm text-gray-600">Inactive Missions</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{missions.length}</div>
            <p className="text-sm text-gray-600">Total Missions</p>
          </div>
        </div>

        {/* Active Missions */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-green-600">Active Missions ({activeMissions.length})</h3>
          <div className="grid gap-2">
            {activeMissions.map((mission) => (
              <div key={mission.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 hover:bg-green-100">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{mission.icon}</span>
                  <div>
                    <h4 className="font-medium">{mission.title}</h4>
                    <div className="flex space-x-2 mt-1">
                      <Badge variant="outline">{mission.type}</Badge>
                      {mission.isMandatory && <Badge variant="destructive">Mandatory</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(mission.id)}
                    className="text-orange-600"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedMission(mission);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteMission(mission.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inactive Missions */}
        {inactiveMissions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-600">Inactive Missions ({inactiveMissions.length})</h3>
            <div className="grid gap-2">
              {inactiveMissions.map((mission) => (
                <div key={mission.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl opacity-50">{mission.icon}</span>
                    <div>
                      <h4 className="font-medium opacity-75">{mission.title}</h4>
                      <div className="flex space-x-2 mt-1">
                        <Badge variant="outline" className="opacity-50">{mission.type}</Badge>
                        {mission.isMandatory && <Badge variant="destructive" className="opacity-50">Mandatory</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(mission.id)}
                      className="text-green-600"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedMission(mission);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteMission(mission.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Mission</DialogTitle>
          </DialogHeader>
          {selectedMission && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Mission Title</Label>
                <Input
                  id="edit-title"
                  value={selectedMission.title}
                  onChange={(e) => setSelectedMission(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-icon">Icon/Emoji</Label>
                  <Input
                    id="edit-icon"
                    value={selectedMission.icon}
                    onChange={(e) => setSelectedMission(prev => prev ? { ...prev, icon: e.target.value } : null)}
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Type</Label>
                  <Input
                    id="edit-type"
                    value={selectedMission.type}
                    onChange={(e) => setSelectedMission(prev => prev ? { ...prev, type: e.target.value } : null)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-active"
                    checked={selectedMission.isActive}
                    onCheckedChange={(checked) => setSelectedMission(prev => prev ? { ...prev, isActive: checked } : null)}
                  />
                  <Label htmlFor="edit-active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-mandatory"
                    checked={selectedMission.isMandatory}
                    onCheckedChange={(checked) => setSelectedMission(prev => prev ? { ...prev, isMandatory: checked } : null)}
                  />
                  <Label htmlFor="edit-mandatory">Mandatory</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditMission}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MissionManagement;
