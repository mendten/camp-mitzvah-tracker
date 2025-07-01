
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, Clock, Shield } from 'lucide-react';
import { MasterData } from '@/utils/masterDataStorage';

interface AdminCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'campers' | 'qualified' | 'pending' | 'submissions';
}

const AdminCardModal: React.FC<AdminCardModalProps> = ({ isOpen, onClose, type }) => {
  const allCampers = MasterData.getAllCampersWithStatus();
  const pendingSubmissions = MasterData.getPendingSubmissions();
  const allSubmissions = MasterData.getAllSubmissions();

  const renderContent = () => {
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
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Pending Edit Requests ({pendingSubmissions.length})</h3>
            </div>
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="p-3 bg-purple-50">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{submission.camperName}</div>
                      <Badge className="bg-purple-100 text-purple-800">
                        {submission.status === 'edit_requested' ? 'Edit Request' : 'Pending'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Bunk {submission.bunkName} • {submission.missions.length} missions
                    </div>
                    {submission.editRequestReason && (
                      <div className="text-sm text-purple-700 bg-purple-100 p-2 rounded">
                        Reason: {submission.editRequestReason}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
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
