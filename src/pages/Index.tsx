
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Home, Calendar, Star, Target } from 'lucide-react';
import { getCurrentHebrewDate, getSessionInfo } from '@/utils/hebrewDate';
import { SESSION_CONFIG, DEFAULT_MISSIONS } from '@/data/campData';

const Index = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  
  const hebrewDate = getCurrentHebrewDate();
  const sessionInfo = getSessionInfo(SESSION_CONFIG);

  const handleStaffLogin = () => {
    navigate('/staff');
  };

  const handleAdminLogin = () => {
    navigate('/admin');
  };

  const handleHomeClick = () => {
    setCurrentUser(null);
    // Reset any logged in state
    localStorage.removeItem('currentCamper');
    localStorage.removeItem('currentBunk');
  };

  const publicStats = {
    totalMissions: DEFAULT_MISSIONS.filter(m => m.isActive).length,
    completedToday: 156,
    activeCampers: 53,
    averageProgress: 78
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleHomeClick}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🔥 Ignite Mission Tracker</h1>
              <div className="text-right">
                <p className="text-lg font-semibold text-blue-600">{hebrewDate.hebrew}</p>
                <p className="text-sm text-gray-600">{hebrewDate.english}</p>
                <p className="text-xs text-purple-600 font-medium">{sessionInfo.english}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
            <Button
              onClick={handleStaffLogin}
              className="bg-green-600 hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>Staff Portal</span>
            </Button>
            <Button
              onClick={handleAdminLogin}
              className="bg-purple-600 hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Admin Portal</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Camp Ignite
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your Jewish summer camp journey with daily missions, progress monitoring, and meaningful connections.
          </p>
        </div>

        <Tabs defaultValue="missions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="missions" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Missions</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="missions" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-center text-2xl">Today's Missions</CardTitle>
                <CardDescription className="text-center">
                  Complete your daily Jewish learning and practice goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {DEFAULT_MISSIONS.filter(m => m.isActive).slice(0, 6).map((mission) => (
                    <Card key={mission.id} className="text-center hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="text-3xl mb-3">{mission.icon}</div>
                        <h3 className="font-semibold text-sm mb-2">{mission.title}</h3>
                        <div className="text-xs text-gray-600 capitalize mb-2">{mission.type}</div>
                        {mission.isMandatory && (
                          <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            Mandatory
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button 
                    onClick={() => navigate('/camper')}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Start Your Mission Journey
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    Select your bunk to begin tracking your daily missions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span>Missions Today</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{publicStats.completedToday}</div>
                  <p className="text-sm text-gray-600">Completed by all campers</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Active Campers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{publicStats.activeCampers}</div>
                  <p className="text-sm text-gray-600">Currently participating</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span>Average Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{publicStats.averageProgress}%</div>
                  <p className="text-sm text-gray-600">Camp-wide completion</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <span>Session Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-gray-900">Week {SESSION_CONFIG.currentWeek}</div>
                  <p className="text-sm text-gray-600">Day {SESSION_CONFIG.currentDay} of Session {SESSION_CONFIG.currentSession}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle>Camp-Wide Progress</CardTitle>
                <CardDescription>Public dashboard showing overall camp achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Today's Mission Completion</h3>
                    <div className="text-4xl font-bold text-blue-600 mb-2">{publicStats.averageProgress}%</div>
                    <p className="text-gray-600">
                      {publicStats.completedToday} missions completed out of {publicStats.activeCampers * publicStats.totalMissions} possible
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h4 className="font-semibold mb-3">Top Performing Bunks</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span>Bunk Daled</span>
                          <span className="font-semibold text-green-600">92%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span>Bunk Gimmel</span>
                          <span className="font-semibold text-blue-600">89%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                          <span>Bunk Beis</span>
                          <span className="font-semibold text-yellow-600">82%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>Bunk Alef</span>
                          <span className="font-semibold text-gray-600">75%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Most Popular Missions</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                          <span>🌅 Shacharit</span>
                          <span className="font-semibold text-purple-600">95%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span>📜 Torah Study</span>
                          <span className="font-semibold text-blue-600">88%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span>⚽ Sports</span>
                          <span className="font-semibold text-green-600">85%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                          <span>❤️ Acts of Kindness</span>
                          <span className="font-semibold text-red-600">79%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
