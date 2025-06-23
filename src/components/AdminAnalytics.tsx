
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Target, Calendar, Award, AlertCircle } from 'lucide-react';
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import { DataStorage } from '@/utils/dataStorage';

const AdminAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    generateAnalytics();
  }, []);

  const generateAnalytics = () => {
    const totalCampers = CAMP_DATA.reduce((sum, bunk) => sum + bunk.campers.length, 0);
    const activeMissions = DEFAULT_MISSIONS.filter(m => m.isActive);
    const dailyRequired = DataStorage.getDailyRequired();

    // Calculate camp-wide statistics
    let qualifiedToday = 0;
    let totalSubmissions = 0;
    let pendingApprovals = 0;
    let editRequests = 0;
    const bunkStats: any[] = [];
    const missionStats: any[] = [];

    // Initialize mission completion tracking
    const missionCompletions: { [key: string]: number } = {};
    activeMissions.forEach(mission => {
      missionCompletions[mission.id] = 0;
    });

    CAMP_DATA.forEach(bunk => {
      let bunkQualified = 0;
      let bunkSubmissions = 0;
      let bunkPending = 0;

      bunk.campers.forEach(camper => {
        const status = DataStorage.getCamperTodayStatus(camper.id);
        
        if (status.qualified) qualifiedToday++;
        if (status.status === 'pending') {
          pendingApprovals++;
          bunkPending++;
        }
        if (status.status === 'edit_requested') editRequests++;
        if (status.submittedCount > 0) {
          totalSubmissions++;
          bunkSubmissions++;
        }
        if (status.qualified) bunkQualified++;

        // Track mission completions
        const todayMissions = DataStorage.getCamperTodayMissions(camper.id);
        todayMissions.forEach(missionId => {
          if (missionCompletions[missionId] !== undefined) {
            missionCompletions[missionId]++;
          }
        });
      });

      bunkStats.push({
        name: bunk.displayName,
        total: bunk.campers.length,
        qualified: bunkQualified,
        submissions: bunkSubmissions,
        pending: bunkPending,
        percentage: Math.round((bunkQualified / bunk.campers.length) * 100)
      });
    });

    // Convert mission completions to chart data
    activeMissions.forEach(mission => {
      missionStats.push({
        name: mission.title,
        completions: missionCompletions[mission.id],
        percentage: Math.round((missionCompletions[mission.id] / totalCampers) * 100)
      });
    });

    // Generate trend data (sample historical data)
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Simulate increasing participation over time
      const baseRate = 60 + (6 - i) * 5;
      const qualified = Math.floor((baseRate / 100) * totalCampers);
      
      trendData.push({
        day: dayName,
        qualified,
        total: totalCampers,
        percentage: Math.round((qualified / totalCampers) * 100)
      });
    }

    setAnalyticsData({
      overview: {
        totalCampers,
        qualifiedToday,
        totalSubmissions,
        pendingApprovals,
        editRequests,
        qualificationRate: Math.round((qualifiedToday / totalCampers) * 100),
        submissionRate: Math.round((totalSubmissions / totalCampers) * 100)
      },
      bunkStats,
      missionStats,
      trendData
    });
  };

  if (!analyticsData) {
    return <div>Loading analytics...</div>;
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Total Campers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{analyticsData.overview.totalCampers}</div>
            <p className="text-sm text-gray-600">Across all bunks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-600" />
              <span>Qualified Today</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{analyticsData.overview.qualifiedToday}</div>
            <p className="text-sm text-gray-600">{analyticsData.overview.qualificationRate}% of campers</p>
            <Progress value={analyticsData.overview.qualificationRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>Pending Approvals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{analyticsData.overview.pendingApprovals}</div>
            <p className="text-sm text-gray-600">Awaiting staff review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span>Edit Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{analyticsData.overview.editRequests}</div>
            <p className="text-sm text-gray-600">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bunks" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bunks">Bunk Performance</TabsTrigger>
          <TabsTrigger value="missions">Mission Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends & History</TabsTrigger>
        </TabsList>

        <TabsContent value="bunks">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Bunk Qualification Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.bunkStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bunk Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.bunkStats.map((bunk: any, index: number) => (
                    <div key={bunk.name} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Bunk {bunk.name}</p>
                        <p className="text-sm text-gray-600">{bunk.qualified}/{bunk.total} qualified</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={bunk.percentage >= 80 ? "default" : bunk.percentage >= 60 ? "secondary" : "destructive"}>
                          {bunk.percentage}%
                        </Badge>
                        {bunk.pending > 0 && (
                          <Badge variant="outline" className="text-yellow-600">
                            {bunk.pending} pending
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="missions">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mission Completion Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.missionStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="completions"
                    >
                      {analyticsData.missionStats.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mission Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData.missionStats.map((mission: any, index: number) => (
                    <div key={mission.name} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{mission.name}</p>
                        <p className="text-sm text-gray-600">{mission.completions} completions</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24">
                          <Progress value={mission.percentage} />
                        </div>
                        <span className="text-sm font-medium">{mission.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>7-Day Qualification Trend</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="qualified" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#e5e7eb" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
