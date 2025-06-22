
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Star, Sun, Moon } from 'lucide-react';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const roles = [
    { id: 'camper', name: 'Camper', icon: Star, color: 'bg-blue-500', description: 'Complete daily missions' },
    { id: 'staff', name: 'Staff', icon: Sun, color: 'bg-green-500', description: 'Guide and monitor campers' },
    { id: 'admin', name: 'Admin', icon: Moon, color: 'bg-purple-500', description: 'Manage everything' }
  ];

  const handleLogin = () => {
    if (selectedRole && credentials.username && credentials.password) {
      navigate(`/${selectedRole}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Camp Missions</h1>
          <p className="text-gray-600">Track your summer journey</p>
          <div className="text-sm text-blue-600 font-medium">
            {new Date().toLocaleDateString('he-IL', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              calendar: 'hebrew'
            })}
          </div>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Choose Your Role</CardTitle>
            <CardDescription>Select how you'll be using the app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    selectedRole === role.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${role.color}`}>
                      <role.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900">{role.name}</div>
                      <div className="text-sm text-gray-600">{role.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedRole && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    placeholder="Enter your username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder="Enter your password"
                  />
                </div>
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  disabled={!credentials.username || !credentials.password}
                >
                  Enter Camp
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
