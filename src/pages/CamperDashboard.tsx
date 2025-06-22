
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { LogOut, Star, Award, Calendar, Clock, Home } from 'lucide-react';
import MissionCard from '@/components/MissionCard';
import BunkSelector from '@/components/BunkSelector';
import CamperSelector from '@/components/CamperSelector';
import { useToast } from '@/hooks/use-toast';
import { getCurrentHebrewDate, getSessionInfo } from '@/utils/hebrewDate';
import { SESSION_CONFIG, DEFAULT_MISSIONS, CAMP_DATA, REQUIRED_MISSIONS_COUNT } from '@/data/campData';

interface CamperMission {
  id: number;
  title: string;
  type: string;
  completed: boolean;
  icon: string;
  isMandatory: boolean;
}

const CamperDashboard = () => {
  const [selectedBunk, setSelectedBunk] = useState<string>('');
  const [selectedCamper, setSelectedCamper] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'bunk' | 'camper' | 'dashboard'>('bunk');
  const [missions, setMissions] = useState<CamperMission[]>([]);
  const [streakCount, setStreakCount] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [canSubmitToday, setCanSubmitToday] = useState(true);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const hebrewDate = getCurrentHebrewDate();
  const sessionInfo = getSessionInfo(SESSION_CONFIG);

  // Initialize missions from DEFAULT_MISSIONS
  useEffect(() => {
    const initialMissions = DEFAULT_MISSIONS.filter(m => m.isActive).map((m, index) => ({
      id: index + 1,
      title: m.title,
      type: m.type,
      completed: false,
      icon: m.icon,
      isMandatory: m.isMandatory
    }));
    setMissions(initialMissions);
  }, []);

  // Check if it's past midnight (12am Florida time)
  useEffect(() => {
    const now = new Date();
    const floridaTime = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      hour12: false
    });
    const currentHour = parseInt(floridaTime.format(now));
    
    // For simulation, allow submissions during testing hours
    setCanSubmitToday(true);
  }, []);

  // Load saved progress from localStorage
  useEffect(() => {
    if (selectedCamper && selectedBunk) {
      const savedProgress = localStorage.getItem(`camper-progress-${selectedCamper}`);
      if (savedProgress) {
        const { missions: savedMissions, streak, points, submitted } = JSON.parse(savedProgress);
        if (savedMissions && Array.isArray(savedMissions)) {
          setMissions(savedMissions);
        }
        setStreakCount(streak || 1);
        setTotalPoints(points || 0);
        setHasSubmittedToday(submitted || false);
      }
      setCurrentStep('dashboard');
    }
  }, [selectedCamper, selectedBunk]);

  // Save progress to localStorage whenever missions change
  useEffect(() => {
    if (selectedCamper && missions.length > 0) {
      const progressData = {
        missions,
        streak: streakCount,
        points: totalPoints,
        submitted: hasSubmittedToday,
        lastSubmission: Date.now()
      };
      localStorage.setItem(`camper-progress-${selectedCamper}`, JSON.stringify(progressData));
      localStorage.setItem('currentCamper', selectedCamper);
      localStorage.setItem('currentBunk', selectedBunk);
    }
  }, [missions, streakCount, totalPoints, hasSubmittedToday, selectedCamper, selectedBunk]);

  const completedCount = missions.filter(m => m.completed).length;
  const progressPercentage = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;
  const mandatoryMissions = missions.filter(m => m.isMandatory);
  const completedMandatory = mandatoryMissions.filter(m => m.completed).length;
  const isQualified = completedCount >= REQUIRED_MISSIONS_COUNT;

  const toggleMission = (missionId: number) => {
    if (hasSubmittedToday && canSubmitToday) {
      toast({
        title: "Already Submitted Today",
        description: "You can only submit one edit per day. Your submission is pending approval.",
        variant: "destructive"
      });
      return;
    }

    if (!canSubmitToday) {
      toast({
        title: "Submission Closed",
        description: "Daily submissions close at 12am. Contact your staff for changes.",
        variant: "destructive"
      });
      return;
    }

    setMissions(prevMissions => prevMissions.map(mission => {
      if (mission.id === missionId) {
        const newCompleted = !mission.completed;
        if (newCompleted) {
          setTotalPoints(prev => prev + 5);
          
          const newCompletedCount = prevMissions.filter(m => m.completed).length + 1;
          if (newCompletedCount === missions.length) {
            toast({
              title: "🎉 ALL MISSIONS COMPLETE! 🎉",
              description: `Amazing work! You've completed all missions today!`,
            });
          } else if (newCompletedCount >= REQUIRED_MISSIONS_COUNT && !isQualified) {
            toast({
              title: "🌟 Qualified for Today! 🌟", 
              description: `Great job! You've completed ${REQUIRED_MISSIONS_COUNT} missions and qualified!`,
            });
          } else {
            toast({
              title: "Mission Complete! 🎉",
              description: `Great job completing ${mission.title}! +5 points`,
            });
          }
        } else {
          setTotalPoints(prev => Math.max(0, prev - 5));
        }
        return { ...mission, completed: newCompleted };
      }
      return mission;
    }));
  };

  const handleSubmitDay = () => {
    if (completedCount < REQUIRED_MISSIONS_COUNT) {
      toast({
        title: "Cannot Submit",
        description: `You need to complete at least ${REQUIRED_MISSIONS_COUNT} missions to submit.`,
        variant: "destructive"
      });
      return;
    }

    setHasSubmittedToday(true);
    if (isQualified && completedCount === missions.length) {
      setStreakCount(prev => prev + 1);
    }
    
    toast({
      title: "Day Submitted Successfully! 🎉",
      description: isQualified 
        ? "Congratulations! You've qualified for today!"
        : "Submitted! Some requirements may still be pending.",
    });
  };

  const handleBunkSelect = (bunkId: string) => {
    setSelectedBunk(bunkId);
    setCurrentStep('camper');
  };

  const handleCamperSelect = (camperId: string) => {
    setSelectedCamper(camperId);
    setCurrentStep('dashboard');
  };

  const handleBack = () => {
    if (currentStep === 'camper') {
      setCurrentStep('bunk');
      setSelectedBunk('');
    } else if (currentStep === 'dashboard') {
      setCurrentStep('camper');
      setSelectedCamper('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentCamper');
    localStorage.removeItem('currentBunk');
    navigate('/');
  };

  if (currentStep === 'bunk') {
    return <BunkSelector onSelectBunk={handleBunkSelect} />;
  }

  if (currentStep === 'camper') {
    return (
      <CamperSelector 
        bunkId={selectedBunk}
        onSelectCamper={handleCamperSelect}
        onBack={handleBack}
      />
    );
  }

  const camperInfo = CAMP_DATA
    .find(b => b.id === selectedBunk)
    ?.campers.find(c => c.id === selectedCamper);

  const bunkInfo = CAMP_DATA.find(b => b.id === selectedBunk);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {camperInfo?.name} - Bunk {bunkInfo?.displayName}
              </h1>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600">{hebrewDate.hebrew}</p>
                <p className="text-xs text-gray-600">{hebrewDate.english}</p>
                <p className="text-xs text-purple-600">{sessionInfo.english}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold">{totalPoints} pts</span>
              </div>
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-semibold">{streakCount} day streak</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Today's Progress</span>
                <span className="text-2xl font-bold text-blue-600">
                  {completedCount}/{missions.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm mt-2">
                <span className={`${isQualified ? 'text-green-600' : 'text-orange-600'}`}>
                  {isQualified 
                    ? `✅ Qualified! (${completedCount}/${REQUIRED_MISSIONS_COUNT} required)` 
                    : `Need ${REQUIRED_MISSIONS_COUNT - completedCount} more to qualify`
                  }
                </span>
                <span className="text-gray-600">
                  Mandatory: {completedMandatory}/{mandatoryMissions.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span>Submission Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`font-semibold ${hasSubmittedToday ? 'text-green-600' : 'text-orange-600'}`}>
                    {hasSubmittedToday ? 'Submitted' : 'In Progress'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Qualification</span>
                  <span className={`font-semibold ${isQualified ? 'text-green-600' : 'text-red-600'}`}>
                    {isQualified ? 'Qualified' : 'Not Qualified'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Time Remaining</span>
                  <span className="font-semibold text-blue-600 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{canSubmitToday ? 'Open' : 'Closed'}</span>
                  </span>
                </div>
              </div>
              {!hasSubmittedToday && canSubmitToday && completedCount >= REQUIRED_MISSIONS_COUNT && (
                <Button 
                  onClick={handleSubmitDay}
                  className="w-full mt-3 bg-green-600 hover:bg-green-700"
                >
                  Submit Today's Missions
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onToggle={() => toggleMission(mission.id)}
            />
          ))}
        </div>

        {hasSubmittedToday && (
          <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-green-300 animate-scale-in">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">
                {isQualified ? '🏆' : '📝'}
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-2">
                {isQualified ? 'Day Complete & Qualified!' : 'Day Submitted!'}
              </h2>
              <p className="text-green-700">
                {isQualified 
                  ? 'Excellent work! You\'ve completed your daily requirements and qualified for today!'
                  : 'Your submission has been recorded. Some requirements may still be pending review.'
                }
              </p>
              <div className="mt-4 flex justify-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">+{completedCount * 5}</div>
                  <div className="text-sm text-gray-600">Points Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{streakCount}</div>
                  <div className="text-sm text-gray-600">Day Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CamperDashboard;
