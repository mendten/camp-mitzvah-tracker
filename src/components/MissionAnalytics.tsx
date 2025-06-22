
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Star, Target } from 'lucide-react';
import { DEFAULT_MISSIONS, CAMP_DATA } from '@/data/campData';

const MissionAnalytics = () => {
  const getMissionStats = () => {
    const totalCampers = CAMP_DATA.reduce((sum, bunk) => sum + bunk.campers.length, 0);
    
    return DEFAULT_MISSIONS.map(mission => {
      let completionCount = 0;
      
      CAMP_DATA.forEach(bunk => {
        bunk.campers.forEach(camper => {
          const approved = JSON.parse(localStorage.getItem(`camper_${camper.id}_approved`) || '[]');
          if (approved.includes(mission.id)) {
            completionCount++;
          }
        });
      });
      
      const completionRate = Math.round((completionCount / totalCampers) * 100);
      
      return {
        ...mission,
        completionCount,
        totalCampers,
        completionRate
      };
    }).sort((a, b) => b.completionCount - a.completionCount);
  };

  const missionStats = getMissionStats();
  const mostPopular = missionStats[0];
  const leastPopular = missionStats[missionStats.length - 1];
  const averageCompletion = Math.round(
    missionStats.reduce((sum, mission) => sum + mission.completionRate, 0) / missionStats.length
  );

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Most Popular</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{mostPopular?.completionCount || 0}</div>
              <div className="text-sm font-medium">{mostPopular?.title}</div>
              <div className="text-xs text-gray-600">
                {mostPopular?.completionRate}% completion rate
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Average Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{averageCompletion}%</div>
              <div className="text-sm font-medium">Across all missions</div>
              <div className="text-xs text-gray-600">
                {missionStats.filter(m => m.isActive).length} active missions
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-orange-600" />
              <span>Needs Attention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{leastPopular?.completionCount || 0}</div>
              <div className="text-sm font-medium">{leastPopular?.title}</div>
              <div className="text-xs text-gray-600">
                {leastPopular?.completionRate}% completion rate
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mission Completion Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {missionStats.map(mission => (
              <div key={mission.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="text-2xl">{mission.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold">{mission.title}</h3>
                    <Badge variant={mission.isMandatory ? "destructive" : "secondary"}>
                      {mission.isMandatory ? 'Mandatory' : 'Optional'}
                    </Badge>
                    <Badge variant={mission.isActive ? "default" : "outline"}>
                      {mission.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion: {mission.completionCount}/{mission.totalCampers}</span>
                      <span className="font-semibold">{mission.completionRate}%</span>
                    </div>
                    <Progress value={mission.completionRate} className="h-2" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {mission.completionCount}
                  </div>
                  <div className="text-xs text-gray-600">completions</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mission Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {['daily', 'weekly', 'special', 'bonus'].map(type => {
              const typeMissions = missionStats.filter(m => m.type === type);
              const avgCompletion = typeMissions.length ? 
                Math.round(typeMissions.reduce((sum, m) => sum + m.completionRate, 0) / typeMissions.length) : 0;
              
              return (
                <div key={type} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold capitalize">{type} Missions</h3>
                    <Badge variant="outline">{typeMissions.length} missions</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Completion</span>
                      <span className="font-semibold">{avgCompletion}%</span>
                    </div>
                    <Progress value={avgCompletion} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MissionAnalytics;
