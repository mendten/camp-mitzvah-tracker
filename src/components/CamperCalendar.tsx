
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CamperCalendarProps {
  completedMissions: Set<string>;
  missions: any[];
  camperId: string;
}

const CamperCalendar: React.FC<CamperCalendarProps> = ({ completedMissions, missions, camperId }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate sample completion data for the calendar
  const getCompletionDataForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const savedData = localStorage.getItem(`camper_${camperId}_history_${dateKey}`);
    if (savedData) {
      return JSON.parse(savedData);
    }
    
    // Generate sample data for demo
    const isToday = date.toDateString() === new Date().toDateString();
    if (isToday) {
      return {
        completed: completedMissions.size,
        total: missions.length,
        missions: [...completedMissions]
      };
    }
    
    // Sample historical data
    const dayOfMonth = date.getDate();
    const completed = Math.min(missions.length, Math.floor(dayOfMonth / 3) + 2);
    return {
      completed,
      total: missions.length,
      missions: missions.slice(0, completed).map(m => m.id)
    };
  };

  const getDayColor = (date: Date) => {
    const data = getCompletionDataForDate(date);
    const percentage = data.total > 0 ? (data.completed / data.total) * 100 : 0;
    
    if (percentage === 100) return 'bg-green-500 text-white';
    if (percentage >= 75) return 'bg-green-300';
    if (percentage >= 50) return 'bg-yellow-300';
    if (percentage >= 25) return 'bg-orange-300';
    if (percentage > 0) return 'bg-red-300';
    return '';
  };

  const selectedDateData = selectedDate ? getCompletionDataForDate(selectedDate) : null;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Mission Calendar</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                return data.completed === data.total && data.total > 0;
              },
              partial: (date) => {
                const data = getCompletionDataForDate(date);
                return data.completed > 0 && data.completed < data.total;
              }
            }}
            modifiersStyles={{
              completed: { backgroundColor: '#10b981', color: 'white' },
              partial: { backgroundColor: '#f59e0b', color: 'white' }
            }}
          />
          <div className="mt-4 flex items-center justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Partial</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Not Started</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle>
            {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            }) : 'Select a Date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateData ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {selectedDateData.completed}/{selectedDateData.total}
                </div>
                <p className="text-gray-600">Missions Completed</p>
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
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Select a date to view mission completion details
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CamperCalendar;
