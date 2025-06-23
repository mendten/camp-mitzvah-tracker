import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, AlertTriangle, Send, Clock } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  type: string;
  completed: boolean;
  icon: string;
  isMandatory?: boolean;
  submitted?: boolean;
  approved?: boolean;
}

interface MissionCardProps {
  mission: Mission;
  onToggle: () => void;
  onSubmit?: () => void;
  showSubmitButton?: boolean;
  disabled?: boolean;
}

const MissionCard: React.FC<MissionCardProps> = ({ 
  mission, 
  onToggle, 
  onSubmit, 
  showSubmitButton = false,
  disabled = false
}) => {
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

  const getStatusColor = () => {
    if (mission.approved) return 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg shadow-green-200/50';
    if (mission.submitted) return 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-lg shadow-yellow-200/50';
    if (mission.completed) return 'border-blue-500 bg-gradient-to-br from-blue-50 to-sky-50 shadow-lg shadow-blue-200/50';
    return mission.isMandatory 
      ? 'border-red-300 bg-gradient-to-br from-red-50 to-pink-50 hover:border-red-400'
      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg';
  };

  const getStatusIcon = () => {
    if (mission.approved) return <CheckCircle2 className="h-8 w-8 text-green-500" />;
    if (mission.submitted) return <Clock className="h-8 w-8 text-yellow-500" />;
    if (mission.completed) return <Send className="h-8 w-8 text-blue-500" />;
    return (
      <div className="flex items-center space-x-1">
        {mission.isMandatory && <AlertTriangle className="h-5 w-5 text-red-500" />}
        <Circle className="h-8 w-8 text-gray-400 group-hover:text-blue-400 transition-colors" />
      </div>
    );
  };

  const getStatusText = () => {
    if (mission.approved) return '✅ Approved!';
    if (mission.submitted) return '⏳ Pending approval';
    if (mission.completed) return '📤 Ready to submit';
    return 'Tap to complete';
  };

  const getStatusTextColor = () => {
    if (mission.approved) return 'text-green-600';
    if (mission.submitted) return 'text-yellow-600';
    if (mission.completed) return 'text-blue-600';
    return 'text-gray-600 group-hover:text-blue-600';
  };

  const handleCardClick = () => {
    if (!disabled && !mission.submitted && !mission.approved) {
      onToggle();
    }
  };

  return (
    <Card 
      className={`transition-all duration-300 border-2 ${getStatusColor()} group ${
        disabled || mission.submitted || mission.approved 
          ? 'cursor-default opacity-75' 
          : 'cursor-pointer hover:scale-105 hover:shadow-xl'
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getTypeGradient(mission.type)} flex items-center justify-center text-2xl shadow-md transform transition-transform group-hover:scale-110`}>
            {mission.icon}
          </div>
          <div className="relative">
            {getStatusIcon()}
          </div>
        </div>
        
        <h3 className={`text-lg font-semibold mb-2 transition-colors ${
          mission.approved ? 'text-green-700' : 
          mission.submitted ? 'text-yellow-700' :
          mission.completed ? 'text-blue-700' : 
          'text-gray-900 group-hover:text-blue-700'
        }`}>
          {mission.title}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              mission.approved ? 'bg-green-100 text-green-700' :
              mission.submitted ? 'bg-yellow-100 text-yellow-700' :
              mission.completed ? 'bg-blue-100 text-blue-700' : 
              'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'
            } transition-colors capitalize`}>
              {mission.type}
            </span>
            {mission.isMandatory && (
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                Mandatory
              </span>
            )}
          </div>
          
          <p className={`text-sm font-medium ${getStatusTextColor()} transition-colors`}>
            {getStatusText()}
          </p>
        </div>

        {showSubmitButton && mission.completed && !mission.submitted && !mission.approved && (
          <Button 
            size="sm" 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={(e) => {
              e.stopPropagation();
              onSubmit?.();
            }}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit for Approval
          </Button>
        )}

        {(mission.submitted || mission.approved) && (
          <div className="mt-3 text-center">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              mission.approved 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            } animate-fade-in`}>
              {mission.approved ? 'Approved! 🎉' : 'Awaiting staff approval ⏳'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MissionCard;
