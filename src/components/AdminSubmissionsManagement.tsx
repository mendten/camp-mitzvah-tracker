
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle2, XCircle, Clock, Search, Download, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MasterData, CamperSubmission } from '@/utils/masterDataStorage';
import { DEFAULT_MISSIONS } from '@/data/campData';

const AdminSubmissionsManagement = () => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<CamperSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<CamperSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadSubmissions();
  }, [refreshKey]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, statusFilter, dateFilter]);

  const loadSubmissions = () => {
    const allSubmissions = MasterData.getAllSubmissions();
    setSubmissions(allSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()));
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.camperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.camperCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.bunkName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      if (dateFilter === 'today') {
        filtered = filtered.filter(sub => sub.date === today);
      } else if (dateFilter === 'yesterday') {
        filtered = filtered.filter(sub => sub.date === yesterday);
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        filtered = filtered.filter(sub => sub.date >= weekAgo);
      }
    }

    setFilteredSubmissions(filtered);
  };

  const handleApprove = (submissionId: string) => {
    MasterData.approveSubmission(submissionId, 'Admin');
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Submission Approved",
      description: "The submission has been approved successfully.",
    });
  };

  const handleReject = (submissionId: string) => {
    MasterData.rejectSubmission(submissionId, 'Admin');
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Submission Rejected",
      description: "The submission has been rejected.",
    });
  };

  const getMissionTitles = (missionIds: string[]) => {
    return missionIds
      .map(id => DEFAULT_MISSIONS.find(m => m.id === id)?.title)
      .filter(Boolean)
      .join(', ');
  };

  const exportSubmissions = () => {
    const csvData = filteredSubmissions.map(sub => ({
      'Submission ID': sub.id,
      'Camper Code': sub.camperCode,
      'Camper Name': sub.camperName,
      'Bunk': sub.bunkName,
      'Date': sub.date,
      'Status': sub.status,
      'Missions Count': sub.missions.length,
      'Missions': getMissionTitles(sub.missions),
      'Submitted At': new Date(sub.submittedAt).toLocaleString(),
      'Approved At': sub.approvedAt ? new Date(sub.approvedAt).toLocaleString() : '',
      'Edit Reason': sub.editRequestReason || '',
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
    a.download = `submissions-export-${new Date().toISOString().split('T')[0]}.csv`;
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
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>All Submissions Management</span>
          <div className="flex items-center space-x-2">
            <Button onClick={exportSubmissions} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export ({filteredSubmissions.length})
            </Button>
          </div>
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
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="edit_requested">Edit Requested</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center text-sm text-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            {filteredSubmissions.length} submissions
          </div>
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <div className="grid gap-2">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-4 p-3 bg-gray-100 rounded-lg font-semibold text-sm">
                <div>Camper Code</div>
                <div>Name</div>
                <div>Bunk</div>
                <div>Date</div>
                <div>Status</div>
                <div>Missions</div>
                <div>Edit Reason</div>
                <div>Actions</div>
              </div>

              {/* Data Rows */}
              {filteredSubmissions.map((submission) => (
                <div key={submission.id} className="grid grid-cols-8 gap-4 p-3 border rounded-lg hover:bg-gray-50 text-sm">
                  <div className="font-medium text-blue-600">{submission.camperCode}</div>
                  <div className="font-medium">{submission.camperName}</div>
                  <div>{submission.bunkName}</div>
                  <div>{new Date(submission.date).toLocaleDateString()}</div>
                  <div>{getStatusBadge(submission.status)}</div>
                  <div>
                    <div className="font-medium">{submission.missions.length} missions</div>
                    <div className="text-gray-500 truncate max-w-32" title={getMissionTitles(submission.missions)}>
                      {getMissionTitles(submission.missions)}
                    </div>
                  </div>
                  <div className="text-gray-500 truncate max-w-32" title={submission.editRequestReason}>
                    {submission.editRequestReason || '-'}
                  </div>
                  <div className="flex space-x-1">
                    {(submission.status === 'submitted' || submission.status === 'edit_requested') && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(submission.id)}
                          className="bg-green-600 hover:bg-green-700 px-2 py-1 text-xs"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(submission.id)}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 px-2 py-1 text-xs"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {submission.status === 'approved' && (
                      <Badge className="bg-green-100 text-green-800 text-xs">✓ Done</Badge>
                    )}
                    {submission.status === 'rejected' && (
                      <Badge className="bg-red-100 text-red-800 text-xs">✗ Rejected</Badge>
                    )}
                  </div>
                </div>
              ))}

              {filteredSubmissions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No submissions found matching your filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSubmissionsManagement;
