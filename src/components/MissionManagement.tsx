
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
import { Target, Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { DEFAULT_MISSIONS } from '@/data/campData';

interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  category?: string;
  points?: number;
}

const MissionManagement = () => {
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    icon: '⭐',
    isActive: true,
    category: 'General',
    points: 1
  });

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = () => {
    // Load missions from localStorage or use defaults
    const storedMissions = localStorage.getItem('custom_missions');
    if (storedMissions) {
      setMissions(JSON.parse(storedMissions));
    } else {
      setMissions([...DEFAULT_MISSIONS]);
      localStorage.setItem('custom_missions', JSON.stringify(DEFAULT_MISSIONS));
    }
  };

  const saveMissions = (updatedMissions: Mission[]) => {
    setMissions(updatedMissions);
    localStorage.setItem('custom_missions', JSON.stringify(updatedMissions));
  };

  const handleAddMission = () => {
    if (!newMission.title || !newMission.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and description.",
        variant: "destructive"
      });
      return;
    }

    const mission: Mission = {
      id: `mission_${Date.now()}`,
      title: newMission.title,
      description: newMission.description,
      icon: newMission.icon,
      isActive: newMission.isActive,
      category: newMission.category,
      points: newMission.points
    };

    const updatedMissions = [...missions, mission];
    saveMissions(updatedMissions);
    
    setNewMission({
      title: '',
      description: '',
      icon: '⭐',
      isActive: true,
      category: 'General',
      points: 1
    });
    setShowAddDialog(false);
    
    toast({
      title: "Mission Added",
      description: `"${mission.title}" has been added to the mission list.`,
    });
  };

  const handleEditMission = () => {
    if (!selectedMission || !selectedMission.title || !selectedMission.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in title and description.",
        variant: "destructive"
      });
      return;
    }

    const updatedMissions = missions.map(m => 
      m.id === selectedMission.id ? selectedMission : m
    );
    
    saveMissions(updatedMissions);
    
    setSelectedMission(null);
    setShowEditDialog(false);
    
    toast({
      title: "Mission Updated",
      description: `"${selectedMission.title}" has been updated.`,
    });
  };

  const handleDeleteMission = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    const updatedMissions = missions.filter(m => m.id !== missionId);
    saveMissions(updatedMissions);
    
    toast({
      title: "Mission Deleted",
      description: `"${mission.title}" has been removed.`,
    });
  };

  const handleToggleActive = (missionId: string) => {
    const updatedMissions = missions.map(m => 
      m.id === missionId ? { ...m, isActive: !m.isActive } : m
    );
    saveMissions(updatedMissions);
    
    const mission = missions.find(m => m.id === missionId);
    toast({
      title: `Mission ${mission?.isActive ? 'Deactivated' : 'Activated'}`,
      description: `"${mission?.title}" is now ${mission?.isActive ? 'inactive' : 'active'}.`,
    });
  };

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
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMission.description}
                    onChange={(e) => setNewMission(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter mission description"
                    rows={3}
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
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      value={newMission.points}
                      onChange={(e) => setNewMission(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                      min={1}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newMission.category}
                    onChange={(e) => setNewMission(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="General"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newMission.isActive}
                    onCheckedChange={(checked) => setNewMission(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="active">Active</Label>
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
                    <p className="text-sm text-gray-600">{mission.description}</p>
                    {mission.category && <Badge variant="outline" className="mt-1">{mission.category}</Badge>}
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
                      <p className="text-sm text-gray-500">{mission.description}</p>
                      {mission.category && <Badge variant="outline" className="mt-1 opacity-50">{mission.category}</Badge>}
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
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedMission.description}
                  onChange={(e) => setSelectedMission(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
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
                  <Label htmlFor="edit-points">Points</Label>
                  <Input
                    id="edit-points"
                    type="number"
                    value={selectedMission.points || 1}
                    onChange={(e) => setSelectedMission(prev => prev ? { ...prev, points: parseInt(e.target.value) || 1 } : null)}
                    min={1}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={selectedMission.category || ''}
                  onChange={(e) => setSelectedMission(prev => prev ? { ...prev, category: e.target.value } : null)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={selectedMission.isActive}
                  onCheckedChange={(checked) => setSelectedMission(prev => prev ? { ...prev, isActive: checked } : null)}
                />
                <Label htmlFor="edit-active">Active</Label>
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
