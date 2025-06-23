
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, UserCheck, LogIn } from 'lucide-react';
import { getCurrentHebrewDate } from '@/utils/hebrewDate';
import { CAMP_DATA } from '@/data/campData';

const Index = () => {
  const navigate = useNavigate();
  const hebrewDate = getCurrentHebrewDate();
  
  const bunkColors = {
    alef: 'from-blue-400 to-blue-600',
    beis: 'from-green-400 to-green-600',
    gimmel: 'from-purple-400 to-purple-600',
    daled: 'from-orange-400 to-orange-600'
  };

  const handleBunkSelect = (bunkId: string) => {
    // Use consistent localStorage key
    localStorage.setItem('selectedBunk', bunkId);
    navigate('/camper-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative">
      {/* Logo Watermark Background */}
      <div 
        className="absolute inset-0 opacity-5 bg-center bg-no-repeat bg-contain pointer-events-none" 
        style={{
          backgroundImage: 'url(/lovable-uploads/3e849155-a2e3-4667-a070-7289c4581a44.png)'
        }} 
      />
      
      {/* Header */}
      <header className="bg-white/90 backdrop-blur shadow-lg border-b relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/3e849155-a2e3-4667-a070-7289c4581a44.png" 
                alt="Camp Gan Yisroel Florida Logo" 
                className="h-16 w-16 object-contain" 
              />
              <div>
                <h1 className="text-3xl font-bold text-blue-800">
                  Welcome to Gan Yisroel Florida!!
                </h1>
                <p className="text-lg text-purple-600 font-semibold">{hebrewDate.hebrew}</p>
                <p className="text-gray-600">{hebrewDate.english}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/staff')} 
                variant="outline" 
                className="bg-green-50 hover:bg-green-100 border-green-300"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Staff Portal
              </Button>
              <Button 
                onClick={() => navigate('/admin')} 
                variant="outline" 
                className="bg-purple-50 hover:bg-purple-100 border-purple-300"
              >
                <Shield className="h-4 w-4 mr-2" />
                Admin Portal
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Main Content */}
        <div className="text-center space-y-6 mb-12">
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Select your bunk to access the camper mission dashboard and track your progress!
          </p>
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Bunk</h2>
            <p className="text-gray-600">Click on your bunk to access the camper portal</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {CAMP_DATA.map(bunk => (
              <Card 
                key={bunk.id} 
                className="bg-white/80 backdrop-blur shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group" 
                onClick={() => handleBunkSelect(bunk.id)}
              >
                <CardHeader className="text-center space-y-4">
                  <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${bunkColors[bunk.id as keyof typeof bunkColors]} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">Bunk {bunk.displayName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Campers ({bunk.campers.length})</h4>
                      <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                        {bunk.campers.slice(0, 5).map((camper, index) => (
                          <div key={camper.id} className="truncate">
                            {camper.name}
                          </div>
                        ))}
                        {bunk.campers.length > 5 && (
                          <div className="text-gray-500 italic">+{bunk.campers.length - 5} more...</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Staff</h4>
                      <div className="text-xs text-gray-600">
                        {bunk.staff.map(staff => staff.name.split(' ')[0]).join(' & ')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <div className={`w-full py-3 px-4 rounded-lg bg-gradient-to-r ${bunkColors[bunk.id as keyof typeof bunkColors]} text-white text-center font-semibold transition-all duration-200 group-hover:opacity-90`}>
                      <LogIn className="h-4 w-4 inline mr-2" />
                      Enter Bunk {bunk.displayName}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center space-y-4">
          <div className="pt-8 border-t border-gray-200">
            <p className="text-gray-500">🏕️ Camp Gan Yisroel Florida 5785 • Building memories, one mission at a time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
