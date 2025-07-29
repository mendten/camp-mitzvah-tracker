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
import { supabase } from '@/integrations/supabase/client';

interface CamperProfile {
  id: string;
  name: string;
  access_code: string;
  bunk_id: string;
  bunkName?: string;
}

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
  const [bunks, setBunks] = useState<Array<{id: string; name: string}>>([]);
  const [newCamper, setNewCamper] = useState({
    name: '',
    bunk_id: '',
    access_code: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCampers();
  }, [campers, searchTerm, bunkFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load bunks
      const { data: bunksData, error: bunksError } = await supabase
        .from('bunks')
        .select('id, display_name');
      
      if (bunksError) throw bunksError;
      
      const bunksList = bunksData?.map(bunk => ({
        id: bunk.id,
        name: bunk.display_name
      })) || [];
      setBunks(bunksList);

      // Load campers
      const { data: campersData, error: campersError } = await supabase
        .from('campers')
        .select('id, name, access_code, bunk_id');
      
      if (campersError) throw campersError;
      
      const campersWithBunks = campersData?.map(camper => ({
        ...camper,
        bunkName: bunksList.find(b => b.id === camper.bunk_id)?.name || 'Unknown'
      })) || [];
      
      setCampers(campersWithBunks);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
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
        camper.access_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (bunkFilter !== 'all') {
      filtered = filtered.filter(camper => camper.bunk_id === bunkFilter);
    }

    setFilteredCampers(filtered);
  };

  const generateAccessCode = (name: string, bunkId: string) => {
    const initials = name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    const bunkLetter = bunkId.split('-').pop()?.toUpperCase() || 'A';
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `${initials}-${bunkLetter.charAt(0)}-${randomNum}`;
  };

  const handleAddCamper = async () => {
    if (!newCamper.name || !newCamper.bunk_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const accessCode = newCamper.access_code || generateAccessCode(newCamper.name, newCamper.bunk_id);
      const camperId = newCamper.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

      const { error } = await supabase
        .from('campers')
        .insert({
          id: camperId,
          name: newCamper.name,
          access_code: accessCode,
          bunk_id: newCamper.bunk_id
        });

      if (error) throw error;

      await loadData(); // Reload to get updated data
      
      setNewCamper({ name: '', bunk_id: '', access_code: '' });
      setShowAddDialog(false);
      
      const bunkName = bunks.find(b => b.id === newCamper.bunk_id)?.name;
      toast({
        title: "Camper Added",
        description: `${newCamper.name} has been added to ${bunkName}.`,
      });
    } catch (error) {
      console.error('Error adding camper:', error);
      toast({
        title: "Error",
        description: "Failed to add camper",
        variant: "destructive"
      });
    }
  };

  const handleEditCamper = async () => {
    if (!selectedCamper || !selectedCamper.name || !selectedCamper.bunk_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('campers')
        .update({
          name: selectedCamper.name,
          access_code: selectedCamper.access_code,
          bunk_id: selectedCamper.bunk_id
        })
        .eq('id', selectedCamper.id);

      if (error) throw error;

      await loadData(); // Reload to get updated data
      
      setSelectedCamper(null);
      setShowEditDialog(false);
      
      toast({
        title: "Camper Updated",
        description: `${selectedCamper.name}'s information has been updated.`,
      });
    } catch (error) {
      console.error('Error updating camper:', error);
      toast({
        title: "Error",
        description: "Failed to update camper",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCamper = async (camperId: string) => {
    const camper = campers.find(c => c.id === camperId);
    if (!camper) return;

    try {
      const { error } = await supabase
        .from('campers')
        .delete()
        .eq('id', camperId);

      if (error) throw error;

      await loadData(); // Reload to get updated data
      
      toast({
        title: "Camper Removed",
        description: `${camper.name} has been removed from the system.`,
      });
    } catch (error) {
      console.error('Error deleting camper:', error);
      toast({
        title: "Error",
        description: "Failed to delete camper",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                  <Select value={newCamper.bunk_id} onValueChange={(value) => setNewCamper(prev => ({ ...prev, bunk_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bunk" />
                    </SelectTrigger>
                    <SelectContent>
                      {bunks.map(bunk => (
                        <SelectItem key={bunk.id} value={bunk.id}>{bunk.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="code">Access Code (Optional)</Label>
                  <Input
                    id="code"
                    value={newCamper.access_code}
                    onChange={(e) => setNewCamper(prev => ({ ...prev, access_code: e.target.value }))}
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
              {bunks.map(bunk => (
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
                  <p className="text-sm text-gray-500">Code: {camper.access_code}</p>
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
                <Label htmlFor="edit-code">Access Code</Label>
                <Input
                  id="edit-code"
                  value={selectedCamper.access_code}
                  onChange={(e) => setSelectedCamper(prev => prev ? { ...prev, access_code: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-bunk">Bunk</Label>
                <Select value={selectedCamper.bunk_id} onValueChange={(value) => setSelectedCamper(prev => prev ? { ...prev, bunk_id: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bunks.map(bunk => (
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