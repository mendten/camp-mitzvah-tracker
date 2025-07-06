
import { supabaseService } from '@/services/supabaseService';
import { SupabaseMigration } from './supabaseMigration';

// Master Data Storage - Now using Supabase with localStorage fallback during migration
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

class MasterDataStorage {
  private static instance: MasterDataStorage;
  private isSupabaseReady: boolean = false;
  
  static getInstance(): MasterDataStorage {
    if (!MasterDataStorage.instance) {
      MasterDataStorage.instance = new MasterDataStorage();
    }
    return MasterDataStorage.instance;
  }

  constructor() {
    this.initializeSupabase();
  }

  private async initializeSupabase(): Promise<void> {
    try {
      // Check if migration is needed and run it
      if (!SupabaseMigration.isMigrationCompleted()) {
        const needsMigration = await SupabaseMigration.needsMigration();
        if (needsMigration) {
          await SupabaseMigration.runMigration();
        } else {
          // Mark as completed even if no migration was needed
          localStorage.setItem('supabase_migration_completed', 'true');
        }
      }
      
      this.isSupabaseReady = true;
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      // Continue with localStorage fallback
    }
  }

  // Generate today's date string
  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Get all camper profiles (now properly async)
  async getAllCamperProfiles(): Promise<CamperProfile[]> {
    if (this.isSupabaseReady) {
      try {
        return await supabaseService.getAllCamperProfiles();
      } catch (error) {
        console.error('Error fetching camper profiles from Supabase:', error);
      }
    }
    
    // Fallback to localStorage only during transition
    const stored = localStorage.getItem('master_camper_profiles');
    return stored ? JSON.parse(stored) : [];
  }

  // Synchronous version for immediate backward compatibility (deprecated)
  getAllCamperProfilesSync(): CamperProfile[] {
    console.warn('getAllCamperProfilesSync is deprecated - use async getAllCamperProfiles instead');
    const stored = localStorage.getItem('master_camper_profiles');
    return stored ? JSON.parse(stored) : [];
  }

  // Save camper profiles to Supabase
  async saveAllCamperProfiles(profiles: CamperProfile[]): Promise<void> {
    console.warn('saveAllCamperProfiles is deprecated - individual camper operations should be used');
    // This method is now deprecated since profiles should be managed individually
  }

  // Get camper profile by ID (keep sync for now)
  getCamperProfile(camperId: string): CamperProfile | null {
    // Use sync method for backward compatibility
    return this.getCamperProfileSync(camperId);
  }

  // Synchronous version for backward compatibility
  getCamperProfileSync(camperId: string): CamperProfile | null {
    const profiles = this.getAllCamperProfilesSync();
    return profiles.find(p => p.id === camperId) || null;
  }

  // Generate secure camper code (kept for backward compatibility)
  generateSecureCamperCode(bunkLetter: string, position: number, camperName: string): string {
    const names = camperName.split(' ');
    const firstNameCode = names[0].substring(0, 2).toUpperCase();
    const lastNameCode = names[names.length - 1].substring(0, 1).toUpperCase();
    const randomNumbers = Math.floor(10 + Math.random() * 90); // 10-99
    return `${firstNameCode}${lastNameCode}${bunkLetter}${randomNumbers}`;
  }

  // Generate secure staff code (kept for backward compatibility)
  generateSecureStaffCode(bunkLetter: string, position: number, staffName: string): string {
    const initials = staffName.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `STF_${initials}_${bunkLetter}${position}_${randomSuffix}`;
  }

  // Get all submissions (keep sync for now)
  getAllSubmissions(): CamperSubmission[] {
    // Use sync method for backward compatibility
    return this.getAllSubmissionsSync();
  }

  // Synchronous version for backward compatibility
  getAllSubmissionsSync(): CamperSubmission[] {
    const stored = localStorage.getItem('master_submissions');
    return stored ? JSON.parse(stored) : [];
  }

  // Save all submissions (deprecated - now handled by Supabase)
  saveAllSubmissions(submissions: CamperSubmission[]): void {
    console.warn('saveAllSubmissions is deprecated - submissions are managed in Supabase');
  }

  // Submit missions for a camper (async version)
  async submitCamperMissions(camperId: string, missionIds: string[]): Promise<void> {
    if (this.isSupabaseReady) {
      try {
        await supabaseService.submitCamperMissions(camperId, missionIds);
        return;
      } catch (error) {
        console.error('Error submitting missions to Supabase:', error);
      }
    }
    
    // Fallback to localStorage approach
    const profile = this.getCamperProfileSync(camperId);
    if (!profile) {
      console.error('Camper profile not found:', camperId);
      return;
    }

    const submissions = this.getAllSubmissionsSync();
    const today = this.getTodayString();
    
    // Remove any existing submission for today
    const filtered = submissions.filter(s => !(s.camperId === camperId && s.date === today));
    
    // Add new submission
    const newSubmission: CamperSubmission = {
      id: `sub_${camperId}_${today}_${Date.now()}`,
      camperId,
      camperName: profile.name,
      camperCode: profile.code,
      bunkName: profile.bunkName,
      date: today,
      missions: missionIds,
      status: 'submitted',
      submittedAt: new Date().toISOString()
    };
    
    filtered.push(newSubmission);
    localStorage.setItem('master_submissions', JSON.stringify(filtered));
    
    // Clear working missions after submission
    this.clearCamperWorkingMissions(camperId);
  }

  // Get today's submission for a camper (keep sync for now)
  getCamperTodaySubmission(camperId: string): CamperSubmission | null {
    // Use sync method for backward compatibility
    return this.getCamperTodaySubmissionSync(camperId);
  }

  // Synchronous version for backward compatibility
  getCamperTodaySubmissionSync(camperId: string): CamperSubmission | null {
    const submissions = this.getAllSubmissionsSync();
    const today = this.getTodayString();
    return submissions.find(s => s.camperId === camperId && s.date === today) || null;
  }

  // Check if camper can edit today's submission (editing disabled for campers)
  canEditTodaySubmission(camperId: string): boolean {
    return false; // Camper editing is now disabled
  }

  // Approve submission (async version)
  async approveSubmission(submissionId: string, approvedBy: string): Promise<void> {
    if (this.isSupabaseReady) {
      try {
        await supabaseService.approveSubmission(submissionId, approvedBy);
        return;
      } catch (error) {
        console.error('Error approving submission in Supabase:', error);
      }
    }
    
    // Fallback to localStorage
    const submissions = this.getAllSubmissionsSync();
    const submission = submissions.find(s => s.id === submissionId);
    
    if (submission) {
      submission.status = 'approved';
      submission.approvedAt = new Date().toISOString();
      submission.approvedBy = approvedBy;
      localStorage.setItem('master_submissions', JSON.stringify(submissions));
    }
  }

  // Reject submission (async version)
  async rejectSubmission(submissionId: string, rejectedBy: string): Promise<void> {
    if (this.isSupabaseReady) {
      try {
        await supabaseService.rejectSubmission(submissionId, rejectedBy);
        return;
      } catch (error) {
        console.error('Error rejecting submission in Supabase:', error);
      }
    }
    
    // Fallback to localStorage
    const submissions = this.getAllSubmissionsSync();
    const submission = submissions.find(s => s.id === submissionId);
    
    if (submission) {
      submission.status = 'rejected';
      submission.rejectedAt = new Date().toISOString();
      submission.rejectedBy = rejectedBy;
      localStorage.setItem('master_submissions', JSON.stringify(submissions));
    }
  }

  // Get camper's current in-progress missions (keep sync for now)
  getCamperWorkingMissions(camperId: string): string[] {
    // Use sync method for backward compatibility
    return this.getCamperWorkingMissionsSync(camperId);
  }

  // Synchronous version for backward compatibility
  getCamperWorkingMissionsSync(camperId: string): string[] {
    const stored = localStorage.getItem(`working_missions_${camperId}`);
    return stored ? JSON.parse(stored) : [];
  }

  // Save camper's working missions (keep sync for now)
  saveCamperWorkingMissions(camperId: string, missionIds: string[]): void {
    // Use sync method for backward compatibility
    this.saveCamperWorkingMissionsSync(camperId, missionIds);
  }

  // Synchronous version for backward compatibility
  saveCamperWorkingMissionsSync(camperId: string, missionIds: string[]): void {
    localStorage.setItem(`working_missions_${camperId}`, JSON.stringify(missionIds));
  }

  // Clear working missions after submission (async version)
  async clearCamperWorkingMissions(camperId: string): Promise<void> {
    if (this.isSupabaseReady) {
      try {
        await supabaseService.clearCamperWorkingMissions(camperId);
        return;
      } catch (error) {
        console.error('Error clearing working missions from Supabase:', error);
      }
    }
    
    // Fallback to localStorage
    localStorage.removeItem(`working_missions_${camperId}`);
  }

  // Get admin password (keep sync for now)
  getAdminPassword(): string {
    // Use sync method for backward compatibility
    return this.getAdminPasswordSync();
  }

  // Synchronous version for backward compatibility
  getAdminPasswordSync(): string {
    return localStorage.getItem('admin_password') || 'admin123';
  }

  // Set admin password (async version)
  async setAdminPassword(password: string): Promise<void> {
    if (this.isSupabaseReady) {
      try {
        await supabaseService.updateSystemSettings({ adminPassword: password });
        return;
      } catch (error) {
        console.error('Error updating admin password in Supabase:', error);
      }
    }
    
    // Fallback to localStorage
    localStorage.setItem('admin_password', password);
  }

  // Get daily required missions (keep sync for now)
  getDailyRequired(): number {
    // Use sync method for backward compatibility
    return this.getDailyRequiredSync();
  }

  // Synchronous version for backward compatibility
  getDailyRequiredSync(): number {
    const stored = localStorage.getItem('daily_required_missions');
    return stored ? parseInt(stored) : 3;
  }

  // Set daily required missions (async version)
  async setDailyRequired(count: number): Promise<void> {
    if (this.isSupabaseReady) {
      try {
        await supabaseService.updateSystemSettings({ dailyRequired: count });
        return;
      } catch (error) {
        console.error('Error updating daily required in Supabase:', error);
      }
    }
    
    // Fallback to localStorage
    localStorage.setItem('daily_required_missions', count.toString());
  }

  // Get all campers with their submission status for today (keep sync for now)
  getAllCampersWithStatus(): Array<{
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
  }> {
    // Use sync methods for backward compatibility
    return this.getAllCampersWithStatusSync();
  }

  // Synchronous version for backward compatibility
  getAllCampersWithStatusSync(): Array<{
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
  }> {
    const profiles = this.getAllCamperProfilesSync();
    const dailyRequired = this.getDailyRequiredSync();
    
    return profiles.map(profile => {
      const todaySubmission = this.getCamperTodaySubmissionSync(profile.id);
      const workingMissions = this.getCamperWorkingMissionsSync(profile.id);
      
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
        isQualified: missionCount >= dailyRequired
      };
    });
  }

  // Get submissions that need approval (keep sync for now)
  getPendingSubmissions(): CamperSubmission[] {
    // Use sync method for backward compatibility
    return this.getPendingSubmissionsSync();
  }

  // Synchronous version for backward compatibility
  getPendingSubmissionsSync(): CamperSubmission[] {
    const submissions = this.getAllSubmissionsSync();
    return submissions.filter(s => s.status === 'submitted' || s.status === 'edit_requested');
  }
}

export const MasterData = MasterDataStorage.getInstance();
