
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';

interface Mission {
  id: number;
  title: string;
  type: string;
  completed: boolean;
  icon: string;
}

interface MissionCardProps {
  mission: Mission;
  onToggle: () => void;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onToggle }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prayer': return 'bg-yellow-500';
      case 'learning': return 'bg-blue-500';
      case 'mitzvah': return 'bg-red-500';
      case 'activity': return 'bg-green-500';
      case 'reflection': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 ${
        mission.completed 
          ? 'border-green-500 bg-green-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${getTypeColor(mission.type)} flex items-center justify-center text-2xl`}>
            {mission.icon}
          </div>
          {mission.completed ? (
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          ) : (
            <Circle className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${
          mission.completed ? 'text-green-700' : 'text-gray-900'
        }`}>
          {mission.title}
        </h3>
        <p className={`text-sm ${
          mission.completed ? 'text-green-600' : 'text-gray-600'
        }`}>
          {mission.completed ? 'Complete!' : 'Click to mark complete'}
        </p>
      </CardContent>
    </Card>
  );
};

export default MissionCard;
