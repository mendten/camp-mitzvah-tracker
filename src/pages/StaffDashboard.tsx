
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Edit3 } from 'lucide-react';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [campers] = useState([
    { id: 1, name: 'David Cohen', progress: 80, missions: 4, total: 5 },
    { id: 2, name: 'Sarah Goldberg', progress: 60, missions: 3, total: 5 },
    { id: 3, name: 'Michael Rosen', progress: 100, missions: 5, total: 5 },
    { id: 4, name: 'Rachel Green', progress: 40, missions: 2, total: 5 },
    { id: 5, name: 'Joshua Miller', progress: 60, missions: 3, total: 5 },
    { id: 6, name: 'Hannah Davis', progress: 80, missions: 4, total: 5 }
  ]);

  const averageProgress = Math.round(campers.reduce((sum, camper) => sum + camper.progress, 0) / campers.length);

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
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button size="sm" className="w-full justify-start" variant="outline">
                  <Edit3 className="h-4 w-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button size="sm" className="w-full justify-start" variant="outline">
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
                <Card key={camper.id} className="border hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">{camper.name}</h3>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">Online</span>
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
                      <Button size="sm" variant="outline" className="w-full">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Quick Edit
                      </Button>
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
