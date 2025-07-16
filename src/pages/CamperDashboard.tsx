
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Trophy, Clock, Send, History } from 'lucide-react';
import CamperHistoryView from '@/components/CamperHistoryView';
import { useToast } from '@/hooks/use-toast';
import MissionCard from '@/components/MissionCard';
import { getCurrentHebrewDate, getSessionInfo } from '@/utils/hebrewDate';
import { supabaseService } from '@/services/supabaseService';

const CamperDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCamper, setSelectedCamper] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [selectedMissions, setSelectedMissions] = useState<Set<string>>(new Set());
  const [submissionStatus, setSubmissionStatus] = useState<'none' | 'submitted'>('none');
  const [loading, setLoading] = useState(true);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [staffCounselor, setStaffCounselor] = useState<string>('');
  const [dailyRequired, setDailyRequired] = useState(3);
  const hebrewDate = getCurrentHebrewDate();
  const sessionInfo = getSessionInfo();

  useEffect(() => {
    loadCamperData();
    loadMissions();
  }, [navigate]);

  const loadMissions = async () => {
    console.log('Loading missions from Supabase...');
    setMissionsLoading(true);
    try {
      const supabaseMissions = await supabaseService.getAllMissions();
      console.log('Loaded missions from Supabase:', supabaseMissions);
      
      // Convert Supabase missions to the format expected by the component
      const formattedMissions = supabaseMissions.map(mission => ({
        id: mission.id,
        title: mission.title,
        type: mission.type,
        icon: mission.icon,
        isMandatory: mission.isMandatory,
        isActive: mission.isActive
      }));
      
      setMissions(formattedMissions);
    } catch (error) {
      console.error('Error loading missions:', error);
      toast({
        title: "Error",
        description: "Failed to load missions. Please try again.",
        variant: "destructive"
      });
      setMissions([]);
    } finally {
      setMissionsLoading(false);
    }
  };

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
      
      // Get system settings for daily required
      const settings = await supabaseService.getSystemSettings();
      setDailyRequired(settings.dailyRequired);
      
      // Get staff counselor for this bunk
      const staffProfiles = await supabaseService.getAllStaffProfiles();
      const bunkStaff = staffProfiles.find(staff => staff.bunkId === profile.bunkId);
      if (bunkStaff) {
        setStaffCounselor(bunkStaff.name);
        console.log(`Camper ${profile.name} logged in - Counselor: ${bunkStaff.name}`);
      }

      // Check if already submitted TODAY specifically
      const todaySubmission = await supabaseService.getCamperTodaySubmission(camperId);
      if (todaySubmission) {
        // Already submitted today - show completed state
        setSubmissionStatus('submitted');
        setSelectedMissions(new Set(todaySubmission.missions));
        
        toast({
          title: `You completed ${todaySubmission.missions.length} missions today! 🎉`,
          description: 'Your submission has been automatically approved!',
        });
      } else {
        // No submission today - load working missions from localStorage for local editing
        const localMissions = localStorage.getItem(`working_missions_${camperId}`);
        if (localMissions) {
          setSelectedMissions(new Set(JSON.parse(localMissions)));
        }
        setSubmissionStatus('none');
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

  const toggleMission = (missionId: string) => {
    if (!selectedCamper || submissionStatus !== 'none') return;
    
    const newSelected = new Set(selectedMissions);
    
    if (newSelected.has(missionId)) {
      newSelected.delete(missionId);
      toast({
        title: "Mission Unmarked",
        description: "Mission marked as incomplete",
      });
    } else {
      newSelected.add(missionId);
      toast({
        title: "Mission Complete! 🎉",
        description: "Great job! Keep up the excellent work!",
      });
    }
    
    setSelectedMissions(newSelected);
    
    // Save to localStorage only - no Supabase until submit
    localStorage.setItem(`working_missions_${selectedCamper.id}`, JSON.stringify([...newSelected]));
  };

  const handleSubmit = async () => {
    if (!selectedCamper) return;
    
    try {
      // Submit missions to Supabase (auto-approved)
      await supabaseService.submitCamperMissions(selectedCamper.id, [...selectedMissions]);
      
      // Update local state
      setSubmissionStatus('submitted');
      
      // Clear localStorage working missions
      localStorage.removeItem(`working_missions_${selectedCamper.id}`);
      
      toast({
        title: "Missions Submitted! 🎉",
        description: "Your daily missions have been automatically approved.",
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

  const completedCount = selectedMissions.size;
  const totalMissions = missions.length;
  const progressPercentage = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;
  
  // Separate qualification from submission ability
  const isQualified = completedCount >= dailyRequired;
  const canSubmit = submissionStatus === 'none'; // Can submit with any number of missions (even 0)

  const getStatusDisplay = () => {
    if (submissionStatus === 'submitted') {
      return { text: '✅ Submitted & Approved!', color: 'text-green-600', bg: 'bg-green-50' };
    }
    
    if (canSubmit) {
      return { text: '📤 Ready to Submit', color: 'text-blue-600', bg: 'bg-blue-50' };
    }
    
    return { text: '⏳ Working...', color: 'text-gray-600', bg: 'bg-gray-50' };
  };

  const getQualificationDisplay = () => {
    if (isQualified) {
      return { text: '🎯 Qualified!', color: 'text-green-600', bg: 'bg-green-50' };
    }
    
    const remaining = dailyRequired - completedCount;
    return { text: `Need ${remaining} more`, color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  const statusDisplay = getStatusDisplay();
  const qualificationDisplay = getQualificationDisplay();

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
                  Your submission has been automatically approved. Great job!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4">
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
                <span>Selected</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{completedCount}</div>
              <p className="text-sm text-gray-600">Missions chosen</p>
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

          <Card className={`backdrop-blur shadow-lg border-0 ${qualificationDisplay.bg}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600" />
                <span>Qualification</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-bold ${qualificationDisplay.color}`}>
                {qualificationDisplay.text}
              </div>
              <p className="text-sm text-gray-600">Daily goal</p>
            </CardContent>
          </Card>

          <Card className={`backdrop-blur shadow-lg border-0 ${statusDisplay.bg}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span>Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-bold ${statusDisplay.color}`}>
                {statusDisplay.text}
              </div>
              <p className="text-sm text-gray-600">Today's status</p>
            </CardContent>
          </Card>
        </div>

        {/* Mission History - always show */}
        <CamperHistoryView camperId={selectedCamper.id} />

        {/* Missions Card - only show if not submitted */}
        {submissionStatus === 'none' && (
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl flex items-center justify-between">
                <span>Today's Missions</span>
                <div className="flex space-x-2">
                  {canSubmit && (
                    <Button
                      onClick={handleSubmit}
                      className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Submit {completedCount} Missions</span>
                    </Button>
                  )}
                </div>
              </CardTitle>
              <p className="text-gray-600">
                Select your completed missions and submit when ready. You can submit with any number of missions. You need at least {dailyRequired} missions to qualify for the day.
              </p>
              {!isQualified && (
                <p className="text-orange-600 text-sm font-medium">
                  ⚠️ You need {Math.max(0, dailyRequired - completedCount)} more missions to qualify, but you can still submit with {completedCount} missions.
                </p>
              )}
            </CardHeader>
            <CardContent>
              {missionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading missions...</p>
                </div>
              ) : missions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No missions available at this time.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {missions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={{
                        ...mission,
                        completed: selectedMissions.has(mission.id)
                      }}
                      onToggle={() => toggleMission(mission.id)}
                      disabled={false}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CamperDashboard;
