
import { supabaseService } from '@/services/supabaseService';
import { SupabaseMigration } from './supabaseMigration';

// Master Data Storage - DEPRECATED: Use supabaseService directly instead
// This file is kept for backward compatibility but should be phased out
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

  // DEPRECATED: Use supabaseService.getAllCamperProfiles() instead
  async getAllCamperProfiles(): Promise<CamperProfile[]> {
    console.warn('MasterData.getAllCamperProfiles() is deprecated - use supabaseService.getAllCamperProfiles() instead');
    try {
      await this.ensureSupabaseReady();
      return await supabaseService.getAllCamperProfiles();
    } catch (error) {
      console.error('Error fetching camper profiles from Supabase:', error);
      throw error;
    }
  }

  // Ensure Supabase is ready
  private async ensureSupabaseReady(): Promise<void> {
    if (!this.isSupabaseReady) {
      await this.initializeSupabase();
    }
  }

  // DEPRECATED: Use supabaseService.getAllCamperProfiles() instead
  getAllCamperProfilesSync(): CamperProfile[] {
    console.warn('getAllCamperProfilesSync is DEPRECATED and should not be used - use async supabaseService.getAllCamperProfiles() instead');
    const stored = localStorage.getItem('master_camper_profiles');
    return stored ? JSON.parse(stored) : [];
  }

  // DEPRECATED: Individual camper operations should be used
  async saveAllCamperProfiles(profiles: CamperProfile[]): Promise<void> {
    console.warn('saveAllCamperProfiles is deprecated - individual camper operations should be used');
  }

  // DEPRECATED: Use supabaseService.getCamperProfile() instead
  getCamperProfile(camperId: string): CamperProfile | null {
    console.warn('MasterData.getCamperProfile() is deprecated - use supabaseService.getCamperProfile() instead');
    return this.getCamperProfileSync(camperId);
  }

  // DEPRECATED: Use supabaseService.getCamperProfile() instead
  getCamperProfileSync(camperId: string): CamperProfile | null {
    console.warn('getCamperProfileSync is DEPRECATED - use async supabaseService.getCamperProfile() instead');
    const profiles = this.getAllCamperProfilesSync();
    return profiles.find(p => p.id === camperId) || null;
  }

  // Legacy code generation methods (kept for backward compatibility)
  generateSecureCamperCode(bunkLetter: string, position: number, camperName: string): string {
    const names = camperName.split(' ');
    const firstNameCode = names[0].substring(0, 2).toUpperCase();
    const lastNameCode = names[names.length - 1].substring(0, 1).toUpperCase();
    const randomNumbers = Math.floor(10 + Math.random() * 90); // 10-99
    return `${firstNameCode}${lastNameCode}${bunkLetter}${randomNumbers}`;
  }

  generateSecureStaffCode(bunkLetter: string, position: number, staffName: string): string {
    const initials = staffName.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `STF_${initials}_${bunkLetter}${position}_${randomSuffix}`;
  }

  // DEPRECATED: Use supabaseService.getAllSubmissions() instead
  async getAllSubmissions(): Promise<CamperSubmission[]> {
    console.warn('MasterData.getAllSubmissions() is deprecated - use supabaseService.getAllSubmissions() instead');
    try {
      await this.ensureSupabaseReady();
      return await supabaseService.getAllSubmissions();
    } catch (error) {
      console.error('Error fetching submissions from Supabase:', error);
      return [];
    }
  }

  // DEPRECATED: Use supabaseService.getAllSubmissions() instead
  getAllSubmissionsSync(): CamperSubmission[] {
    console.warn('getAllSubmissionsSync is DEPRECATED - use async supabaseService.getAllSubmissions() instead');
    const stored = localStorage.getItem('master_submissions');
    return stored ? JSON.parse(stored) : [];
  }

  // DEPRECATED: Submissions are managed in Supabase
  saveAllSubmissions(submissions: CamperSubmission[]): void {
    console.warn('saveAllSubmissions is deprecated - submissions are managed in Supabase');
  }

  // Submit missions for a camper (redirects to supabaseService)
  async submitCamperMissions(camperId: string, missionIds: string[]): Promise<void> {
    try {
      await supabaseService.submitCamperMissions(camperId, missionIds);
    } catch (error) {
      console.error('Error submitting missions:', error);
      throw error;
    }
  }

  // DEPRECATED: Use supabaseService.getCamperTodaySubmission() instead
  async getCamperTodaySubmission(camperId: string): Promise<CamperSubmission | null> {
    console.warn('MasterData.getCamperTodaySubmission() is deprecated - use supabaseService.getCamperTodaySubmission() instead');
    try {
      await this.ensureSupabaseReady();
      return await supabaseService.getCamperTodaySubmission(camperId);
    } catch (error) {
      console.error('Error fetching today submission from Supabase:', error);
      return null;
    }
  }

  // DEPRECATED: Use supabaseService.getCamperTodaySubmission() instead
  getCamperTodaySubmissionSync(camperId: string): CamperSubmission | null {
    console.warn('getCamperTodaySubmissionSync is DEPRECATED - use async supabaseService.getCamperTodaySubmission() instead');
    const submissions = this.getAllSubmissionsSync();
    const today = this.getTodayString();
    return submissions.find(s => s.camperId === camperId && s.date === today) || null;
  }

  // Editing is disabled for campers
  canEditTodaySubmission(camperId: string): boolean {
    return false; // Camper editing is now disabled
  }

  // Redirects to supabaseService
  async approveSubmission(submissionId: string, approvedBy: string): Promise<void> {
    try {
      await supabaseService.approveSubmission(submissionId, approvedBy);
    } catch (error) {
      console.error('Error approving submission:', error);
      throw error;
    }
  }

  // Redirects to supabaseService
  async rejectSubmission(submissionId: string, rejectedBy: string): Promise<void> {
    try {
      await supabaseService.rejectSubmission(submissionId, rejectedBy);
    } catch (error) {
      console.error('Error rejecting submission:', error);
      throw error;
    }
  }

  // DEPRECATED: Use supabaseService.getCamperWorkingMissions() instead
  getCamperWorkingMissions(camperId: string): string[] {
    console.warn('MasterData.getCamperWorkingMissions() is deprecated - use supabaseService.getCamperWorkingMissions() instead');
    return this.getCamperWorkingMissionsSync(camperId);
  }

  // DEPRECATED: Use supabaseService.getCamperWorkingMissions() instead
  getCamperWorkingMissionsSync(camperId: string): string[] {
    console.warn('getCamperWorkingMissionsSync is DEPRECATED - use async supabaseService.getCamperWorkingMissions() instead');
    const stored = localStorage.getItem(`working_missions_${camperId}`);
    return stored ? JSON.parse(stored) : [];
  }

  // DEPRECATED: Use supabaseService.saveCamperWorkingMissions() instead
  saveCamperWorkingMissions(camperId: string, missionIds: string[]): void {
    console.warn('MasterData.saveCamperWorkingMissions() is deprecated - use supabaseService.saveCamperWorkingMissions() instead');
    this.saveCamperWorkingMissionsSync(camperId, missionIds);
  }

  // DEPRECATED: Use supabaseService.saveCamperWorkingMissions() instead
  saveCamperWorkingMissionsSync(camperId: string, missionIds: string[]): void {
    console.warn('saveCamperWorkingMissionsSync is DEPRECATED - use async supabaseService.saveCamperWorkingMissions() instead');
    localStorage.setItem(`working_missions_${camperId}`, JSON.stringify(missionIds));
  }

  // Redirects to supabaseService
  async clearCamperWorkingMissions(camperId: string): Promise<void> {
    try {
      await supabaseService.clearCamperWorkingMissions(camperId);
    } catch (error) {
      console.error('Error clearing working missions:', error);
      throw error;
    }
  }

  // DEPRECATED: Use supabaseService.getSystemSettings() instead
  getAdminPassword(): string {
    console.warn('MasterData.getAdminPassword() is deprecated - use supabaseService.getSystemSettings() instead');
    return this.getAdminPasswordSync();
  }

  // DEPRECATED: Use supabaseService.getSystemSettings() instead
  getAdminPasswordSync(): string {
    console.warn('getAdminPasswordSync is DEPRECATED - use async supabaseService.getSystemSettings() instead');
    return localStorage.getItem('admin_password') || 'admin123';
  }

  // Redirects to supabaseService
  async setAdminPassword(password: string): Promise<void> {
    try {
      await supabaseService.updateSystemSettings({ adminPassword: password });
    } catch (error) {
      console.error('Error updating admin password:', error);
      throw error;
    }
  }

  // DEPRECATED: Use supabaseService.getSystemSettings() instead
  getDailyRequired(): number {
    console.warn('MasterData.getDailyRequired() is deprecated - use supabaseService.getSystemSettings() instead');
    return this.getDailyRequiredSync();
  }

  // DEPRECATED: Use supabaseService.getSystemSettings() instead
  getDailyRequiredSync(): number {
    console.warn('getDailyRequiredSync is DEPRECATED - use async supabaseService.getSystemSettings() instead');
    const stored = localStorage.getItem('daily_required_missions');
    return stored ? parseInt(stored) : 3;
  }

  // Redirects to supabaseService
  async setDailyRequired(count: number): Promise<void> {
    try {
      await supabaseService.updateSystemSettings({ dailyRequired: count });
    } catch (error) {
      console.error('Error updating daily required:', error);
      throw error;
    }
  }

  // DEPRECATED: This method should not be used - components should load data directly from supabaseService
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
    console.warn('getAllCampersWithStatus is DEPRECATED - components should load data directly from supabaseService');
    return this.getAllCampersWithStatusSync();
  }

  // DEPRECATED: This method should not be used - components should load data directly from supabaseService
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
    console.warn('getAllCampersWithStatusSync is DEPRECATED - components should load data directly from supabaseService');
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

  // DEPRECATED: All submissions are auto-approved
  getPendingSubmissions(): CamperSubmission[] {
    console.warn('getPendingSubmissions is deprecated - all submissions are auto-approved');
    return [];
  }

  // DEPRECATED: All submissions are auto-approved
  getPendingSubmissionsSync(): CamperSubmission[] {
    console.warn('getPendingSubmissionsSync is deprecated - all submissions are auto-approved');
    return [];
  }
}

export const MasterData = MasterDataStorage.getInstance();
