
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { MasterData, CamperProfile } from '@/utils/masterDataStorage';
import { CAMP_DATA } from '@/data/campData';

const CamperManagement = () => {
  const { toast } = useToast();
  const [campers, setCampers] = useState<CamperProfile[]>([]);
  const [filteredCampers, setFilteredCampers] = useState<CamperProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bunkFilter, setBunkFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCamper, setSelectedCamper] = useState<CamperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [newCamper, setNewCamper] = useState({
    name: '',
    bunkId: '',
    code: ''
  });

  useEffect(() => {
    loadCampers();
  }, []);

  useEffect(() => {
    filterCampers();
  }, [campers, searchTerm, bunkFilter]);

  const loadCampers = async () => {
    setLoading(true);
    try {
      const allCampers = await MasterData.getAllCamperProfiles();
      setCampers(allCampers);
    } catch (error) {
      console.error('Error loading campers:', error);
      toast({
        title: "Error",
        description: "Failed to load campers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCampers = () => {
    let filtered = [...campers];

    if (searchTerm) {
      filtered = filtered.filter(camper => 
        camper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camper.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (bunkFilter !== 'all') {
      filtered = filtered.filter(camper => camper.bunkId === bunkFilter);
    }

    setFilteredCampers(filtered);
  };

  const handleAddCamper = () => {
    if (!newCamper.name || !newCamper.bunkId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const bunk = CAMP_DATA.find(b => b.id === newCamper.bunkId);
    if (!bunk) {
      toast({
        title: "Invalid Bunk",
        description: "Selected bunk does not exist.",
        variant: "destructive"
      });
      return;
    }

    const camperProfile: CamperProfile = {
      id: `camper_${Date.now()}`,
      name: newCamper.name,
      code: newCamper.code || MasterData.generateSecureCamperCode(bunk.displayName.split(' ').pop()?.charAt(0).toUpperCase() || 'A', Math.floor(Math.random() * 100), newCamper.name),
      bunkId: newCamper.bunkId,
      bunkName: bunk.displayName
    };

    const updatedCampers = [...campers, camperProfile];
    MasterData.saveAllCamperProfiles(updatedCampers);
    setCampers(updatedCampers);
    
    setNewCamper({ name: '', bunkId: '', code: '' });
    setShowAddDialog(false);
    
    toast({
      title: "Camper Added",
      description: `${camperProfile.name} has been added to Bunk ${bunk.displayName}.`,
    });
  };

  const handleEditCamper = () => {
    if (!selectedCamper || !selectedCamper.name || !selectedCamper.bunkId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const bunk = CAMP_DATA.find(b => b.id === selectedCamper.bunkId);
    if (!bunk) {
      toast({
        title: "Invalid Bunk",
        description: "Selected bunk does not exist.",
        variant: "destructive"
      });
      return;
    }

    const updatedCamper = {
      ...selectedCamper,
      bunkName: bunk.displayName
    };

    const updatedCampers = campers.map(c => 
      c.id === selectedCamper.id ? updatedCamper : c
    );
    
    MasterData.saveAllCamperProfiles(updatedCampers);
    setCampers(updatedCampers);
    
    setSelectedCamper(null);
    setShowEditDialog(false);
    
    toast({
      title: "Camper Updated",
      description: `${updatedCamper.name}'s information has been updated.`,
    });
  };

  const handleDeleteCamper = (camperId: string) => {
    const camper = campers.find(c => c.id === camperId);
    if (!camper) return;

    const updatedCampers = campers.filter(c => c.id !== camperId);
    MasterData.saveAllCamperProfiles(updatedCampers);
    setCampers(updatedCampers);
    
    toast({
      title: "Camper Removed",
      description: `${camper.name} has been removed from the system.`,
    });
  };

  const uniqueBunks = CAMP_DATA.map(bunk => ({ id: bunk.id, name: bunk.displayName }));

  return (
    <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span>Camper Management</span>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Camper
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Camper</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Camper Name</Label>
                  <Input
                    id="name"
                    value={newCamper.name}
                    onChange={(e) => setNewCamper(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter camper name"
                  />
                </div>
                <div>
                  <Label htmlFor="bunk">Bunk</Label>
                  <Select value={newCamper.bunkId} onValueChange={(value) => setNewCamper(prev => ({ ...prev, bunkId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bunk" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueBunks.map(bunk => (
                        <SelectItem key={bunk.id} value={bunk.id}>{bunk.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="code">Camper Code (Optional)</Label>
                  <Input
                    id="code"
                    value={newCamper.code}
                    onChange={(e) => setNewCamper(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCamper}>
                    Add Camper
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search campers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={bunkFilter} onValueChange={setBunkFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by bunk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bunks</SelectItem>
              {uniqueBunks.map(bunk => (
                <SelectItem key={bunk.id} value={bunk.id}>{bunk.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center text-sm text-gray-600">
            {filteredCampers.length} campers
          </div>
        </div>

        {/* Campers List */}
        <div className="grid gap-2">
          {filteredCampers.map((camper) => (
            <div key={camper.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div>
                  <h3 className="font-medium">{camper.name}</h3>
                  <p className="text-sm text-gray-500">Code: {camper.code}</p>
                </div>
                <Badge variant="outline">{camper.bunkName}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCamper(camper);
                    setShowEditDialog(true);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteCamper(camper.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {filteredCampers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No campers found matching your criteria.
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Camper</DialogTitle>
          </DialogHeader>
          {selectedCamper && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Camper Name</Label>
                <Input
                  id="edit-name"
                  value={selectedCamper.name}
                  onChange={(e) => setSelectedCamper(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-code">Camper Code</Label>
                <Input
                  id="edit-code"
                  value={selectedCamper.code}
                  onChange={(e) => setSelectedCamper(prev => prev ? { ...prev, code: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-bunk">Bunk</Label>
                <Select value={selectedCamper.bunkId} onValueChange={(value) => setSelectedCamper(prev => prev ? { ...prev, bunkId: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueBunks.map(bunk => (
                      <SelectItem key={bunk.id} value={bunk.id}>{bunk.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditCamper}>
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

export default CamperManagement;
