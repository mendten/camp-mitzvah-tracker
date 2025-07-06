import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabaseService, CamperSubmission } from '@/services/supabaseService';
import { DEFAULT_MISSIONS } from '@/data/campData';
import { Save, X } from 'lucide-react';

interface AdminSubmissionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: CamperSubmission | null;
  onSubmissionUpdated: () => void;
}

const AdminSubmissionEditModal: React.FC<AdminSubmissionEditModalProps> = ({
  isOpen,
  onClose,
  submission,
  onSubmissionUpdated
}) => {
  const { toast } = useToast();
  const [selectedMissions, setSelectedMissions] = useState<Set<string>>(new Set());
  const [submissionDate, setSubmissionDate] = useState('');
  const [loading, setLoading] = useState(false);

  const missions = DEFAULT_MISSIONS.filter(m => m.isActive);

  useEffect(() => {
    if (submission) {
      setSelectedMissions(new Set(submission.missions));
      setSubmissionDate(submission.date);
    }
  }, [submission]);

  const toggleMission = (missionId: string) => {
    const newSelected = new Set(selectedMissions);
    if (newSelected.has(missionId)) {
      newSelected.delete(missionId);
    } else {
      newSelected.add(missionId);
    }
    setSelectedMissions(newSelected);
  };

  const handleSave = async () => {
    if (!submission || selectedMissions.size === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one mission.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await supabaseService.editSubmission(submission.id, {
        missions: [...selectedMissions],
        date: submissionDate,
        status: 'approved' // Keep as approved after editing
      });

      toast({
        title: "Submission Updated",
        description: "The submission has been successfully updated.",
      });

      onSubmissionUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating submission:', error);
      toast({
        title: "Error",
        description: "Failed to update submission. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Submission - {submission.camperName}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Camper Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Camper Information</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {submission.camperName}
              </div>
              <div>
                <span className="font-medium">Code:</span> {submission.camperCode}
              </div>
              <div>
                <span className="font-medium">Bunk:</span> {submission.bunkName}
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Submission Date</Label>
            <Input
              id="date"
              type="date"
              value={submissionDate}
              onChange={(e) => setSubmissionDate(e.target.value)}
            />
          </div>

          {/* Missions */}
          <div className="space-y-2">
            <Label>Missions ({selectedMissions.size} selected)</Label>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border p-4 rounded-lg">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleMission(mission.id)}
                >
                  <Checkbox
                    checked={selectedMissions.has(mission.id)}
                    onChange={() => toggleMission(mission.id)}
                  />
                  <span className="text-sm">{mission.title}</span>
                  {mission.isMandatory && (
                    <span className="text-xs bg-red-100 text-red-600 px-1 rounded">Required</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Original Submission Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Original Submission</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Submitted:</span> {new Date(submission.submittedAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Status:</span> {submission.status}
              </div>
              {submission.approvedAt && (
                <div>
                  <span className="font-medium">Approved:</span> {new Date(submission.approvedAt).toLocaleString()}
                </div>
              )}
              {submission.approvedBy && (
                <div>
                  <span className="font-medium">Approved By:</span> {submission.approvedBy}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={loading || selectedMissions.size === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSubmissionEditModal;