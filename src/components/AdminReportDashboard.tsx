
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Trophy, Calendar, Download, Search, Filter } from 'lucide-react';
import { MasterData } from '@/utils/masterDataStorage';
import { DEFAULT_MISSIONS } from '@/data/campData';

const AdminReportDashboard = () => {
  const [camperData, setCamperData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bunkFilter, setBunkFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadCamperData();
  }, [refreshKey]);

  useEffect(() => {
    filterData();
  }, [camperData, searchTerm, statusFilter, bunkFilter]);

  const loadCamperData = () => {
    const allCampers = MasterData.getAllCampersWithStatus();
    setCamperData(allCampers);
  };

  const filterData = () => {
    let filtered = [...camperData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(camper => 
        camper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camper.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camper.bunkName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(camper => camper.status === statusFilter);
    }

    // Bunk filter
    if (bunkFilter !== 'all') {
      filtered = filtered.filter(camper => camper.bunkName === bunkFilter);
    }

    setFilteredData(filtered);
  };

  const exportData = () => {
    const csvData = filteredData.map(camper => ({
      'Camper Code': camper.code,
      'Camper Name': camper.name,
      'Bunk': camper.bunkName,
      'Status': camper.status,
      'Missions Completed': camper.missionCount,
      'Qualified': camper.isQualified ? 'Yes' : 'No',
      'Submission Date': camper.todaySubmission?.submittedAt ? new Date(camper.todaySubmission.submittedAt).toLocaleDateString() : '',
      'Working Missions': camper.workingMissions.length
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `camper-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'edit_requested':
        return <Badge className="bg-yellow-100 text-yellow-800">Edit Requested</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'working':
        return <Badge className="bg-gray-100 text-gray-800">Working</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const uniqueBunks = [...new Set(camperData.map(c => c.bunkName))];
  const dailyRequired = MasterData.getDailyRequired();
  
  // Calculate statistics
  const totalCampers = camperData.length;
  const qualifiedCampers = camperData.filter(c => c.isQualified).length;
  const submittedCampers = camperData.filter(c => c.status === 'submitted' || c.status === 'approved').length;
  const approvedCampers = camperData.filter(c => c.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
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
            <p className="text-sm text-gray-600">All registered campers</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <span>Qualified</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{qualifiedCampers}</div>
            <p className="text-sm text-gray-600">{dailyRequired}+ missions completed</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Submitted</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{submittedCampers}</div>
            <p className="text-sm text-gray-600">Daily submissions</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-green-600" />
              <span>Approved</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{approvedCampers}</div>
            <p className="text-sm text-gray-600">Staff approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Campers Report</span>
            <Button onClick={exportData} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export ({filteredData.length})
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="working">Working</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="edit_requested">Edit Requested</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={bunkFilter} onValueChange={setBunkFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by bunk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Bunks</SelectItem>
                {uniqueBunks.map(bunk => (
                  <SelectItem key={bunk} value={bunk}>{bunk}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="h-4 w-4 mr-2" />
              {filteredData.length} campers
            </div>
          </div>

          {/* Campers Table */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid gap-2">
                {/* Header Row */}
                <div className="grid grid-cols-7 gap-4 p-3 bg-gray-100 rounded-lg font-semibold text-sm">
                  <div>Camper Code</div>
                  <div>Name</div>
                  <div>Bunk</div>
                  <div>Status</div>
                  <div>Missions</div>
                  <div>Qualified</div>
                  <div>Working</div>
                </div>

                {/* Data Rows */}
                {filteredData.map((camper) => (
                  <div key={camper.id} className="grid grid-cols-7 gap-4 p-3 border rounded-lg hover:bg-gray-50 text-sm">
                    <div className="font-medium text-blue-600">{camper.code}</div>
                    <div className="font-medium">{camper.name}</div>
                    <div>{camper.bunkName}</div>
                    <div>{getStatusBadge(camper.status)}</div>
                    <div>
                      <span className="font-medium">{camper.missionCount}</span>
                      <span className="text-gray-500">/{DEFAULT_MISSIONS.filter(m => m.isActive).length}</span>
                    </div>
                    <div>
                      {camper.isQualified ? (
                        <Badge className="bg-green-100 text-green-800">✓ Yes</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">✗ No</Badge>
                      )}
                    </div>
                    <div className="text-gray-600">{camper.workingMissions.length}</div>
                  </div>
                ))}

                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No campers found matching your filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReportDashboard;
