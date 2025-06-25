
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Calendar, Settings, BarChart3, Home, Shield, Target, UserPlus } from 'lucide-react';
import AdminLogin from '@/components/AdminLogin';
import AdminSubmissionsManagement from '@/components/AdminSubmissionsManagement';
import AdminReportDashboard from '@/components/AdminReportDashboard';
import AdminAnalytics from '@/components/AdminAnalytics';
import StaffManagement from '@/components/StaffManagement';
import BunkManagementDialog from '@/components/BunkManagementDialog';
import SessionManagement from '@/components/SessionManagement';
import CamperManagement from '@/components/CamperManagement';
import MissionManagement from '@/components/MissionManagement';
import AdminSettings from '@/components/AdminSettings';
import PublicDashboard from '@/components/PublicDashboard';
import { getCurrentHebrewDate, getSessionInfo } from '@/utils/hebrewDate';
import { MasterData } from '@/utils/masterDataStorage';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showBunkManagement, setShowBunkManagement] = useState(false);
  const hebrewDate = getCurrentHebrewDate();
  const sessionInfo = getSessionInfo();

  useEffect(() => {
    const storedPassword = MasterData.getAdminPassword();
    setAdminPassword(storedPassword);

    const isAdminLoggedIn = localStorage.getItem('adminAuthenticated');
    if (isAdminLoggedIn === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
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

  // Get quick stats for the overview cards
  const allCampersWithStatus = MasterData.getAllCampersWithStatus();
  const pendingSubmissions = MasterData.getPendingSubmissions();
  const qualifiedToday = allCampersWithStatus.filter(c => c.isQualified).length;
  const totalSubmissions = MasterData.getAllSubmissions().length;

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} onBack={handleBackToHome} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100">
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
              <p className="text-sm text-blue-600">{hebrewDate.hebrew}</p>
              <p className="text-xs text-gray-600">{sessionInfo.hebrew}</p>
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
        {/* Quick Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto text-blue-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{allCampersWithStatus.length}</div>
              <p className="text-gray-600">Total Campers</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{qualifiedToday}</div>
              <p className="text-gray-600">Qualified Today</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-purple-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{pendingSubmissions.length}</div>
              <p className="text-gray-600">Pending Approvals</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 mx-auto text-orange-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{totalSubmissions}</div>
              <p className="text-gray-600">Total Submissions</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="public" className="space-y-4">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="public">Public View</TabsTrigger>
            <TabsTrigger value="reports">All Campers</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="campers">Edit Campers</TabsTrigger>
            <TabsTrigger value="missions">Edit Missions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="management">Staff & Bunks</TabsTrigger>
          </TabsList>

          <TabsContent value="public">
            <PublicDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReportDashboard />
          </TabsContent>

          <TabsContent value="submissions">
            <AdminSubmissionsManagement />
          </TabsContent>

          <TabsContent value="campers">
            <CamperManagement />
          </TabsContent>

          <TabsContent value="missions">
            <MissionManagement />
          </TabsContent>

          <TabsContent value="analytics">
            <AdminAnalytics />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>

          <TabsContent value="management">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Staff & Bunk Management</span>
                  <Button onClick={() => setShowBunkManagement(true)} size="sm">
                    Manage Bunks
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StaffManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BunkManagementDialog
        isOpen={showBunkManagement}
        onClose={() => setShowBunkManagement(false)}
        bunk={null}
      />
    </div>
  );
};

export default AdminDashboard;
