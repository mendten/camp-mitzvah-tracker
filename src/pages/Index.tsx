
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, UserCheck, BarChart3, Calendar } from 'lucide-react';
import PublicDashboard from '@/components/PublicDashboard';
import { getCurrentProperHebrewDate } from '@/utils/properHebrewDate';

const Index = () => {
  const navigate = useNavigate();
  const hebrewDate = getCurrentProperHebrewDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative overflow-hidden">
      {/* Single Large Background Logo */}
      <div 
        className="fixed inset-0 opacity-5 bg-no-repeat bg-center"
        style={{
          backgroundImage: `url('/lovable-uploads/e7a1a4b6-8ae6-4b14-8b3a-39169bb6dc9f.png')`,
          backgroundSize: '60% auto',
          backgroundPosition: 'center center',
          zIndex: 0,
        }}
      />
      
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-blue-200 p-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center space-x-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/e7a1a4b6-8ae6-4b14-8b3a-39169bb6dc9f.png" 
                alt="TEMIMIM Florida Logo" 
                className="h-20 w-20 object-contain"
              />
            </div>
            
            {/* Title and Date */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-blue-900">TEMIMIM Florida</h1>
              <p className="text-xl text-blue-700 font-semibold">{hebrewDate.hebrew}</p>
              <p className="text-lg text-blue-600">{hebrewDate.english}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 relative z-10">
        {/* Login Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-300 bg-white/80 backdrop-blur-sm hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-700" />
              </div>
              <CardTitle className="text-xl text-blue-900">Camper Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-blue-700 mb-4">
                Submit your daily missions and track your progress
              </p>
              <Button 
                onClick={() => navigate('/bunk-selection')}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white"
              >
                Camper Login
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-green-300 bg-white/80 backdrop-blur-sm hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <UserCheck className="h-8 w-8 text-green-700" />
              </div>
              <CardTitle className="text-xl text-green-900">Staff Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-green-700 mb-4">
                Manage your bunk and approve camper submissions
              </p>
              <Button 
                onClick={() => navigate('/staff')}
                className="w-full bg-green-700 hover:bg-green-800 text-white"
              >
                Staff Login
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-300 bg-white/80 backdrop-blur-sm hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-purple-700" />
              </div>
              <CardTitle className="text-xl text-purple-900">Admin Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-purple-700 mb-4">
                Complete camp management and system administration
              </p>
              <Button 
                onClick={() => navigate('/admin')}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white"
              >
                Admin Login
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Public Dashboard */}
        <div className="mt-12">
          <div className="text-center mb-8 bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-blue-200">
            <h2 className="text-3xl font-bold text-blue-900 mb-4 flex items-center justify-center space-x-4">
              <BarChart3 className="h-8 w-8 text-blue-700" />
              <span>Live Camp Dashboard</span>
              <img 
                src="/lovable-uploads/e7a1a4b6-8ae6-4b14-8b3a-39169bb6dc9f.png" 
                alt="TEMIMIM Logo" 
                className="h-8 w-8 object-contain"
              />
            </h2>
            <p className="text-lg text-blue-700">Real-time camp statistics and leaderboards</p>
          </div>
          <PublicDashboard />
        </div>
      </main>
    </div>
  );
};

export default Index;
