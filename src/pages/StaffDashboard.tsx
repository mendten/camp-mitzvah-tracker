import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, CheckCircle2, Calendar, Eye, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import { DataStorage } from '@/utils/dataStorage';
import StaffLogin from '@/components/StaffLogin';
import BulkCompleteDialog from '@/components/BulkCompleteDialog';
import CamperDetailsModal from '@/components/CamperDetailsModal';
import PendingApprovalsCard from '@/components/PendingApprovalsCard';
import CamperCalendar from '@/components/CamperCalendar';
import { getCurrentHebrewDate, getSessionInfo } from '@/utils/hebrewDate';

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
      // Use new data system to update missions
      const currentMissions = DataStorage.getCamperTodayMissions(camperId);
      const updatedMissions = [...new Set([...currentMissions, ...missionIds])];
      DataStorage.setCamperTodayMissions(camperId, updatedMissions);
    });
    
    setSelectedCampers([]);
    
    toast({
      title: "Missions Updated",
      description: `Updated missions for ${camperIds.length} campers`,
    });
  };

  const handleViewCamperDetails = (camper: any) => {
    setSelectedCamperForDetails(camper);
    setShowCamperDetails(true);
  };

  const editCamperProgress = (camperId: string, missionId: string, completed: boolean) => {
    const existingProgress = localStorage.getItem(`camper_${camperId}_missions`);
    const currentCompleted = existingProgress ? new Set(JSON.parse(existingProgress)) : new Set();
    
    if (completed) {
      currentCompleted.add(missionId);
    } else {
      currentCompleted.delete(missionId);
    }
    
    localStorage.setItem(`camper_${camperId}_missions`, JSON.stringify([...currentCompleted]));
    
    toast({
      title: "Progress Updated",
      description: `Mission ${completed ? 'completed' : 'uncompleted'} for camper`,
    });
  };

  if (!isAuthenticated) {
    return <StaffLogin onLogin={handleStaffLogin} onBack={handleBackToHome} />;
  }

  const activeMissions = DEFAULT_MISSIONS.filter(m => m.isActive);
  const camperNames = bunkData.campers.reduce((acc: any, camper: any) => {
    acc[camper.id] = camper.name;
    return acc;
  }, {});

  // Calculate statistics using new data system
  const totalCampers = bunkData.campers.length;
  const dailyRequired = DataStorage.getDailyRequired();
  
  let qualifiedToday = 0;
  let totalCompletedMissions = 0;
  
  bunkData.campers.forEach((camper: any) => {
    const status = DataStorage.getCamperTodayStatus(camper.id);
    if (status.qualified && (status.status === 'approved' || status.status === 'pending')) {
      qualifiedToday++;
    }
    totalCompletedMissions += status.submittedCount;
  });

  const completionRate = totalCampers > 0 ? Math.round((qualifiedToday / totalCampers) * 100) : 0;
  const completedMissionsToday = totalCompletedMissions;

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
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
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
                  {bunkData.campers.map((camper: any) => {
                    const status = DataStorage.getCamperTodayStatus(camper.id);
                    const progressPercentage = activeMissions.length > 0 ? 
                      Math.round((status.submittedCount / activeMissions.length) * 100) : 0;
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
                                <span className="font-semibold">{status.submittedCount}/{activeMissions.length}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className={`font-semibold ${
                                  status.status === 'approved' ? 'text-green-600' :
                                  status.status === 'pending' ? 'text-yellow-600' :
                                  status.status === 'edit_requested' ? 'text-blue-600' :
                                  'text-red-600'
                                }`}>
                                  {status.status === 'not_submitted' ? 'Not Submitted' :
                                   status.status === 'pending' ? 'Pending' :
                                   status.status === 'edit_requested' ? 'Edit Requested' :
                                   'Approved'}
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
                                handleViewCamperDetails(camper);
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

          <TabsContent value="approvals">
            <PendingApprovalsCard bunkCampers={bunkData.campers} />
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle>Staff Calendar View</CardTitle>
              </CardHeader>
              <CardContent>
                <CamperCalendar 
                  completedMissions={new Set()} 
                  missions={activeMissions} 
                  camperId="staff" 
                />
              </CardContent>
            </Card>
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
                        <span className="font-semibold">{completedMissionsToday}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completion Rate</span>
                        <span className="font-semibold">{completionRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Most Active Camper</span>
                        <span className="font-semibold">
                          {bunkData.campers.reduce((max: any, camper: any) => {
                            const maxStatus = DataStorage.getCamperTodayStatus(max.id);
                            const camperStatus = DataStorage.getCamperTodayStatus(camper.id);
                            return camperStatus.submittedCount > maxStatus.submittedCount ? camper : max;
                          }).name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Mission Breakdown</h3>
                    <div className="space-y-2">
                      {activeMissions.map(mission => {
                        const completedBy = bunkData.campers.filter((camper: any) => {
                          const todayMissions = DataStorage.getCamperTodayMissions(camper.id);
                          return todayMissions.includes(mission.id);
                        }).length;
                        const percentage = Math.round((completedBy / totalCampers) * 100);

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
