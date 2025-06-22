
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Settings, BarChart3, Plus, Edit, Trash2, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import AdminLogin from '@/components/AdminLogin';
import { getCurrentHebrewDate } from '@/utils/hebrewDate';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [missions, setMissions] = useState(DEFAULT_MISSIONS);
  const hebrewDate = getCurrentHebrewDate();

  useEffect(() => {
    // Check if admin is already logged in
    const isAdminLoggedIn = localStorage.getItem('adminAuthenticated');
    if (isAdminLoggedIn === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('adminAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
    navigate('/');
  };

  const handleBackToHome = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuthenticated');
  };

  const toggleMissionActive = (missionId: string) => {
    setMissions(prev => prev.map(mission => 
      mission.id === missionId 
        ? { ...mission, isActive: !mission.isActive }
        : mission
    ));
    toast({
      title: "Mission Updated",
      description: "Mission status changed successfully",
    });
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleAdminLogin} onBack={handleBackToHome} />;
  }

  // Calculate statistics from real data
  const totalCampers = CAMP_DATA.reduce((sum, bunk) => sum + bunk.campers.length, 0);
  const totalStaff = CAMP_DATA.reduce((sum, bunk) => sum + bunk.staff.length, 0);
  const activeMissions = missions.filter(m => m.isActive).length;

  // Generate bunk statistics
  const bunkStats = CAMP_DATA.map(bunk => {
    const avgProgress = Math.floor(Math.random() * 30) + 70; // 70-100% for demo
    return {
      id: bunk.id,
      name: bunk.displayName,
      campers: bunk.campers.length,
      staff: bunk.staff.length,
      avgProgress
    };
  });

  const overallProgress = Math.round(bunkStats.reduce((sum, bunk) => sum + bunk.avgProgress, 0) / bunkStats.length);

  // Generate all campers list
  const allCampers = CAMP_DATA.flatMap(bunk => 
    bunk.campers.map(camper => ({
      id: camper.id,
      name: camper.name,
      bunk: bunk.displayName,
      progress: Math.floor(Math.random() * 40) + 60, // 60-100% for demo
      missions: Math.floor(Math.random() * 3) + 3, // 3-5 missions
      total: missions.filter(m => m.isActive).length,
      online: Math.random() > 0.3 // 70% chance of being online
    }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
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
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-purple-600">{hebrewDate.hebrew}</p>
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

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Total Campers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalCampers}</div>
              <p className="text-sm text-gray-600">Across {CAMP_DATA.length} bunks</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Total Staff</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalStaff}</div>
              <p className="text-sm text-gray-600">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <span>Overall Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{overallProgress}%</div>
              <p className="text-sm text-gray-600">Camp average</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <span>Active Missions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{activeMissions}</div>
              <p className="text-sm text-gray-600">Out of {missions.length} total</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bunks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bunks">Bunks</TabsTrigger>
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="campers">Campers</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="bunks" className="space-y-4">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Bunk Management</span>
                  <Button size="sm" onClick={() => toast({ title: "Add Bunk", description: "New bunk form would open here" })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Bunk
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {bunkStats.map((bunk) => (
                    <Card key={bunk.id} className="border hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h3 className="font-semibold text-gray-900 text-lg">Bunk {bunk.name}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Campers</span>
                              <span className="font-semibold">{bunk.campers}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Staff</span>
                              <span className="font-semibold">{bunk.staff}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-semibold text-green-600">{bunk.avgProgress}%</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="w-full">
                            Manage
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missions">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Mission Management</span>
                  <Button size="sm" onClick={() => toast({ title: "Add Mission", description: "Mission creation form would open here" })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Mission
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {missions.map((mission) => (
                    <div key={mission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">{mission.icon}</div>
                        <div>
                          <h3 className="font-semibold">{mission.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="capitalize">{mission.type}</span>
                            {mission.isMandatory && (
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                                Mandatory
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={mission.isActive ? "default" : "outline"}
                          onClick={() => toggleMissionActive(mission.id)}
                        >
                          {mission.isActive ? "Active" : "Inactive"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toast({ title: "Edit Mission", description: `Editing ${mission.title}` })}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toast({ title: "Delete Mission", description: `${mission.title} would be deleted`, variant: "destructive" })}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campers">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Camper Management</span>
                  <Button size="sm" onClick={() => toast({ title: "Add Camper", description: "New camper form would open here" })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Camper
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allCampers.slice(0, 12).map((camper) => (
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
                          <div className="text-sm">
                            <p className="text-gray-600">Bunk: {camper.bunk}</p>
                            <p className="text-gray-600">Progress: {camper.progress}%</p>
                            <p className="text-gray-600">Missions: {camper.missions}/{camper.total}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => toast({ title: "Edit Camper", description: `Editing ${camper.name}` })}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toast({ title: "View Camper", description: `Viewing ${camper.name}'s profile` })}>
                              View
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Daily Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Missions Completed Today</span>
                        <span className="font-semibold">{Math.floor(totalCampers * activeMissions * 0.75)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Completion Rate</span>
                        <span className="font-semibold">{overallProgress}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Most Active Bunk</span>
                        <span className="font-semibold">Bunk {bunkStats.reduce((max, bunk) => bunk.avgProgress > max.avgProgress ? bunk : max).name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Mission Analytics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Most Popular Mission</span>
                        <span className="font-semibold">Shacharit</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate</span>
                        <span className="font-semibold">94%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Missions</span>
                        <span className="font-semibold">{activeMissions}/{missions.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button onClick={() => toast({ title: "Export Data", description: "Report export would start here" })}>
                    Export Full Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
