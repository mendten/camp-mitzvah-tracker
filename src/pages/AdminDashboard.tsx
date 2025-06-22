
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Settings, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [bunks, setBunks] = useState([
    { id: 1, name: 'Aleph', campers: 12, staff: 2, avgProgress: 75 },
    { id: 2, name: 'Bet', campers: 10, staff: 2, avgProgress: 82 },
    { id: 3, name: 'Gimel', campers: 11, staff: 2, avgProgress: 68 },
    { id: 4, name: 'Dalet', campers: 13, staff: 3, avgProgress: 90 }
  ]);

  const [allCampers] = useState([
    { id: 1, name: 'David Cohen', bunk: 'Aleph', progress: 80, missions: 4, total: 5, online: true },
    { id: 2, name: 'Sarah Goldberg', bunk: 'Aleph', progress: 60, missions: 3, total: 5, online: false },
    { id: 3, name: 'Michael Rosen', bunk: 'Bet', progress: 100, missions: 5, total: 5, online: true },
    { id: 4, name: 'Rachel Green', bunk: 'Bet', progress: 40, missions: 2, total: 5, online: true },
    { id: 5, name: 'Joshua Miller', bunk: 'Gimel', progress: 60, missions: 3, total: 5, online: false },
    { id: 6, name: 'Hannah Davis', bunk: 'Gimel', progress: 80, missions: 4, total: 5, online: true },
    { id: 7, name: 'Ethan Levy', bunk: 'Dalet', progress: 90, missions: 4, total: 5, online: true },
    { id: 8, name: 'Maya Stein', bunk: 'Dalet', progress: 95, missions: 5, total: 5, online: true }
  ]);

  const [missions, setMissions] = useState([
    { id: 1, title: 'Morning Tefillah', type: 'prayer', icon: '🕯️', active: true },
    { id: 2, title: 'Torah Study', type: 'learning', icon: '📜', active: true },
    { id: 3, title: 'Acts of Kindness', type: 'mitzvah', icon: '❤️', active: true },
    { id: 4, title: 'Camp Activity', type: 'activity', icon: '🏃', active: true },
    { id: 5, title: 'Evening Reflection', type: 'reflection', icon: '⭐', active: true },
    { id: 6, title: 'Shabbat Preparation', type: 'shabbat', icon: '🕯️', active: false },
    { id: 7, title: 'Hebrew Practice', type: 'learning', icon: '✍️', active: false }
  ]);

  const totalCampers = bunks.reduce((sum, bunk) => sum + bunk.campers, 0);
  const totalStaff = bunks.reduce((sum, bunk) => sum + bunk.staff, 0);
  const overallProgress = Math.round(bunks.reduce((sum, bunk) => sum + bunk.avgProgress, 0) / bunks.length);

  const handleAddMission = () => {
    toast({
      title: "Mission Creator",
      description: "Mission creation form would open here",
    });
  };

  const handleEditMission = (mission: any) => {
    toast({
      title: "Edit Mission",
      description: `Editing ${mission.title}`,
    });
  };

  const handleDeleteMission = (mission: any) => {
    toast({
      title: "Mission Deleted",
      description: `${mission.title} has been removed`,
      variant: "destructive"
    });
  };

  const toggleMissionActive = (missionId: number) => {
    setMissions(prev => prev.map(mission => 
      mission.id === missionId 
        ? { ...mission, active: !mission.active }
        : mission
    ));
    toast({
      title: "Mission Updated",
      description: "Mission status changed successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-purple-600">
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
              <p className="text-sm text-gray-600">Across {bunks.length} bunks</p>
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
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full" onClick={handleAddMission}>
                <Plus className="h-4 w-4 mr-2" />
                Add Mission
              </Button>
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
                  {bunks.map((bunk) => (
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
                  <Button size="sm" onClick={handleAddMission}>
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
                          <p className="text-sm text-gray-600 capitalize">{mission.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={mission.active ? "default" : "outline"}
                          onClick={() => toggleMissionActive(mission.id)}
                        >
                          {mission.active ? "Active" : "Inactive"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEditMission(mission)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteMission(mission)}>
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
                  {allCampers.map((camper) => (
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
                            <Button size="sm" variant="outline" className="flex-1">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
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
                        <span className="font-semibold">142</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Completion Rate</span>
                        <span className="font-semibold">76%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Most Active Bunk</span>
                        <span className="font-semibold">Dalet</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Weekly Trends</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Best Day</span>
                        <span className="font-semibold">Wednesday</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Most Popular Mission</span>
                        <span className="font-semibold">Camp Activity</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Engagement Rate</span>
                        <span className="font-semibold">89%</span>
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
