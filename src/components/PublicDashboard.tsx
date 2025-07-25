
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Calendar, TrendingUp, Crown, Medal, Award } from 'lucide-react';
import { getCurrentHebrewDate } from '@/utils/hebrewDate';
import { supabaseService } from '@/services/supabaseService';

interface BunkStats {
  id: string;
  name: string;
  totalCampers: number;
  qualifiedCampers: number;
  totalCompletions: number;
  averageProgress: number;
  rank: number;
}

interface CamperStats {
  id: string;
  name: string;
  bunk: string;
  totalMissions: number;
  qualifiedDays: number;
}

const PublicDashboard = () => {
  const [bunkStats, setBunkStats] = useState<BunkStats[]>([]);
  const [topCampers, setTopCampers] = useState<CamperStats[]>([]);
  const [showHebrewDate, setShowHebrewDate] = useState(false);
  const hebrewDate = getCurrentHebrewDate();

  const calculateBunkStats = async (): Promise<BunkStats[]> => {
    try {
      const [bunks, camperProfiles, settings, allSubmissions] = await Promise.all([
        supabaseService.getBunks(),
        supabaseService.getAllCamperProfiles(),
        supabaseService.getSystemSettings(),
        supabaseService.getAllSubmissions()
      ]);
      
      const stats = await Promise.all(bunks.map(async (bunk) => {
        const bunkCampers = camperProfiles.filter(c => c.bunkId === bunk.id);
        let totalCompletions = 0;
        let qualifiedCampers = 0;
        let totalProgress = 0;

        await Promise.all(bunkCampers.map(async (camper) => {
          const todaySubmission = await supabaseService.getCamperTodaySubmission(camper.id);
          const missionCount = todaySubmission ? todaySubmission.missions.length : 0;
          
          totalCompletions += missionCount;
          totalProgress += (missionCount / 6) * 100; // Assuming 6 total missions
          
          if (missionCount >= settings.dailyRequired) {
            qualifiedCampers++;
          }
        }));

        return {
          id: bunk.id,
          name: bunk.displayName,
          totalCampers: bunkCampers.length,
          qualifiedCampers,
          totalCompletions,
          averageProgress: bunkCampers.length > 0 ? Math.round(totalProgress / bunkCampers.length) : 0,
          rank: 0
        };
      }));

      stats.sort((a, b) => b.averageProgress - a.averageProgress);
      stats.forEach((stat, index) => {
        stat.rank = index + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error calculating bunk stats:', error);
      return [];
    }
  };

  const calculateTopCampers = async (): Promise<CamperStats[]> => {
    try {
      const [camperProfiles, allSubmissions, settings] = await Promise.all([
        supabaseService.getAllCamperProfiles(),
        supabaseService.getAllSubmissions(),
        supabaseService.getSystemSettings()
      ]);
      
      const topCampers = await Promise.all(camperProfiles.map(async (camper) => {
        const todaySubmission = await supabaseService.getCamperTodaySubmission(camper.id);
        const camperSubmissions = allSubmissions.filter(s => s.camperId === camper.id);
        const qualifiedDays = camperSubmissions.filter(s => s.missions.length >= settings.dailyRequired).length;
        
        return {
          id: camper.id,
          name: camper.name,
          bunk: camper.bunkName,
          totalMissions: todaySubmission ? todaySubmission.missions.length : 0,
          qualifiedDays
        };
      }));
      
      return topCampers
        .sort((a, b) => {
          if (b.totalMissions !== a.totalMissions) {
            return b.totalMissions - a.totalMissions;
          }
          return b.qualifiedDays - a.qualifiedDays;
        })
        .slice(0, 10);
    } catch (error) {
      console.error('Error calculating top campers:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const [bunkData, camperData] = await Promise.all([
        calculateBunkStats(),
        calculateTopCampers()
      ]);
      setBunkStats(bunkData);
      setTopCampers(camperData);
    };
    
    loadData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-white';
      case 2: return 'bg-gray-400 text-white';
      case 3: return 'bg-amber-600 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getCamperRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <Trophy className="h-4 w-4 text-blue-500" />;
    }
  };

  const totalCampers = bunkStats.reduce((sum, bunk) => sum + bunk.totalCampers, 0);
  const totalQualified = bunkStats.reduce((sum, bunk) => sum + bunk.qualifiedCampers, 0);
  const totalCompletions = bunkStats.reduce((sum, bunk) => sum + bunk.totalCompletions, 0);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">🏕️ Camp Gan Yisroel Florida Dashboard</CardTitle>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHebrewDate(!showHebrewDate)}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              <Calendar className="h-4 w-4 mr-2" />
              {showHebrewDate ? 'Show English' : 'Show Hebrew'}
            </Button>
          </div>
          <p className="text-xl mt-2">
            {showHebrewDate ? hebrewDate.hebrew : hebrewDate.english}
          </p>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-blue-600 mb-2" />
            <div className="text-3xl font-bold text-gray-900">{totalCampers}</div>
            <p className="text-gray-600">Total Campers</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 mx-auto text-green-600 mb-2" />
            <div className="text-3xl font-bold text-gray-900">{totalQualified}</div>
            <p className="text-gray-600">Qualified Today</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-purple-600 mb-2" />
            <div className="text-3xl font-bold text-gray-900">{totalCompletions}</div>
            <p className="text-gray-600">Total Completions</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-900">
              {totalCampers > 0 ? Math.round((totalQualified / totalCampers) * 100) : 0}%
            </div>
            <p className="text-gray-600">Camp Qualification</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <span>Top 10 Campers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCampers.map((camper, index) => (
                <div
                  key={camper.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border"
                >
                  <div className="flex items-center space-x-3">
                    {getCamperRankIcon(index + 1)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{camper.name}</h3>
                      <p className="text-sm text-gray-600">Bunk {camper.bunk}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">{camper.totalMissions}</div>
                    <p className="text-xs text-gray-600">missions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span>Bunk Rankings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bunkStats.map((bunk) => (
                <div
                  key={bunk.id}
                  className="flex items-center justify-between p-4 rounded-lg border-2 hover:shadow-md transition-all"
                  style={{
                    borderColor: bunk.rank === 1 ? '#fbbf24' : bunk.rank === 2 ? '#9ca3af' : bunk.rank === 3 ? '#d97706' : '#3b82f6'
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <Badge className={`text-lg px-3 py-1 ${getRankColor(bunk.rank)}`}>
                      {getRankEmoji(bunk.rank)}
                    </Badge>
                    <div>
                      <h3 className="text-xl font-bold">Bunk {bunk.name}</h3>
                      <p className="text-gray-600">{bunk.totalCampers} campers</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{bunk.qualifiedCampers}</div>
                      <p className="text-sm text-gray-600">Qualified</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{bunk.totalCompletions}</div>
                      <p className="text-sm text-gray-600">Total Done</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{bunk.averageProgress}%</div>
                      <p className="text-sm text-gray-600">Average</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicDashboard;
