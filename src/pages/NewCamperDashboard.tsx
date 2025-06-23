
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Edit, Trophy, User, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import MissionCard from '@/components/MissionCard';
import { MasterData } from '@/utils/masterDataStorage';
import { formatHebrewDate } from '@/utils/hebrewCalendar';

const NewCamperDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCamper, setSelectedCamper] = useState<any>(null);
  const [selectedBunk, setSelectedBunk] = useState<any>(null);
  const [workingMissions, setWorkingMissions] = useState<Set<string>>(new Set());
  const [submissionStatus, setSubmissionStatus] = useState<'working' | 'submitted' | 'edit_requested' | 'approved' | 'rejected'>('working');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editReason, setEditReason] = useState('');

  const missions = DEFAULT_MISSIONS.filter(m => m.isActive);
  const dailyRequired = MasterData.getDailyRequired();

  useEffect(() => {
    const camperId = localStorage.getItem('selectedCamper');
    const bunkId = localStorage.getItem('selectedBunk');
    
    if (camperId && bunkId) {
      const bunk = CAMP_DATA.find(b => b.id === bunkId);
      const camper = bunk?.campers.find(c => c.id === camperId);
      
      if (bunk && camper) {
        setSelectedBunk(bunk);
        setSelectedCamper(camper);
        
        // Check today's submission status
        const todaySubmission = MasterData.getCamperTodaySubmission(camperId);
        if (todaySubmission) {
          setSubmissionStatus(todaySubmission.status);
          setWorkingMissions(new Set(todaySubmission.missions));
        } else {
          // Load working missions
          const working = MasterData.getCamperWorkingMissions(camperId);
          setWorkingMissions(new Set(working));
          setSubmissionStatus('working');
        }
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  const toggleMission = (missionId: string) => {
    if (submissionStatus !== 'working') return;
    
    const newWorking = new Set(workingMissions);
    
    if (newWorking.has(missionId)) {
      newWorking.delete(missionId);
    } else {
      newWorking.add(missionId);
    }
    
    setWorkingMissions(newWorking);
    // Save working missions immediately
    MasterData.saveCamperWorkingMissions(selectedCamper.id, [...newWorking]);
  };

  const handleSubmit = () => {
    if (!selectedCamper || workingMissions.size < dailyRequired) return;
    
    // Submit missions using master data
    MasterData.submitCamperMissions(selectedCamper.id, [...workingMissions]);
    
    // Update status
    setSubmissionStatus('submitted');
    
    toast({
      title: "Missions Submitted! 🎉",
      description: "Your daily missions have been submitted for staff approval.",
    });
  };

  const handleRequestEdit = () => {
    if (!editReason.trim()) {
      toast({
        title: "Edit Reason Required",
        description: "Please provide a reason for your edit request.",
        variant: "destructive"
      });
      return;
    }
    
    MasterData.requestEdit(selectedCamper.id, editReason);
    setSubmissionStatus('edit_requested');
    setShowEditForm(false);
    setEditReason('');
    
    toast({
      title: "Edit Request Submitted",
      description: "Your edit request has been sent for approval.",
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

  const completedCount = workingMissions.size;
  const canSubmit = completedCount >= dailyRequired && submissionStatus === 'working';

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
              <p className="text-sm text-blue-600">{formatHebrewDate(new Date())}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Bunk {selectedBunk.displayName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{completedCount}/{missions.length}</div>
              <p className="text-sm text-gray-600">Missions completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span>Required</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{dailyRequired}</div>
              <p className="text-sm text-gray-600">For qualification</p>
            </CardContent>
          </Card>

          <Card className={`backdrop-blur shadow-lg border-0 ${
            submissionStatus === 'approved' ? 'bg-green-50' :
            submissionStatus === 'submitted' ? 'bg-blue-50' :
            submissionStatus === 'edit_requested' ? 'bg-yellow-50' :
            submissionStatus === 'rejected' ? 'bg-red-50' :
            'bg-white/80'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span>Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-bold ${
                submissionStatus === 'approved' ? 'text-green-600' :
                submissionStatus === 'submitted' ? 'text-blue-600' :
                submissionStatus === 'edit_requested' ? 'text-yellow-600' :
                submissionStatus === 'rejected' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {submissionStatus === 'approved' ? '✅ Approved!' :
                 submissionStatus === 'submitted' ? '⏳ Submitted' :
                 submissionStatus === 'edit_requested' ? '✏️ Edit Requested' :
                 submissionStatus === 'rejected' ? '❌ Rejected' :
                 canSubmit ? '✅ Ready' : '⏳ Working...'}
              </div>
              <p className="text-sm text-gray-600">Daily status</p>
            </CardContent>
          </Card>
        </div>

        {/* Missions Card */}
        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-xl">Today's Missions</CardTitle>
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
                    completed: workingMissions.has(mission.id)
                  }}
                  onToggle={() => toggleMission(mission.id)}
                  disabled={submissionStatus !== 'working'}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Area */}
        <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
          <CardContent className="p-6">
            {submissionStatus === 'working' && (
              <div className="text-center">
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Submit All Missions ({completedCount})
                </Button>
                {!canSubmit && completedCount < dailyRequired && (
                  <p className="text-sm text-gray-600 mt-2">
                    Complete {dailyRequired - completedCount} more missions to submit
                  </p>
                )}
              </div>
            )}

            {submissionStatus === 'submitted' && (
              <div className="text-center space-y-4">
                <div className="bg-green-100 border border-green-300 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    🎉 You have submitted your missions!
                  </h3>
                  <p className="text-green-700 mb-4">
                    Your {completedCount} completed missions have been sent for staff approval.
                  </p>
                  <Button
                    onClick={() => setShowEditForm(true)}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Request Edit Approval
                  </Button>
                </div>
              </div>
            )}

            {submissionStatus === 'edit_requested' && (
              <div className="text-center">
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-yellow-800 mb-2">
                    ⏳ Edit Request Pending
                  </h3>
                  <p className="text-yellow-700">
                    Your edit request is waiting for staff approval.
                  </p>
                </div>
              </div>
            )}

            {submissionStatus === 'approved' && (
              <div className="text-center">
                <div className="bg-green-100 border border-green-300 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-2">
                    ✅ Missions Approved!
                  </h3>
                  <p className="text-green-700">
                    Great job! Your missions have been approved by staff.
                  </p>
                </div>
              </div>
            )}

            {submissionStatus === 'rejected' && (
              <div className="text-center">
                <div className="bg-red-100 border border-red-300 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-red-800 mb-2">
                    ❌ Submission Rejected
                  </h3>
                  <p className="text-red-700">
                    Your submission was rejected. Please try again with different missions.
                  </p>
                  <Button
                    onClick={() => {
                      setSubmissionStatus('working');
                      setWorkingMissions(new Set());
                      MasterData.clearCamperWorkingMissions(selectedCamper.id);
                    }}
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    Start Over
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Request Form */}
        {showEditForm && (
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle>Request Edit Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="Please explain why you need to edit your submission..."
                className="w-full p-3 border rounded-lg resize-none h-24"
              />
              <div className="flex space-x-2">
                <Button
                  onClick={handleRequestEdit}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit Edit Request
                </Button>
                <Button
                  onClick={() => setShowEditForm(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default NewCamperDashboard;
