import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, CheckCircle2, XCircle, Clock, ChevronDown, ChevronRight, Trophy, Target } from 'lucide-react';
import { supabaseService, CamperSubmission } from '@/services/supabaseService';
import { DEFAULT_MISSIONS } from '@/data/campData';

interface EnhancedCamperHistoryProps {
  camperId: string;
  showQualificationBar?: boolean;
}

const EnhancedCamperHistory: React.FC<EnhancedCamperHistoryProps> = ({ 
  camperId, 
  showQualificationBar = false 
}) => {
  const [submissions, setSubmissions] = useState<CamperSubmission[]>([]);
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(new Set());
  const [camperStats, setCamperStats] = useState({
    totalSubmissions: 0,
    totalMissions: 0,
    qualifiedDays: 0,
    currentStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissionsAndStats();
  }, [camperId]);

  const loadSubmissionsAndStats = async () => {
    try {
      setLoading(true);
      const [camperSubmissions, settings] = await Promise.all([
        supabaseService.getCamperSubmissions(camperId),
        supabaseService.getSystemSettings()
      ]);
      
      setSubmissions(camperSubmissions);
      
      // Calculate stats
      const totalSubmissions = camperSubmissions.length;
      const totalMissions = camperSubmissions.reduce((sum, s) => sum + s.missions.length, 0);
      const qualifiedDays = camperSubmissions.filter(s => 
        s.missions.length >= settings.dailyRequired
      ).length;
      
      // Calculate current streak (consecutive qualified days from most recent)
      let currentStreak = 0;
      const sortedSubmissions = [...camperSubmissions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      for (const submission of sortedSubmissions) {
        if (submission.missions.length >= settings.dailyRequired) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      setCamperStats({
        totalSubmissions,
        totalMissions,
        qualifiedDays,
        currentStreak
      });
    } catch (error) {
      console.error('Error loading submissions and stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (submissionId: string) => {
    const newExpanded = new Set(expandedSubmissions);
    if (newExpanded.has(submissionId)) {
      newExpanded.delete(submissionId);
    } else {
      newExpanded.add(submissionId);
    }
    setExpandedSubmissions(newExpanded);
  };

  const getMissionTitles = (missionIds: string[]) => {
    return missionIds
      .map(id => DEFAULT_MISSIONS.find(m => m.id === id)?.title)
      .filter(Boolean);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return { day: 'Today', date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) };
    } else if (date.toDateString() === yesterday.toDateString()) {
      return { day: 'Yesterday', date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) };
    } else {
      return { 
        day: date.toLocaleDateString('en-US', { weekday: 'long' }), 
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      };
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded mb-4"></div>
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Qualification Bar - only show if requested */}
      {showQualificationBar && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold text-blue-900">{camperStats.totalSubmissions}</span>
                </div>
                <p className="text-sm text-blue-700">Total Days</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-green-600 mr-2" />
                  <span className="text-2xl font-bold text-green-900">{camperStats.totalMissions}</span>
                </div>
                <p className="text-sm text-green-700">Total Missions</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6 text-yellow-600 mr-2" />
                  <span className="text-2xl font-bold text-yellow-900">{camperStats.qualifiedDays}</span>
                </div>
                <p className="text-sm text-yellow-700">Qualified Days</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-6 w-6 text-purple-600 mr-2" />
                  <span className="text-2xl font-bold text-purple-900">{camperStats.currentStreak}</span>
                </div>
                <p className="text-sm text-purple-700">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mission History */}
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Mission History</span>
            <Badge variant="outline" className="ml-auto">
              {submissions.length} submissions
            </Badge>
          </CardTitle>
          <p className="text-gray-600">Your complete submission history</p>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No submissions yet</p>
              <p className="text-sm">Complete and submit missions to see your history here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => {
                const isExpanded = expandedSubmissions.has(submission.id);
                const dateInfo = formatDate(submission.date);
                const isQualified = submission.missions.length >= 3; // Default daily required
                
                return (
                  <Collapsible key={submission.id}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto border rounded-lg hover:bg-gray-50"
                        onClick={() => toggleExpanded(submission.id)}
                      >
                        <div className="flex items-center space-x-4 text-left">
                          <div className={`w-3 h-3 rounded-full ${
                            isQualified ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                          
                          <div>
                            <div className="font-semibold text-gray-900">
                              {dateInfo.day}
                            </div>
                            <div className="text-sm text-gray-600">
                              {dateInfo.date}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {submission.missions.length}
                            </div>
                            <div className="text-xs text-gray-500">missions</div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {isQualified ? (
                              <Badge className="bg-green-100 text-green-800">Qualified</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Submitted</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(submission.status)}
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="px-4 pb-4">
                      <div className="mt-3 pt-3 border-t space-y-3">
                        <div className="text-sm text-gray-600">
                          <p><strong>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
                          {submission.approvedAt && (
                            <p><strong>Approved:</strong> {new Date(submission.approvedAt).toLocaleString()}</p>
                          )}
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">Completed Missions:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {getMissionTitles(submission.missions).map((title, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm">
                                <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                                <span>{title}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {submission.editRequestReason && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-700">
                              <strong>Edit Request:</strong> {submission.editRequestReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCamperHistory;