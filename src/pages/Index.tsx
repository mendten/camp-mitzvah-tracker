import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, UserCheck, Calendar, Trophy, Star } from 'lucide-react';
import { getCurrentHebrewDate } from '@/utils/hebrewDate';

const Index = () => {
  const navigate = useNavigate();
  const hebrewDate = getCurrentHebrewDate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              ברוכים הבאים לקמפ אריאל 🏕️
            </h1>
            <h2 className="text-3xl font-bold text-blue-600">
              Welcome to Camp Ariel!
            </h2>
          </div>
          
          <div className="space-y-1">
            <p className="text-lg text-purple-600 font-semibold">{hebrewDate.hebrew}</p>
            <p className="text-gray-600">{hebrewDate.english}</p>
          </div>

          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Track your daily missions, connect with your bunk, and make this summer unforgettable!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Camper Portal</CardTitle>
              <CardDescription className="text-gray-600">
                Access your personal mission dashboard and track your daily progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span>Complete daily missions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <span>View progress calendar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-purple-500" />
                  <span>Track your achievements</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/camper-login')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Enter Camper Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Staff Portal</CardTitle>
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
                  <span>Bulk complete missions</span>
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
                Enter Staff Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur shadow-xl border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Admin Portal</CardTitle>
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
                Enter Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center space-y-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto text-sm text-gray-600">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">For Campers</h3>
              <p>Complete your daily missions, track progress, and celebrate achievements with your bunk!</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">For Staff</h3>
              <p>Support your campers, manage bunk activities, and ensure everyone stays on track.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">For Administrators</h3>
              <p>Oversee the entire camp, create missions, and analyze camp-wide progress.</p>
            </div>
          </div>
          
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
