
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
import CamperHistoryView from '@/components/CamperHistoryView';

const CamperDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCamper, setSelectedCamper] = useState<any>(null);
  const [selectedBunk, setSelectedBunk] = useState<any>(null);
  const [missions, setMissions] = useState(DEFAULT_MISSIONS.filter(m => m.isActive));
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [submissionStatus, setSubmissionStatus] = useState<'none' | 'submitted' | 'approved'>('none');
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
          setSubmissionStatus(submission.status === 'pending' || submission.status === 'edit_requested' ? 'submitted' : submission.status);
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
    if (!selectedCamper || submissionStatus !== 'none') return;
    
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

  // Edit functionality removed - submissions are final

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

  const getStatusDisplay = () => {
    switch (submissionStatus) {
      case 'approved':
        return { text: '✅ Approved!', color: 'text-green-600', bg: 'bg-green-50' };
      case 'submitted':
        return { text: '📋 Submitted (View Only)', color: 'text-blue-600', bg: 'bg-blue-50' };
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
          <CamperHistoryView camperId={selectedCamper.id} />
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
              {submissionStatus === 'submitted' && ' (Submitted - View only)'}
              {submissionStatus === 'approved' && ' (Approved! Great job!)'}
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
                  disabled={submissionStatus !== 'none'}
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
