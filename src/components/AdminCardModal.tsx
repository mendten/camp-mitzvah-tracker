
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, Clock, Shield } from 'lucide-react';
import { supabaseService, CamperSubmission, CamperProfile } from '@/services/supabaseService';

interface AdminCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'campers' | 'qualified' | 'pending' | 'submissions';
}

interface CamperWithStatus {
  id: string;
  name: string;
  code: string;
  bunkName: string;
  bunkId: string;
  todaySubmission: CamperSubmission | null;
  workingMissions: string[];
  status: 'working' | 'submitted' | 'approved' | 'rejected';
  missionCount: number;
  isQualified: boolean;
}

const AdminCardModal: React.FC<AdminCardModalProps> = ({ isOpen, onClose, type }) => {
  const [allCampers, setAllCampers] = useState<CamperWithStatus[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<CamperSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('Loading admin modal data from Supabase...');
      
      // Load all necessary data from Supabase
      const [profiles, submissions, systemSettings] = await Promise.all([
        supabaseService.getAllCamperProfiles(),
        supabaseService.getAllSubmissions(),
        supabaseService.getSystemSettings()
      ]);

      console.log('Loaded profiles:', profiles.length);
      console.log('Loaded submissions:', submissions.length);

      // Build campers with status
      const campersWithStatus = await Promise.all(
        profiles.map(async (profile) => {
          const todaySubmission = await supabaseService.getCamperTodaySubmission(profile.id);
          const workingMissions = await supabaseService.getCamperWorkingMissions(profile.id);
          
          let status: 'working' | 'submitted' | 'approved' | 'rejected' = 'working';
          let missionCount = workingMissions.length;
          
          if (todaySubmission) {
            status = todaySubmission.status === 'edit_requested' ? 'submitted' : todaySubmission.status;
            missionCount = todaySubmission.missions.length;
          }
          
          return {
            id: profile.id,
            name: profile.name,
            code: profile.code,
            bunkName: profile.bunkName,
            bunkId: profile.bunkId,
            todaySubmission,
            workingMissions,
            status,
            missionCount,
            isQualified: missionCount >= systemSettings.dailyRequired
          };
        })
      );

      setAllCampers(campersWithStatus);
      setAllSubmissions(submissions);
      
    } catch (error) {
      console.error('Error loading admin modal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 ml-4">Loading data from Supabase...</p>
        </div>
      );
    }

    switch (type) {
      case 'campers':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">All Campers ({allCampers.length})</h3>
            </div>
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {allCampers.map((camper) => (
                <Card key={camper.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{camper.name}</div>
                      <div className="text-sm text-gray-600">Bunk {camper.bunkName}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={camper.isQualified ? "default" : "secondary"}>
                        {camper.missionCount} missions
                      </Badge>
                      {camper.isQualified ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'qualified':
        const qualifiedCampers = allCampers.filter(c => c.isQualified);
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Qualified Today ({qualifiedCampers.length})</h3>
            </div>
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {qualifiedCampers.map((camper) => (
                <Card key={camper.id} className="p-3 bg-green-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{camper.name}</div>
                      <div className="text-sm text-gray-600">Bunk {camper.bunkName}</div>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {camper.missionCount} missions ✓
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'pending':
        // With auto-approval, there are no longer pending submissions
        const pendingSubmissions: CamperSubmission[] = [];
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Pending Edit Requests ({pendingSubmissions.length})</h3>
            </div>
            <div className="text-center py-8 text-gray-500">
              <p>All submissions are now auto-approved.</p>
              <p>No pending requests to display.</p>
            </div>
          </div>
        );

      case 'submissions':
        const recentSubmissions = allSubmissions.slice(0, 20);
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Recent Submissions ({allSubmissions.length} total)</h3>
            </div>
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {recentSubmissions.map((submission) => (
                <Card key={submission.id} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{submission.camperName}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(submission.submittedAt).toLocaleDateString()} • Bunk {submission.bunkName}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        submission.status === 'approved' ? 'default' :
                        submission.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {submission.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{submission.missions.length} missions</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Camp Statistics Details</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default AdminCardModal;
