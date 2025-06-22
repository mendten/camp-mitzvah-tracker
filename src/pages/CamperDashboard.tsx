
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { LogOut, Star, Award, Calendar } from 'lucide-react';
import MissionCard from '@/components/MissionCard';
import BunkSelector from '@/components/BunkSelector';
import { useToast } from '@/hooks/use-toast';

const CamperDashboard = () => {
  const [selectedBunk, setSelectedBunk] = useState<string>('');
  const [missions, setMissions] = useState([
    { id: 1, title: 'Morning Tefillah', type: 'prayer', completed: false, icon: '🕯️' },
    { id: 2, title: 'Torah Study', type: 'learning', completed: false, icon: '📜' },
    { id: 3, title: 'Acts of Kindness', type: 'mitzvah', completed: false, icon: '❤️' },
    { id: 4, title: 'Camp Activity', type: 'activity', completed: false, icon: '🏃' },
    { id: 5, title: 'Evening Reflection', type: 'reflection', completed: false, icon: '⭐' },
    { id: 6, title: 'Hebrew Practice', type: 'learning', completed: false, icon: '✍️' },
    { id: 7, title: 'Help a Friend', type: 'mitzvah', completed: false, icon: '🤝' },
    { id: 8, title: 'Sports & Games', type: 'activity', completed: false, icon: '⚽' }
  ]);

  const [streakCount, setStreakCount] = useState(3);
  const [totalPoints, setTotalPoints] = useState(42);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`camper-progress-${selectedBunk}`);
    if (savedProgress) {
      const { missions: savedMissions, streak, points } = JSON.parse(savedProgress);
      setMissions(savedMissions);
      setStreakCount(streak || 3);
      setTotalPoints(points || 42);
    }
  }, [selectedBunk]);

  // Save progress to localStorage whenever missions change
  useEffect(() => {
    if (selectedBunk) {
      localStorage.setItem(`camper-progress-${selectedBunk}`, JSON.stringify({
        missions,
        streak: streakCount,
        points: totalPoints
      }));
    }
  }, [missions, streakCount, totalPoints, selectedBunk]);

  const completedCount = missions.filter(m => m.completed).length;
  const progressPercentage = (completedCount / missions.length) * 100;

  const toggleMission = (id: number) => {
    setMissions(prev => prev.map(mission => {
      if (mission.id === id) {
        const newCompleted = !mission.completed;
        if (newCompleted) {
          setTotalPoints(prev => prev + 5);
          
          // Check for special achievements
          const newCompletedCount = missions.filter(m => m.completed).length + 1;
          if (newCompletedCount === missions.length) {
            setStreakCount(prev => prev + 1);
            toast({
              title: "🎉 ALL MISSIONS COMPLETE! 🎉",
              description: `Amazing work! You've completed all ${missions.length} missions today! Streak: ${streakCount + 1} days!`,
            });
          } else if (newCompletedCount === Math.floor(missions.length / 2)) {
            toast({
              title: "🌟 Halfway There! 🌟",
              description: `Great progress! You're halfway through today's missions!`,
            });
          } else {
            toast({
              title: "Mission Complete! 🎉",
              description: `Great job completing ${mission.title}! +5 points`,
            });
          }
        } else {
          setTotalPoints(prev => Math.max(0, prev - 5));
          toast({
            title: "Mission Unchecked",
            description: `${mission.title} marked as incomplete. -5 points`,
          });
        }
        return { ...mission, completed: newCompleted };
      }
      return mission;
    }));
  };

  if (!selectedBunk) {
    return <BunkSelector onSelectBunk={setSelectedBunk} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bunk {selectedBunk}</h1>
            <p className="text-sm text-blue-600">
              {new Date().toLocaleDateString('he-IL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                calendar: 'hebrew'
              })}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold">{totalPoints} pts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-semibold">{streakCount} day streak</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Today's Progress</span>
                <span className="text-2xl font-bold text-blue-600">
                  {completedCount}/{missions.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {progressPercentage === 100 
                  ? "🎉 All missions complete! Amazing work!" 
                  : `${missions.length - completedCount} missions remaining`
                }
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Streak</span>
                  <span className="font-semibold text-orange-600">{streakCount} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Points</span>
                  <span className="font-semibold text-yellow-600">{totalPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Rank in Bunk</span>
                  <span className="font-semibold text-green-600">#3</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onToggle={() => toggleMission(mission.id)}
            />
          ))}
        </div>

        {progressPercentage === 100 && (
          <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-green-300 animate-scale-in">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-xl font-bold text-green-800 mb-2">All Missions Complete!</h2>
              <p className="text-green-700">
                Congratulations! You've completed all missions for today. 
                Your dedication is inspiring! Keep up the amazing work tomorrow!
              </p>
              <div className="mt-4 flex justify-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">+{missions.length * 5}</div>
                  <div className="text-sm text-gray-600">Bonus Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{streakCount}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CamperDashboard;
