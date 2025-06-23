
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Trophy, Clock, Send, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import MissionCard from '@/components/MissionCard';
import { getCurrentHebrewDate, getSessionInfo } from '@/utils/hebrewDate';
import CamperCalendar from '@/components/CamperCalendar';

const CamperDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCamper, setSelectedCamper] = useState<any>(null);
  const [selectedBunk, setSelectedBunk] = useState<any>(null);
  const [missions, setMissions] = useState(DEFAULT_MISSIONS.filter(m => m.isActive));
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [submissionStatus, setSubmissionStatus] = useState<'none' | 'submitted' | 'can_edit'>('none');
  const [showCalendar, setShowCalendar] = useState(false);
  const hebrewDate = getCurrentHebrewDate();
  const sessionInfo = getSessionInfo({ currentSession: 1, currentWeek: 3, currentDay: 4 });

  useEffect(() => {
    console.log('CamperDashboard - checking localStorage...');
    const camperId = localStorage.getItem('selectedCamper');
    const bunkId = localStorage.getItem('selectedBunk');
    
    console.log('Found in localStorage:', { camperId, bunkId });
    
    if (camperId && bunkId) {
      const bunk = CAMP_DATA.find(b => b.id === bunkId);
      const camper = bunk?.campers.find(c => c.id === camperId);
      
      console.log('Found data:', { bunk, camper });
      
      if (bunk && camper) {
        setSelectedBunk(bunk);
        setSelectedCamper(camper);
        
        // Load completed missions for this camper
        const savedProgress = localStorage.getItem(`camper_${camperId}_missions`);
        if (savedProgress) {
          setCompletedMissions(new Set(JSON.parse(savedProgress)));
        }
        
        // Check submission status for today
        const today = new Date().toDateString();
        const submissionDate = localStorage.getItem(`camper_${camperId}_submission_date`);
        const hasSubmitted = submissionDate === today;
        const lastEditDate = localStorage.getItem(`camper_${camperId}_last_edit_date`);
        const canEdit = hasSubmitted && lastEditDate !== today;
        
        if (hasSubmitted && !canEdit) {
          setSubmissionStatus('submitted');
        } else if (hasSubmitted && canEdit) {
          setSubmissionStatus('can_edit');
        } else {
          setSubmissionStatus('none');
        }
      } else {
        console.error('Bunk or camper not found, redirecting home');
        navigate('/');
      }
    } else {
      console.error('Missing camper or bunk ID, redirecting home');
      navigate('/');
    }
  }, [navigate]);

  const toggleMission = (missionId: string) => {
    if (!selectedCamper || submissionStatus === 'submitted') return;
    
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
    localStorage.setItem(`camper_${selectedCamper.id}_missions`, JSON.stringify([...newCompleted]));
  };

  const handleSubmit = () => {
    if (!selectedCamper) return;
    
    const today = new Date().toDateString();
    localStorage.setItem(`camper_${selectedCamper.id}_submission_date`, today);
    localStorage.setItem(`camper_${selectedCamper.id}_submitted`, JSON.stringify([...completedMissions]));
    
    setSubmissionStatus('submitted');
    
    toast({
      title: "Missions Submitted! 🎉",
      description: "Your missions have been submitted for staff approval.",
    });
  };

  const handleEdit = () => {
    if (!selectedCamper) return;
    
    const today = new Date().toDateString();
    localStorage.setItem(`camper_${selectedCamper.id}_last_edit_date`, today);
    
    setSubmissionStatus('none');
    
    toast({
      title: "Edit Mode Enabled",
      description: "You can now edit your missions (once per day only).",
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
  
  // Get admin-defined required missions count
  const dailyRequired = parseInt(localStorage.getItem('mission_daily_required') || '3');
  const canSubmit = completedCount >= dailyRequired && submissionStatus === 'none';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
        {showCalendar && (
          <CamperCalendar 
            completedMissions={completedMissions} 
            missions={missions}
            camperId={selectedCamper.id}
          />
        )}

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

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600" />
                <span>Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900">
                {submissionStatus === 'submitted' ? '✅ Submitted' : 
                 submissionStatus === 'can_edit' ? '✏️ Can Edit' : 
                 completedCount >= dailyRequired ? '✅ Ready' : '⏳ Working'}
              </div>
              <p className="text-sm text-gray-600">Daily status</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl flex items-center justify-between">
              <span>Today's Missions</span>
              <div className="flex space-x-2">
                {submissionStatus === 'submitted' && (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit (Once per day)</span>
                  </Button>
                )}
                {canSubmit && (
                  <Button
                    onClick={handleSubmit}
                    className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit for Approval</span>
                  </Button>
                )}
              </div>
            </CardTitle>
            <p className="text-gray-600">
              Complete at least {dailyRequired} missions to submit for approval! 
              {submissionStatus === 'submitted' && ' (Already submitted today)'}
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
                  disabled={submissionStatus === 'submitted'}
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
