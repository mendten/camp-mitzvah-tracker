
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Settings, Lock, Calendar, Users, Save } from 'lucide-react';
import { MasterData } from '@/utils/masterDataStorage';

const AdminSettings = () => {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dailyRequired, setDailyRequired] = useState(3);
  const [campName, setCampName] = useState('Camp Gan Yisroel Florida');
  const [maxSubmissionsPerDay, setMaxSubmissionsPerDay] = useState(1);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setDailyRequired(MasterData.getDailyRequired());
    const storedCampName = localStorage.getItem('camp_name');
    if (storedCampName) setCampName(storedCampName);
    
    const maxSubmissions = localStorage.getItem('max_submissions_per_day');
    if (maxSubmissions) setMaxSubmissionsPerDay(parseInt(maxSubmissions));
  };

  const handlePasswordChange = () => {
    const adminPassword = MasterData.getAdminPassword();
    
    if (currentPassword !== adminPassword) {
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

    MasterData.setAdminPassword(newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    toast({
      title: "Password Updated",
      description: "Admin password has been changed successfully.",
    });
  };

  const handleSaveSettings = () => {
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

    MasterData.setDailyRequired(dailyRequired);
    localStorage.setItem('camp_name', campName);
    localStorage.setItem('max_submissions_per_day', maxSubmissionsPerDay.toString());
    
    toast({
      title: "Settings Saved",
      description: "All settings have been updated successfully.",
    });
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

  const exportAllData = () => {
    try {
      const allData = {
        camperProfiles: MasterData.getAllCamperProfiles(),
        submissions: MasterData.getAllSubmissions(),
        adminPassword: MasterData.getAdminPassword(),
        dailyRequired: MasterData.getDailyRequired(),
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
            <Settings className="h-6 w-6 text-blue-600" />
            <span>Camp Configuration</span>
          </CardTitle>
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
