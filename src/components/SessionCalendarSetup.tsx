
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Settings, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SessionCalendarSetup = () => {
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState(0);
  const [session1Start, setSession1Start] = useState<Date | undefined>(undefined);
  const [session1End, setSession1End] = useState<Date | undefined>(undefined);
  const [session2Start, setSession2Start] = useState<Date | undefined>(undefined);
  const [session2End, setSession2End] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState<'session1_start' | 'session1_end' | 'session2_start' | 'session2_end' | null>(null);

  useEffect(() => {
    // Load saved session data
    const savedSession = localStorage.getItem('current_session');
    const session1StartDate = localStorage.getItem('session1_start_date');
    const session1EndDate = localStorage.getItem('session1_end_date');
    const session2StartDate = localStorage.getItem('session2_start_date');
    const session2EndDate = localStorage.getItem('session2_end_date');

    if (savedSession) setCurrentSession(parseInt(savedSession));
    if (session1StartDate) setSession1Start(new Date(session1StartDate));
    if (session1EndDate) setSession1End(new Date(session1EndDate));
    if (session2StartDate) setSession2Start(new Date(session2StartDate));
    if (session2EndDate) setSession2End(new Date(session2EndDate));
  }, []);

  const saveSessionSettings = () => {
    localStorage.setItem('current_session', currentSession.toString());
    
    if (session1Start) localStorage.setItem('session1_start_date', session1Start.toISOString());
    if (session1End) localStorage.setItem('session1_end_date', session1End.toISOString());
    if (session2Start) localStorage.setItem('session2_start_date', session2Start.toISOString());
    if (session2End) localStorage.setItem('session2_end_date', session2End.toISOString());

    // Set the session start date for tracking
    if (currentSession === 1 && session1Start) {
      localStorage.setItem('session_start_date', session1Start.toISOString());
    } else if (currentSession === 2 && session2Start) {
      localStorage.setItem('session_start_date', session2Start.toISOString());
    }

    toast({
      title: "Session Settings Saved",
      description: `Session ${currentSession} configuration has been saved.`,
    });
  };

  const activateSession = (sessionNumber: number) => {
    setCurrentSession(sessionNumber);
    localStorage.setItem('current_session', sessionNumber.toString());

    if (sessionNumber === 1 && session1Start) {
      localStorage.setItem('session_start_date', session1Start.toISOString());
    } else if (sessionNumber === 2 && session2Start) {
      localStorage.setItem('session_start_date', session2Start.toISOString());
    }

    toast({
      title: "Session Activated",
      description: `Session ${sessionNumber} is now active.`,
    });
  };

  const getCurrentSessionStatus = () => {
    const now = new Date();
    
    if (currentSession === 0) return { status: 'pre-camp', message: 'Pre-Camp Phase' };
    
    if (currentSession === 1) {
      if (!session1Start || !session1End) return { status: 'not-configured', message: 'Session 1 Not Configured' };
      if (now < session1Start) return { status: 'scheduled', message: 'Session 1 Scheduled' };
      if (now >= session1Start && now <= session1End) return { status: 'active', message: 'Session 1 Active' };
      if (now > session1End) return { status: 'completed', message: 'Session 1 Completed' };
    }
    
    if (currentSession === 2) {
      if (!session2Start || !session2End) return { status: 'not-configured', message: 'Session 2 Not Configured' };
      if (now < session2Start) return { status: 'scheduled', message: 'Session 2 Scheduled' };
      if (now >= session2Start && now <= session2End) return { status: 'active', message: 'Session 2 Active' };
      if (now > session2End) return { status: 'completed', message: 'Session 2 Completed' };
    }
    
    return { status: 'unknown', message: 'Unknown Status' };
  };

  const sessionStatus = getCurrentSessionStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'not-configured': return 'bg-yellow-100 text-yellow-800';
      case 'pre-camp': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>Session Management</span>
            <Badge className={`ml-4 ${getStatusColor(sessionStatus.status)}`}>
              {sessionStatus.message}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Session Selection */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card 
              className={`cursor-pointer border-2 transition-all ${
                currentSession === 0 ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
              }`}
              onClick={() => activateSession(0)}
            >
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold">Session 0</h3>
                <p className="text-sm text-gray-600">Pre-Camp</p>
                {currentSession === 0 && <Badge className="mt-2">Active</Badge>}
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer border-2 transition-all ${
                currentSession === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => session1Start && activateSession(1)}
            >
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold">Session 1</h3>
                <p className="text-sm text-gray-600">
                  {session1Start ? session1Start.toLocaleDateString() : 'Not configured'}
                </p>
                {currentSession === 1 && <Badge className="mt-2">Active</Badge>}
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer border-2 transition-all ${
                currentSession === 2 ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
              }`}
              onClick={() => session2Start && activateSession(2)}
            >
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold">Session 2</h3>
                <p className="text-sm text-gray-600">
                  {session2Start ? session2Start.toLocaleDateString() : 'Not configured'}
                </p>
                {currentSession === 2 && <Badge className="mt-2">Active</Badge>}
              </CardContent>
            </Card>
          </div>

          {/* Session 1 Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session 1 Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      onClick={() => setShowCalendar('session1_start')}
                      className="w-full justify-start"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {session1Start ? session1Start.toLocaleDateString() : 'Select start date'}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>End Date</Label>
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      onClick={() => setShowCalendar('session1_end')}
                      className="w-full justify-start"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {session1End ? session1End.toLocaleDateString() : 'Select end date'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session 2 Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session 2 Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      onClick={() => setShowCalendar('session2_start')}
                      className="w-full justify-start"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {session2Start ? session2Start.toLocaleDateString() : 'Select start date'}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>End Date</Label>
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      onClick={() => setShowCalendar('session2_end')}
                      className="w-full justify-start"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {session2End ? session2End.toLocaleDateString() : 'Select end date'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Picker */}
          {showCalendar && (
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={
                    showCalendar === 'session1_start' ? session1Start :
                    showCalendar === 'session1_end' ? session1End :
                    showCalendar === 'session2_start' ? session2Start :
                    session2End
                  }
                  onSelect={(date) => {
                    if (showCalendar === 'session1_start') setSession1Start(date);
                    else if (showCalendar === 'session1_end') setSession1End(date);
                    else if (showCalendar === 'session2_start') setSession2Start(date);
                    else if (showCalendar === 'session2_end') setSession2End(date);
                    setShowCalendar(null);
                  }}
                  className="rounded-md border"
                />
                <Button
                  variant="outline"
                  onClick={() => setShowCalendar(null)}
                  className="mt-2 w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={saveSessionSettings} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Save Session Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionCalendarSetup;
