
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, UserCheck, BarChart3, Calendar } from 'lucide-react';
import PublicDashboard from '@/components/PublicDashboard';
import { getCurrentHebrewDate } from '@/utils/hebrewDate';

const Index = () => {
  const navigate = useNavigate();
  const hebrewDate = getCurrentHebrewDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">🏕️ Camp Gan Yisroel Florida</h1>
            <p className="text-xl text-blue-600">{hebrewDate.hebrew}</p>
            <p className="text-lg text-gray-600">{hebrewDate.english}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Login Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Camper Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Submit your daily missions and track your progress
              </p>
              <Button 
                onClick={() => navigate('/bunk-selection')}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Camper Login
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Staff Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Manage your bunk and approve camper submissions
              </p>
              <Button 
                onClick={() => navigate('/staff')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Staff Login
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Admin Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Complete camp management and system administration
              </p>
              <Button 
                onClick={() => navigate('/admin')}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Admin Login
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Public Dashboard */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">📊 Live Camp Dashboard</h2>
            <p className="text-lg text-gray-600">Real-time camp statistics and leaderboards</p>
          </div>
          <PublicDashboard />
        </div>
      </main>
    </div>
  );
};

export default Index;
