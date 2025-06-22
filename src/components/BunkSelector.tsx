
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { CAMP_DATA, type Bunk } from '@/data/campData';

interface BunkSelectorProps {
  onSelectBunk: (bunkId: string) => void;
}

const BunkSelector: React.FC<BunkSelectorProps> = ({ onSelectBunk }) => {
  const [selectedBunk, setSelectedBunk] = useState<string>('');

  const bunkColors = {
    alef: 'bg-blue-500',
    beis: 'bg-green-500', 
    gimmel: 'bg-purple-500',
    daled: 'bg-orange-500'
  };

  const handleConfirm = () => {
    if (selectedBunk) {
      onSelectBunk(selectedBunk);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">בחר את הבאנק שלך</h1>
          <h2 className="text-2xl font-semibold text-blue-600">Select Your Bunk</h2>
          <p className="text-gray-600">Choose your bunk to continue to camper selection</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Available Bunks</CardTitle>
            <CardDescription>Select the bunk you belong to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {CAMP_DATA.map((bunk: Bunk) => (
                <button
                  key={bunk.id}
                  onClick={() => setSelectedBunk(bunk.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    selectedBunk === bunk.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-lg ${bunkColors[bunk.id as keyof typeof bunkColors]}`}>
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-lg">Bunk {bunk.displayName}</div>
                      <div className="text-sm text-gray-600">{bunk.campers.length} campers</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Staff: {bunk.staff.map(s => s.name.split(' ')[0]).join(' & ')}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedBunk && (
              <div className="pt-4 animate-fade-in">
                <Button 
                  onClick={handleConfirm}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Continue to Bunk {CAMP_DATA.find(b => b.id === selectedBunk)?.displayName}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BunkSelector;
