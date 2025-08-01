import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Calendar, Settings, BarChart3, Home, Shield, Target, UserPlus, Award, Clock } from 'lucide-react';
import AdminLogin from '@/components/AdminLogin';
import AdminSubmissionsManagement from '@/components/AdminSubmissionsManagement';
import AdminReportDashboard from '@/components/AdminReportDashboard';
import AdminAnalytics from '@/components/AdminAnalytics';
import StaffManagement from '@/components/StaffManagement';
import BunkManagementDialog from '@/components/BunkManagementDialog';
import SessionManagementSupabase from '@/components/SessionManagementSupabase';
import CamperManagement from '@/components/CamperManagement';
import MissionManagement from '@/components/MissionManagement';
import AdminSettings from '@/components/AdminSettings';
import PublicDashboard from '@/components/PublicDashboard';
import AdminCardModal from '@/components/AdminCardModal';
import AdminSupabaseSubmissions from '@/components/AdminSupabaseSubmissions';
import SessionQualificationHistory from '@/components/SessionQualificationHistory';
import DailyNonSubmissionTracking from '@/components/DailyNonSubmissionTracking';
import RankManagement from '@/components/RankManagement';
import CsvImportDialog from '@/components/CsvImportDialog';
import AdminEditingEnhancements from '@/components/AdminEditingEnhancements';
import IndividualCamperProgress from '@/pages/IndividualCamperProgress';
import { getCurrentProperHebrewDate, getSessionInfo } from '@/utils/properHebrewDate';
import { MasterData, CamperSubmission } from '@/utils/masterDataStorage';
import { supabaseService } from '@/services/supabaseService';
import mivtzahLogo from '@/assets/mivtzah-logo.png';
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showBunkManagement, setShowBunkManagement] = useState(false);
  const [activeTab, setActiveTab] = useState('public');
  const [modalType, setModalType] = useState<'campers' | 'qualified' | 'pending' | 'submissions' | null>(null);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const hebrewDate = getCurrentProperHebrewDate();
  const sessionInfo = getSessionInfo();

  // Async state management for dashboard data
  const [allSubmissions, setAllSubmissions] = useState<CamperSubmission[]>([]);
  const [allCampersWithStatus, setAllCampersWithStatus] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<CamperSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load system settings first
        const settings = await supabaseService.getSystemSettings();
        setAdminPassword(settings.adminPassword);

        // Load all data from Supabase
        const [submissions, camperProfiles] = await Promise.all([supabaseService.getAllSubmissions(), supabaseService.getAllCamperProfiles()]);
        setAllSubmissions(submissions);

        // Build campers with status using async data
        const campersWithStatus = await Promise.all(camperProfiles.map(async profile => {
          const todaySubmission = await supabaseService.getCamperTodaySubmission(profile.id);
          const dailyRequired = settings.dailyRequired;
          let status: 'working' | 'submitted' | 'approved' | 'rejected' = 'working';
          let missionCount = 0;
          if (todaySubmission) {
            // With auto-approval, all submissions are approved
            status = 'approved';
            missionCount = todaySubmission.missions.length;
          }
          return {
            id: profile.id,
            name: profile.name,
            code: profile.code,
            bunkName: profile.bunkName,
            bunkId: profile.bunkId,
            todaySubmission,
            status,
            missionCount,
            isQualified: missionCount >= dailyRequired
          };
        }));
        setAllCampersWithStatus(campersWithStatus);

        // Filter pending submissions (none with auto-approval)
        const pending: CamperSubmission[] = [];
        setPendingSubmissions(pending);
      } catch (error) {
        console.error('Error loading admin dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    const isAdminLoggedIn = localStorage.getItem('adminAuthenticated');
    if (isAdminLoggedIn === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);
  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('adminAuthenticated', 'true');
    // Reload data after login
    window.location.reload();
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
  const qualifiedToday = allCampersWithStatus.filter(c => c.isQualified).length;
  const totalSubmissions = allSubmissions.length;

  // Card click handlers - now open modals instead of changing tabs
  const handleCardClick = (action: 'campers' | 'qualified' | 'pending' | 'submissions') => {
    setModalType(action);
  };
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} onBack={handleBackToHome} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')} className="flex items-center space-x-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            <div className="flex items-center space-x-4">
              <img src={mivtzahLogo} alt="Mivtzah Tut Altz Temimim" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">גן ישראל פלורידא 
מבצע טוט אלץ</h1>
                <p className="text-sm text-blue-600">{hebrewDate.hebrew}</p>
                <p className="text-xs text-gray-600">{sessionInfo.hebrew}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Stats Overview - Clickable Cards with Modals */}
        {loading ? <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Card key={i} className="bg-white/80 backdrop-blur shadow-lg border-0">
                <CardContent className="p-6 text-center">
                  <div className="animate-pulse">
                    <div className="h-12 w-12 bg-gray-300 rounded mx-auto mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded"></div>
                  </div>
                </CardContent>
              </Card>)}
          </div> : <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow hover:scale-105" onClick={() => handleCardClick('campers')}>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <div className="text-3xl font-bold text-gray-900">{allCampersWithStatus.length}</div>
                <p className="text-gray-600">Total Campers</p>
                <p className="text-xs text-blue-600 mt-1">Click to view details</p>
              </CardContent>
            </Card>
          
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow hover:scale-105" onClick={() => handleCardClick('qualified')}>
            <CardContent className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{qualifiedToday}</div>
              <p className="text-gray-600">Qualified Today</p>
              <p className="text-xs text-green-600 mt-1">Click to view qualified</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow hover:scale-105" onClick={() => handleCardClick('pending')}>
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-purple-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">0</div>
              <p className="text-gray-600">Pending Submissions</p>
              <p className="text-xs text-purple-600 mt-1">Auto-approved system</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0 cursor-pointer hover:shadow-xl transition-shadow hover:scale-105" onClick={() => handleCardClick('submissions')}>
            <CardContent className="p-6 text-center">
              <Shield className="h-12 w-12 mx-auto text-orange-600 mb-2" />
              <div className="text-3xl font-bold text-gray-900">{totalSubmissions}</div>
              <p className="text-gray-600">Total Submissions</p>
              <p className="text-xs text-orange-600 mt-1">Click to view history</p>
            </CardContent>
          </Card>
          </div>}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="public">Public View</TabsTrigger>
            <TabsTrigger value="reports">All Campers</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="session-history">Session History</TabsTrigger>
            <TabsTrigger value="daily-tracking">Daily Tracking</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="ranks">Ranks</TabsTrigger>
            <TabsTrigger value="campers">Edit Campers</TabsTrigger>
            <TabsTrigger value="missions">Edit Missions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="public">
            <PublicDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <AdminReportDashboard />
          </TabsContent>

          <TabsContent value="submissions">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Supabase Submissions</h2>
                <Button onClick={() => setShowCsvImport(true)} className="bg-blue-600 hover:bg-blue-700">
                  Import CSV
                </Button>
              </div>
              <AdminSupabaseSubmissions />
            </div>
          </TabsContent>

          <TabsContent value="stats">
            <AdminEditingEnhancements />
          </TabsContent>

          <TabsContent value="session-history">
            <SessionQualificationHistory />
          </TabsContent>

          <TabsContent value="daily-tracking">
            <DailyNonSubmissionTracking />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionManagementSupabase />
          </TabsContent>

          <TabsContent value="ranks">
            <RankManagement />
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
            <div className="space-y-6">
              <AdminSettings />
              
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
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BunkManagementDialog isOpen={showBunkManagement} onClose={() => setShowBunkManagement(false)} bunk={null} />

      <AdminCardModal isOpen={modalType !== null} onClose={() => setModalType(null)} type={modalType || 'campers'} />

      <CsvImportDialog isOpen={showCsvImport} onClose={() => setShowCsvImport(false)} onImportComplete={() => {
      // Refresh data after import
      window.location.reload();
    }} />
    </div>;
};
export default AdminDashboard;