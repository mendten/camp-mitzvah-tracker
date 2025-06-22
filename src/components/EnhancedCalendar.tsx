
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';
import { getCurrentHebrewDate } from '@/utils/hebrewDate';

interface EnhancedCalendarProps {
  completedMissions: Set<string>;
  missions: any[];
  camperId?: string;
  isAdminView?: boolean;
  bunkCampers?: any[];
}

const HEBREW_MONTHS = [
  'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר',
  'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
];

const HEBREW_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

const EnhancedCalendar: React.FC<EnhancedCalendarProps> = ({ 
  completedMissions, 
  missions, 
  camperId, 
  isAdminView = false,
  bunkCampers = []
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showHebrewCalendar, setShowHebrewCalendar] = useState(false);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [showFilters, setShowFilters] = useState(false);

  const getHebrewDate = (date: Date) => {
    const day = date.getDate();
    const month = HEBREW_MONTHS[date.getMonth()];
    const year = 'תשפ"ה';
    return `${day} ${month} ${year}`;
  };

  const getCompletionDataForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    if (isAdminView) {
      // Admin view: show camp-wide statistics
      let totalCompletedMissions = 0;
      let totalCampersWithMissions = 0;
      
      bunkCampers.forEach(camper => {
        const savedData = localStorage.getItem(`camper_${camper.id}_missions`);
        if (savedData) {
          const completed = JSON.parse(savedData);
          if (completed.length > 0) {
            totalCompletedMissions += completed.length;
            totalCampersWithMissions++;
          }
        }
      });
      
      return {
        completed: totalCampersWithMissions,
        total: bunkCampers.length,
        missions: totalCompletedMissions,
        isToday: dateKey === today,
        isFuture: dateKey > today
      };
    } else {
      // Individual camper view
      if (!camperId) return { completed: 0, total: missions.length, missions: [], isToday: false, isFuture: false };
      
      const savedData = localStorage.getItem(`camper_${camperId}_history_${dateKey}`);
      if (savedData) {
        return { ...JSON.parse(savedData), isToday: dateKey === today, isFuture: dateKey > today };
      }
      
      const isToday = dateKey === today;
      if (isToday) {
        return {
          completed: completedMissions.size,
          total: missions.length,
          missions: [...completedMissions],
          isToday: true,
          isFuture: false
        };
      }
      
      return {
        completed: 0,
        total: missions.length,
        missions: [],
        isToday: false,
        isFuture: dateKey > today
      };
    }
  };

  const getDayColor = (date: Date) => {
    const data = getCompletionDataForDate(date);
    if (data.isFuture) return '';
    
    const percentage = data.total > 0 ? (data.completed / data.total) * 100 : 0;
    
    if (percentage === 100) return 'bg-green-500 text-white hover:bg-green-600';
    if (percentage >= 75) return 'bg-green-300 hover:bg-green-400';
    if (percentage >= 50) return 'bg-yellow-300 hover:bg-yellow-400';
    if (percentage >= 25) return 'bg-orange-300 hover:bg-orange-400';
    if (percentage > 0) return 'bg-red-300 hover:bg-red-400';
    return 'hover:bg-gray-100';
  };

  const selectedDateData = selectedDate ? getCompletionDataForDate(selectedDate) : null;

  const exportCalendarData = () => {
    // Implementation for calendar data export
    console.log('Exporting calendar data...');
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{isAdminView ? 'Camp-Wide Mission Calendar' : 'Mission Calendar'}</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="hebrew-calendar"
                  checked={showHebrewCalendar}
                  onCheckedChange={setShowHebrewCalendar}
                />
                <Label htmlFor="hebrew-calendar" className="text-xs">Hebrew</Label>
              </div>
              <Button variant="outline" size="sm" onClick={exportCalendarData}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {showHebrewCalendar 
                ? getHebrewDate(currentMonth)
                : currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              }
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <Label className="text-xs">View:</Label>
                {(['daily', 'weekly', 'monthly'] as const).map(mode => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="text-xs"
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border"
            modifiers={{
              completed: (date) => {
                const data = getCompletionDataForDate(date);
                return !data.isFuture && data.completed === data.total && data.total > 0;
              },
              partial: (date) => {
                const data = getCompletionDataForDate(date);
                return !data.isFuture && data.completed > 0 && data.completed < data.total;
              },
              future: (date) => {
                const data = getCompletionDataForDate(date);
                return data.isFuture;
              }
            }}
            modifiersStyles={{
              completed: { backgroundColor: '#10b981', color: 'white' },
              partial: { backgroundColor: '#f59e0b', color: 'white' },
              future: { backgroundColor: '#f3f4f6', color: '#9ca3af' }
            }}
            formatters={showHebrewCalendar ? {
              formatDay: (date) => HEBREW_DAYS[date.getDay()],
              formatMonthCaption: (date) => getHebrewDate(date)
            } : undefined}
          />
          
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>{isAdminView ? 'All Completed' : 'Completed'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Partial</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Not Started</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>Future</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle>
            {selectedDate ? (showHebrewCalendar 
              ? getHebrewDate(selectedDate)
              : selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })
            ) : 'Select a Date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateData ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {isAdminView 
                    ? `${selectedDateData.completed}/${selectedDateData.total}`
                    : `${selectedDateData.completed}/${selectedDateData.total}`
                  }
                </div>
                <p className="text-gray-600">
                  {isAdminView ? 'Campers with Missions' : 'Missions Completed'}
                </p>
                {isAdminView && (
                  <p className="text-sm text-gray-500">
                    Total Missions: {selectedDateData.missions}
                  </p>
                )}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${selectedDateData.total > 0 ? (selectedDateData.completed / selectedDateData.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {selectedDateData.isFuture && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">This date is in the future</p>
                </div>
              )}
              
              {!isAdminView && !selectedDateData.isFuture && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Completed Missions:</h4>
                  {selectedDateData.missions.length > 0 ? (
                    <div className="grid gap-2">
                      {missions
                        .filter(m => selectedDateData.missions.includes(m.id))
                        .map(mission => (
                          <div key={mission.id} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            <span className="text-green-600">✓</span>
                            <span className="text-sm">{mission.title}</span>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No missions completed on this day</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Select a date to view details
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCalendar;
