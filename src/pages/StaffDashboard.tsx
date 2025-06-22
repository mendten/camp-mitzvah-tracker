
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Edit3, CheckCircle2, Circle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [campers, setCampers] = useState([
    { 
      id: 1, 
      name: 'David Cohen', 
      progress: 80, 
      missions: 4, 
      total: 5, 
      online: true,
      completedMissions: ['Morning Tefillah', 'Torah Study', 'Acts of Kindness', 'Camp Activity'],
      pendingMissions: ['Evening Reflection']
    },
    { 
      id: 2, 
      name: 'Sarah Goldberg', 
      progress: 60, 
      missions: 3, 
      total: 5, 
      online: false,
      completedMissions: ['Morning Tefillah', 'Torah Study', 'Acts of Kindness'],
      pendingMissions: ['Camp Activity', 'Evening Reflection']
    },
    { 
      id: 3, 
      name: 'Michael Rosen', 
      progress: 100, 
      missions: 5, 
      total: 5, 
      online: true,
      completedMissions: ['Morning Tefillah', 'Torah Study', 'Acts of Kindness', 'Camp Activity', 'Evening Reflection'],
      pendingMissions: []
    },
    { 
      id: 4, 
      name: 'Rachel Green', 
      progress: 40, 
      missions: 2, 
      total: 5, 
      online: true,
      completedMissions: ['Morning Tefillah', 'Torah Study'],
      pendingMissions: ['Acts of Kindness', 'Camp Activity', 'Evening Reflection']
    },
    { 
      id: 5, 
      name: 'Joshua Miller', 
      progress: 60, 
      missions: 3, 
      total: 5, 
      online: false,
      completedMissions: ['Morning Tefillah', 'Acts of Kindness', 'Camp Activity'],
      pendingMissions: ['Torah Study', 'Evening Reflection']
    },
    { 
      id: 6, 
      name: 'Hannah Davis', 
      progress: 80, 
      missions: 4, 
      total: 5, 
      online: true,
      completedMissions: ['Morning Tefillah', 'Torah Study', 'Acts of Kindness', 'Evening Reflection'],
      pendingMissions: ['Camp Activity']
    }
  ]);

  const [selectedCamper, setSelectedCamper] = useState(null);

  const averageProgress = Math.round(campers.reduce((sum, camper) => sum + camper.progress, 0) / campers.length);

  const handleQuickEdit = (camperId: number, missionName: string, completed: boolean) => {
    setCampers(prev => prev.map(camper => {
      if (camper.id === camperId) {
        const updatedCompleted = completed 
          ? [...camper.completedMissions, missionName]
          : camper.completedMissions.filter(m => m !== missionName);
        
        const updatedPending = completed
          ? camper.pendingMissions.filter(m => m !== missionName)
          : [...camper.pendingMissions, missionName];

        const newProgress = Math.round((updatedCompleted.length / camper.total) * 100);

        return {
          ...camper,
          completedMissions: updatedCompleted,
          pendingMissions: updatedPending,
          missions: updatedCompleted.length,
          progress: newProgress
        };
      }
      return camper;
    }));

    toast({
      title: completed ? "Mission Completed! 🎉" : "Mission Unchecked",
      description: `${missionName} ${completed ? 'marked as complete' : 'marked as incomplete'} for ${campers.find(c => c.id === camperId)?.name}`,
    });
  };

  const handleBulkComplete = () => {
    toast({
      title: "Bulk Action",
      description: "Bulk completion form would open here",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard - Bunk Aleph</h1>
            <p className="text-sm text-green-600">
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

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Bunk Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Campers</span>
                  <span className="font-semibold">{campers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Average Progress</span>
                  <span className="font-semibold">{averageProgress}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Online Now</span>
                  <span className="font-semibold">{campers.filter(c => c.online).length}</span>
                </div>
                <Progress value={averageProgress} className="h-2 mt-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Today's Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed Missions</span>
                  <span className="font-semibold text-green-600">
                    {campers.reduce((sum, c) => sum + c.missions, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Possible</span>
                  <span className="font-semibold">
                    {campers.reduce((sum, c) => sum + c.total, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="font-semibold">{averageProgress}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" className="w-full justify-start" variant="outline" onClick={handleBulkComplete}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Bulk Complete
                </Button>
                <Button size="sm" className="w-full justify-start" variant="outline" onClick={() => toast({ title: "Reports", description: "Bunk report would open here" })}>
                  <Users className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardHeader>
            <CardTitle>Camper Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campers.map((camper) => (
                <Card key={camper.id} className="border hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">{camper.name}</h3>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${camper.online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-xs text-gray-500">{camper.online ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">{camper.missions}/{camper.total}</span>
                        </div>
                        <Progress value={camper.progress} className="h-2" />
                        <p className="text-xs text-gray-500">{camper.progress}% complete</p>
                      </div>
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedCamper(camper)}>
                              <Edit3 className="h-3 w-3 mr-1" />
                              Quick Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>Quick Edit - {camper.name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2 text-green-600">Completed Missions</h4>
                                <div className="space-y-2">
                                  {camper.completedMissions.map((mission) => (
                                    <div key={mission} className="flex items-center justify-between">
                                      <span className="text-sm">{mission}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleQuickEdit(camper.id, mission, false)}
                                      >
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {camper.pendingMissions.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-2 text-orange-600">Pending Missions</h4>
                                  <div className="space-y-2">
                                    {camper.pendingMissions.map((mission) => (
                                      <div key={mission} className="flex items-center justify-between">
                                        <span className="text-sm">{mission}</span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleQuickEdit(camper.id, mission, true)}
                                        >
                                          <Circle className="h-4 w-4 text-gray-400" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button size="sm" variant="outline" onClick={() => toast({ title: "Camper Details", description: `Viewing detailed profile for ${camper.name}` })}>
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StaffDashboard;
