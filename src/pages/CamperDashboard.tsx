
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Trophy, Clock, Send, Edit, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import MissionCard from '@/components/MissionCard';
import { getCurrentHebrewDate, getSessionInfo } from '@/utils/hebrewDate';
import { DataStorage } from '@/utils/dataStorage';
import CamperCalendar from '@/components/CamperCalendar';

const CamperDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCamper, setSelectedCamper] = useState<any>(null);
  const [selectedBunk, setSelectedBunk] = useState<any>(null);
  const [missions, setMissions] = useState(DEFAULT_MISSIONS.filter(m => m.isActive));
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [submissionStatus, setSubmissionStatus] = useState<'none' | 'submitted' | 'approved' | 'edit_requested'>('none');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState<any[]>([]);
  const hebrewDate = getCurrentHebrewDate();
  const sessionInfo = getSessionInfo();

  useEffect(() => {
    console.log('CamperDashboard - checking localStorage...');
    const camperId = localStorage.getItem('selectedCamper');
    const bunkId = localStorage.getItem('selectedBunk');
    
    if (camperId && bunkId) {
      const bunk = CAMP_DATA.find(b => b.id === bunkId);
      const camper = bunk?.campers.find(c => c.id === camperId);
      
      if (bunk && camper) {
        setSelectedBunk(bunk);
        setSelectedCamper(camper);
        
        // Load today's missions using new data system
        const todayMissions = DataStorage.getCamperTodayMissions(camperId);
        setCompletedMissions(new Set(todayMissions));
        
        // Check submission status using new data system
        const todayStatus = DataStorage.getCamperTodayStatus(camperId);
        const submission = DataStorage.getCamperTodaySubmission(camperId);
        
        if (submission) {
          setSubmissionStatus(submission.status === 'pending' ? 'submitted' : submission.status);
        } else {
          setSubmissionStatus('none');
        }
        
        // Load submission history
        const history = DataStorage.getSubmissionHistory(camperId);
        setSubmissionHistory(history);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const toggleMission = (missionId: string) => {
    if (!selectedCamper || submissionStatus === 'submitted' || submissionStatus === 'approved') return;
    
    const newCompleted = new Set(completedMissions);
    
    if (newCompleted.has(missionId)) {
      newCompleted.delete(missionId);
      toast({
        title: "Mission Unmarked",
        description: "Mission marked as incomplete",
      });
    } else {
      newCompleted.add(missionId);
      toast({
        title: "Mission Complete! 🎉",
        description: "Great job! Keep up the excellent work!",
      });
    }
    
    setCompletedMissions(newCompleted);
    // Save using new data system
    DataStorage.setCamperTodayMissions(selectedCamper.id, [...newCompleted]);
  };

  const handleBulkSubmit = () => {
    if (!selectedCamper) return;
    
    // Submit all missions using new data system
    DataStorage.submitCamperMissions(selectedCamper.id, [...completedMissions]);
    
    // Update local state
    setSubmissionStatus('submitted');
    
    // Refresh submission history
    const history = DataStorage.getSubmissionHistory(selectedCamper.id);
    setSubmissionHistory(history);
    
    toast({
      title: "Missions Submitted! 🎉",
      description: "Your daily missions have been submitted for staff approval.",
    });
  };

  const handleRequestEdit = () => {
    if (!selectedCamper) return;
    
    // Request edit using new data system
    DataStorage.requestSubmissionEdit(selectedCamper.id, 'Daily edit request');
    
    setSubmissionStatus('edit_requested');
    
    toast({
      title: "Edit Request Submitted",
      description: "Your edit request has been sent to staff for approval.",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('selectedCamper');
    localStorage.removeItem('selectedBunk');
    navigate('/');
  };

  if (!selectedCamper || !selectedBunk) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  const completedCount = completedMissions.size;
  const totalMissions = missions.length;
  const progressPercentage = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;
  
  const dailyRequired = DataStorage.getDailyRequired();
  const canSubmit = completedCount >= dailyRequired && submissionStatus === 'none';
  const canRequestEdit = submissionStatus === 'submitted';

  const getStatusDisplay = () => {
    switch (submissionStatus) {
      case 'approved':
        return { text: '✅ Approved!', color: 'text-green-600', bg: 'bg-green-50' };
      case 'submitted':
        return { text: '⏳ Pending Approval', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'edit_requested':
        return { text: '✏️ Edit Requested', color: 'text-blue-600', bg: 'bg-blue-50' };
      default:
        return completedCount >= dailyRequired 
          ? { text: '✅ Ready to Submit', color: 'text-green-600', bg: 'bg-green-50' }
          : { text: '⏳ Working...', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Logout</span>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {selectedCamper.name}! 👋
              </h1>
              <p className="text-sm text-blue-600">{hebrewDate.hebrew}</p>
              <p className="text-xs text-gray-600">{sessionInfo.hebrew}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2"
            >
              <History className="h-4 w-4" />
              <span>{showHistory ? 'Hide History' : 'Show History'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center space-x-2"
            >
              <Calendar className="h-4 w-4" />
              <span>{showCalendar ? 'Hide Calendar' : 'Show Calendar'}</span>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Bunk {selectedBunk.displayName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Calendar and History */}
        {showCalendar && (
          <CamperCalendar 
            completedMissions={completedMissions} 
            missions={missions}
            camperId={selectedCamper.id}
          />
        )}

        {showHistory && (
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle>Submission History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {submissionHistory.length === 0 ? (
                  <p className="text-gray-500 text-center">No submissions yet</p>
                ) : (
                  submissionHistory.map((submission, index) => (
                    <div key={index} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{new Date(submission.date).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          submission.status === 'approved' ? 'bg-green-100 text-green-700' :
                          submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          submission.status === 'edit_requested' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {submission.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {submission.missions.length} missions completed
                      </p>
                      {submission.editRequestReason && (
                        <p className="text-xs text-blue-600 mt-1">
                          Edit reason: {submission.editRequestReason}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{progressPercentage}%</div>
              <p className="text-sm text-gray-600">{completedCount} of {totalMissions} missions</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span>Completed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{completedCount}</div>
              <p className="text-sm text-gray-600">Missions done today</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span>Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{dailyRequired}</div>
              <p className="text-sm text-gray-600">For qualification</p>
            </CardContent>
          </Card>

          <Card className={`backdrop-blur shadow-lg border-0 ${statusDisplay.bg}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600" />
                <span>Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-bold ${statusDisplay.color}`}>
                {statusDisplay.text}
              </div>
              <p className="text-sm text-gray-600">Daily status</p>
            </CardContent>
          </Card>
        </div>

        {/* Missions Card */}
        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              <span>Today's Missions</span>
              <div className="flex space-x-2">
                {canRequestEdit && (
                  <Button
                    onClick={handleRequestEdit}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Request Edit</span>
                  </Button>
                )}
                {canSubmit && (
                  <Button
                    onClick={handleBulkSubmit}
                    className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit All Missions</span>
                  </Button>
                )}
              </div>
            </CardTitle>
            <p className="text-gray-600">
              Complete at least {dailyRequired} missions to submit for approval!
              {submissionStatus === 'submitted' && ' (Submitted and awaiting approval)'}
              {submissionStatus === 'approved' && ' (Approved! Great job!)'}
              {submissionStatus === 'edit_requested' && ' (Edit request pending)'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {missions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={{
                    ...mission,
                    completed: completedMissions.has(mission.id)
                  }}
                  onToggle={() => toggleMission(mission.id)}
                  disabled={submissionStatus === 'submitted' || submissionStatus === 'approved'}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CamperDashboard;
