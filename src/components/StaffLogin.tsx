
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { CAMP_DATA } from '@/data/campData';

interface StaffLoginProps {
  onLogin: (staffId: string, bunkId: string) => void;
  onBack: () => void;
}

const StaffLogin: React.FC<StaffLoginProps> = ({ onLogin, onBack }) => {
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [accessCode, setAccessCode] = useState<string>('');

  // Get all staff members across all bunks
  const allStaff = CAMP_DATA.flatMap(bunk => 
    bunk.staff.map(staff => ({
      ...staff,
      bunkName: bunk.displayName,
      bunkId: bunk.id
    }))
  );

  const handleLogin = () => {
    if (selectedStaff && accessCode) {
      // Accept any 4-digit code for testing
      if (accessCode.length === 4) {
        const staff = allStaff.find(s => s.id === selectedStaff);
        if (staff) {
          onLogin(selectedStaff, staff.bunkId);
        }
      } else {
        alert('Please enter a 4-digit access code');
      }
    }
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
                    placeholder="Enter your 4-digit code"
                    maxLength={4}
                  />
                  <p className="text-xs text-gray-500">
                    Enter any 4-digit code for testing
                  </p>
                </div>
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-green-600 hover:bg-green-700 transition-colors"
                  disabled={!selectedStaff || accessCode.length !== 4}
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
