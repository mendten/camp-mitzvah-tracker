import { supabase } from '@/integrations/supabase/client';
import { formatInTimeZone } from 'date-fns-tz';

export interface CamperSubmission {
  id: string;
  camperId: string;
  camperName: string;
  camperCode: string;
  bunkName: string;
  date: string;
  missions: string[];
  status: 'submitted' | 'approved' | 'edit_requested' | 'rejected';
  submittedAt: string;
  editRequestReason?: string;
  editRequestedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
}

export interface CamperProfile {
  id: string;
  name: string;
  code: string;
  bunkId: string;
  bunkName: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  code: string;
  bunkId: string;
  bunkName: string;
}

export interface Mission {
  id: string;
  title: string;
  type: string;
  icon: string;
  isMandatory: boolean;
  isActive: boolean;
  sortOrder?: number;
}

export interface Bunk {
  id: string;
  name: string;
  displayName: string;
}

class SupabaseService {
  private static instance: SupabaseService;
  private cachedTimezone: string | null = null;
  
  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // Get timezone-aware today's date string
  async getTodayString(): Promise<string> {
    const timezone = await this.getTimezone();
    return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
  }

  // Get system timezone setting
  private async getTimezone(): Promise<string> {
    if (this.cachedTimezone) {
      return this.cachedTimezone;
    }

    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('timezone')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching timezone:', error);
        this.cachedTimezone = 'America/New_York'; // Default fallback
        return this.cachedTimezone;
      }

      this.cachedTimezone = data.timezone || 'America/New_York';
      return this.cachedTimezone;
    } catch (error) {
      console.error('Error in getTimezone:', error);
      this.cachedTimezone = 'America/New_York'; // Default fallback
      return this.cachedTimezone;
    }
  }

  // Clear timezone cache when settings change
  clearTimezoneCache(): void {
    this.cachedTimezone = null;
  }

  // Get all bunks
  async getBunks(): Promise<Bunk[]> {
    const { data, error } = await supabase
      .from('bunks')
      .select('*')
      .order('display_name');
    
    if (error) {
      console.error('Error fetching bunks:', error);
      return [];
    }
    
    return data.map(bunk => ({
      id: bunk.id,
      name: bunk.name,
      displayName: bunk.display_name
    }));
  }

  // Get all camper profiles
  async getAllCamperProfiles(): Promise<CamperProfile[]> {
    const { data: campers, error: campersError } = await supabase
      .from('campers')
      .select(`
        id,
        name,
        access_code,
        bunk_id,
        bunks!inner(display_name)
      `)
      .order('name');
    
    if (campersError) {
      console.error('Error fetching campers:', campersError);
      return [];
    }
    
    return campers.map(camper => ({
      id: camper.id,
      name: camper.name,
      code: camper.access_code,
      bunkId: camper.bunk_id,
      bunkName: (camper as any).bunks.display_name
    }));
  }

  // Get all staff profiles
  async getAllStaffProfiles(): Promise<StaffProfile[]> {
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select(`
        id,
        name,
        access_code,
        bunk_id,
        bunks!inner(display_name)
      `)
      .order('name');
    
    if (staffError) {
      console.error('Error fetching staff:', staffError);
      return [];
    }
    
    return staff.map(staffMember => ({
      id: staffMember.id,
      name: staffMember.name,
      code: staffMember.access_code,
      bunkId: staffMember.bunk_id,
      bunkName: (staffMember as any).bunks.display_name
    }));
  }

  // Get camper profile by ID
  async getCamperProfile(camperId: string): Promise<CamperProfile | null> {
    const { data, error } = await supabase
      .from('campers')
      .select(`
        id,
        name,
        access_code,
        bunk_id,
        bunks!inner(display_name)
      `)
      .eq('id', camperId)
      .single();
    
    if (error) {
      console.error('Error fetching camper profile:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      code: data.access_code,
      bunkId: data.bunk_id,
      bunkName: (data as any).bunks.display_name
    };
  }

  // Get staff profile by ID
  async getStaffProfile(staffId: string): Promise<StaffProfile | null> {
    const { data, error } = await supabase
      .from('staff')
      .select(`
        id,
        name,
        access_code,
        bunk_id,
        bunks!inner(display_name)
      `)
      .eq('id', staffId)
      .single();
    
    if (error) {
      console.error('Error fetching staff profile:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      code: data.access_code,
      bunkId: data.bunk_id,
      bunkName: (data as any).bunks.display_name
    };
  }

  // Verify camper access code
  async verifyCamperCode(camperId: string, accessCode: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('campers')
      .select('access_code')
      .eq('id', camperId)
      .single();
    
    if (error) {
      console.error('Error verifying camper code:', error);
      return false;
    }
    
    return data.access_code === accessCode;
  }

  // Verify staff access code
  async verifyStaffCode(staffId: string, accessCode: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('staff')
      .select('access_code')
      .eq('id', staffId)
      .single();
    
    if (error) {
      console.error('Error verifying staff code:', error);
      return false;
    }
    
    return data.access_code === accessCode;
  }

  // Get all missions
  async getAllMissions(): Promise<Mission[]> {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) {
      console.error('Error fetching missions:', error);
      return [];
    }
    
    return data.map(mission => ({
      id: mission.id,
      title: mission.title,
      type: mission.type,
      icon: mission.icon,
      isMandatory: mission.is_mandatory,
      isActive: mission.is_active,
      sortOrder: mission.sort_order
    }));
  }

  // Get camper's working missions (in-progress)
  async getCamperWorkingMissions(camperId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('working_missions')
      .select('missions')
      .eq('camper_id', camperId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, return empty array
        return [];
      }
      console.error('Error fetching working missions:', error);
      return [];
    }
    
    return data.missions || [];
  }

  // Save camper's working missions
  async saveCamperWorkingMissions(camperId: string, missionIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('working_missions')
      .upsert({
        camper_id: camperId,
        missions: missionIds,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'camper_id'
      });
    
    if (error) {
      console.error('Error saving working missions:', error);
      throw error;
    }
  }

  // Submit camper missions (auto-approved)
  async submitCamperMissions(camperId: string, missionIds: string[]): Promise<void> {
    const profile = await this.getCamperProfile(camperId);
    if (!profile) {
      throw new Error('Camper profile not found');
    }

    const today = await this.getTodayString();
    const submissionId = `sub_${camperId}_${today}_${Date.now()}`;
    
    // Insert the submission with auto-approval
    const { error } = await supabase
      .from('submissions')
      .upsert({
        id: submissionId,
        camper_id: camperId,
        date: today,
        missions: missionIds,
        status: 'approved', // Auto-approve all submissions
        submitted_at: new Date().toISOString(),
        approved_at: new Date().toISOString(),
        approved_by: 'system'
      }, {
        onConflict: 'camper_id,date'
      });
    
    if (error) {
      console.error('Error submitting missions:', error);
      throw error;
    }
    
    // Clear working missions after submission
    await this.clearCamperWorkingMissions(camperId);
  }

  // Clear working missions
  async clearCamperWorkingMissions(camperId: string): Promise<void> {
    const { error } = await supabase
      .from('working_missions')
      .delete()
      .eq('camper_id', camperId);
    
    if (error) {
      console.error('Error clearing working missions:', error);
    }
  }

  // Get today's submission for a camper
  async getCamperTodaySubmission(camperId: string): Promise<CamperSubmission | null> {
    const today = await this.getTodayString();
    
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        id,
        camper_id,
        date,
        missions,
        status,
        submitted_at,
        edit_request_reason,
        edit_requested_at,
        approved_at,
        approved_by,
        rejected_at,
        rejected_by,
        campers!inner(name, access_code, bunks!inner(display_name))
      `)
      .eq('camper_id', camperId)
      .eq('date', today)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No data found
        return null;
      }
      console.error('Error fetching today submission:', error);
      return null;
    }
    
    const camper = (data as any).campers;
    
    return {
      id: data.id,
      camperId: data.camper_id,
      camperName: camper.name,
      camperCode: camper.access_code,
      bunkName: camper.bunks.display_name,
      date: data.date,
      missions: data.missions,
      status: data.status as 'submitted' | 'approved' | 'edit_requested' | 'rejected',
      submittedAt: data.submitted_at,
      editRequestReason: data.edit_request_reason,
      editRequestedAt: data.edit_requested_at,
      approvedAt: data.approved_at,
      approvedBy: data.approved_by,
      rejectedAt: data.rejected_at,
      rejectedBy: data.rejected_by
    };
  }

  // Get all submissions
  async getAllSubmissions(): Promise<CamperSubmission[]> {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        id,
        camper_id,
        date,
        missions,
        status,
        submitted_at,
        edit_request_reason,
        edit_requested_at,
        approved_at,
        approved_by,
        rejected_at,
        rejected_by,
        campers!inner(name, access_code, bunks!inner(display_name))
      `)
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching all submissions:', error);
      return [];
    }
    
    return data.map(submission => {
      const camper = (submission as any).campers;
      return {
        id: submission.id,
        camperId: submission.camper_id,
        camperName: camper.name,
        camperCode: camper.access_code,
        bunkName: camper.bunks.display_name,
        date: submission.date,
        missions: submission.missions,
        status: submission.status as 'submitted' | 'approved' | 'edit_requested' | 'rejected',
        submittedAt: submission.submitted_at,
        editRequestReason: submission.edit_request_reason,
        editRequestedAt: submission.edit_requested_at,
        approvedAt: submission.approved_at,
        approvedBy: submission.approved_by,
        rejectedAt: submission.rejected_at,
        rejectedBy: submission.rejected_by
      };
    });
  }

  // Get pending submissions (deprecated - all submissions are auto-approved)
  async getPendingSubmissions(): Promise<CamperSubmission[]> {
    // With auto-approval, there are no longer pending submissions
    return [];
  }

  // Approve submission
  async approveSubmission(submissionId: string, approvedBy: string): Promise<void> {
    const { error } = await supabase
      .from('submissions')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy
      })
      .eq('id', submissionId);
    
    if (error) {
      console.error('Error approving submission:', error);
      throw error;
    }
  }

  // Reject submission
  async rejectSubmission(submissionId: string, rejectedBy: string): Promise<void> {
    const { error } = await supabase
      .from('submissions')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: rejectedBy
      })
      .eq('id', submissionId);
    
    if (error) {
      console.error('Error rejecting submission:', error);
      throw error;
    }
  }

  // Get system settings
  async getSystemSettings(): Promise<{
    dailyRequired: number;
    adminPassword: string;
    timezone: string;
  }> {
    const { data, error } = await supabase
      .from('system_settings')
      .select('daily_required_missions, admin_password, timezone')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.error('Error fetching system settings:', error);
      return { dailyRequired: 3, adminPassword: 'admin123', timezone: 'America/New_York' };
    }
    
    return {
      dailyRequired: data.daily_required_missions,
      adminPassword: data.admin_password,
      timezone: data.timezone || 'America/New_York'
    };
  }

  // Get camper's weekly points
  async getCamperWeeklyPoints(camperId: string, week: number, session: number): Promise<{
    totalPoints: number;
    missionsCompleted: number;
    weekNumber: number;
    sessionNumber: number;
  } | null> {
    const { data, error } = await supabase
      .from('camper_weekly_points')
      .select('*')
      .eq('camper_id', camperId)
      .eq('week_number', week)
      .eq('session_number', session)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No data found
      }
      console.error('Error fetching weekly points:', error);
      return null;
    }
    
    return {
      totalPoints: data.total_points,
      missionsCompleted: data.missions_completed,
      weekNumber: data.week_number,
      sessionNumber: data.session_number
    };
  }

  // Get all camper's weekly points history
  async getCamperAllWeeklyPoints(camperId: string): Promise<Array<{
    totalPoints: number;
    missionsCompleted: number;
    weekNumber: number;
    sessionNumber: number;
  }>> {
    const { data, error } = await supabase
      .from('camper_weekly_points')
      .select('*')
      .eq('camper_id', camperId)
      .order('session_number')
      .order('week_number');
    
    if (error) {
      console.error('Error fetching all weekly points:', error);
      return [];
    }
    
    return data.map(item => ({
      totalPoints: item.total_points,
      missionsCompleted: item.missions_completed,
      weekNumber: item.week_number,
      sessionNumber: item.session_number
    }));
  }

  // Update camper's weekly points
  async updateCamperWeeklyPoints(camperId: string, week: number, session: number, points: number, missions: number): Promise<void> {
    const { error } = await supabase
      .from('camper_weekly_points')
      .upsert({
        camper_id: camperId,
        week_number: week,
        session_number: session,
        total_points: points,
        missions_completed: missions,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'camper_id,week_number,session_number'
      });
    
    if (error) {
      console.error('Error updating weekly points:', error);
      throw error;
    }
  }

  // Update system settings
  async updateSystemSettings(settings: {
    dailyRequired?: number;
    adminPassword?: string;
    timezone?: string;
  }): Promise<void> {
    const updateData: any = {};
    
    if (settings.dailyRequired !== undefined) {
      updateData.daily_required_missions = settings.dailyRequired;
    }
    
    if (settings.adminPassword !== undefined) {
      updateData.admin_password = settings.adminPassword;
    }
    
    if (settings.timezone !== undefined) {
      updateData.timezone = settings.timezone;
      this.clearTimezoneCache(); // Clear cache when timezone changes
    }
    
    const { error } = await supabase
      .from('system_settings')
      .update(updateData)
      .eq('id', 1);
    
    if (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  }

  // Edit existing submission (admin only)
  async editSubmission(submissionId: string, updates: {
    missions?: string[];
    date?: string;
    status?: 'submitted' | 'approved' | 'edit_requested' | 'rejected';
  }): Promise<void> {
    const updateData: any = {};
    
    if (updates.missions !== undefined) {
      updateData.missions = updates.missions;
    }
    
    if (updates.date !== undefined) {
      updateData.date = updates.date;
    }
    
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }
    
    updateData.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('submissions')
      .update(updateData)
      .eq('id', submissionId);
    
    if (error) {
      console.error('Error editing submission:', error);
      throw error;
    }
  }

  // Get camper submissions for a specific date range
  async getCamperSubmissions(camperId: string, startDate?: string, endDate?: string): Promise<CamperSubmission[]> {
    let query = supabase
      .from('submissions')
      .select(`
        id,
        camper_id,
        date,
        missions,
        status,
        submitted_at,
        edit_request_reason,
        edit_requested_at,
        approved_at,
        approved_by,
        rejected_at,
        rejected_by,
        campers!inner(name, access_code, bunks!inner(display_name))
      `)
      .eq('camper_id', camperId)
      .order('date', { ascending: false });
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching camper submissions:', error);
      return [];
    }
    
    return data.map(submission => {
      const camper = (submission as any).campers;
      return {
        id: submission.id,
        camperId: submission.camper_id,
        camperName: camper.name,
        camperCode: camper.access_code,
        bunkName: camper.bunks.display_name,
        date: submission.date,
        missions: submission.missions,
        status: submission.status as 'submitted' | 'approved' | 'edit_requested' | 'rejected',
        submittedAt: submission.submitted_at,
        editRequestReason: submission.edit_request_reason,
        editRequestedAt: submission.edit_requested_at,
        approvedAt: submission.approved_at,
        approvedBy: submission.approved_by,
        rejectedAt: submission.rejected_at,
        rejectedBy: submission.rejected_by
      };
    });
  }
}

export const supabaseService = SupabaseService.getInstance();