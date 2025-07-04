
import { CAMP_DATA } from '@/data/campData';

// Master Data Storage - Single source of truth for all camp data
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
  
  static getInstance(): MasterDataStorage {
    if (!MasterDataStorage.instance) {
      MasterDataStorage.instance = new MasterDataStorage();
    }
    return MasterDataStorage.instance;
  }

  // Generate today's date string
  getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Get all camper profiles
  getAllCamperProfiles(): CamperProfile[] {
    const stored = localStorage.getItem('master_camper_profiles');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Initialize from CAMP_DATA with secure codes
    const profiles: CamperProfile[] = [];
    
    CAMP_DATA.forEach((bunk: any) => {
      bunk.campers.forEach((camper: any, index: number) => {
        // Extract kevutzah letter from bunk displayName
        const bunkLetter = bunk.displayName.split(' ').pop()?.charAt(0).toUpperCase() || 'A';
        // Generate secure 6-8 character code
        const secureCode = this.generateSecureCamperCode(bunkLetter, index + 1);
        
        profiles.push({
          id: camper.id,
          name: camper.name,
          code: secureCode,
          bunkId: bunk.id,
          bunkName: bunk.displayName
        });
      });
    });
    
    this.saveAllCamperProfiles(profiles);
    return profiles;
  }

  saveAllCamperProfiles(profiles: CamperProfile[]): void {
    localStorage.setItem('master_camper_profiles', JSON.stringify(profiles));
  }

  // Get camper profile by ID
  getCamperProfile(camperId: string): CamperProfile | null {
    const profiles = this.getAllCamperProfiles();
    return profiles.find(p => p.id === camperId) || null;
  }

  // Generate secure camper code (6-8 characters)
  generateSecureCamperCode(bunkLetter: string, position: number): string {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${bunkLetter}${position}${randomSuffix}`;
  }

  // Generate secure staff code
  generateSecureStaffCode(bunkLetter: string, position: number): string {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `STF_${bunkLetter}${position}${randomSuffix}`;
  }

  // Get all submissions
  getAllSubmissions(): CamperSubmission[] {
    const stored = localStorage.getItem('master_submissions');
    return stored ? JSON.parse(stored) : [];
  }

  // Save all submissions
  saveAllSubmissions(submissions: CamperSubmission[]): void {
    localStorage.setItem('master_submissions', JSON.stringify(submissions));
  }

  // Submit missions for a camper
  submitCamperMissions(camperId: string, missionIds: string[]): void {
    const profile = this.getCamperProfile(camperId);
    if (!profile) {
      console.error('Camper profile not found:', camperId);
      return;
    }

    const submissions = this.getAllSubmissions();
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
    this.saveAllSubmissions(filtered);
    
    // Clear working missions after submission
    this.clearCamperWorkingMissions(camperId);
  }

  // Get today's submission for a camper
  getCamperTodaySubmission(camperId: string): CamperSubmission | null {
    const submissions = this.getAllSubmissions();
    const today = this.getTodayString();
    return submissions.find(s => s.camperId === camperId && s.date === today) || null;
  }

  // Check if camper can edit today's submission (removed edit functionality)
  canEditTodaySubmission(camperId: string): boolean {
    return false; // Edit functionality removed
  }

  // Approve submission
  approveSubmission(submissionId: string, approvedBy: string): void {
    const submissions = this.getAllSubmissions();
    const submission = submissions.find(s => s.id === submissionId);
    
    if (submission) {
      submission.status = 'approved';
      submission.approvedAt = new Date().toISOString();
      submission.approvedBy = approvedBy;
      this.saveAllSubmissions(submissions);
    }
  }

  // Reject submission
  rejectSubmission(submissionId: string, rejectedBy: string): void {
    const submissions = this.getAllSubmissions();
    const submission = submissions.find(s => s.id === submissionId);
    
    if (submission) {
      submission.status = 'rejected';
      submission.rejectedAt = new Date().toISOString();
      submission.rejectedBy = rejectedBy;
      this.saveAllSubmissions(submissions);
    }
  }

  // Get camper's current in-progress missions (not yet submitted)
  getCamperWorkingMissions(camperId: string): string[] {
    const stored = localStorage.getItem(`working_missions_${camperId}`);
    return stored ? JSON.parse(stored) : [];
  }

  // Save camper's working missions
  saveCamperWorkingMissions(camperId: string, missionIds: string[]): void {
    localStorage.setItem(`working_missions_${camperId}`, JSON.stringify(missionIds));
  }

  // Clear working missions after submission
  clearCamperWorkingMissions(camperId: string): void {
    localStorage.removeItem(`working_missions_${camperId}`);
  }

  // Get admin password
  getAdminPassword(): string {
    return localStorage.getItem('admin_password') || 'admin123';
  }

  // Set admin password
  setAdminPassword(password: string): void {
    localStorage.setItem('admin_password', password);
  }

  // Get daily required missions
  getDailyRequired(): number {
    const stored = localStorage.getItem('daily_required_missions');
    return stored ? parseInt(stored) : 3;
  }

  // Set daily required missions
  setDailyRequired(count: number): void {
    localStorage.setItem('daily_required_missions', count.toString());
  }

  // Get all campers with their submission status for today
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
    const profiles = this.getAllCamperProfiles();
    const dailyRequired = this.getDailyRequired();
    
    return profiles.map(profile => {
      const todaySubmission = this.getCamperTodaySubmission(profile.id);
      const workingMissions = this.getCamperWorkingMissions(profile.id);
      
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

  // Get submissions that need approval
  getPendingSubmissions(): CamperSubmission[] {
    const submissions = this.getAllSubmissions();
    return submissions.filter(s => s.status === 'submitted' || s.status === 'edit_requested');
  }
}

export const MasterData = MasterDataStorage.getInstance();
