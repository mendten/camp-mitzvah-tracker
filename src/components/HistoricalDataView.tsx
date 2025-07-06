import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, CheckCircle, Clock, Download } from 'lucide-react';
import { MasterData, CamperSubmission } from '@/utils/masterDataStorage';
import { DEFAULT_MISSIONS } from '@/data/campData';

const HistoricalDataView = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [submissions, setSubmissions] = useState<CamperSubmission[]>([]);
  const [totalCampers, setTotalCampers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateStats, setDateStats] = useState({
    totalCampers: 0,
    totalSubmissions: 0,
    approved: 0,
    qualified: 0
  });

  useEffect(() => {
    loadDataForDate();
  }, [selectedDate]);

  const loadDataForDate = async () => {
    setLoading(true);
    try {
      const allSubmissions = await MasterData.getAllSubmissions();
      const dateSubmissions = allSubmissions.filter(s => s.date === selectedDate);
      setSubmissions(dateSubmissions.sort((a, b) => a.camperName.localeCompare(b.camperName)));

      const allCampers = await MasterData.getAllCamperProfiles();
      const totalCampersCount = allCampers.length;
      setTotalCampers(totalCampersCount);
      
      const dailyRequired = MasterData.getDailyRequired();
      const approved = dateSubmissions.filter(s => s.status === 'approved');
      const qualified = approved.filter(s => s.missions.length >= dailyRequired);

      setDateStats({
        totalCampers: totalCampersCount,
        totalSubmissions: dateSubmissions.length,
        approved: approved.length,
        qualified: qualified.length
      });
    } catch (error) {
      console.error('Error loading historical data:', error);
    } finally {
      setLoading(false);
    }
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
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'edit_requested':
        return <Badge className="bg-yellow-100 text-yellow-800">Edit Requested</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const exportDateData = () => {
    const csvData = submissions.map(sub => ({
      'Date': sub.date,
      'Camper Code': sub.camperCode,
      'Camper Name': sub.camperName,
      'Bunk': sub.bunkName,
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
    a.download = `submissions-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span>Historical Data View</span>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <Button onClick={exportDateData} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading historical data...</p>
          </div>
        ) : (
          <>
            {/* Date Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{dateStats.totalSubmissions}</div>
                <div className="text-sm text-blue-800">Total Submissions</div>
                <div className="text-xs text-gray-600">of {dateStats.totalCampers} campers</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{dateStats.approved}</div>
                <div className="text-sm text-green-800">Approved</div>
                <div className="text-xs text-gray-600">{Math.round((dateStats.approved / Math.max(dateStats.totalSubmissions, 1)) * 100)}% rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{dateStats.qualified}</div>
                <div className="text-sm text-purple-800">Qualified</div>
                <div className="text-xs text-gray-600">{Math.round((dateStats.qualified / Math.max(dateStats.totalCampers, 1)) * 100)}% rate</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{MasterData.getDailyRequired()}</div>
                <div className="text-sm text-orange-800">Daily Requirement</div>
                <div className="text-xs text-gray-600">missions needed</div>
              </div>
            </div>

            {/* Submissions Table */}
            <div className="overflow-x-auto">
              {submissions.length > 0 ? (
                <div className="min-w-full">
                  <div className="grid gap-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-6 gap-4 p-3 bg-gray-100 rounded-lg font-semibold text-sm">
                      <div>Camper</div>
                      <div>Bunk</div>
                      <div>Status</div>
                      <div>Missions</div>
                      <div>Submitted</div>
                      <div>Edit Reason</div>
                    </div>

                    {/* Data Rows */}
                    {submissions.map((submission) => (
                      <div key={submission.id} className="grid grid-cols-6 gap-4 p-3 border rounded-lg hover:bg-gray-50 text-sm">
                        <div>
                          <div className="font-medium">{submission.camperName}</div>
                          <div className="text-gray-500 text-xs">{submission.camperCode}</div>
                        </div>
                        <div>{submission.bunkName}</div>
                        <div>{getStatusBadge(submission.status)}</div>
                        <div>
                          <div className="font-medium">{submission.missions.length} missions</div>
                          <div className="text-gray-500 truncate max-w-32" title={getMissionTitles(submission.missions)}>
                            {getMissionTitles(submission.missions)}
                          </div>
                        </div>
                        <div className="text-gray-500">
                          {new Date(submission.submittedAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs">{new Date(submission.submittedAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-gray-500 truncate max-w-32" title={submission.editRequestReason}>
                          {submission.editRequestReason || '-'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No submissions found for {new Date(selectedDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalDataView;