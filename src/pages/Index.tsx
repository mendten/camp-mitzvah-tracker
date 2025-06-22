
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, UserCheck, Calendar, Trophy, Star, LogIn } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome to Camp Ariel! 🏕️
            </h1>
          </div>
          
          <div className="space-y-1">
            <p className="text-lg text-purple-600 font-semibold">{hebrewDate.hebrew}</p>
            <p className="text-gray-600">{hebrewDate.english}</p>
          </div>

          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Track your daily missions, connect with your bunk, and make this summer unforgettable!
          </p>
        </div>

        {/* Bunks Dashboard */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Camp Bunks</h2>
            <p className="text-gray-600">Select your bunk to access the camper portal</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {CAMP_DATA.map((bunk) => (
              <Card key={bunk.id} className="bg-white/80 backdrop-blur shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardHeader className="text-center space-y-4">
                  <div className={`mx-auto w-16 h-16 bg-gradient-to-br ${bunkColors[bunk.id as keyof typeof bunkColors]} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">Bunk {bunk.displayName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-2">Campers ({bunk.campers.length})</h4>
                      <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                        {bunk.campers.map((camper, index) => (
                          <div key={camper.id} className="truncate">
                            {camper.name}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-sm text-gray-700 mb-1">Staff</h4>
                      <div className="text-xs text-gray-600">
                        {bunk.staff.map(staff => staff.name).join(' & ')}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/camper-login')}
                    className={`w-full bg-gradient-to-r ${bunkColors[bunk.id as keyof typeof bunkColors]} hover:opacity-90 transition-all duration-200`}
                  >
                    Join Bunk {bunk.displayName}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Staff and Admin Access */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff & Administrative Access</h2>
            <p className="text-gray-600">Manage bunks, track progress, and oversee camp activities</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">Staff Portal</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage your bunk, track camper progress, and support your team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Manage bunk members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>Approve mission completions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span>View detailed reports</span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/staff')}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Staff Login
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl text-gray-900">Admin Portal</CardTitle>
                <CardDescription className="text-gray-600">
                  Full camp management, mission control, and administrative oversight
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    <span>Manage all bunks & staff</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span>Create & edit missions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span>View camp analytics</span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/admin')}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-200"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16 text-center space-y-4">
          <div className="pt-8 border-t border-gray-200">
            <p className="text-gray-500">
              🏕️ Camp Ariel Summer 2024 • Building memories, one mission at a time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
