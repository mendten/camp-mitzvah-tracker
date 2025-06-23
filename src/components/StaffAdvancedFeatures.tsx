
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, CheckCircle, XCircle, Users, Download } from 'lucide-react';
import { DataStorage } from '@/utils/dataStorage';
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

  // Filter campers based on search and status
  const filteredCampers = bunkCampers.filter(camper => {
    const matchesSearch = camper.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    
    const status = DataStorage.getCamperTodayStatus(camper.id);
    return status.status === statusFilter;
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
      switch (bulkAction) {
        case 'approve':
          DataStorage.approveSubmission(camperId);
          break;
        case 'reject':
          // For rejection, we'll clear today's submission
          const submission = DataStorage.getCamperTodaySubmission(camperId);
          if (submission) {
            const today = DataStorage.getTodayDateString();
            localStorage.removeItem(`camper_${camperId}_submission_${today}`);
            DataStorage.setCamperTodayMissions(camperId, []);
          }
          break;
        case 'request_edit':
          DataStorage.requestSubmissionEdit(camperId, 'Staff requested edits');
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
    const bunkData = bunkCampers.map(camper => {
      const status = DataStorage.getCamperTodayStatus(camper.id);
      const history = DataStorage.getSubmissionHistory(camper.id);
      
      return {
        name: camper.name,
        id: camper.id,
        todayStatus: status.status,
        todayCompleted: status.submittedCount,
        qualified: status.qualified,
        totalSubmissions: history.length,
        approvedSubmissions: history.filter(h => h.status === 'approved').length
      };
    });

    const csvContent = [
      ['Name', 'ID', 'Today Status', 'Today Completed', 'Qualified', 'Total Submissions', 'Approved Submissions'],
      ...bunkData.map(camper => [
        camper.name,
        camper.id,
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
    a.download = `${bunkName}_report_${DataStorage.getTodayDateString()}.csv`;
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'edit_requested': return 'bg-blue-100 text-blue-800';
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="edit_requested">Edit Requested</SelectItem>
                <SelectItem value="not_submitted">Not Submitted</SelectItem>
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
              const status = DataStorage.getCamperTodayStatus(camper.id);
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
                      <p className="text-sm text-gray-500">ID: {camper.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{status.submittedCount}/{DEFAULT_MISSIONS.filter(m => m.isActive).length}</p>
                      <p className="text-xs text-gray-500">missions</p>
                    </div>
                    <Badge className={getStatusColor(status.status)}>
                      {status.status === 'not_submitted' ? 'Not Submitted' :
                       status.status === 'pending' ? 'Pending' :
                       status.status === 'edit_requested' ? 'Edit Requested' :
                       'Approved'}
                    </Badge>
                    {status.qualified && (
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
