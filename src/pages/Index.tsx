
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Target, Sparkles } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Star,
      title: 'Daily Missions',
      description: 'Complete meaningful Jewish activities and track your spiritual journey'
    },
    {
      icon: Users,
      title: 'Bunk Community',
      description: 'Connect with your bunkmates and build lasting friendships'
    },
    {
      icon: Target,
      title: 'Progress Tracking',
      description: 'Watch your growth with visual progress indicators and achievements'
    },
    {
      icon: Sparkles,
      title: 'Fun Rewards',
      description: 'Earn exciting rewards and celebrate your accomplishments'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Camp Missions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track your Jewish summer camp journey with daily missions, progress monitoring, and meaningful connections.
          </p>
          <div className="text-lg text-blue-600 font-medium">
            {new Date().toLocaleDateString('he-IL', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              calendar: 'hebrew'
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center bg-white/80 backdrop-blur shadow-lg border-0 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center space-y-8">
          <Card className="max-w-md mx-auto bg-white/80 backdrop-blur shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Begin?</CardTitle>
              <CardDescription>
                Join your camp community and start tracking your missions today!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/login')}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Button>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-8 text-sm text-gray-500">
            <span>✨ Summer 2024</span>
            <span>🏕️ Jewish Summer Camp</span>
            <span>📱 Mobile Friendly</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
