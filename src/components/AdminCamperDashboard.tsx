import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Download, Search, Filter, Settings, Calendar, AlertTriangle } from 'lucide-react';
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import { getCamperCode } from '@/utils/camperCodes';
import { DataStorage } from '@/utils/dataStorage';
import CamperEditDialog from './CamperEditDialog';
import StaffManagement from './StaffManagement';
import PublicDashboard from './PublicDashboard';
import SessionCalendarSetup from './SessionCalendarSetup';
import { useToast } from '@/hooks/use-toast';

const AdminCamperDashboard = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBunk, setSelectedBunk] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCamper, setSelectedCamper] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [dailyRequired, setDailyRequired] = useState(3);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('mission_daily_required');
    if (saved) {
      setDailyRequired(parseInt(saved));
    }
  }, []);

  const updateDailyRequired = (value: number) => {
    setDailyRequired(value);
    localStorage.setItem('mission_daily_required', value.toString());
    toast({
      title: "Settings Updated",
      description: `Daily required missions set to ${value}`,
    });
  };

  const getBunkPerformance = (bunkId: string) => {
    const bunk = CAMP_DATA.find(b => b.id === bunkId);
    if (!bunk) return { percentage: 0, status: 'needs-attention' };
    
    const qualifiedCampers = bunk.campers.filter(camper => {
      const status = DataStorage.getCamperTodayStatus(camper.id);
      return status.qualified && (status.status === 'approved' || status.status === 'pending');
    }).length;
    
    const percentage = bunk.campers.length > 0 ? Math.round((qualifiedCampers / bunk.campers.length) * 100) : 0;
    
    let status: string;
    if (percentage >= 90) status = 'excellent';
    else if (percentage >= 75) status = 'good';
    else if (percentage >= 50) status = 'average';
    else status = 'needs-attention';
    
    return { percentage, status };
  };

  // Get all campers from all bunks with their codes and proper status
  const getAllCampers = () => {
    console.log('Getting all campers from CAMP_DATA:', CAMP_DATA);
    const allCampers = CAMP_DATA.flatMap(bunk => 
      bunk.campers.map(camper => {
        console.log('Processing camper:', camper.name, 'from bunk:', bunk.displayName);
        const camperStatus = DataStorage.getCamperTodayStatus(camper.id);
        return {
          ...camper,
          bunk: bunk.displayName,
          bunkId: bunk.id,
          code: getCamperCode(camper.id),
          todayStatus: camperStatus.status,
          qualified: camperStatus.qualified,
          submittedCount: camperStatus.submittedCount
        };
      })
    );
    console.log('Total campers found:', allCampers.length);
    return allCampers;
  };

  const getCamperStats = (camperId: string) => {
    const todayStatus = DataStorage.getCamperTodayStatus(camperId);
    const activeMissions = DEFAULT_MISSIONS.filter(m => m.isActive);
    const history = DataStorage.getSubmissionHistory(camperId);
    const approvedCount = history.filter(h => h.status === 'approved').length;
    
    const progressPercentage = activeMissions.length > 0 ? 
      Math.round((todayStatus.submittedCount / activeMissions.length) * 100) : 0;
    
    return {
      todayStatus: todayStatus.status,
      submittedMissions: todayStatus.submittedCount,
      totalMissions: activeMissions.length,
      todayQualified: todayStatus.qualified,
      weekTotal: approvedCount, // For now, same as total approved
      sessionTotal: approvedCount,
      dailyRequired: DataStorage.getDailyRequired(),
      progressPercentage
    };
  };

  const filteredCampers = getAllCampers().filter(camper => {
    const matchesSearch = camper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camper.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camper.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBunk = selectedBunk === 'all' || camper.bunkId === selectedBunk;
    
    if (!matchesSearch || !matchesBunk) return false;
    
    if (filterStatus === 'all') return true;
    
    if (filterStatus === 'approved') return camper.todayStatus === 'approved';
    if (filterStatus === 'pending') return camper.todayStatus === 'pending';
    if (filterStatus === 'not_submitted') return camper.todayStatus === 'not_submitted';
    if (filterStatus === 'edit_requested') return camper.todayStatus === 'edit_requested';
    
    return true;
  });

  const handleEditCamper = (camper: any) => {
    setSelectedCamper(camper);
    setShowEditDialog(true);
  };

  const handleSaveCamper = (updatedCamper: any) => {
    console.log('Saving camper:', updatedCamper);
    setRefreshKey(prev => prev + 1);
  };

  const handleApproveSubmission = (camperId: string) => {
    DataStorage.approveSubmission(camperId);
    setRefreshKey(prev => prev + 1);
    
    toast({
      title: "Submission Approved",
      description: "Camper's daily submission has been approved",
    });
  };

  const exportAllData = () => {
    const allData = filteredCampers.map(camper => {
      const stats = getCamperStats(camper.id);
      return {
        Name: camper.name,
        Code: camper.code,
        ID: camper.id,
        Bunk: camper.bunk,
        'Today Status': stats.todayStatus,
        'Today Qualified': stats.todayQualified ? 'Yes' : 'No',
        'Submitted Today': stats.submittedMissions,
        'Week Total': stats.weekTotal,
        'Session Total': stats.sessionTotal,
        'Progress %': stats.progressPercentage
      };
    });
    
    const headers = Object.keys(allData[0] || {});
    const csvContent = [
      headers.join(','),
      ...allData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camp-data-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string, qualified: boolean) => {
    switch (status) {
      case 'approved':
        return 'border-green-500 bg-green-50';
      case 'pending':
        return 'border-yellow-500 bg-yellow-50';
      case 'edit_requested':
        return 'border-blue-500 bg-blue-50';
      case 'not_submitted':
        return qualified ? 'border-gray-300 bg-gray-50' : 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-6 w-6 text-green-600" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'edit_requested':
        return <Clock className="h-6 w-6 text-blue-600" />;
      case 'not_submitted':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <XCircle className="h-6 w-6 text-gray-400" />;
    }
  };

  console.log('Rendering with filtered campers:', filteredCampers.length);

  return (
    <div className="space-y-6" key={refreshKey}>
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Complete Admin Dashboard</span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-blue-50 p-2 rounded-lg">
                <Settings className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Daily Required:</span>
                <Select value={dailyRequired.toString()} onValueChange={(value) => updateDailyRequired(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={exportAllData} size="sm" className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all-campers" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all-campers">All Campers ({getAllCampers().length})</TabsTrigger>
              <TabsTrigger value="by-bunks">By Bunks</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="staff-management">Staff</TabsTrigger>
              <TabsTrigger value="public-dashboard">Dashboard</TabsTrigger>
            </TabsList>

            <TabsContent value="all-campers">
              <div className="space-y-4">
                {/* Filters */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search campers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedBunk} onValueChange={setSelectedBunk}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by bunk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Bunks</SelectItem>
                      {CAMP_DATA.map(bunk => (
                        <SelectItem key={bunk.id} value={bunk.id}>Bunk {bunk.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved (Green)</SelectItem>
                      <SelectItem value="pending">Pending (Yellow)</SelectItem>
                      <SelectItem value="edit_requested">Edit Requested (Blue)</SelectItem>
                      <SelectItem value="not_submitted">Not Submitted (Red)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    {filteredCampers.length} campers
                  </div>
                </div>

                {/* Status Legend */}
                <Card className="border-2 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Approved</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>Pending Approval</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>Edit Requested</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Not Submitted</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Campers Grid */}
                <div className="grid gap-4">
                  {filteredCampers.map(camper => {
                    const stats = getCamperStats(camper.id);
                    return (
                      <Card key={camper.id} className={`border-2 hover:shadow-lg transition-all ${getStatusColor(stats.todayStatus, stats.todayQualified)}`}>
                        <CardContent className="p-4">
                          <div className="grid md:grid-cols-8 gap-4 items-center">
                            <div className="md:col-span-2">
                              <h3 className="font-semibold text-lg">{camper.name}</h3>
                              <p className="text-sm text-gray-600">Code: {camper.code}</p>
                              <Badge variant="outline">Bunk {camper.bunk}</Badge>
                            </div>
                            
                            <div className="text-center">
                              {getStatusIcon(stats.todayStatus)}
                              <p className="text-xs text-gray-600 mt-1">Status</p>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{stats.submittedMissions}</div>
                              <p className="text-xs text-gray-600">Today</p>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">{stats.weekTotal}</div>
                              <p className="text-xs text-gray-600">Week</p>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-orange-600">{stats.progressPercentage}%</div>
                              <p className="text-xs text-gray-600">Progress</p>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${stats.progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              {stats.todayStatus === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveSubmission(camper.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Approve
                                </Button>
                              )}
                              {stats.todayStatus === 'approved' && (
                                <span className="text-green-600 font-semibold">✓ Approved</span>
                              )}
                              {stats.todayStatus === 'edit_requested' && (
                                <span className="text-blue-600 font-semibold">Edit Request</span>
                              )}
                              {stats.todayStatus === 'not_submitted' && (
                                <span className="text-red-600 font-semibold">Not Submitted</span>
                              )}
                            </div>
                            
                            <div className="text-center">
                              <Button 
                                size="sm" 
                                onClick={() => handleEditCamper(camper)}
                                variant="outline"
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="by-bunks">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {CAMP_DATA.map(bunk => {
                    const performance = getBunkPerformance(bunk.id);
                    const statusColors = {
                      excellent: 'border-green-500 bg-green-50',
                      good: 'border-blue-500 bg-blue-50',
                      average: 'border-yellow-500 bg-yellow-50',
                      'needs-attention': 'border-red-500 bg-red-50'
                    };
                    
                    return (
                      <Card key={bunk.id} className={`border-2 ${statusColors[performance.status as keyof typeof statusColors]}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Bunk {bunk.displayName}</CardTitle>
                          <div className="flex items-center space-x-2">
                            {performance.status === 'excellent' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                            {performance.status === 'needs-attention' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                            <span className="text-sm font-semibold">{performance.percentage}% Qualified</span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Total Campers:</span>
                              <span className="font-semibold">{bunk.campers.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Qualified Today:</span>
                              <span className="font-semibold">
                                {bunk.campers.filter(camper => getCamperStats(camper.id).todayQualified).length}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${performance.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sessions">
              <SessionCalendarSetup />
            </TabsContent>

            <TabsContent value="staff-management">
              <StaffManagement />
            </TabsContent>

            <TabsContent value="public-dashboard">
              <PublicDashboard />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CamperEditDialog
        isOpen={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        camper={selectedCamper}
        onSave={handleSaveCamper}
      />
    </div>
  );
};

export default AdminCamperDashboard;
