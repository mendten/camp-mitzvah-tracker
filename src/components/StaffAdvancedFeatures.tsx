
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, CheckCircle, XCircle, Users, Download } from 'lucide-react';
import { MasterData } from '@/utils/masterDataStorage';
import { DEFAULT_MISSIONS } from '@/data/campData';
import { useToast } from '@/hooks/use-toast';

interface StaffAdvancedFeaturesProps {
  bunkCampers: any[];
  bunkName: string;
}

const StaffAdvancedFeatures: React.FC<StaffAdvancedFeaturesProps> = ({ bunkCampers, bunkName }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampers, setSelectedCampers] = useState<string[]>([]);
  const [showBulkApproval, setShowBulkApproval] = useState(false);
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'request_edit'>('approve');

  // Get campers with their current status using MasterData
  const allCampersWithStatus = MasterData.getAllCampersWithStatus();
  const bunkCampersWithStatus = allCampersWithStatus.filter(c => 
    bunkCampers.some(bc => bc.id === c.id)
  );

  // Filter campers based on search and status
  const filteredCampers = bunkCampersWithStatus.filter(camper => {
    const matchesSearch = camper.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    return camper.status === statusFilter;
  });

  const handleBulkAction = () => {
    if (selectedCampers.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select campers to perform bulk action",
        variant: "destructive"
      });
      return;
    }

    selectedCampers.forEach(camperId => {
      const submission = MasterData.getCamperTodaySubmission(camperId);
      if (!submission) return;

      switch (bulkAction) {
        case 'approve':
          MasterData.approveSubmission(submission.id, 'Staff');
          break;
        case 'reject':
          MasterData.rejectSubmission(submission.id, 'Staff');
          break;
        case 'request_edit':
          // For this simplified version, we'll mark as edit requested
          const submissions = MasterData.getAllSubmissions();
          const targetSubmission = submissions.find(s => s.id === submission.id);
          if (targetSubmission) {
            targetSubmission.status = 'edit_requested';
            targetSubmission.editRequestReason = 'Staff requested edits';
            targetSubmission.editRequestedAt = new Date().toISOString();
            MasterData.saveAllSubmissions(submissions);
          }
          break;
      }
    });

    setSelectedCampers([]);
    setShowBulkApproval(false);
    
    const actionText = bulkAction === 'approve' ? 'approved' : 
                     bulkAction === 'reject' ? 'rejected' : 'marked for edit';
    
    toast({
      title: "Bulk Action Complete",
      description: `${selectedCampers.length} submissions ${actionText}`,
    });
  };

  const exportBunkData = () => {
    const bunkData = bunkCampersWithStatus.map(camper => {
      const submissions = MasterData.getAllSubmissions().filter(s => s.camperId === camper.id);
      
      return {
        code: camper.code,
        name: camper.name,
        todayStatus: camper.status,
        todayCompleted: camper.missionCount,
        qualified: camper.isQualified,
        totalSubmissions: submissions.length,
        approvedSubmissions: submissions.filter(s => s.status === 'approved').length
      };
    });

    const csvContent = [
      ['Code', 'Name', 'Today Status', 'Today Completed', 'Qualified', 'Total Submissions', 'Approved Submissions'],
      ...bunkData.map(camper => [
        camper.code,
        camper.name,
        camper.todayStatus,
        camper.todayCompleted,
        camper.qualified,
        camper.totalSubmissions,
        camper.approvedSubmissions
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bunkName}_report_${MasterData.getTodayString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Bunk ${bunkName} data exported successfully`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'edit_requested': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Advanced Camper Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search campers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="edit_requested">Edit Requested</SelectItem>
                <SelectItem value="working">Working</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowBulkApproval(true)}
              disabled={selectedCampers.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Bulk Actions ({selectedCampers.length})
            </Button>
            <Button
              variant="outline"
              onClick={exportBunkData}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          {/* Camper List */}
          <div className="space-y-2">
            {filteredCampers.map(camper => {
              const isSelected = selectedCampers.includes(camper.id);

              return (
                <div
                  key={camper.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                    isSelected ? 'border-purple-300 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCampers(prev => [...prev, camper.id]);
                        } else {
                          setSelectedCampers(prev => prev.filter(id => id !== camper.id));
                        }
                      }}
                    />
                    <div>
                      <p className="font-medium">{camper.name}</p>
                      <p className="text-sm text-gray-500">Code: {camper.code}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{camper.missionCount}/{DEFAULT_MISSIONS.filter(m => m.isActive).length}</p>
                      <p className="text-xs text-gray-500">missions</p>
                    </div>
                    <Badge className={getStatusColor(camper.status)}>
                      {camper.status === 'working' ? 'Working' :
                       camper.status === 'submitted' ? 'Submitted' :
                       camper.status === 'edit_requested' ? 'Edit Requested' :
                       camper.status === 'approved' ? 'Approved' :
                       'Not Started'}
                    </Badge>
                    {camper.isQualified && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCampers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No campers found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkApproval} onOpenChange={setShowBulkApproval}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Action for {selectedCampers.length} Campers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Action:</label>
              <Select value={bulkAction} onValueChange={(value: any) => setBulkAction(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve Submissions</SelectItem>
                  <SelectItem value="reject">Reject Submissions</SelectItem>
                  <SelectItem value="request_edit">Request Edits</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                This action will be applied to {selectedCampers.length} selected campers.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowBulkApproval(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkAction}>
                Apply Action
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffAdvancedFeatures;
