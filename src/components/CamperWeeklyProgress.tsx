import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Calendar, TrendingUp } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';

interface CamperWeeklyProgressProps {
  camperId: string;
}

interface WeeklyPoint {
  totalPoints: number;
  missionsCompleted: number;
  weekNumber: number;
  sessionNumber: number;
}

const CamperWeeklyProgress: React.FC<CamperWeeklyProgressProps> = ({ camperId }) => {
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyPoint[]>([]);
  const [currentSession, setCurrentSession] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyProgress();
  }, [camperId]);

  const loadWeeklyProgress = async () => {
    setLoading(true);
    try {
      const allPoints = await supabaseService.getCamperAllWeeklyPoints(camperId);
      setWeeklyProgress(allPoints);
      
      // Get current session from session config or localStorage
      const currentSessionFromStorage = localStorage.getItem('current_session');
      if (currentSessionFromStorage) {
        setCurrentSession(parseInt(currentSessionFromStorage));
      }
    } catch (error) {
      console.error('Error loading weekly progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalPoints = () => {
    return weeklyProgress.reduce((sum, week) => sum + week.totalPoints, 0);
  };

  const getTotalMissions = () => {
    return weeklyProgress.reduce((sum, week) => sum + week.missionsCompleted, 0);
  };

  const getCurrentSessionProgress = () => {
    return weeklyProgress.filter(week => week.sessionNumber === currentSession);
  };

  const getSessionTotal = (sessionNum: number) => {
    const sessionWeeks = weeklyProgress.filter(week => week.sessionNumber === sessionNum);
    return {
      points: sessionWeeks.reduce((sum, week) => sum + week.totalPoints, 0),
      missions: sessionWeeks.reduce((sum, week) => sum + week.missionsCompleted, 0)
    };
  };

  // Group by sessions
  const sessions = [...new Set(weeklyProgress.map(w => w.sessionNumber))].sort();

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading weekly progress...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-yellow-600" />
          <span>Weekly & Session Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{getTotalPoints()}</div>
            <div className="text-sm text-blue-800">Total Points</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{getTotalMissions()}</div>
            <div className="text-sm text-green-800">Total Missions</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{sessions.length}</div>
            <div className="text-sm text-purple-800">Sessions</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{weeklyProgress.length}</div>
            <div className="text-sm text-orange-800">Active Weeks</div>
          </div>
        </div>

        {/* Session Breakdown */}
        {sessions.map(sessionNum => {
          const sessionData = getSessionTotal(sessionNum);
          const sessionWeeks = weeklyProgress.filter(w => w.sessionNumber === sessionNum);
          const isCurrentSession = sessionNum === currentSession;
          
          return (
            <div key={sessionNum} className={`border rounded-lg p-4 ${isCurrentSession ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <span>Session {sessionNum}</span>
                  {isCurrentSession && <Badge className="bg-blue-100 text-blue-800">Current</Badge>}
                </h3>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{sessionData.points} pts</div>
                  <div className="text-sm text-gray-600">{sessionData.missions} missions</div>
                </div>
              </div>
              
              {/* Weekly Progress within Session */}
              <div className="grid gap-2">
                {sessionWeeks.sort((a, b) => a.weekNumber - b.weekNumber).map(week => (
                  <div key={`${week.sessionNumber}-${week.weekNumber}`} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded bg-gray-100">
                        <Calendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <span className="font-medium">Week {week.weekNumber}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{week.totalPoints} points</div>
                        <div className="text-sm text-gray-600">{week.missionsCompleted} missions</div>
                      </div>
                      <div className="w-20">
                        <Progress 
                          value={Math.min((week.totalPoints / 21) * 100, 100)} // Assuming 21 points per week max (3 daily * 7 days)
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {sessionWeeks.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No weeks completed in this session yet
                </div>
              )}
            </div>
          );
        })}

        {weeklyProgress.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No weekly progress data yet.</p>
            <p className="text-sm">Complete your daily missions to start tracking progress!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CamperWeeklyProgress;