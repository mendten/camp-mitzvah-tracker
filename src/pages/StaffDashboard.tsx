
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, CheckCircle2, Calendar, Eye, Home, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import StaffLogin from '@/components/StaffLogin';
import BulkCompleteDialog from '@/components/BulkCompleteDialog';
import CamperDetailsModal from '@/components/CamperDetailsModal';
import PendingApprovalsCard from '@/components/PendingApprovalsCard';
import StaffAdvancedFeatures from '@/components/StaffAdvancedFeatures';
import { getCurrentHebrewDate, getSessionInfo } from '@/utils/hebrewDate';
import { MasterData } from '@/utils/masterDataStorage';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffData, setStaffData] = useState<any>(null);
  const [bunkData, setBunkData] = useState<any>(null);
  const [selectedCampers, setSelectedCampers] = useState<string[]>([]);
  const [showBulkComplete, setShowBulkComplete] = useState(false);
  const [showCamperDetails, setShowCamperDetails] = useState(false);
  const [selectedCamperForDetails, setSelectedCamperForDetails] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const hebrewDate = getCurrentHebrewDate();
  const sessionInfo = getSessionInfo();

  useEffect(() => {
    // Check if staff is already logged in
    const isStaffLoggedIn = localStorage.getItem('staffAuthenticated');
    if (isStaffLoggedIn === 'true') {
      const staffId = localStorage.getItem('staffId');
      const staffBunkId = localStorage.getItem('staffBunkId');

      if (staffId && staffBunkId) {
        const bunk = CAMP_DATA.find(b => b.id === staffBunkId);
        const staff = bunk?.staff.find(s => s.id === staffId);

        if (bunk && staff) {
          setStaffData(staff);
          setBunkData(bunk);
          setIsAuthenticated(true);
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    }
  }, [navigate]);

  const handleStaffLogin = (staffId: string, bunkId: string) => {
    const bunk = CAMP_DATA.find(b => b.id === bunkId);
    const staff = bunk?.staff.find(s => s.id === staffId);
    
    if (bunk && staff) {
      setStaffData(staff);
      setBunkData(bunk);
      setIsAuthenticated(true);
      localStorage.setItem('staffAuthenticated', 'true');
      localStorage.setItem('staffId', staffId);
      localStorage.setItem('staffBunkId', bunkId);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setStaffData(null);
    setBunkData(null);
    localStorage.removeItem('staffAuthenticated');
    localStorage.removeItem('staffId');
    localStorage.removeItem('staffBunkId');
    navigate('/');
  };

  const handleBackToHome = () => {
    setIsAuthenticated(false);
    setStaffData(null);
    setBunkData(null);
    localStorage.removeItem('staffAuthenticated');
    localStorage.removeItem('staffId');
    localStorage.removeItem('staffBunkId');
  };

  const toggleCamperSelection = (camperId: string) => {
    setSelectedCampers(prev => 
      prev.includes(camperId)
        ? prev.filter(id => id !== camperId)
        : [...prev, camperId]
    );
  };

  const handleBulkComplete = (camperIds: string[], missionIds: string[]) => {
    camperIds.forEach(camperId => {
      const currentMissions = MasterData.getCamperWorkingMissions(camperId);
      const updatedMissions = [...new Set([...currentMissions, ...missionIds])];
      MasterData.saveCamperWorkingMissions(camperId, updatedMissions);
    });
    
    setSelectedCampers([]);
    setRefreshKey(prev => prev + 1);
    
    toast({
      title: "Missions Updated",
      description: `Updated missions for ${camperIds.length} campers`,
    });
  };

  const handleViewCamperDetails = (camper: any) => {
    setSelectedCamperForDetails(camper);
    setShowCamperDetails(true);
  };

  if (!isAuthenticated) {
    return <StaffLogin onLogin={handleStaffLogin} onBack={handleBackToHome} />;
  }

  const activeMissions = DEFAULT_MISSIONS.filter(m => m.isActive);
  const camperNames = bunkData.campers.reduce((acc: any, camper: any) => {
    acc[camper.id] = camper.name;
    return acc;
  }, {});

  // Calculate statistics using MasterData
  const allCampersWithStatus = MasterData.getAllCampersWithStatus();
  const bunkCampersWithStatus = allCampersWithStatus.filter(c => c.bunkId === bunkData.id);
  
  const totalCampers = bunkCampersWithStatus.length;
  const qualifiedToday = bunkCampersWithStatus.filter(c => c.isQualified && (c.status === 'approved' || c.status === 'submitted')).length;
  const totalCompletedMissions = bunkCampersWithStatus.reduce((sum, c) => sum + c.missionCount, 0);
  const completionRate = totalCampers > 0 ? Math.round((qualifiedToday / totalCampers) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
              <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
              <p className="text-sm text-green-600">{hebrewDate.hebrew}</p>
              <p className="text-xs text-gray-600">
                {staffData.name} - Bunk {bunkData.displayName}
              </p>
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
              <p className="text-sm text-gray-600">In your bunk</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span>Qualified Today</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{qualifiedToday}</div>
              <p className="text-sm text-gray-600">Out of {totalCampers} campers</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Completion Rate</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
              <p className="text-sm text-gray-600">Bunk average</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Users className="h-5 w-5 text-orange-600" />
                <span>Selected</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{selectedCampers.length}</div>
              <p className="text-sm text-gray-600">Campers selected</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="campers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campers">Camper Management</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Tools</TabsTrigger>
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="campers">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Camper Management - Bunk {bunkData.displayName}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => setShowBulkComplete(true)}
                      disabled={selectedCampers.length === 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Bulk Complete ({selectedCampers.length})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCampers([])}
                      disabled={selectedCampers.length === 0}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bunkCampersWithStatus.map((camper) => {
                    const progressPercentage = activeMissions.length > 0 ? 
                      Math.round((camper.missionCount / activeMissions.length) * 100) : 0;
                    const isSelected = selectedCampers.includes(camper.id);

                    return (
                      <Card 
                        key={camper.id} 
                        className={`border-2 transition-all duration-200 cursor-pointer ${
                          isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleCamperSelection(camper.id)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-gray-900">{camper.name}</h3>
                              <Checkbox
                                checked={isSelected}
                                onChange={() => toggleCamperSelection(camper.id)}
                              />
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold text-green-600">{progressPercentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Completed</span>
                                <span className="font-semibold">{camper.missionCount}/{activeMissions.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                 <span className={`font-semibold ${
                                  camper.status === 'approved' ? 'text-green-600' :
                                  camper.status === 'submitted' ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {camper.status === 'working' ? 'Working' :
                                   camper.status === 'submitted' ? 'Submitted' :
                                   camper.status === 'approved' ? 'Approved' :
                                   'Not Started'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                const fullCamper = bunkData.campers.find((c: any) => c.id === camper.id);
                                handleViewCamperDetails(fullCamper);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <StaffAdvancedFeatures 
              bunkCampers={bunkData.campers} 
              bunkName={bunkData.displayName}
            />
          </TabsContent>

          <TabsContent value="approvals">
            <PendingApprovalsCard bunkCampers={bunkData.campers} />
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle>Bunk Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Daily Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Missions Completed</span>
                        <span className="font-semibold">{totalCompletedMissions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate</span>
                        <span className="font-semibold">{completionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Most Active Camper</span>
                        <span className="font-semibold">
                          {bunkCampersWithStatus.reduce((max, camper) => 
                            camper.missionCount > max.missionCount ? camper : max, 
                            bunkCampersWithStatus[0] || { name: 'None', missionCount: 0 }
                          ).name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Mission Breakdown</h3>
                    <div className="space-y-2">
                      {activeMissions.map(mission => {
                        const completedBy = bunkCampersWithStatus.filter(camper => {
                          const todaySubmission = camper.todaySubmission;
                          return todaySubmission && todaySubmission.missions.includes(mission.id);
                        }).length;
                        const percentage = totalCampers > 0 ? Math.round((completedBy / totalCampers) * 100) : 0;

                        return (
                          <div key={mission.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span>{mission.icon}</span>
                              <span className="text-sm">{mission.title}</span>
                            </div>
                            <span className="text-sm font-semibold">{completedBy}/{totalCampers} ({percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BulkCompleteDialog
        isOpen={showBulkComplete}
        onClose={() => setShowBulkComplete(false)}
        selectedCampers={selectedCampers}
        camperNames={camperNames}
        onBulkComplete={handleBulkComplete}
      />

      <CamperDetailsModal
        isOpen={showCamperDetails}
        onClose={() => setShowCamperDetails(false)}
        camper={selectedCamperForDetails}
        bunkName={bunkData?.displayName || ''}
      />
    </div>
  );
};

export default StaffDashboard;
