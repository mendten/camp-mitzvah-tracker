import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Settings, BarChart3, Plus, Edit, Trash2, Home, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import AdminLogin from '@/components/AdminLogin';
import BunkManagementDialog from '@/components/BunkManagementDialog';
import MissionEditDialog from '@/components/MissionEditDialog';
import CamperEditDialog from '@/components/CamperEditDialog';
import { getCurrentHebrewDate } from '@/utils/hebrewDate';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [missions, setMissions] = useState(DEFAULT_MISSIONS);
  const [selectedBunk, setSelectedBunk] = useState<any>(null);
  const [showBunkManagement, setShowBunkManagement] = useState(false);
  const [showMissionEdit, setShowMissionEdit] = useState(false);
  const [editingMission, setEditingMission] = useState<any>(null);
  const [showStatDetails, setShowStatDetails] = useState<{ type: string; data: any } | null>(null);
  const [showCamperEdit, setShowCamperEdit] = useState(false);
  const [editingCamper, setEditingCamper] = useState<any>(null);
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

  const handleManageBunk = (bunk: any) => {
    setSelectedBunk(bunk);
    setShowBunkManagement(true);
  };

  const handleEditMission = (mission: any) => {
    setEditingMission(mission);
    setShowMissionEdit(true);
  };

  const handleCreateMission = () => {
    setEditingMission(null);
    setShowMissionEdit(true);
  };

  const handleSaveMission = (mission: any) => {
    if (mission.id) {
      // Edit existing mission
      setMissions(prev => prev.map(m => m.id === mission.id ? mission : m));
    } else {
      // Create new mission
      const newMission = { ...mission, id: `mission_${Date.now()}` };
      setMissions(prev => [...prev, newMission]);
    }
  };

  const handleDeleteMission = (missionId: string) => {
    setMissions(prev => prev.filter(m => m.id !== missionId));
  };

  const handleStatClick = (type: string) => {
    let data = {};
    
    switch (type) {
      case 'campers':
        data = {
          title: 'Total Campers Breakdown',
          items: CAMP_DATA.map(bunk => ({
            name: `Bunk ${bunk.displayName}`,
            count: bunk.campers.length,
            details: bunk.campers.map(c => c.name).join(', ')
          }))
        };
        break;
      case 'staff':
        data = {
          title: 'Staff Distribution',
          items: CAMP_DATA.map(bunk => ({
            name: `Bunk ${bunk.displayName}`,
            count: bunk.staff.length,
            details: bunk.staff.map(s => s.name).join(', ')
          }))
        };
        break;
      case 'progress':
        data = {
          title: 'Progress Details',
          items: CAMP_DATA.map(bunk => {
            const avgProgress = Math.floor(Math.random() * 30) + 70;
            return {
              name: `Bunk ${bunk.displayName}`,
              count: `${avgProgress}%`,
              details: `${bunk.campers.length} campers averaging ${avgProgress}% completion`
            };
          })
        };
        break;
      case 'missions':
        data = {
          title: 'Active Missions Details',
          items: missions.filter(m => m.isActive).map(mission => ({
            name: mission.title,
            count: mission.type,
            details: `${mission.isMandatory ? 'Mandatory' : 'Optional'} ${mission.type} mission`
          }))
        };
        break;
    }
    
    setShowStatDetails({ type, data });
  };

  const handleEditCamper = (camper: any) => {
    setEditingCamper(camper);
    setShowCamperEdit(true);
  };

  const handleSaveCamper = (camper: any) => {
    // In a real app, this would update the database
    toast({
      title: "Camper Saved",
      description: `${camper.name} has been updated successfully`,
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
          <Card 
            className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleStatClick('campers')}
          >
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

          <Card 
            className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleStatClick('staff')}
          >
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

          <Card 
            className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleStatClick('progress')}
          >
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

          <Card 
            className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleStatClick('missions')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <span>Missions</span>
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
                    <Card key={bunk.id} className="border hover:shadow-md transition-shadow">
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
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleManageBunk(CAMP_DATA.find(b => b.id === bunk.id))}
                          >
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
                  <Button size="sm" onClick={handleCreateMission}>
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
                            {!mission.isActive && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditMission(mission)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteMission(mission.id)}>
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
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditCamper(camper)}>
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toast({ title: "View Camper", description: `Viewing ${camper.name}'s profile` })}>
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
                        <span>Total Missions</span>
                        <span className="font-semibold">{missions.length}</span>
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

      <BunkManagementDialog
        isOpen={showBunkManagement}
        onClose={() => setShowBunkManagement(false)}
        bunk={selectedBunk}
      />

      <MissionEditDialog
        isOpen={showMissionEdit}
        onClose={() => setShowMissionEdit(false)}
        mission={editingMission}
        onSave={handleSaveMission}
        onDelete={handleDeleteMission}
      />

      <CamperEditDialog
        isOpen={showCamperEdit}
        onClose={() => setShowCamperEdit(false)}
        camper={editingCamper}
        onSave={handleSaveCamper}
      />

      {showStatDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowStatDetails(null)}>
          <Card className="max-w-2xl w-full m-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{showStatDetails.data.title}</span>
                <Button variant="outline" size="sm" onClick={() => setShowStatDetails(null)}>
                  Close
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {showStatDetails.data.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start p-3 border rounded-lg">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.details}</p>
                    </div>
                    <span className="font-bold text-lg">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
