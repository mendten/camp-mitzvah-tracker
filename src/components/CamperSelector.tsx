
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User } from 'lucide-react';
import { CAMP_DATA, type Camper } from '@/data/campData';

interface CamperSelectorProps {
  bunkId: string;
  onSelectCamper: (camperId: string) => void;
  onBack: () => void;
}

const CamperSelector: React.FC<CamperSelectorProps> = ({ bunkId, onSelectCamper, onBack }) => {
  const [selectedCamper, setSelectedCamper] = useState<string>('');
  const [accessCode, setAccessCode] = useState<string>('');

  const bunk = CAMP_DATA.find(b => b.id === bunkId);
  const campers = bunk?.campers || [];

  const handleLogin = () => {
    if (selectedCamper && accessCode) {
      // For simulation, accept any 4-digit code
      if (accessCode.length === 4) {
        onSelectCamper(selectedCamper);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">בחר את השם שלך</h1>
          <h2 className="text-2xl font-semibold text-blue-600">Select Your Name</h2>
          <p className="text-gray-600">Choose your name from Bunk {bunk?.displayName}</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bunk {bunk?.displayName} Campers</span>
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>Select your name and enter your access code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Your Name</Label>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {campers.map((camper: Camper) => (
                  <button
                    key={camper.id}
                    onClick={() => setSelectedCamper(camper.id)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
                      selectedCamper === camper.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{camper.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedCamper && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="accessCode">Access Code</Label>
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
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  disabled={!selectedCamper || accessCode.length !== 4}
                >
                  Enter Mission Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CamperSelector;
