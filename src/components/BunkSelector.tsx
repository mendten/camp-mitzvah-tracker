
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface BunkSelectorProps {
  onSelectBunk: (bunk: string) => void;
}

const BunkSelector: React.FC<BunkSelectorProps> = ({ onSelectBunk }) => {
  const [selectedBunk, setSelectedBunk] = useState<string>('');

  const bunks = [
    { id: 'aleph', name: 'Aleph', description: 'Ages 8-10', color: 'bg-blue-500' },
    { id: 'bet', name: 'Bet', description: 'Ages 11-13', color: 'bg-green-500' },
    { id: 'gimel', name: 'Gimel', description: 'Ages 14-16', color: 'bg-purple-500' },
    { id: 'dalet', name: 'Dalet', description: 'Ages 17+', color: 'bg-orange-500' }
  ];

  const handleConfirm = () => {
    if (selectedBunk) {
      onSelectBunk(selectedBunk);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Select Your Bunk</h1>
          <p className="text-gray-600">Choose your bunk to begin your mission journey</p>
        </div>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle>Available Bunks</CardTitle>
            <CardDescription>Select the bunk you belong to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {bunks.map((bunk) => (
                <button
                  key={bunk.id}
                  onClick={() => setSelectedBunk(bunk.name)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                    selectedBunk === bunk.name
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`p-3 rounded-lg ${bunk.color}`}>
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 text-lg">{bunk.name}</div>
                      <div className="text-sm text-gray-600">{bunk.description}</div>
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
                  Enter Bunk {selectedBunk}
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
