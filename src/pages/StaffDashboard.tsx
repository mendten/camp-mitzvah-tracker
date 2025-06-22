
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Edit3, CheckCircle2, Circle, Eye, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import StaffLogin from '@/components/StaffLogin';
import { getCurrentHebrewDate } from '@/utils/hebrewDate';

interface CamperProgress {
  id: string;
  name: string;
  progress: number;
  missions: number;
  total: number;
  online: boolean;
  completedMissions: string[];
  pendingMissions: string[];
}

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<string>('');
  const [currentBunk, setCurrentBunk] = useState<string>('');
  const [campers, setCampers] = useState<CamperProgress[]>([]);
  const hebrewDate = getCurrentHebrewDate();

  useEffect(() => {
    // Check if staff is already logged in
    const savedStaff = localStorage.getItem('currentStaff');
    const savedBunk = localStorage.getItem('staffBunk');
    if (savedStaff && savedBunk) {
      setCurrentStaff(savedStaff);
      setCurrentBunk(savedBunk);
      setIsAuthenticated(true);
      loadCamperData(savedBunk);
    }
  }, []);

  const loadCamperData = (bunkId: string) => {
    const bunk = CAMP_DATA.find(b => b.id === bunkId);
    if (!bunk) return;

    const missionTitles = DEFAULT_MISSIONS.filter(m => m.isActive).map(m => m.title);
    const totalMissions = missionTitles.length;

    const camperData: CamperProgress[] = bunk.campers.map(camper => {
      // Load saved progress or generate random data
      const savedProgress = localStorage.getItem(`camper-progress-${camper.id}`);
      let completedMissions: string[] = [];
      let pendingMissions: string[] = missionTitles;

      if (savedProgress) {
        const { missions } = JSON.parse(savedProgress);
        if (missions && Array.isArray(missions)) {
          completedMissions = missions.filter((m: any) => m.completed).map((m: any) => m.title);
          pendingMissions = missions.filter((m: any) => !m.completed).map((m: any) => m.title);
        }
      } else {
        // Generate random progress for simulation
        const completedCount = Math.floor(Math.random() * (totalMissions + 1));
        completedMissions = missionTitles.slice(0, completedCount);
        pendingMissions = missionTitles.slice(completedCount);
      }

      return {
        id: camper.id,
        name: camper.name,
        progress: Math.round((completedMissions.length / totalMissions) * 100),
        missions: completedMissions.length,
        total: totalMissions,
        online: Math.random() > 0.3, // 70% chance of being online
        completedMissions,
        pendingMissions
      };
    });

    setCampers(camperData);
  };

  const handleStaffLogin = (staffId: string, bunkId: string) => {
    setCurrentStaff(staffId);
    setCurrentBunk(bunkId);
    setIsAuthenticated(true);
    localStorage.setItem('currentStaff', staffId);
    localStorage.setItem('staffBunk', bunkId);
    loadCamperData(bunkId);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentStaff('');
    setCurrentBunk('');
    localStorage.removeItem('currentStaff');
    localStorage.removeItem('staffBunk');
    navigate('/');
  };

  const handleBackToHome = () => {
    setIsAuthenticated(false);
    setCurrentStaff('');
    setCurrentBunk('');
    localStorage.removeItem('currentStaff');
    localStorage.removeItem('staffBunk');
  };

  const handleQuickEdit = (camperId: string, missionTitle: string, completed: boolean) => {
    // Update camper progress in localStorage
    const savedProgress = localStorage.getItem(`camper-progress-${camperId}`);
    if (savedProgress) {
      const progressData = JSON.parse(savedProgress);
      if (progressData.missions && Array.isArray(progressData.missions)) {
        const updatedMissions = progressData.missions.map((m: any) => {
          if (m.title === missionTitle) {
            return { ...m, completed };
          }
          return m;
        });
        
        const newProgressData = {
          ...progressData,
          missions: updatedMissions,
          points: updatedMissions.filter((m: any) => m.completed).length * 5
        };
        
        localStorage.setItem(`camper-progress-${camperId}`, JSON.stringify(newProgressData));
      }
    }

    // Update local state
    setCampers(prev => prev.map(camper => {
      if (camper.id === camperId) {
        const updatedCompleted = completed 
          ? [...camper.completedMissions, missionTitle]
          : camper.completedMissions.filter(m => m !== missionTitle);
        
        const updatedPending = completed
          ? camper.pendingMissions.filter(m => m !== missionTitle)
          : [...camper.pendingMissions, missionTitle];

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
      description: `${missionTitle} ${completed ? 'marked as complete' : 'marked as incomplete'} for ${campers.find(c => c.id === camperId)?.name}`,
    });
  };

  if (!isAuthenticated) {
    return <StaffLogin onLogin={handleStaffLogin} onBack={handleBackToHome} />;
  }

  const bunkInfo = CAMP_DATA.find(b => b.id === currentBunk);
  const staffInfo = bunkInfo?.staff.find(s => s.id === currentStaff);
  const averageProgress = campers.length > 0 ? Math.round(campers.reduce((sum, camper) => sum + camper.progress, 0) / campers.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {staffInfo?.name} - Bunk {bunkInfo?.displayName}
              </h1>
              <p className="text-sm text-green-600">{hebrewDate.hebrew}</p>
              <p className="text-xs text-gray-600">{hebrewDate.english}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
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
                <Button size="sm" className="w-full justify-start" variant="outline" onClick={() => toast({ title: "Bulk Actions", description: "Bulk complete form would open here" })}>
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
                            <Button size="sm" variant="outline" className="flex-1">
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
