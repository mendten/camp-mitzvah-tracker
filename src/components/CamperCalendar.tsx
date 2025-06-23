
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DataStorage } from '@/utils/dataStorage';
import { DEFAULT_MISSIONS } from '@/data/campData';

interface CamperCalendarProps {
  completedMissions: Set<string>;
  missions: any[];
  camperId: string;
}

const CamperCalendar: React.FC<CamperCalendarProps> = ({ completedMissions, missions, camperId }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get real completion data for any date
  const getCompletionDataForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const isToday = dateKey === DataStorage.getTodayDateString();
    
    if (isToday) {
      // Use real data for today
      const status = DataStorage.getCamperTodayStatus(camperId);
      const todayMissions = DataStorage.getCamperTodayMissions(camperId);
      return {
        completed: status.submittedCount,
        total: missions.length,
        missions: todayMissions,
        status: status.status,
        qualified: status.qualified
      };
    } else {
      // Check submission history for other dates
      const history = DataStorage.getSubmissionHistory(camperId);
      const daySubmission = history.find(h => h.date === dateKey);
      
      if (daySubmission) {
        return {
          completed: daySubmission.missions.length,
          total: missions.length,
          missions: daySubmission.missions,
          status: daySubmission.status,
          qualified: daySubmission.missions.length >= DataStorage.getDailyRequired()
        };
      }
      
      // No data for this date
      return {
        completed: 0,
        total: missions.length,
        missions: [],
        status: 'not_submitted' as const,
        qualified: false
      };
    }
  };

  const getDayColor = (date: Date) => {
    const data = getCompletionDataForDate(date);
    
    if (data.status === 'approved') return 'bg-green-500 text-white';
    if (data.status === 'pending') return 'bg-yellow-500 text-white';
    if (data.status === 'edit_requested') return 'bg-blue-500 text-white';
    if (data.completed > 0) return 'bg-orange-300';
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
            className="rounded-md border pointer-events-auto"
            modifiers={{
              approved: (date) => {
                const data = getCompletionDataForDate(date);
                return data.status === 'approved';
              },
              pending: (date) => {
                const data = getCompletionDataForDate(date);
                return data.status === 'pending';
              },
              editRequested: (date) => {
                const data = getCompletionDataForDate(date);
                return data.status === 'edit_requested';
              },
              partial: (date) => {
                const data = getCompletionDataForDate(date);
                return data.completed > 0 && data.status === 'not_submitted';
              }
            }}
            modifiersStyles={{
              approved: { backgroundColor: '#10b981', color: 'white' },
              pending: { backgroundColor: '#f59e0b', color: 'white' },
              editRequested: { backgroundColor: '#3b82f6', color: 'white' },
              partial: { backgroundColor: '#fb923c', color: 'white' }
            }}
          />
          <div className="mt-4 flex items-center justify-center space-x-2 text-xs flex-wrap gap-2">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Approved</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Edit Request</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-400 rounded"></div>
              <span>Partial</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>None</span>
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
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                    selectedDateData.status === 'approved' ? 'bg-green-100 text-green-800' :
                    selectedDateData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedDateData.status === 'edit_requested' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedDateData.status === 'not_submitted' ? 'Not Submitted' :
                     selectedDateData.status === 'pending' ? 'Pending Approval' :
                     selectedDateData.status === 'edit_requested' ? 'Edit Requested' :
                     'Approved'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">Mission Details:</h4>
                {selectedDateData.missions.length > 0 ? (
                  <div className="grid gap-2">
                    {missions
                      .filter(m => selectedDateData.missions.includes(m.id))
                      .map(mission => (
                        <div key={mission.id} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                          <span className="text-green-600">✓</span>
                          <span className="text-sm font-medium">{mission.title}</span>
                          <span className="text-xs text-gray-500 capitalize">({mission.type})</span>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No missions completed on this day</p>
                )}
              </div>
              
              {selectedDateData.qualified && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">🎯</span>
                    <span className="text-sm font-medium text-green-800">
                      Qualified for this day!
                    </span>
                  </div>
                </div>
              )}
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
