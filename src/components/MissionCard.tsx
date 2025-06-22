
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle, Star, AlertTriangle } from 'lucide-react';

interface Mission {
  id: number;
  title: string;
  type: string;
  completed: boolean;
  icon: string;
  isMandatory?: boolean;
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
      case 'shabbat': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeGradient = (type: string) => {
    switch (type) {
      case 'prayer': return 'from-yellow-400 to-orange-500';
      case 'learning': return 'from-blue-400 to-blue-600';
      case 'mitzvah': return 'from-red-400 to-pink-500';
      case 'activity': return 'from-green-400 to-emerald-500';
      case 'reflection': return 'from-purple-400 to-violet-500';
      case 'shabbat': return 'from-indigo-400 to-purple-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
        mission.completed 
          ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-200/50' 
          : mission.isMandatory
          ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50 hover:border-red-400'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
      } group`}
      onClick={onToggle}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTypeGradient(mission.type)} flex items-center justify-center text-2xl shadow-md transform transition-transform group-hover:scale-110`}>
            {mission.icon}
          </div>
          <div className="relative">
            {mission.completed ? (
              <div className="relative">
                <CheckCircle2 className="h-8 w-8 text-green-500 animate-scale-in" />
                <Star className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                {mission.isMandatory && (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
                <Circle className="h-8 w-8 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </div>
            )}
          </div>
        </div>
        
        <h3 className={`text-lg font-semibold mb-2 transition-colors ${
          mission.completed ? 'text-green-700' : 'text-gray-900 group-hover:text-blue-700'
        }`}>
          {mission.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              mission.completed 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'
            } transition-colors capitalize`}>
              {mission.type}
            </span>
            {mission.isMandatory && (
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                Mandatory
              </span>
            )}
          </div>
          
          <p className={`text-sm font-medium ${
            mission.completed ? 'text-green-600' : 'text-gray-600 group-hover:text-blue-600'
          } transition-colors`}>
            {mission.completed ? '✨ Complete!' : 'Tap to complete'}
          </p>
        </div>

        {mission.completed && (
          <div className="mt-3 text-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-fade-in">
              <Star className="h-3 w-3 mr-1" />
              +5 points earned!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MissionCard;
