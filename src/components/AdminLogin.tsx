
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Shield } from 'lucide-react';
import { MasterData } from '@/utils/masterDataStorage';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = () => {
    const adminPassword = MasterData.getAdminPassword();
    
    // Accept admin/admin123 or admin/stored_password
    if (username === 'admin' && (password === 'admin123' || password === adminPassword)) {
      onLogin();
    } else {
      alert('Incorrect credentials. Use username: admin, password: admin123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          </div>
          <p className="text-gray-600">Administrative access to camp management</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Admin Login</span>
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>Enter your administrator credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <p className="text-xs text-gray-500">
              Username: <strong>admin</strong><br />
              Password: <strong>admin123</strong>
            </p>
            <Button 
              onClick={handleLogin}
              className="w-full bg-purple-600 hover:bg-purple-700 transition-colors"
              disabled={!username || !password}
            >
              Enter Admin Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
