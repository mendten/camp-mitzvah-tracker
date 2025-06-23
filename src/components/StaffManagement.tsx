
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Edit3, Trash2, Users, Phone, Mail } from 'lucide-react';
import { CAMP_DATA } from '@/data/campData';
import { useToast } from '@/hooks/use-toast';

interface Staff {
  id: string;
  name: string;
  role: string;
  bunkId: string;
  phone?: string;
  email?: string;
  accessCode: string;
  notes?: string;
}

const StaffManagement = () => {
  const { toast } = useToast();
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Get all staff with extended information
  const getAllStaff = (): Staff[] => {
    return CAMP_DATA.flatMap(bunk =>
      bunk.staff.map(staff => ({
        ...staff,
        role: localStorage.getItem(`staff_${staff.id}_role`) || 'Counselor', // Add default role
        bunkId: bunk.id,
        accessCode: localStorage.getItem(`staff_${staff.id}_access`) || generateAccessCode(),
        phone: localStorage.getItem(`staff_${staff.id}_phone`) || '',
        email: localStorage.getItem(`staff_${staff.id}_email`) || '',
        notes: localStorage.getItem(`staff_${staff.id}_notes`) || ''
      }))
    );
  };

  const generateAccessCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const [staffList, setStaffList] = useState<Staff[]>(getAllStaff());
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    name: '',
    role: 'Counselor',
    bunkId: '',
    phone: '',
    email: '',
    notes: ''
  });

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.bunkId) {
      toast({
        title: "Error",
        description: "Name and bunk are required",
        variant: "destructive"
      });
      return;
    }

    const staff: Staff = {
      id: `staff_${Date.now()}`,
      name: newStaff.name!,
      role: newStaff.role || 'Counselor',
      bunkId: newStaff.bunkId!,
      phone: newStaff.phone || '',
      email: newStaff.email || '',
      accessCode: generateAccessCode(),
      notes: newStaff.notes || ''
    };

    // Save to localStorage
    localStorage.setItem(`staff_${staff.id}_role`, staff.role);
    localStorage.setItem(`staff_${staff.id}_phone`, staff.phone);
    localStorage.setItem(`staff_${staff.id}_email`, staff.email);
    localStorage.setItem(`staff_${staff.id}_notes`, staff.notes);
    localStorage.setItem(`staff_${staff.id}_access`, staff.accessCode);

    setStaffList([...staffList, staff]);
    setNewStaff({ name: '', role: 'Counselor', bunkId: '', phone: '', email: '', notes: '' });
    setShowAddDialog(false);

    toast({
      title: "Staff Added",
      description: `${staff.name} has been added successfully`
    });
  };

  const handleEditStaff = () => {
    if (!selectedStaff) return;

    // Update localStorage
    localStorage.setItem(`staff_${selectedStaff.id}_role`, selectedStaff.role);
    localStorage.setItem(`staff_${selectedStaff.id}_phone`, selectedStaff.phone || '');
    localStorage.setItem(`staff_${selectedStaff.id}_email`, selectedStaff.email || '');
    localStorage.setItem(`staff_${selectedStaff.id}_notes`, selectedStaff.notes || '');
    localStorage.setItem(`staff_${selectedStaff.id}_access`, selectedStaff.accessCode);

    setStaffList(staffList.map(staff => 
      staff.id === selectedStaff.id ? selectedStaff : staff
    ));

    setShowEditDialog(false);
    setSelectedStaff(null);

    toast({
      title: "Staff Updated",
      description: "Staff information has been updated successfully"
    });
  };

  const handleDeleteStaff = (staffId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      setStaffList(staffList.filter(staff => staff.id !== staffId));
      
      // Clean up localStorage
      localStorage.removeItem(`staff_${staffId}_role`);
      localStorage.removeItem(`staff_${staffId}_phone`);
      localStorage.removeItem(`staff_${staffId}_email`);
      localStorage.removeItem(`staff_${staffId}_notes`);
      localStorage.removeItem(`staff_${staffId}_access`);

      toast({
        title: "Staff Removed",
        description: "Staff member has been removed successfully"
      });
    }
  };

  const getBunkName = (bunkId: string) => {
    const bunk = CAMP_DATA.find(b => b.id === bunkId);
    return bunk ? bunk.displayName : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-blue-600" />
              <span>Staff Management</span>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Staff Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                      placeholder="Staff member name"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={newStaff.role} onValueChange={(value) => setNewStaff({...newStaff, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Head Counselor">Head Counselor</SelectItem>
                        <SelectItem value="Counselor">Counselor</SelectItem>
                        <SelectItem value="Junior Counselor">Junior Counselor</SelectItem>
                        <SelectItem value="Specialist">Specialist</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Bunk</Label>
                    <Select value={newStaff.bunkId} onValueChange={(value) => setNewStaff({...newStaff, bunkId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bunk" />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMP_DATA.map(bunk => (
                          <SelectItem key={bunk.id} value={bunk.id}>
                            Bunk {bunk.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={newStaff.notes}
                      onChange={(e) => setNewStaff({...newStaff, notes: e.target.value})}
                      placeholder="Additional notes"
                    />
                  </div>
                  <Button onClick={handleAddStaff} className="w-full">
                    Add Staff Member
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {staffList.map((staff) => (
              <Card key={staff.id} className="border-2 hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-semibold">{staff.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{staff.role}</Badge>
                          <Badge variant="secondary">Bunk {getBunkName(staff.bunkId)}</Badge>
                          <Badge className="bg-purple-100 text-purple-800">
                            Code: {staff.accessCode}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {staff.phone && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{staff.phone}</span>
                        </div>
                      )}
                      {staff.email && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span>{staff.email}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStaff(staff);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteStaff(staff.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {staff.notes && (
                    <p className="text-sm text-gray-600 mt-2">{staff.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={selectedStaff.name}
                  onChange={(e) => setSelectedStaff({...selectedStaff, name: e.target.value})}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={selectedStaff.role} onValueChange={(value) => setSelectedStaff({...selectedStaff, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Head Counselor">Head Counselor</SelectItem>
                    <SelectItem value="Counselor">Counselor</SelectItem>
                    <SelectItem value="Junior Counselor">Junior Counselor</SelectItem>
                    <SelectItem value="Specialist">Specialist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Access Code</Label>
                <Input
                  value={selectedStaff.accessCode}
                  onChange={(e) => setSelectedStaff({...selectedStaff, accessCode: e.target.value})}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={selectedStaff.phone}
                  onChange={(e) => setSelectedStaff({...selectedStaff, phone: e.target.value})}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={selectedStaff.email}
                  onChange={(e) => setSelectedStaff({...selectedStaff, email: e.target.value})}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={selectedStaff.notes}
                  onChange={(e) => setSelectedStaff({...selectedStaff, notes: e.target.value})}
                />
              </div>
              <Button onClick={handleEditStaff} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffManagement;
