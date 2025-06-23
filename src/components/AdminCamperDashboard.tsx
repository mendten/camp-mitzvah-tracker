import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle, Download, Search, Filter, Calendar } from 'lucide-react';
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import { getCamperCode } from '@/utils/camperCodes';
import CamperEditDialog from './CamperEditDialog';
import StaffManagement from './StaffManagement';
import PublicDashboard from './PublicDashboard';

const AdminCamperDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBunk, setSelectedBunk] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCamper, setSelectedCamper] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentSession, setCurrentSession] = useState(0);
  const [showSessionPicker, setShowSessionPicker] = useState(false);

  // Get all campers from all bunks with their codes
  const getAllCampers = () => {
    return CAMP_DATA.flatMap(bunk => 
      bunk.campers.map(camper => ({
        ...camper,
        bunk: bunk.displayName,
        bunkId: bunk.id,
        code: getCamperCode(camper.id)
      }))
    );
  };

  const getCamperStats = (camperId: string) => {
    const progress = localStorage.getItem(`camper_${camperId}_missions`);
    const submitted = localStorage.getItem(`camper_${camperId}_submitted`);
    const approved = localStorage.getItem(`camper_${camperId}_approved`);
    
    const completedMissions = progress ? JSON.parse(progress) : [];
    const submittedMissions = submitted ? JSON.parse(submitted) : [];
    const approvedMissions = approved ? JSON.parse(approved) : [];
    
    const activeMissions = DEFAULT_MISSIONS.filter(m => m.isActive);
    const mandatoryMissions = activeMissions.filter(m => m.isMandatory);
    
    const dailyRequired = parseInt(localStorage.getItem('mission_daily_required') || '3');
    
    const completedMandatory = mandatoryMissions.filter(m => 
      approvedMissions.includes(m.id)
    ).length;
    
    const todayQualified = approvedMissions.length >= dailyRequired;
    const weekTotal = approvedMissions.length;
    const sessionTotal = approvedMissions.length;
    
    return {
      completedMissions: completedMissions.length,
      submittedMissions: submittedMissions.length,
      approvedMissions: approvedMissions.length,
      totalMissions: activeMissions.length,
      mandatoryCompleted: completedMandatory,
      mandatoryTotal: mandatoryMissions.length,
      todayQualified,
      weekTotal,
      sessionTotal,
      dailyRequired,
      progressPercentage: Math.round((approvedMissions.length / activeMissions.length) * 100)
    };
  };

  const filteredCampers = getAllCampers().filter(camper => {
    const matchesSearch = camper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camper.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         camper.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBunk = selectedBunk === 'all' || camper.bunkId === selectedBunk;
    
    if (!matchesSearch || !matchesBunk) return false;
    
    if (filterStatus === 'all') return true;
    
    const stats = getCamperStats(camper.id);
    if (filterStatus === 'qualified') return stats.todayQualified;
    if (filterStatus === 'unqualified') return !stats.todayQualified;
    if (filterStatus === 'complete') return stats.progressPercentage === 100;
    if (filterStatus === 'incomplete') return stats.progressPercentage < 100;
    
    return true;
  });

  const handleEditCamper = (camper: any) => {
    setSelectedCamper(camper);
    setShowEditDialog(true);
  };

  const handleSaveCamper = (updatedCamper: any) => {
    console.log('Saving camper:', updatedCamper);
  };

  const handleMissionToggle = (camperId: string, missionId: string) => {
    const approved = JSON.parse(localStorage.getItem(`camper_${camperId}_approved`) || '[]');
    const newApproved = approved.includes(missionId) 
      ? approved.filter((id: string) => id !== missionId)
      : [...approved, missionId];
    
    localStorage.setItem(`camper_${camperId}_approved`, JSON.stringify(newApproved));
    // Force re-render by updating a state
    setCurrentSession(prev => prev);
  };

  const exportAllData = () => {
    const allData = filteredCampers.map(camper => {
      const stats = getCamperStats(camper.id);
      return {
        Name: camper.name,
        Code: camper.code,
        ID: camper.id,
        Bunk: camper.bunk,
        'Today Qualified': stats.todayQualified ? 'Yes' : 'No',
        'Week Total': stats.weekTotal,
        'Session Total': stats.sessionTotal,
        'Approved Missions': stats.approvedMissions,
        'Mandatory Completed': `${stats.mandatoryCompleted}/${stats.mandatoryTotal}`,
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
    a.download = `camp-data-session-${currentSession}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getBunkPerformance = (bunkId: string) => {
    const bunk = CAMP_DATA.find(b => b.id === bunkId);
    if (!bunk) return { status: 'unknown', percentage: 0 };
    
    const camperStats = bunk.campers.map(camper => getCamperStats(camper.id));
    const qualifiedCount = camperStats.filter(stats => stats.todayQualified).length;
    const percentage = Math.round((qualifiedCount / bunk.campers.length) * 100);
    
    if (percentage >= 90) return { status: 'excellent', percentage };
    if (percentage >= 75) return { status: 'good', percentage };
    if (percentage >= 50) return { status: 'average', percentage };
    return { status: 'needs-attention', percentage };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Complete Admin Dashboard</span>
            <div className="flex items-center space-x-2">
              <Button onClick={exportAllData} size="sm" className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export All Data
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all-campers" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all-campers">All Campers</TabsTrigger>
              <TabsTrigger value="by-bunks">By Bunks</TabsTrigger>
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
                      <SelectItem value="qualified">Today Qualified</SelectItem>
                      <SelectItem value="unqualified">Not Qualified</SelectItem>
                      <SelectItem value="complete">100% Complete</SelectItem>
                      <SelectItem value="incomplete">Incomplete</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    {filteredCampers.length} campers
                  </div>
                </div>

                {/* Campers Grid */}
                <div className="grid gap-4">
                  {filteredCampers.map(camper => {
                    const stats = getCamperStats(camper.id);
                    return (
                      <Card key={camper.id} className="border-2 hover:shadow-lg transition-all">
                        <CardContent className="p-4">
                          <div className="grid md:grid-cols-9 gap-4 items-center">
                            <div className="md:col-span-2">
                              <h3 className="font-semibold text-lg">{camper.name}</h3>
                              <p className="text-sm text-gray-600">Code: {camper.code}</p>
                              <Badge variant="outline">Bunk {camper.bunk}</Badge>
                            </div>
                            
                            <div className="text-center">
                              <div className={`text-lg font-bold ${stats.todayQualified ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.todayQualified ? <CheckCircle2 className="h-6 w-6 mx-auto" /> : <XCircle className="h-6 w-6 mx-auto" />}
                              </div>
                              <p className="text-xs text-gray-600">Qualified</p>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{stats.approvedMissions}</div>
                              <p className="text-xs text-gray-600">Approved</p>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-purple-600">{stats.submittedMissions}</div>
                              <p className="text-xs text-gray-600">Submitted</p>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                {stats.mandatoryCompleted}/{stats.mandatoryTotal}
                              </div>
                              <p className="text-xs text-gray-600">Mandatory</p>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-lg font-bold text-orange-600">{stats.progressPercentage}%</div>
                              <p className="text-xs text-gray-600">Progress</p>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-orange-500 h-2 rounded-full"
                                  style={{ width: `${stats.progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="flex flex-col space-y-1">
                                {DEFAULT_MISSIONS.filter(m => m.isActive).slice(0, 3).map(mission => {
                                  const isApproved = JSON.parse(localStorage.getItem(`camper_${camper.id}_approved`) || '[]').includes(mission.id);
                                  return (
                                    <Button
                                      key={mission.id}
                                      size="sm"
                                      variant={isApproved ? "default" : "outline"}
                                      onClick={() => handleMissionToggle(camper.id, mission.id)}
                                      className="text-xs px-2 py-1"
                                    >
                                      {mission.title.slice(0, 10)}...
                                    </Button>
                                  );
                                })}
                              </div>
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
