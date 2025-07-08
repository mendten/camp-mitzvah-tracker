import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Trophy, TrendingUp, Target, Award } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';
import { useToast } from '@/hooks/use-toast';

interface CamperProgressData {
  profile: any;
  submissions: any[];
  totalSubmissions: number;
  totalMissions: number;
  qualifiedDays: number;
  averageMissions: number;
  weeklyQualification: Array<{
    date: string;
    missions: number;
    qualified: boolean;
  }>;
}

const IndividualCamperProgress = () => {
  const { toast } = useToast();
  const [camperCode, setCamperCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [progressData, setProgressData] = useState<CamperProgressData | null>(null);
  const [allCampers, setAllCampers] = useState<any[]>([]);
  const [dailyRequired, setDailyRequired] = useState(5);

  useEffect(() => {
    loadCampersList();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await supabaseService.getSystemSettings();
      setDailyRequired(settings.dailyRequired);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadCampersList = async () => {
    try {
      const campers = await supabaseService.getAllCamperProfiles();
      setAllCampers(campers);
    } catch (error) {
      console.error('Error loading campers:', error);
    }
  };

  const searchCamper = async () => {
    if (!camperCode.trim()) {
      toast({
        title: "Enter Camper Code",
        description: "Please enter a camper code or name to search.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Find camper by code or name
      const camper = allCampers.find(c => 
        c.access_code.toLowerCase() === camperCode.toLowerCase() ||
        c.name.toLowerCase().includes(camperCode.toLowerCase()) ||
        c.id.toLowerCase() === camperCode.toLowerCase()
      );

      if (!camper) {
        toast({
          title: "Camper Not Found",
          description: "No camper found with that code or name.",
          variant: "destructive"
        });
        setProgressData(null);
        return;
      }

      // Load all submissions for this camper
      const allSubmissions = await supabaseService.getAllSubmissions();
      const camperSubmissions = allSubmissions.filter(s => s.camperId === camper.id);

      // Calculate statistics
      const totalSubmissions = camperSubmissions.length;
      const totalMissions = camperSubmissions.reduce((sum, s) => sum + s.missions.length, 0);
      const qualifiedDays = camperSubmissions.filter(s => s.missions.length >= dailyRequired).length;
      const averageMissions = totalSubmissions > 0 ? totalMissions / totalSubmissions : 0;

      // Get last 7 days for weekly view
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentSubmissions = camperSubmissions.filter(s => 
        new Date(s.date) >= sevenDaysAgo
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const weeklyQualification = recentSubmissions.map(s => ({
        date: s.date,
        missions: s.missions.length,
        qualified: s.missions.length >= dailyRequired
      }));

      setProgressData({
        profile: camper,
        submissions: camperSubmissions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        totalSubmissions,
        totalMissions,
        qualifiedDays,
        averageMissions,
        weeklyQualification
      });

      toast({
        title: "Camper Found!",
        description: `Loaded progress data for ${camper.name}`,
      });

    } catch (error) {
      console.error('Error searching camper:', error);
      toast({
        title: "Search Error",
        description: "Failed to load camper data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getQualificationRate = () => {
    if (!progressData || progressData.totalSubmissions === 0) return 0;
    return Math.round((progressData.qualifiedDays / progressData.totalSubmissions) * 100);
  };

  const getWeeklyQualificationRate = () => {
    if (!progressData || progressData.weeklyQualification.length === 0) return 0;
    const qualified = progressData.weeklyQualification.filter(w => w.qualified).length;
    return Math.round((qualified / progressData.weeklyQualification.length) * 100);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center space-x-2">
            <Search className="h-6 w-6 text-blue-600" />
            <span>Individual Camper Progress</span>
          </CardTitle>
          <p className="text-gray-600">
            Enter a camper's access code, name, or ID to view their detailed progress and submission history.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Enter camper code, name, or ID..."
                value={camperCode}
                onChange={(e) => setCamperCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCamper()}
                className="text-lg"
              />
            </div>
            <Button 
              onClick={searchCamper}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {progressData && (
        <>
          {/* Camper Info */}
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardHeader>
              <CardTitle className="text-3xl text-center">
                {progressData.profile.name}
              </CardTitle>
              <div className="text-center space-y-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Bunk {progressData.profile.bunkName}
                </Badge>
                <p className="text-white/90">Access Code: {progressData.profile.access_code}</p>
              </div>
            </CardHeader>
          </Card>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{progressData.totalSubmissions}</div>
                <p className="text-sm text-gray-600">Total Submissions</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{progressData.qualifiedDays}</div>
                <p className="text-sm text-gray-600">Qualified Days</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{progressData.totalMissions}</div>
                <p className="text-sm text-gray-600">Total Missions</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900">{Math.round(progressData.averageMissions * 10) / 10}</div>
                <p className="text-sm text-gray-600">Avg per Day</p>
              </CardContent>
            </Card>
          </div>

          {/* Qualification Rates */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Award className="h-5 w-5 text-green-600" />
                  <span>Overall Qualification Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {getQualificationRate()}%
                  </div>
                  <p className="text-gray-600 mb-4">
                    {progressData.qualifiedDays} out of {progressData.totalSubmissions} days qualified
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getQualificationRate()}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span>Recent Week Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {getWeeklyQualificationRate()}%
                  </div>
                  <p className="text-gray-600 mb-4">
                    Last 7 days qualification rate
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${getWeeklyQualificationRate()}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl">Recent Submission History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressData.submissions.slice(0, 10).map((submission, index) => (
                  <div 
                    key={submission.id}
                    className={`p-4 rounded-lg border-2 ${
                      submission.missions.length >= dailyRequired
                        ? 'border-green-200 bg-green-50'
                        : 'border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">
                          {new Date(submission.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${
                          submission.missions.length >= dailyRequired ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {submission.missions.length}
                        </div>
                        <p className="text-sm text-gray-600">missions</p>
                        {submission.missions.length >= dailyRequired ? (
                          <Badge className="bg-green-100 text-green-700">Qualified</Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700">
                            Need {dailyRequired - submission.missions.length} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {progressData.submissions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No submissions found for this camper.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default IndividualCamperProgress;