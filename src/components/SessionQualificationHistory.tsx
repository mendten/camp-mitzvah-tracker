import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Trophy, TrendingUp, Users, Award, Filter, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Session {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface CamperSessionData {
  id: string;
  name: string;
  bunkName: string;
  qualifiedDays: number;
  totalMissions: number;
  totalDays: number;
  rank: string;
  submissions: Array<{
    date: string;
    missionsCount: number;
    qualified: boolean;
  }>;
}

interface RankThreshold {
  rank_name: string;
  missions_required: number;
  qualified_days_required: number;
  rank_order: number;
}

const SessionQualificationHistory = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('current');
  const [campersData, setCampersData] = useState<CamperSessionData[]>([]);
  const [rankThresholds, setRankThresholds] = useState<RankThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyRequired, setDailyRequired] = useState(5);
  const [sortBy, setSortBy] = useState<'name' | 'qualified' | 'missions'>('qualified');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      loadSessionData();
    }
  }, [selectedSession, sortBy, customStartDate, customEndDate, sessions]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load sessions, rank thresholds, and system settings
      const [sessionsRes, ranksRes, settingsRes] = await Promise.all([
        supabase.from('sessions').select('*').order('created_at', { ascending: false }),
        supabase.from('rank_thresholds').select('*').eq('is_active', true).order('rank_order'),
        supabase.from('system_settings').select('*').limit(1).single()
      ]);

      if (sessionsRes.error) throw sessionsRes.error;
      if (ranksRes.error) throw ranksRes.error;
      if (settingsRes.error) throw settingsRes.error;

      setSessions(sessionsRes.data || []);
      setRankThresholds(ranksRes.data || []);
      setDailyRequired(settingsRes.data?.daily_required_missions || 5);

      // Set current session as default
      const activeSession = sessionsRes.data?.find(s => s.is_active);
      if (activeSession) {
        setSelectedSession(activeSession.id);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadSessionData = async () => {
    try {
      setLoading(true);
      
      let startDate: string;
      let endDate: string;

      if (selectedSession === 'current') {
        const activeSession = sessions.find(s => s.is_active);
        if (!activeSession) return;
        startDate = activeSession.start_date;
        endDate = activeSession.end_date;
      } else if (selectedSession === 'custom') {
        if (!customStartDate || !customEndDate) return;
        startDate = customStartDate;
        endDate = customEndDate;
      } else if (selectedSession === 'all') {
        // Load all data
        startDate = '2024-01-01';
        endDate = new Date().toISOString().split('T')[0];
      } else {
        const session = sessions.find(s => s.id === selectedSession);
        if (!session) return;
        startDate = session.start_date;
        endDate = session.end_date;
      }

      // Get all camper profiles
      const { data: camperProfiles, error: campersError } = await supabase
        .from('campers')
        .select(`
          id,
          name,
          bunks!inner(display_name)
        `);

      if (campersError) throw campersError;

      // Get submissions for the date range
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (submissionsError) throw submissionsError;

      // Build session data for each camper
      const sessionData: CamperSessionData[] = camperProfiles.map(camper => {
        const camperSubmissions = submissions?.filter(s => s.camper_id === camper.id) || [];
        
        // Group by date and check qualification
        const dailyData: { [date: string]: { missionsCount: number; qualified: boolean } } = {};
        
        camperSubmissions.forEach(submission => {
          const dateKey = submission.date;
          if (!dailyData[dateKey] || dailyData[dateKey].missionsCount < submission.missions.length) {
            dailyData[dateKey] = {
              missionsCount: submission.missions.length,
              qualified: submission.missions.length >= dailyRequired
            };
          }
        });
        
        const submissionDetails = Object.entries(dailyData).map(([date, data]) => ({
          date,
          missionsCount: data.missionsCount,
          qualified: data.qualified
        }));
        
        const qualifiedDays = submissionDetails.filter(s => s.qualified).length;
        const totalMissions = camperSubmissions.reduce((sum, s) => sum + s.missions.length, 0);
        
        // Calculate rank
        const rank = calculateRank(totalMissions, qualifiedDays);
        
        return {
          id: camper.id,
          name: camper.name,
          bunkName: camper.bunks?.display_name || 'Unknown',
          qualifiedDays,
          totalMissions,
          totalDays: submissionDetails.length,
          rank,
          submissions: submissionDetails
        };
      });
      
      // Sort the data
      sessionData.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'qualified':
            return b.qualifiedDays - a.qualifiedDays || a.name.localeCompare(b.name);
          case 'missions':
            return b.totalMissions - a.totalMissions || a.name.localeCompare(b.name);
          default:
            return b.qualifiedDays - a.qualifiedDays;
        }
      });
      
      setCampersData(sessionData);
    } catch (error) {
      console.error('Error loading session data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRank = (totalMissions: number, qualifiedDays: number): string => {
    const achievedRanks = rankThresholds.filter(
      rank => totalMissions >= rank.missions_required && qualifiedDays >= rank.qualified_days_required
    );
    
    if (achievedRanks.length === 0) return 'Unranked';
    
    // Return the highest rank achieved
    return achievedRanks[achievedRanks.length - 1].rank_name;
  };

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'platinum': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'gold': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'silver': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'bronze': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getQualificationColor = (qualifiedDays: number, totalDays: number) => {
    if (totalDays === 0) return 'bg-gray-100 text-gray-600';
    const percentage = (qualifiedDays / totalDays) * 100;
    
    if (percentage >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (percentage >= 60) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const exportSimpleCSV = () => {
    const csvContent = [
      ['Name', 'Qualified Days', 'Total Missions'],
      ...campersData.map(camper => [
        camper.name,
        camper.qualifiedDays.toString(),
        camper.totalMissions.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-simple-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportFullCSV = () => {
    const csvContent = [
      ['Name', 'Bunk', 'Qualified Days', 'Total Missions', 'Total Days', 'Rank', 'Success Rate %'],
      ...campersData.map(camper => [
        camper.name,
        camper.bunkName,
        camper.qualifiedDays.toString(),
        camper.totalMissions.toString(),
        camper.totalDays.toString(),
        camper.rank,
        camper.totalDays > 0 ? Math.round((camper.qualifiedDays / camper.totalDays) * 100).toString() : '0'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-full-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTotalStats = () => {
    const totalCampers = campersData.length;
    const totalQualifiedDays = campersData.reduce((sum, camper) => sum + camper.qualifiedDays, 0);
    const totalMissions = campersData.reduce((sum, camper) => sum + camper.totalMissions, 0);
    const avgQualificationRate = campersData.length > 0 
      ? campersData.reduce((sum, camper) => sum + (camper.totalDays > 0 ? (camper.qualifiedDays / camper.totalDays) : 0), 0) / campersData.length * 100
      : 0;
    
    return { totalCampers, totalQualifiedDays, totalMissions, avgQualificationRate };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="grid md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-20 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Session</TabsTrigger>
          <TabsTrigger value="filtering">Filtering Options</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalCampers}</div>
                <p className="text-sm text-gray-600">Total Campers</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalQualifiedDays}</div>
                <p className="text-sm text-gray-600">Total Qualified Days</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <Award className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{stats.totalMissions}</div>
                <p className="text-sm text-gray-600">Total Missions</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{Math.round(stats.avgQualificationRate)}%</div>
                <p className="text-sm text-gray-600">Avg Success Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Export Options */}
          <div className="flex space-x-4">
            <Button onClick={exportSimpleCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Simple CSV Export
            </Button>
            <Button onClick={exportFullCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Full CSV Export
            </Button>
          </div>

          {/* Camper Cards */}
          <div className="grid gap-4">
            {campersData.map((camper) => (
              <Card 
                key={camper.id} 
                className={`border-2 backdrop-blur shadow-lg ${getQualificationColor(camper.qualifiedDays, camper.totalDays)}`}
              >
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-7 gap-4 items-center">
                    <div className="md:col-span-2">
                      <h3 className="text-xl font-bold">{camper.name}</h3>
                      <Badge variant="outline" className="mt-1">Bunk {camper.bunkName}</Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{camper.qualifiedDays}</div>
                      <p className="text-sm text-gray-600">Qualified Days</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{camper.totalMissions}</div>
                      <p className="text-sm text-gray-600">Total Missions</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{camper.totalDays}</div>
                      <p className="text-sm text-gray-600">Active Days</p>
                    </div>
                    
                    <div className="text-center">
                      <Badge className={`${getRankColor(camper.rank)} text-sm px-3 py-1`}>
                        {camper.rank}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">Rank</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {camper.totalDays > 0 ? Math.round((camper.qualifiedDays / camper.totalDays) * 100) : 0}%
                      </div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                  </div>
                  
                  {/* Daily Breakdown */}
                  {camper.submissions.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity:</h4>
                      <div className="flex flex-wrap gap-2">
                        {camper.submissions.slice(-7).map((submission, idx) => (
                          <div 
                            key={idx}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              submission.qualified 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {new Date(submission.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: {submission.missionsCount} missions
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="filtering" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-6 w-6 text-blue-600" />
                <span>Filtering & Sorting Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Session/Period</label>
                  <Select value={selectedSession} onValueChange={setSelectedSession}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Session</SelectItem>
                      <SelectItem value="all">Whole Summer</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                      {sessions.map(session => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select value={sortBy} onValueChange={(value: 'name' | 'qualified' | 'missions') => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualified">Qualified Days</SelectItem>
                      <SelectItem value="missions">Total Missions</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedSession === 'custom' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display filtered results */}
          <div className="text-center text-gray-600">
            Results displayed in the "Current Session" tab based on your filtering options.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionQualificationHistory;