
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User } from 'lucide-react';
import { MasterData } from '@/utils/masterDataStorage';

const CamperLogin = () => {
  const navigate = useNavigate();
  const [selectedBunkId, setSelectedBunkId] = useState<string>('');
  const [selectedCamper, setSelectedCamper] = useState<string>('');
  const [accessCode, setAccessCode] = useState<string>('');
  const [campers, setCampers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampersForBunk();
  }, [navigate]);

  const loadCampersForBunk = async () => {
    console.log('CamperLogin - checking localStorage...');
    const bunkId = localStorage.getItem('selectedBunk');
    console.log('Found bunkId in localStorage:', bunkId);
    
    if (!bunkId) {
      console.log('No bunk selected, redirecting to home');
      navigate('/');
      return;
    }
    
    setSelectedBunkId(bunkId);
    setLoading(true);
    
    try {
      // Get campers for this bunk from MasterData
      const allProfiles = await MasterData.getAllCamperProfiles();
      const bunkCampers = allProfiles.filter(profile => profile.bunkId === bunkId);
      setCampers(bunkCampers);
    } catch (error) {
      console.error('Error loading campers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCamperSelect = (camperId: string) => {
    setSelectedCamper(camperId);
  };

  const handleLogin = () => {
    if (!selectedCamper || !accessCode) {
      return;
    }

    // Get the camper profile to verify the code
    const camperProfile = campers.find(c => c.id === selectedCamper);
    
    if (!camperProfile) {
      alert('Camper not found!');
      return;
    }

    // Validate exact code match only
    if (accessCode === camperProfile.code) {
      console.log('Camper logged in:', selectedCamper);
      localStorage.setItem('selectedCamper', selectedCamper);
      localStorage.setItem('selectedBunk', selectedBunkId);
      navigate('/camper');
    } else {
      alert('Incorrect access code. Please check your code and try again.');
    }
  };

  const handleBack = () => {
    localStorage.removeItem('selectedBunk');
    navigate('/');
  };

  if (!selectedBunkId || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campers...</p>
        </div>
      </div>
    );
  }

  const selectedBunk = campers.length > 0 ? campers[0].bunkName : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">בחר את השם שלך</h1>
          <h2 className="text-2xl font-semibold text-blue-600">Select Your Name</h2>
          <p className="text-gray-600">Choose your name from Bunk {selectedBunk}</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bunk {selectedBunk} Campers</span>
              <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>Select your name and enter your access code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Your Name</Label>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {campers.map((camper) => (
                  <button
                    key={camper.id}
                    onClick={() => handleCamperSelect(camper.id)}
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
                      <div>
                        <span className="font-medium text-gray-900">{camper.name}</span>
                      </div>
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
                    placeholder="Enter your access code"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500">
                    Enter your personal access code
                  </p>
                </div>
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                  disabled={!selectedCamper || !accessCode}
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

export default CamperLogin;
