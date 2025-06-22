
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_MISSIONS } from '@/data/campData';

interface PendingApprovalsCardProps {
  bunkCampers: any[];
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ bunkCampers }) => {
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingSubmissions();
  }, [bunkCampers]);

  const loadPendingSubmissions = () => {
    const submissions: any[] = [];
    
    bunkCampers.forEach(camper => {
      const submittedMissions = localStorage.getItem(`camper_${camper.id}_submitted`);
      if (submittedMissions) {
        const submitted = JSON.parse(submittedMissions);
        submitted.forEach((missionId: string) => {
          const mission = DEFAULT_MISSIONS.find(m => m.id === missionId);
          if (mission) {
            submissions.push({
              camperId: camper.id,
              camperName: camper.name,
              missionId: mission.id,
              missionTitle: mission.title,
              missionIcon: mission.icon,
              submittedAt: new Date().toISOString(), // In real app, this would be stored
            });
          }
        });
      }
    });
    
    setPendingSubmissions(submissions);
  };

  const handleApprove = (camperId: string, missionId: string) => {
    // Remove from submitted
    const submittedMissions = localStorage.getItem(`camper_${camperId}_submitted`);
    if (submittedMissions) {
      const submitted = JSON.parse(submittedMissions);
      const filtered = submitted.filter((id: string) => id !== missionId);
      localStorage.setItem(`camper_${camperId}_submitted`, JSON.stringify(filtered));
    }

    // Add to approved
    const approvedMissions = localStorage.getItem(`camper_${camperId}_approved`);
    const approved = approvedMissions ? JSON.parse(approvedMissions) : [];
    approved.push(missionId);
    localStorage.setItem(`camper_${camperId}_approved`, JSON.stringify(approved));

    toast({
      title: "Mission Approved",
      description: `Approved mission for ${pendingSubmissions.find(s => s.camperId === camperId)?.camperName}`,
    });

    loadPendingSubmissions();
  };

  const handleReject = (camperId: string, missionId: string) => {
    // Remove from submitted
    const submittedMissions = localStorage.getItem(`camper_${camperId}_submitted`);
    if (submittedMissions) {
      const submitted = JSON.parse(submittedMissions);
      const filtered = submitted.filter((id: string) => id !== missionId);
      localStorage.setItem(`camper_${camperId}_submitted`, JSON.stringify(filtered));
    }

    // Remove from completed (so they can redo it)
    const completedMissions = localStorage.getItem(`camper_${camperId}_missions`);
    if (completedMissions) {
      const completed = JSON.parse(completedMissions);
      const filtered = completed.filter((id: string) => id !== missionId);
      localStorage.setItem(`camper_${camperId}_missions`, JSON.stringify(filtered));
    }

    toast({
      title: "Mission Rejected",
      description: `Rejected mission for ${pendingSubmissions.find(s => s.camperId === camperId)?.camperName}`,
      variant: "destructive"
    });

    loadPendingSubmissions();
  };

  if (pendingSubmissions.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span>Pending Approvals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
            <p>All missions have been reviewed!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span>Pending Approvals</span>
          </div>
          <Badge variant="secondary">{pendingSubmissions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingSubmissions.map((submission, index) => (
            <div key={`${submission.camperId}-${submission.missionId}-${index}`} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{submission.missionIcon}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{submission.missionTitle}</h4>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <User className="h-3 w-3" />
                    <span>{submission.camperName}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(submission.camperId, submission.missionId)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(submission.camperId, submission.missionId)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsCard;
