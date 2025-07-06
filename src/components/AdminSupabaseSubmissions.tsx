import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, RefreshCw } from 'lucide-react';
import { supabaseService, CamperSubmission } from '@/services/supabaseService';
import { DEFAULT_MISSIONS } from '@/data/campData';

const AdminSupabaseSubmissions = () => {
  const [submissions, setSubmissions] = useState<CamperSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<CamperSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    loadSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchTerm, statusFilter, dateFilter]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getAllSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.camperName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.camperCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.bunkName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(s => s.date === today);
          break;
        case 'yesterday':
          filtered = filtered.filter(s => s.date === yesterday);
          break;
        case 'week':
          filtered = filtered.filter(s => s.date >= weekAgo);
          break;
      }
    }

    setFilteredSubmissions(filtered);
  };

  const getMissionTitles = (missionIds: string[]) => {
    return missionIds
      .map(id => DEFAULT_MISSIONS.find(m => m.id === id)?.title)
      .filter(Boolean)
      .join(', ');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800">Submitted</Badge>;
      case 'edit_requested':
        return <Badge className="bg-blue-100 text-blue-800">Edit Requested</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const exportData = () => {
    const csvData = filteredSubmissions.map(s => ({
      'Camper Name': s.camperName,
      'Camper Code': s.camperCode,
      'Bunk': s.bunkName,
      'Date': s.date,
      'Missions Count': s.missions.length,
      'Missions': getMissionTitles(s.missions),
      'Status': s.status,
      'Submitted At': new Date(s.submittedAt).toLocaleString(),
      'Approved At': s.approvedAt ? new Date(s.approvedAt).toLocaleString() : '',
      'Approved By': s.approvedBy || '',
      'Rejected At': s.rejectedAt ? new Date(s.rejectedAt).toLocaleString() : '',
      'Edit Reason': s.editRequestReason || ''
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
    a.download = `supabase-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Direct Supabase Submissions</span>
          <div className="flex items-center space-x-2">
            <Button onClick={loadSubmissions} size="sm" variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportData} size="sm" className="bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
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
              <SelectItem value="week">Past Week</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-600 flex items-center">
            Results: {filteredSubmissions.length} of {submissions.length}
          </div>
        </div>

        {/* Submissions Table */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading submissions from Supabase...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Camper</TableHead>
                  <TableHead>Bunk</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Missions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{submission.camperName}</div>
                        <div className="text-sm text-gray-500">{submission.camperCode}</div>
                      </div>
                    </TableCell>
                    <TableCell>{submission.bunkName}</TableCell>
                    <TableCell>
                      {new Date(submission.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{submission.missions.length} missions</div>
                        <div className="text-xs text-gray-500 max-w-xs truncate">
                          {getMissionTitles(submission.missions)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(submission.submittedAt).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        {submission.approvedAt && (
                          <div className="text-green-600">
                            Approved: {new Date(submission.approvedAt).toLocaleDateString()}
                          </div>
                        )}
                        {submission.rejectedAt && (
                          <div className="text-red-600">
                            Rejected: {new Date(submission.rejectedAt).toLocaleDateString()}
                          </div>
                        )}
                        {submission.editRequestReason && (
                          <div className="text-blue-600">
                            Edit: {submission.editRequestReason}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredSubmissions.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <p>No submissions found matching your filters</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminSupabaseSubmissions;