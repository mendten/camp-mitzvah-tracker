
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Users, CheckCircle, XCircle } from 'lucide-react';
import { MasterData } from '@/utils/masterDataStorage';
import { formatHebrewDate, getHebrewDateForDate } from '@/utils/hebrewDate';

interface EnhancedCalendarProps {
  completedMissions: Set<string>;
  missions: any[];
  camperId: string;
  isAdminView?: boolean;
}

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({ 
  completedMissions, 
  missions, 
  camperId,
  isAdminView = false 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showHebrewDates, setShowHebrewDates] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDayData = (date: Date) => {
    if (isAdminView) {
      // For admin view, show camp-wide statistics using MasterData
      const allCampers = MasterData.getAllCampersWithStatus();
      const totalCampers = allCampers.length;
      const qualifiedCampers = allCampers.filter(c => c.isQualified).length;
      const totalCompletions = allCampers.reduce((sum, c) => sum + c.missionCount, 0);

      return {
        qualifiedCampers,
        totalCampers,
        totalCompletions,
        qualificationRate: totalCampers > 0 ? Math.round((qualifiedCampers / totalCampers) * 100) : 0
      };
    } else {
      // For individual camper view
      const todaySubmission = MasterData.getCamperTodaySubmission(camperId);
      const workingMissions = MasterData.getCamperWorkingMissions(camperId);
      const dailyRequired = MasterData.getDailyRequired();
      
      let completions = 0;
      if (todaySubmission) {
        completions = todaySubmission.missions.length;
      } else {
        completions = workingMissions.length;
      }

      return {
        completions,
        isQualified: completions >= dailyRequired
      };
    }
  };

  const renderCalendarDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const isToday = date.toDateString() === today.toDateString();
    const isPast = date < today;
    const isFuture = date > today;
    
    const dayData = getDayData(date);
    const hebrewDate = showHebrewDates ? formatHebrewDate(date) : null;

    return (
      <div
        key={day}
        className={`
          min-h-24 p-2 border border-gray-200 rounded-lg transition-all hover:shadow-md
          ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}
          ${isPast ? 'opacity-75' : ''}
          ${isFuture ? 'opacity-50' : ''}
        `}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
            {day}
          </span>
          {hebrewDate && (
            <span className="text-xs text-purple-600 font-medium">
              {hebrewDate.split(' ')[0]}
            </span>
          )}
        </div>

        {isAdminView ? (
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3 text-blue-500" />
              <span className="text-xs">{dayData.qualifiedCampers}/{dayData.totalCampers}</span>
            </div>
            <Badge 
              variant={dayData.qualificationRate >= 80 ? "default" : dayData.qualificationRate >= 60 ? "secondary" : "destructive"}
              className="text-xs px-1 py-0"
            >
              {dayData.qualificationRate}%
            </Badge>
            <div className="text-xs text-gray-500">
              {dayData.totalCompletions} total
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              {dayData.isQualified ? (
                <CheckCircle className="h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs">{dayData.completions}</span>
            </div>
            <Badge 
              variant={dayData.isQualified ? "default" : "secondary"}
              className="text-xs px-1 py-0"
            >
              {dayData.isQualified ? 'Qualified' : 'Missing'}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1), 1));
  };

  const calendarDays = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="min-h-24"></div>);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(renderCalendarDay(day));
  }

  const allCampers = MasterData.getAllCampersWithStatus();
  const totalCampers = allCampers.length;
  const dailyRequired = MasterData.getDailyRequired();
  const currentSession = localStorage.getItem('current_session') || '0';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={showHebrewDates ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHebrewDates(!showHebrewDates)}
          >
            Hebrew Calendar
          </Button>
          <Button
            variant={viewMode === 'month' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
          <Button
            variant={viewMode === 'week' ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
        </div>
      </div>

      {isAdminView && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalCampers}</div>
                <div className="text-sm text-gray-600">Total Campers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {missions.filter(m => m.isActive).length}
                </div>
                <div className="text-sm text-gray-600">Active Missions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{dailyRequired}</div>
                <div className="text-sm text-gray-600">Daily Required</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">Session {currentSession}</div>
                <div className="text-sm text-gray-600">Current Session</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-7 gap-2">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day.slice(0, 3)}
          </div>
        ))}
        {calendarDays}
      </div>

      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Qualified</span>
        </div>
        <div className="flex items-center space-x-2">
          <XCircle className="h-3 w-3 text-red-500" />
          <span>Not Qualified</span>
        </div>
        {isAdminView && (
          <div className="flex items-center space-x-2">
            <Users className="h-3 w-3 text-blue-500" />
            <span>Camp Stats</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCalendar;
