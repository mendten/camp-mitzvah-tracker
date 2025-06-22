
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle2, Circle } from 'lucide-react';
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
    { id: 5, title: 'Evening Reflection', type: 'reflection', completed: false, icon: '⭐' }
  ]);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const completedCount = missions.filter(m => m.completed).length;
  const progressPercentage = (completedCount / missions.length) * 100;

  const toggleMission = (id: number) => {
    setMissions(prev => prev.map(mission => {
      if (mission.id === id) {
        const newCompleted = !mission.completed;
        if (newCompleted) {
          toast({
            title: "Mission Complete! 🎉",
            description: `Great job completing ${mission.title}!`,
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onToggle={() => toggleMission(mission.id)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default CamperDashboard;
