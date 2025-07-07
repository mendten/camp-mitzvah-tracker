import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Settings, Lock, Calendar, Users, Save, Clock } from 'lucide-react';
import { supabaseService } from '@/services/supabaseService';

const AdminSettings = () => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dailyRequired, setDailyRequired] = useState(3);
  const [campName, setCampName] = useState('Camp Gan Yisroel Florida');
  const [maxSubmissionsPerDay, setMaxSubmissionsPerDay] = useState(1);
  const [timezone, setTimezone] = useState('America/New_York');
  const [dailyResetHour, setDailyResetHour] = useState(5);
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<{hours: number; minutes: number; nextResetTime: string} | null>(null);

  useEffect(() => {
    loadSettings();
    updateTimeUntilReset();
    
    // Update time until reset every minute
    const interval = setInterval(updateTimeUntilReset, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await supabaseService.getSystemSettings();
      setSystemSettings(settings);
      setDailyRequired(settings.dailyRequired);
      setTimezone(settings.timezone);
      setDailyResetHour(settings.dailyResetHour);
      
      const storedCampName = localStorage.getItem('camp_name');
      if (storedCampName) setCampName(storedCampName);
      
      const maxSubmissions = localStorage.getItem('max_submissions_per_day');
      if (maxSubmissions) setMaxSubmissionsPerDay(parseInt(maxSubmissions));
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error Loading Settings",
        description: "Could not load system settings. Using defaults.",
        variant: "destructive"
      });
    }
  };

  const updateTimeUntilReset = async () => {
    try {
      const timeInfo = await supabaseService.getTimeUntilNextReset();
      setTimeUntilReset(timeInfo);
    } catch (error) {
      console.error('Error getting time until reset:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (!systemSettings) {
      toast({
        title: "Error",
        description: "System settings not loaded.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentPassword !== systemSettings.adminPassword) {
      toast({
        title: "Invalid Password",
        description: "Current password is incorrect.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation don't match.",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseService.updateSystemSettings({ adminPassword: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSystemSettings({ ...systemSettings, adminPassword: newPassword });
      
      toast({
        title: "Password Updated",
        description: "Admin password has been changed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSaveSettings = async () => {
    if (dailyRequired < 1 || dailyRequired > 20) {
      toast({
        title: "Invalid Daily Required",
        description: "Daily required missions must be between 1 and 20.",
        variant: "destructive"
      });
      return;
    }

    if (maxSubmissionsPerDay < 1 || maxSubmissionsPerDay > 5) {
      toast({
        title: "Invalid Max Submissions",
        description: "Max submissions per day must be between 1 and 5.",
        variant: "destructive"
      });
      return;
    }

    if (dailyResetHour < 0 || dailyResetHour > 23) {
      toast({
        title: "Invalid Reset Hour",
        description: "Daily reset hour must be between 0 and 23.",
        variant: "destructive"
      });
      return;
    }

    try {
      await supabaseService.updateSystemSettings({ 
        dailyRequired,
        timezone,
        dailyResetHour 
      });
      localStorage.setItem('camp_name', campName);
      localStorage.setItem('max_submissions_per_day', maxSubmissionsPerDay.toString());
      
      // Update time until reset after saving
      await updateTimeUntilReset();
      
      toast({
        title: "Settings Saved",
        description: `All settings have been updated successfully. Daily reset now occurs at ${dailyResetHour}:00 in the selected timezone.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResetAllData = () => {
    if (window.confirm('Are you sure you want to reset all camp data? This action cannot be undone.')) {
      // Clear all MasterData
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('master_') || key.startsWith('camper_') || key.startsWith('working_missions_')) {
          localStorage.removeItem(key);
        }
      });
      
      toast({
        title: "Data Reset",
        description: "All camp data has been reset to defaults.",
      });
      
      // Reload the page to refresh all components
      window.location.reload();
    }
  };

  const exportAllData = async () => {
    try {
      // Get data from Supabase
      const [camperProfiles, submissions] = await Promise.all([
        supabaseService.getAllCamperProfiles(),
        supabaseService.getAllSubmissions()
      ]);
      
      const allData = {
        camperProfiles,
        submissions,
        systemSettings,
        campName,
        maxSubmissionsPerDay,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `camp-data-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "All camp data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="h-6 w-6 text-red-600" />
            <span>Password Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button 
            onClick={handlePasswordChange}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            className="bg-red-600 hover:bg-red-700"
          >
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Camp Settings */}
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-blue-600" />
            <span>Camp Configuration & Daily Reset</span>
          </CardTitle>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Current timezone: <strong>{timezone}</strong></p>
            <p>Daily reset time: <strong>{dailyResetHour}:00 {timezone}</strong></p>
            {timeUntilReset && (
              <p className="text-green-600 font-medium">
                Next reset in: <strong>{timeUntilReset.hours}h {timeUntilReset.minutes}m</strong> (at {timeUntilReset.nextResetTime})
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="camp-name">Camp Name</Label>
            <Input
              id="camp-name"
              value={campName}
              onChange={(e) => setCampName(e.target.value)}
              placeholder="Enter camp name"
            />
          </div>
          <div>
            <Label htmlFor="daily-required">Daily Required Missions</Label>
            <Input
              id="daily-required"
              type="number"
              min={1}
              max={20}
              value={dailyRequired}
              onChange={(e) => setDailyRequired(parseInt(e.target.value) || 3)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Number of missions campers must complete each day to qualify
            </p>
          </div>
          <div>
            <Label htmlFor="max-submissions">Max Daily Submissions</Label>
            <Input
              id="max-submissions"
              type="number"
              min={1}
              max={5}
              value={maxSubmissionsPerDay}
              onChange={(e) => setMaxSubmissionsPerDay(parseInt(e.target.value) || 1)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum number of submission attempts per camper per day
            </p>
          </div>
          <div>
            <Label htmlFor="timezone">Camp Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time (New York)</SelectItem>
                <SelectItem value="America/Chicago">Central Time (Chicago)</SelectItem>
                <SelectItem value="America/Denver">Mountain Time (Denver)</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time (Los Angeles)</SelectItem>
                <SelectItem value="Asia/Jerusalem">Israel Time (Jerusalem)</SelectItem>
                <SelectItem value="Europe/London">GMT (London)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="daily-reset-hour">Daily Reset Hour (24-hour format)</Label>
            <Select value={dailyResetHour.toString()} onValueChange={(value) => setDailyResetHour(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select reset hour" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {i.toString().padStart(2, '0')}:00 ({i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i-12}:00 PM`})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 mt-1">
              Hour when daily submissions reset. Submissions before this time count for the previous day.
            </p>
          </div>
          <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-6 w-6 text-green-600" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Button onClick={exportAllData} variant="outline" className="w-full">
              Export All Data
            </Button>
            <Button 
              onClick={handleResetAllData} 
              variant="outline" 
              className="w-full text-red-600 border-red-300 hover:bg-red-50"
            >
              Reset All Data
            </Button>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Data Management Tips:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Export data regularly as backup</li>
              <li>• Reset data only when starting a new session</li>
              <li>• All operations are permanent and cannot be undone</li>
              <li>• Contact support if you need help with data recovery</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
