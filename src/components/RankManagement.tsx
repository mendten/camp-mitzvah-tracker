import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Award, Plus, Edit, Trash2, Trophy, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RankThreshold {
  id: string;
  rank_name: string;
  missions_required: number;
  qualified_days_required: number;
  rank_order: number;
  is_active: boolean;
}

const RankManagement = () => {
  const [ranks, setRanks] = useState<RankThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRank, setEditingRank] = useState<RankThreshold | null>(null);
  const [newRank, setNewRank] = useState({
    rank_name: '',
    missions_required: 0,
    qualified_days_required: 0,
    rank_order: 0
  });
  const [showNewRankForm, setShowNewRankForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRanks();
  }, []);

  const loadRanks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rank_thresholds')
        .select('*')
        .order('rank_order');

      if (error) throw error;
      setRanks(data || []);
    } catch (error) {
      console.error('Error loading ranks:', error);
      toast({
        title: "Error",
        description: "Failed to load rank thresholds",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRank = async () => {
    if (!newRank.rank_name || newRank.missions_required <= 0 || newRank.qualified_days_required <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all fields with valid values",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('rank_thresholds')
        .insert(newRank)
        .select()
        .single();

      if (error) throw error;

      setRanks([...ranks, data]);
      setNewRank({
        rank_name: '',
        missions_required: 0,
        qualified_days_required: 0,
        rank_order: 0
      });
      setShowNewRankForm(false);
      
      toast({
        title: "Success",
        description: "Rank threshold created successfully",
      });
    } catch (error) {
      console.error('Error creating rank:', error);
      toast({
        title: "Error",
        description: "Failed to create rank threshold",
        variant: "destructive"
      });
    }
  };

  const updateRank = async () => {
    if (!editingRank) return;

    try {
      const { data, error } = await supabase
        .from('rank_thresholds')
        .update({
          rank_name: editingRank.rank_name,
          missions_required: editingRank.missions_required,
          qualified_days_required: editingRank.qualified_days_required,
          rank_order: editingRank.rank_order,
          is_active: editingRank.is_active
        })
        .eq('id', editingRank.id)
        .select()
        .single();

      if (error) throw error;

      setRanks(ranks.map(r => r.id === editingRank.id ? data : r));
      setEditingRank(null);
      
      toast({
        title: "Success",
        description: "Rank threshold updated successfully",
      });
    } catch (error) {
      console.error('Error updating rank:', error);
      toast({
        title: "Error",
        description: "Failed to update rank threshold",
        variant: "destructive"
      });
    }
  };

  const deleteRank = async (rankId: string) => {
    try {
      const { error } = await supabase
        .from('rank_thresholds')
        .delete()
        .eq('id', rankId);

      if (error) throw error;

      setRanks(ranks.filter(r => r.id !== rankId));
      
      toast({
        title: "Success",
        description: "Rank threshold deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting rank:', error);
      toast({
        title: "Error",
        description: "Failed to delete rank threshold",
        variant: "destructive"
      });
    }
  };

  const getRankColor = (rankName: string) => {
    switch (rankName.toLowerCase()) {
      case 'platinum':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'gold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'silver':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'bronze':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-16 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="h-6 w-6 text-blue-600" />
              <span>Rank Management</span>
            </div>
            <Button 
              onClick={() => setShowNewRankForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Rank
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Ranks */}
          <div className="space-y-3">
            {ranks.sort((a, b) => a.rank_order - b.rank_order).map(rank => (
              <div 
                key={rank.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-white/50"
              >
                <div className="flex items-center space-x-4">
                  <Badge className={`${getRankColor(rank.rank_name)} px-3 py-1 text-sm font-medium`}>
                    {rank.rank_name}
                  </Badge>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      <span>{rank.missions_required} missions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-green-600" />
                      <span>{rank.qualified_days_required} qualified days</span>
                    </div>
                    <div className="text-gray-500">
                      Order: {rank.rank_order}
                    </div>
                    {!rank.is_active && (
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingRank(rank)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Rank</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the {rank.rank_name} rank? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteRank(rank.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            
            {ranks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No rank thresholds defined yet. Add your first rank to get started.
              </div>
            )}
          </div>

          {/* Create New Rank Form */}
          {showNewRankForm && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Create New Rank</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="newRankName">Rank Name</Label>
                    <Input
                      id="newRankName"
                      value={newRank.rank_name}
                      onChange={(e) => setNewRank({...newRank, rank_name: e.target.value})}
                      placeholder="e.g., Diamond"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newRankOrder">Rank Order</Label>
                    <Input
                      id="newRankOrder"
                      type="number"
                      value={newRank.rank_order}
                      onChange={(e) => setNewRank({...newRank, rank_order: parseInt(e.target.value) || 0})}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newMissionsRequired">Missions Required</Label>
                    <Input
                      id="newMissionsRequired"
                      type="number"
                      value={newRank.missions_required}
                      onChange={(e) => setNewRank({...newRank, missions_required: parseInt(e.target.value) || 0})}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newQualifiedDays">Qualified Days Required</Label>
                    <Input
                      id="newQualifiedDays"
                      type="number"
                      value={newRank.qualified_days_required}
                      onChange={(e) => setNewRank({...newRank, qualified_days_required: parseInt(e.target.value) || 0})}
                      placeholder="50"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createRank}>Create Rank</Button>
                  <Button variant="outline" onClick={() => setShowNewRankForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Rank Form */}
          {editingRank && (
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg">Edit {editingRank.rank_name} Rank</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editRankName">Rank Name</Label>
                    <Input
                      id="editRankName"
                      value={editingRank.rank_name}
                      onChange={(e) => setEditingRank({...editingRank, rank_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editRankOrder">Rank Order</Label>
                    <Input
                      id="editRankOrder"
                      type="number"
                      value={editingRank.rank_order}
                      onChange={(e) => setEditingRank({...editingRank, rank_order: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMissionsRequired">Missions Required</Label>
                    <Input
                      id="editMissionsRequired"
                      type="number"
                      value={editingRank.missions_required}
                      onChange={(e) => setEditingRank({...editingRank, missions_required: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editQualifiedDays">Qualified Days Required</Label>
                    <Input
                      id="editQualifiedDays"
                      type="number"
                      value={editingRank.qualified_days_required}
                      onChange={(e) => setEditingRank({...editingRank, qualified_days_required: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingRank.is_active}
                      onChange={(e) => setEditingRank({...editingRank, is_active: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={updateRank}>Update Rank</Button>
                  <Button variant="outline" onClick={() => setEditingRank(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RankManagement;