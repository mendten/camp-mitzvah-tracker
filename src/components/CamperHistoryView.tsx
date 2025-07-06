import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { MasterData, CamperSubmission } from '@/utils/masterDataStorage';
import { DEFAULT_MISSIONS } from '@/data/campData';

interface CamperHistoryViewProps {
  camperId: string;
}

const CamperHistoryView: React.FC<CamperHistoryViewProps> = ({ camperId }) => {
  const [submissions, setSubmissions] = useState<CamperSubmission[]>([]);

  useEffect(() => {
    loadSubmissions();
  }, [camperId]);

  const loadSubmissions = async () => {
    try {
      const allSubmissions = await MasterData.getAllSubmissions();
      const camperSubmissions = allSubmissions
        .filter(s => s.camperId === camperId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSubmissions(camperSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const getMissionTitles = (missionIds: string[]) => {
    return missionIds
      .map(id => DEFAULT_MISSIONS.find(m => m.id === id)?.title)
      .filter(Boolean);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800">Submitted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span>Mission History</span>
        </CardTitle>
        <p className="text-gray-600">All your past submissions from Supabase</p>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No submissions yet</p>
            <p className="text-sm">Complete and submit missions to see your history here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {new Date(submission.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Submitted at: {new Date(submission.submittedAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })} on {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                    {submission.approvedAt && (
                      <p className="text-sm text-green-600">
                        Approved at: {new Date(submission.approvedAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })} on {new Date(submission.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                    {submission.rejectedAt && (
                      <p className="text-sm text-red-600">
                        Rejected at: {new Date(submission.rejectedAt).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })} on {new Date(submission.rejectedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(submission.status)}
                    {getStatusBadge(submission.status)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Missions Completed: {submission.missions.length}
                    </span>
                    <span className="text-xs text-gray-500">
                      Required: {3} {/* Default daily required */}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {getMissionTitles(submission.missions).map((title, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>{title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {submission.editRequestReason && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-700">
                      <strong>Edit Request:</strong> {submission.editRequestReason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CamperHistoryView;