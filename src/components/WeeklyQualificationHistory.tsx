import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, TrendingUp, Users } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';

interface CamperWeeklyData {
  id: string;
  name: string;
  bunkName: string;
  qualifiedDays: number;
  totalDays: number;
  submissions: Array<{
    date: string;
    missionsCount: number;
    qualified: boolean;
  }>;
}

const WeeklyQualificationHistory = () => {
  const [campersData, setCampersData] = useState<CamperWeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyRequired, setDailyRequired] = useState(5);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = async () => {
    try {
      setLoading(true);
      
      // Get system settings
      const settings = await supabaseService.getSystemSettings();
      setDailyRequired(settings.dailyRequired);
      
      // Get all camper profiles
      const camperProfiles = await supabaseService.getAllCamperProfiles();
      
      // Get last 7 days of submissions
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const allSubmissions = await supabaseService.getAllSubmissions();
      const recentSubmissions = allSubmissions.filter(s => 
        new Date(s.date) >= sevenDaysAgo
      );
      
      // Build weekly data for each camper
      const weeklyData: CamperWeeklyData[] = await Promise.all(
        camperProfiles.map(async (camper) => {
          const camperSubmissions = recentSubmissions.filter(s => s.camperId === camper.id);
          
          // Group by date and check qualification
          const dailyData: { [date: string]: { missionsCount: number; qualified: boolean } } = {};
          
          camperSubmissions.forEach(submission => {
            const dateKey = submission.date;
            if (!dailyData[dateKey] || dailyData[dateKey].missionsCount < submission.missions.length) {
              dailyData[dateKey] = {
                missionsCount: submission.missions.length,
                qualified: submission.missions.length >= settings.dailyRequired
              };
            }
          });
          
          const submissions = Object.entries(dailyData).map(([date, data]) => ({
            date,
            missionsCount: data.missionsCount,
            qualified: data.qualified
          }));
          
          const qualifiedDays = submissions.filter(s => s.qualified).length;
          
          return {
            id: camper.id,
            name: camper.name,
            bunkName: camper.bunkName,
            qualifiedDays,
            totalDays: submissions.length,
            submissions
          };
        })
      );
      
      // Sort by qualified days (descending) then by name
      weeklyData.sort((a, b) => {
        if (b.qualifiedDays !== a.qualifiedDays) {
          return b.qualifiedDays - a.qualifiedDays;
        }
        return a.name.localeCompare(b.name);
      });
      
      setCampersData(weeklyData);
    } catch (error) {
      console.error('Error loading weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQualificationColor = (qualifiedDays: number, totalDays: number) => {
    if (totalDays === 0) return 'bg-gray-100 text-gray-600';
    const percentage = (qualifiedDays / Math.max(totalDays, 7)) * 100;
    
    if (percentage >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (percentage >= 60) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getTotalStats = () => {
    const totalCampers = campersData.length;
    const totalQualifiedDays = campersData.reduce((sum, camper) => sum + camper.qualifiedDays, 0);
    const totalPossibleDays = campersData.reduce((sum, camper) => sum + Math.max(camper.totalDays, 7), 0);
    const avgQualificationRate = totalPossibleDays > 0 ? (totalQualifiedDays / totalPossibleDays) * 100 : 0;
    
    return { totalCampers, totalQualifiedDays, avgQualificationRate };
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

  const stats = getTotalStats();

  return (
    <div className="space-y-6">
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
            <TrendingUp className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{Math.round(stats.avgQualificationRate)}%</div>
            <p className="text-sm text-gray-600">Avg Qualification Rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{dailyRequired}</div>
            <p className="text-sm text-gray-600">Missions Required</p>
          </CardContent>
        </Card>
      </div>

      {/* Camper History Cards */}
      <div className="grid gap-4">
        {campersData.map((camper) => (
          <Card 
            key={camper.id} 
            className={`border-2 backdrop-blur shadow-lg ${getQualificationColor(camper.qualifiedDays, camper.totalDays)}`}
          >
            <CardContent className="p-6">
              <div className="grid md:grid-cols-6 gap-4 items-center">
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold">{camper.name}</h3>
                  <Badge variant="outline" className="mt-1">Bunk {camper.bunkName}</Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{camper.qualifiedDays}</div>
                  <p className="text-sm text-gray-600">Qualified Days</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{camper.totalDays}</div>
                  <p className="text-sm text-gray-600">Active Days</p>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {camper.totalDays > 0 ? Math.round((camper.qualifiedDays / camper.totalDays) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {camper.qualifiedDays}/7
                  </div>
                  <p className="text-sm text-gray-600">Weekly Goal</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((camper.qualifiedDays / 7) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Daily Breakdown */}
              {camper.submissions.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Activity:</h4>
                  <div className="flex flex-wrap gap-2">
                    {camper.submissions.map((submission, idx) => (
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
    </div>
  );
};

export default WeeklyQualificationHistory;