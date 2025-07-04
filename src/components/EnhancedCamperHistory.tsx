import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle2, XCircle, Clock, TrendingUp, Award, Target } from 'lucide-react';
import { MasterData, CamperSubmission } from '@/utils/masterDataStorage';
import { DEFAULT_MISSIONS } from '@/data/campData';

interface EnhancedCamperHistoryProps {
  camperId: string;
}

const EnhancedCamperHistory: React.FC<EnhancedCamperHistoryProps> = ({ camperId }) => {
  const [submissions, setSubmissions] = useState<CamperSubmission[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<any>({});

  useEffect(() => {
    loadSubmissions();
  }, [camperId]);

  const loadSubmissions = () => {
    const allSubmissions = MasterData.getAllSubmissions();
    const camperSubmissions = allSubmissions
      .filter(s => s.camperId === camperId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setSubmissions(camperSubmissions);
    calculateWeeklyStats(camperSubmissions);
  };

  const calculateWeeklyStats = (submissions: CamperSubmission[]) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const thisWeekSubmissions = submissions.filter(s => 
      new Date(s.date) >= weekAgo && s.status === 'approved'
    );
    
    const totalMissions = thisWeekSubmissions.reduce((sum, s) => sum + s.missions.length, 0);
    const streak = calculateStreak(submissions);
    
    setWeeklyStats({
      thisWeekDays: thisWeekSubmissions.length,
      totalMissions,
      streak,
      averagePerDay: thisWeekSubmissions.length > 0 ? (totalMissions / thisWeekSubmissions.length).toFixed(1) : 0
    });
  };

  const calculateStreak = (submissions: CamperSubmission[]) => {
    if (submissions.length === 0) return 0;
    
    const sortedSubmissions = submissions
      .filter(s => s.status === 'approved')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const submission of sortedSubmissions) {
      const submissionDate = new Date(submission.date);
      const diffDays = Math.floor((currentDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate = submissionDate;
      } else {
        break;
      }
    }
    
    return streak;
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

  const weeklyProgress = Math.min((weeklyStats.thisWeekDays / 7) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-900">{weeklyStats.thisWeekDays}/7</div>
            <p className="text-sm text-blue-700">Days This Week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-900">{weeklyStats.totalMissions}</div>
            <p className="text-sm text-green-700">Total Missions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-900">{weeklyStats.streak}</div>
            <p className="text-sm text-purple-700">Day Streak</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-orange-900">{weeklyStats.averagePerDay}</div>
            <p className="text-sm text-orange-700">Avg Per Day</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>This Week's Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Days Completed</span>
              <span>{weeklyStats.thisWeekDays}/7</span>
            </div>
            <Progress value={weeklyProgress} className="h-3" />
            <p className="text-xs text-gray-600">
              {weeklyProgress === 100 ? "Perfect week! 🎉" : `${Math.ceil(7 - weeklyStats.thisWeekDays)} more days to complete the week`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submission History */}
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Mission History</span>
          </CardTitle>
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
                <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
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
                        })}
                      </p>
                      {submission.approvedAt && (
                        <p className="text-sm text-green-600">
                          Approved at: {new Date(submission.approvedAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      )}
                      {submission.rejectedAt && (
                        <p className="text-sm text-red-600">
                          Rejected at: {new Date(submission.rejectedAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
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
                        Required: {MasterData.getDailyRequired()}
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
    </div>
  );
};

export default EnhancedCamperHistory;