
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Settings, BarChart3, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [bunks] = useState([
    { id: 1, name: 'Aleph', campers: 12, staff: 2, avgProgress: 75 },
    { id: 2, name: 'Bet', campers: 10, staff: 2, avgProgress: 82 },
    { id: 3, name: 'Gimel', campers: 11, staff: 2, avgProgress: 68 },
    { id: 4, name: 'Dalet', campers: 13, staff: 3, avgProgress: 90 }
  ]);

  const totalCampers = bunks.reduce((sum, bunk) => sum + bunk.campers, 0);
  const totalStaff = bunks.reduce((sum, bunk) => sum + bunk.staff, 0);
  const overallProgress = Math.round(bunks.reduce((sum, bunk) => sum + bunk.avgProgress, 0) / bunks.length);

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
              <Button size="sm" className="w-full">
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
                  <Button size="sm">
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
                <CardTitle>Mission Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Mission management tools will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campers">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle>Camper Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Camper management tools will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Detailed reports and analytics will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
