
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { CAMP_DATA } from '@/data/campData';

interface StaffLoginProps {
  onLogin: (staffId: string, bunkId: string) => void;
  onBack: () => void;
}

const StaffLogin: React.FC<StaffLoginProps> = ({ onLogin, onBack }) => {
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [accessCode, setAccessCode] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Get all staff members across all bunks with secure codes
  const allStaff = CAMP_DATA.flatMap(bunk => 
    bunk.staff.map((staff, index) => {
      // Extract kevutzah letter from bunk displayName  
      const bunkLetter = bunk.displayName.split(' ').pop()?.charAt(0).toUpperCase() || 'A';
      // Generate fixed staff code - no Math.random() to avoid changing codes
      const initials = staff.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
      const secureCode = `STF_${initials}_${bunkLetter}${index + 1}_9X7M`;
      
      return {
        ...staff,
        bunkName: bunk.displayName,
        bunkId: bunk.id,
        accessCode: secureCode
      };
    })
  );

  const handleLogin = () => {
    setError('');
    
    if (!selectedStaff || !accessCode) {
      setError('Please select your name and enter your access code');
      return;
    }

    const staff = allStaff.find(s => s.id === selectedStaff);
    if (!staff) {
      setError('Staff member not found');
      return;
    }

    // Validate access code (exact match required)
    if (accessCode !== staff.accessCode) {
      setError('Invalid access code. Please contact administration.');
      return;
    }

    onLogin(selectedStaff, staff.bunkId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Staff Portal</h1>
          <p className="text-gray-600">Select your name and enter your access code</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Staff Login</span>
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>Choose your name from the staff list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Your Name</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allStaff.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => setSelectedStaff(staff.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
                      selectedStaff === staff.id
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{staff.name}</span>
                      <span className="text-sm text-gray-600">Bunk {staff.bunkName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedStaff && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Staff Access Code</Label>
                  <Input
                    id="accessCode"
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter your access code"
                  />
                  <p className="text-xs text-gray-500">
                    Contact administration for your access code
                  </p>
                </div>
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-green-600 hover:bg-green-700 transition-colors"
                  disabled={!selectedStaff || !accessCode}
                >
                  Enter Staff Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffLogin;
