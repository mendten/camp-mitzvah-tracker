import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Edit3, Save, X, Award, Target, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CamperStats {
  id: string;
  name: string;
  bunkName: string;
  totalMissions: number;
  qualifiedDays: number;
  currentStreak: number;
  totalSubmissions: number;
  totalPoints: number;
}

const AdminEditingEnhancements = () => {
  const [camperStats, setCamperStats] = useState<CamperStats[]>([]);
  const [editingCamper, setEditingCamper] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ totalMissions: number; qualifiedDays: number; totalPoints: number }>({ totalMissions: 0, qualifiedDays: 0, totalPoints: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCamperStats();
  }, []);

  const loadCamperStats = async () => {
    try {
      setLoading(true);
      
      // Get all campers with their bunks
      const { data: camperProfiles, error: campersError } = await supabase
        .from('campers')
        .select(`
          id,
          name,
          bunks!inner(display_name)
        `);

      if (campersError) throw campersError;

      // Get current session
      const { data: sessionConfig, error: sessionError } = await supabase
        .from('session_config')
        .select('current_session')
        .limit(1)
        .single();

      if (sessionError) throw sessionError;

      // Get existing manual stats from camper_session_stats
      const { data: manualStats, error: manualStatsError } = await supabase
        .from('camper_session_stats')
        .select('*');

      if (manualStatsError) throw manualStatsError;

      // Get all submissions to calculate stats
      const { data: allSubmissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('*');

      if (submissionsError) throw submissionsError;

      // Get system settings
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .single();

      if (settingsError) throw settingsError;

      // Get weekly points for current session
      const { data: weeklyPoints, error: pointsError } = await supabase
        .from('camper_weekly_points')
        .select('*')
        .eq('session_number', sessionConfig.current_session);

      if (pointsError) throw pointsError;

      // Calculate stats for each camper
      const statsData: CamperStats[] = camperProfiles.map(camper => {
        const camperSubmissions = allSubmissions?.filter(s => s.camper_id === camper.id) || [];
        
        const totalSubmissions = camperSubmissions.length;
        
        // Check if we have manual stats for this camper
        const manualStat = manualStats?.find(stat => 
          stat.camper_id === camper.id && 
          (!stat.session_id || stat.session_id === sessionConfig.current_session.toString())
        );
        
        // Use manual values if they exist, otherwise calculate from submissions
        const calculatedTotalMissions = camperSubmissions.reduce((sum, s) => sum + s.missions.length, 0);
        const calculatedQualifiedDays = camperSubmissions.filter(s => 
          s.missions.length >= settings.daily_required_missions
        ).length;
        
        const totalMissions = manualStat?.total_missions ?? calculatedTotalMissions;
        const qualifiedDays = manualStat?.total_qualified_days ?? calculatedQualifiedDays;
        
        // Calculate total points from weekly points table
        const camperPoints = weeklyPoints?.filter(p => p.camper_id === camper.id) || [];
        const totalPoints = camperPoints.reduce((sum, p) => sum + (p.total_points || 0), 0);
        
        // Calculate current streak (always from submissions)
        const sortedSubmissions = [...camperSubmissions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        let currentStreak = 0;
        for (const submission of sortedSubmissions) {
          if (submission.missions.length >= settings.daily_required_missions) {
            currentStreak++;
          } else {
            break;
          }
        }

        return {
          id: camper.id,
          name: camper.name,
          bunkName: camper.bunks?.display_name || 'Unknown',
          totalMissions,
          qualifiedDays,
          currentStreak,
          totalSubmissions,
          totalPoints
        };
      });

      // Sort by total missions descending
      statsData.sort((a, b) => b.totalMissions - a.totalMissions);
      setCamperStats(statsData);
    } catch (error) {
      console.error('Error loading camper stats:', error);
      toast({
        title: "Error",
        description: "Failed to load camper statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (camper: CamperStats) => {
    setEditingCamper(camper.id);
    setEditValues({
      totalMissions: camper.totalMissions,
      qualifiedDays: camper.qualifiedDays,
      totalPoints: camper.totalPoints
    });
  };

  const cancelEditing = () => {
    setEditingCamper(null);
    setEditValues({ totalMissions: 0, qualifiedDays: 0, totalPoints: 0 });
  };

  const saveEdits = async (camperId: string) => {
    try {
      // Get current session
      const { data: sessionConfig, error: sessionError } = await supabase
        .from('session_config')
        .select('current_session')
        .limit(1)
        .single();

      if (sessionError) throw sessionError;

      // Check if a record already exists for this camper
      const { data: existingRecord, error: checkError } = await supabase
        .from('camper_session_stats')
        .select('id')
        .eq('camper_id', camperId)
        .maybeSingle();

      if (checkError) throw checkError;

      const updateData = {
        camper_id: camperId,
        total_missions: editValues.totalMissions,
        total_qualified_days: editValues.qualifiedDays,
        session_id: sessionConfig.current_session.toString()
      };

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('camper_session_stats')
          .update(updateData)
          .eq('id', existingRecord.id);

        if (updateError) throw updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('camper_session_stats')
          .insert(updateData);

        if (insertError) throw insertError;
      }

      // Save points to weekly points table for current session and week
      const { data: sessionData, error: sessionCheckError } = await supabase
        .from('session_config')
        .select('current_session, current_week')
        .limit(1)
        .single();

      if (sessionCheckError) throw sessionCheckError;

      // Update or insert weekly points
      const { data: existingPoints, error: pointsCheckError } = await supabase
        .from('camper_weekly_points')
        .select('id')
        .eq('camper_id', camperId)
        .eq('session_number', sessionData.current_session)
        .eq('week_number', sessionData.current_week)
        .maybeSingle();

      if (pointsCheckError) throw pointsCheckError;

      const pointsData = {
        camper_id: camperId,
        session_number: sessionData.current_session,
        week_number: sessionData.current_week,
        total_points: editValues.totalPoints,
        missions_completed: editValues.totalMissions
      };

      if (existingPoints) {
        const { error: updatePointsError } = await supabase
          .from('camper_weekly_points')
          .update(pointsData)
          .eq('id', existingPoints.id);

        if (updatePointsError) throw updatePointsError;
      } else {
        const { error: insertPointsError } = await supabase
          .from('camper_weekly_points')
          .insert(pointsData);

        if (insertPointsError) throw insertPointsError;
      }

      // Update local state
      setCamperStats(prev => prev.map(camper => 
        camper.id === camperId 
          ? { ...camper, totalMissions: editValues.totalMissions, qualifiedDays: editValues.qualifiedDays, totalPoints: editValues.totalPoints }
          : camper
      ));

      toast({
        title: "Success",
        description: "Camper statistics updated successfully",
        variant: "default"
      });
      
      setEditingCamper(null);
    } catch (error) {
      console.error('Error saving edits:', error);
      toast({
        title: "Error",
        description: "Failed to save edits",
        variant: "destructive"
      });
    }
  };

  const exportToCsv = async () => {
    try {
      const { exportCamperData } = await import('@/utils/dataExport');
      exportCamperData();
      
      toast({
        title: "Export Complete",
        description: "Camper statistics exported successfully"
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export camper statistics",
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
    <div className="space-y-6">
      {/* Header with export */}
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <span>Camper Statistics & Management</span>
            </div>
            <Button onClick={exportToCsv} variant="outline">
              Export CSV
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Stats Table */}
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Camper</th>
                  <th className="text-left p-4 font-semibold">Bunk</th>
                  <th className="text-center p-4 font-semibold">Total Missions</th>
                  <th className="text-center p-4 font-semibold">Qualified Days</th>
                  <th className="text-center p-4 font-semibold">Total Points</th>
                  <th className="text-center p-4 font-semibold">Current Streak</th>
                  <th className="text-center p-4 font-semibold">Total Submissions</th>
                  <th className="text-center p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {camperStats.map((camper, index) => (
                  <tr key={camper.id} className={`border-b hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {index < 3 && <Award className="h-4 w-4 text-yellow-600" />}
                        <span className="font-medium">{camper.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{camper.bunkName}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      {editingCamper === camper.id ? (
                        <Input
                          type="number"
                          value={editValues.totalMissions}
                          onChange={(e) => setEditValues(prev => ({ ...prev, totalMissions: parseInt(e.target.value) || 0 }))}
                          className="w-20 text-center"
                        />
                      ) : (
                        <span className="text-lg font-bold text-blue-600">{camper.totalMissions}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {editingCamper === camper.id ? (
                        <Input
                          type="number"
                          value={editValues.qualifiedDays}
                          onChange={(e) => setEditValues(prev => ({ ...prev, qualifiedDays: parseInt(e.target.value) || 0 }))}
                          className="w-20 text-center"
                        />
                      ) : (
                        <span className="text-lg font-bold text-green-600">{camper.qualifiedDays}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {editingCamper === camper.id ? (
                        <Input
                          type="number"
                          value={editValues.totalPoints}
                          onChange={(e) => setEditValues(prev => ({ ...prev, totalPoints: parseInt(e.target.value) || 0 }))}
                          className="w-20 text-center"
                        />
                      ) : (
                        <span className="text-lg font-bold text-orange-600">{camper.totalPoints}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-lg font-bold text-purple-600">{camper.currentStreak}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-lg font-bold text-gray-600">{camper.totalSubmissions}</span>
                    </td>
                    <td className="p-4 text-center">
                      {editingCamper === camper.id ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Button size="sm" onClick={() => saveEdits(camper.id)}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => startEditing(camper)}>
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEditingEnhancements;