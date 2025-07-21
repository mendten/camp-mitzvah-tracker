import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, AlertCircle, Clock, Users, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CamperStatus {
  id: string;
  name: string;
  bunkName: string;
  status: 'submitted' | 'not_submitted' | 'qualified';
  submissionTime?: string;
  missionsCount: number;
}

const DailyNonSubmissionTracking = () => {
  const [todaysCampers, setTodaysCampers] = useState<CamperStatus[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dailyRequired, setDailyRequired] = useState(5);

  useEffect(() => {
    loadTodaysData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const loadTodaysData = async () => {
    try {
      setLoading(true);
      
      // Get system settings
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .single();

      if (settingsError) throw settingsError;
      setDailyRequired(settings.daily_required_missions);

      // Get all camper profiles
      const { data: camperProfiles, error: campersError } = await supabase
        .from('campers')
        .select(`
          id,
          name,
          bunks!inner(display_name)
        `);

      if (campersError) throw campersError;

      // Get today's submissions
      const today = new Date().toISOString().split('T')[0];
      const { data: todaysSubmissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('date', today);

      if (submissionsError) throw submissionsError;

      // Build status for each camper
      const camperStatuses: CamperStatus[] = camperProfiles.map(camper => {
        const submission = todaysSubmissions?.find(s => s.camper_id === camper.id);
        
        let status: 'submitted' | 'not_submitted' | 'qualified' = 'not_submitted';
        let missionsCount = 0;
        let submissionTime: string | undefined;

        if (submission) {
          missionsCount = submission.missions.length;
          submissionTime = new Date(submission.submitted_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          });
          
          if (missionsCount >= settings.daily_required_missions) {
            status = 'qualified';
          } else {
            status = 'submitted';
          }
        }

        return {
          id: camper.id,
          name: camper.name,
          bunkName: camper.bunks?.display_name || 'Unknown',
          status,
          submissionTime,
          missionsCount
        };
      });

      // Sort by status (not submitted first, then by name)
      camperStatuses.sort((a, b) => {
        if (a.status === 'not_submitted' && b.status !== 'not_submitted') return -1;
        if (a.status !== 'not_submitted' && b.status === 'not_submitted') return 1;
        return a.name.localeCompare(b.name);
      });

      setTodaysCampers(camperStatuses);
    } catch (error) {
      console.error('Error loading today\'s data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'qualified':
        return 'bg-green-500';
      case 'submitted':
        return 'bg-yellow-500';
      case 'not_submitted':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'qualified':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'not_submitted':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTimeStatus = () => {
    const now = new Date();
    const hour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Logic: Submit missions for the PREVIOUS day by 4:00 PM
    // So Monday 4 PM is deadline for Sunday's missions, Tuesday 4 PM for Monday's missions, etc.
    
    if (currentDay >= 1 && currentDay <= 5) { // Monday to Friday
      if (hour >= 16) { // After 4:00 PM
        return { 
          status: 'deadline', 
          message: `Deadline passed (4:00 PM) - Yesterday's missions no longer accepted` 
        };
      } else if (hour >= 14) { // After 2:00 PM
        return { 
          status: 'approaching', 
          message: `Deadline approaching (4:00 PM today) for yesterday's missions` 
        };
      } else {
        return { 
          status: 'open', 
          message: `Submissions open until 4:00 PM today for yesterday's missions` 
        };
      }
    } else {
      return { 
        status: 'closed', 
        message: 'Weekend - Submit Sunday missions by Monday 4 PM' 
      };
    }
  };

  const getStats = () => {
    const qualified = todaysCampers.filter(c => c.status === 'qualified').length;
    const submitted = todaysCampers.filter(c => c.status === 'submitted').length;
    const notSubmitted = todaysCampers.filter(c => c.status === 'not_submitted').length;
    const total = todaysCampers.length;
    
    return { qualified, submitted, notSubmitted, total };
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded mb-4"></div>
              <div className="grid md:grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const timeStatus = getTimeStatus();
  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header with time status */}
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-blue-600" />
              <span>Daily Submission Tracking</span>
              <Badge variant="outline" className="ml-2">
                Submit by 4:00 PM next day
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-lg font-semibold">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg border ${
            timeStatus.status === 'deadline' ? 'bg-red-50 border-red-200' :
            timeStatus.status === 'approaching' ? 'bg-yellow-50 border-yellow-200' :
            timeStatus.status === 'open' ? 'bg-green-50 border-green-200' :
            'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              {timeStatus.status === 'deadline' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {timeStatus.status === 'approaching' && <Clock className="h-5 w-5 text-yellow-600" />}
              {timeStatus.status === 'open' && <CheckCircle className="h-5 w-5 text-green-600" />}
              {timeStatus.status === 'closed' && <XCircle className="h-5 w-5 text-gray-600" />}
              <span className={`font-medium ${
                timeStatus.status === 'deadline' ? 'text-red-800' :
                timeStatus.status === 'approaching' ? 'text-yellow-800' :
                timeStatus.status === 'open' ? 'text-green-800' :
                'text-gray-800'
              }`}>
                {timeStatus.message}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <p className="text-sm text-gray-600">Total Campers</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 border-green-200 shadow-lg">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-700">{stats.qualified}</div>
            <p className="text-sm text-green-600">Qualified ({dailyRequired}+ missions)</p>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 border-yellow-200 shadow-lg">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
            <div className="text-2xl font-bold text-yellow-700">{stats.submitted}</div>
            <p className="text-sm text-yellow-600">Submitted (Under {dailyRequired})</p>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 border-red-200 shadow-lg">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-700">{stats.notSubmitted}</div>
            <p className="text-sm text-red-600">Not Submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Camper List */}
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle>Today's Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {todaysCampers.map(camper => (
              <div 
                key={camper.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-white/50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(camper.status)}`}></div>
                  <div>
                    <div className="font-semibold">{camper.name}</div>
                    <div className="text-sm text-gray-600">Bunk {camper.bunkName}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {camper.status !== 'not_submitted' && (
                    <div className="text-right">
                      <div className="text-sm font-medium">{camper.missionsCount} missions</div>
                      {camper.submissionTime && (
                        <div className="text-xs text-gray-500">at {camper.submissionTime}</div>
                      )}
                    </div>
                  )}
                  
                  <Badge className={`${getStatusBadgeColor(camper.status)} px-3 py-1`}>
                    {camper.status === 'qualified' && 'Qualified'}
                    {camper.status === 'submitted' && 'Submitted'}
                    {camper.status === 'not_submitted' && 'Not Submitted'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyNonSubmissionTracking;