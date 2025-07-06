
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Trophy, Clock, Send, History } from 'lucide-react';
import CamperHistoryView from '@/components/CamperHistoryView';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_MISSIONS } from '@/data/campData';
import MissionCard from '@/components/MissionCard';
import { getCurrentHebrewDate, getSessionInfo } from '@/utils/hebrewDate';
import { MasterData } from '@/utils/masterDataStorage';
import { supabaseService } from '@/services/supabaseService';

const CamperDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCamper, setSelectedCamper] = useState<any>(null);
  const [missions, setMissions] = useState(DEFAULT_MISSIONS.filter(m => m.isActive));
  const [completedMissions, setCompletedMissions] = useState<Set<string>>(new Set());
  const [submissionStatus, setSubmissionStatus] = useState<'none' | 'submitted' | 'approved'>('none');
  const [loading, setLoading] = useState(true);
  const [staffCounselor, setStaffCounselor] = useState<string>('');
  const hebrewDate = getCurrentHebrewDate();
  const sessionInfo = getSessionInfo();

  useEffect(() => {
    loadCamperData();
  }, [navigate]);

  const loadCamperData = async () => {
    console.log('CamperDashboard - checking localStorage...');
    const camperId = localStorage.getItem('selectedCamper');
    
    if (!camperId) {
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      // Get camper profile from Supabase
      const profile = await supabaseService.getCamperProfile(camperId);
      if (!profile) {
        console.log('Camper profile not found, redirecting to home');
        navigate('/');
        return;
      }

      setSelectedCamper(profile);
      
      // Get staff counselor for this bunk
      const staffProfiles = await supabaseService.getAllStaffProfiles();
      const bunkStaff = staffProfiles.find(staff => staff.bunkId === profile.bunkId);
      if (bunkStaff) {
        setStaffCounselor(bunkStaff.name);
        console.log(`Camper ${profile.name} logged in - Counselor: ${bunkStaff.name}`);
      }

      // Check if already submitted TODAY specifically
      const todaySubmission = await MasterData.getCamperTodaySubmission(camperId);
      if (todaySubmission) {
        // Already submitted today - show completed state
        setSubmissionStatus(todaySubmission.status === 'approved' ? 'approved' : 'submitted');
        setCompletedMissions(new Set(todaySubmission.missions));
        
        toast({
          title: `You completed ${todaySubmission.missions.length} missions today! 🎉`,
          description: todaySubmission.status === 'approved' ? 'Your submission has been approved!' : 'Your submission is under review.',
        });
      } else {
        // No submission today - can work on missions
        setSubmissionStatus('none');
        const workingMissions = await supabaseService.getCamperWorkingMissions(camperId);
        setCompletedMissions(new Set(workingMissions));
      }
    } catch (error) {
      console.error('Error loading camper data:', error);
      toast({
        title: "Error",
        description: "Failed to load camper data. Please try again.",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const toggleMission = async (missionId: string) => {
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
    
    // Save working missions to Supabase
    try {
      await supabaseService.saveCamperWorkingMissions(selectedCamper.id, [...newCompleted]);
    } catch (error) {
      console.error('Error saving working missions:', error);
    }
  };

  const handleBulkSubmit = async () => {
    if (!selectedCamper) return;
    
    try {
      // Submit missions to Supabase
      await MasterData.submitCamperMissions(selectedCamper.id, [...completedMissions]);
      
      // Update local state
      setSubmissionStatus('submitted');
      
      toast({
        title: "Missions Submitted! 🎉",
        description: "Your daily missions have been submitted for staff approval.",
      });
    } catch (error) {
      console.error('Error submitting missions:', error);
      toast({
        title: "Error",
        description: "Failed to submit missions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('selectedCamper');
    localStorage.removeItem('selectedBunk');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  if (!selectedCamper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load camper data</h2>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </div>
    );
  }

  const completedCount = completedMissions.size;
  const totalMissions = missions.length;
  const progressPercentage = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;
  
  const dailyRequired = 3; // Default from Supabase settings
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
              {staffCounselor && (
                <p className="text-xs text-purple-600">Counselor: {staffCounselor}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Bunk {selectedCamper.bunkName}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Show completed message for already submitted */}
        {submissionStatus !== 'none' && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-blue-900 mb-2">
                  🎉 You completed {completedCount} missions today!
                </h2>
                <p className="text-blue-700">
                  {submissionStatus === 'approved' 
                    ? 'Your submission has been approved. Great job!' 
                    : 'Your submission is under review by staff.'}
                </p>
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

        {/* Mission History - show if already submitted today */}
        {submissionStatus !== 'none' && (
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Your Mission History</span>
                <History className="h-5 w-5 text-purple-600" />
              </CardTitle>
              <p className="text-gray-600">
                View all your past submissions
              </p>
            </CardHeader>
            <CardContent>
              <CamperHistoryView camperId={selectedCamper.id} />
            </CardContent>
          </Card>
        )}

        {/* Missions Card - only show if not submitted */}
        {submissionStatus === 'none' && (
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
                    disabled={false}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CamperDashboard;
