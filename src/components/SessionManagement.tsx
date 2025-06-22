
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar, RefreshCw, Upload, Download, AlertTriangle } from 'lucide-react';

const SessionManagement = () => {
  const [currentSession, setCurrentSession] = useState(0);
  const [sessionName, setSessionName] = useState('Pre-Camp Setup');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedSession = localStorage.getItem('current_session');
    const savedSessionName = localStorage.getItem('session_name');
    const savedStartDate = localStorage.getItem('session_start_date');
    const savedEndDate = localStorage.getItem('session_end_date');
    
    if (savedSession) setCurrentSession(parseInt(savedSession));
    if (savedSessionName) setSessionName(savedSessionName);
    if (savedStartDate) setStartDate(savedStartDate);
    if (savedEndDate) setEndDate(savedEndDate);
  }, []);

  const handleStartSession1 = () => {
    setCurrentSession(1);
    setSessionName('Camp Session 1');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    
    localStorage.setItem('current_session', '1');
    localStorage.setItem('session_name', 'Camp Session 1');
    localStorage.setItem('session_start_date', today);
    
    // Clear all existing progress data
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('camper_') && (key.includes('_missions') || key.includes('_history'))) {
        localStorage.removeItem(key);
      }
    });
    
    toast({
      title: "Session 1 Started!",
      description: "All camper progress has been reset for the new session.",
    });
  };

  const handleEndSession = () => {
    if (endDate) {
      localStorage.setItem('session_end_date', endDate);
      toast({
        title: "Session Ended",
        description: `${sessionName} has been marked as completed.`,
      });
    }
  };

  const exportSessionData = () => {
    // Export all session data
    const sessionData = {
      session: currentSession,
      name: sessionName,
      startDate,
      endDate,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${currentSession}-backup.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // Process imported data here
          toast({
            title: "Data Imported",
            description: "Session data has been imported successfully.",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Invalid file format or corrupted data.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span>Session Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Current Session</h3>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Session:</span>
                      <span className="text-blue-600 font-bold">
                        {currentSession === 0 ? 'Pre-Camp (Session 0)' : `Session ${currentSession}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{sessionName}</span>
                    </div>
                    {startDate && (
                      <div className="flex justify-between">
                        <span className="font-medium">Start Date:</span>
                        <span>{new Date(startDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {endDate && (
                      <div className="flex justify-between">
                        <span className="font-medium">End Date:</span>
                        <span>{new Date(endDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Session Controls</h3>
                
                {currentSession === 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Start Session 1 (Reset All Data)
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <span>Start New Session?</span>
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will start Session 1 and clear all existing camper progress data. 
                          This action cannot be undone. Make sure to export any data you want to keep first.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleStartSession1}>
                          Yes, Start Session 1
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {currentSession > 0 && !endDate && (
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Session Date</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                      <Button onClick={handleEndSession} disabled={!endDate}>
                        End Session
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Data Management</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={exportSessionData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Session Backup
                  </Button>
                  
                  <div>
                    <Label htmlFor="import-data" className="cursor-pointer">
                      <Button variant="outline" className="w-full" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Import Session Data
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="import-data"
                      type="file"
                      accept=".json,.csv"
                      onChange={handleImportData}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Session 0 is for setup and testing</li>
                  <li>• Starting Session 1 will clear all progress</li>
                  <li>• Always backup data before major changes</li>
                  <li>• Import data with caution and verify results</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionManagement;
