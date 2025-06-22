
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, User, Target, Clock } from 'lucide-react';
import { DEFAULT_MISSIONS } from '@/data/campData';

interface CamperDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  camper: any;
  bunkName: string;
}

const CamperDetailsModal: React.FC<CamperDetailsModalProps> = ({
  isOpen,
  onClose,
  camper,
  bunkName
}) => {
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);

  useEffect(() => {
    if (camper) {
      // Load completed missions for this camper
      const savedProgress = localStorage.getItem(`camper_${camper.id}_missions`);
      if (savedProgress) {
        setCompletedMissions(new Set(JSON.parse(savedProgress)));
      }

      // Generate weekly stats
      const stats = [];
      for (let week = 1; week <= 4; week++) {
        const completed = Math.floor(Math.random() * DEFAULT_MISSIONS.length) + 2;
        stats.push({
          week,
          completed,
          total: DEFAULT_MISSIONS.length,
          percentage: Math.round((completed / DEFAULT_MISSIONS.length) * 100)
        });
      }
      setWeeklyStats(stats);
    }
  }, [camper]);

  if (!camper) return null;

  const activeMissions = DEFAULT_MISSIONS.filter(m => m.isActive);
  const completedCount = completedMissions.size;
  const progressPercentage = activeMissions.length > 0 ? Math.round((completedCount / activeMissions.length) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{camper.name} - Detailed Profile</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{camper.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bunk</p>
                  <p className="font-semibold">{bunkName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Camper ID</p>
                  <p className="font-semibold">{camper.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Progress */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span>Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{progressPercentage}%</div>
                <p className="text-sm text-gray-600">{completedCount} of {activeMissions.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span>Completed</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{completedCount}</div>
                <p className="text-sm text-gray-600">Today's missions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span>Remaining</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{activeMissions.length - completedCount}</div>
                <p className="text-sm text-gray-600">Left to do</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span>Streak</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{Math.floor(Math.random() * 7) + 1}</div>
                <p className="text-sm text-gray-600">Days active</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Mission Status */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Mission Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {activeMissions.map(mission => (
                  <div key={mission.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{mission.icon}</span>
                      <div>
                        <p className="font-medium">{mission.title}</p>
                        <p className="text-xs text-gray-500 capitalize">{mission.type}</p>
                      </div>
                    </div>
                    <Badge variant={completedMissions.has(mission.id) ? "default" : "secondary"}>
                      {completedMissions.has(mission.id) ? "Complete" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weeklyStats.map(week => (
                  <div key={week.week} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Week {week.week}</p>
                      <p className="text-sm text-gray-600">{week.completed}/{week.total} missions completed</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${week.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{week.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CamperDetailsModal;
