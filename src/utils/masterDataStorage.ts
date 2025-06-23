
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
    
    // Initialize from CAMP_DATA if not exists
    const { CAMP_DATA } = require('@/data/campData');
    const profiles: CamperProfile[] = [];
    
    CAMP_DATA.forEach((bunk: any) => {
      bunk.campers.forEach((camper: any) => {
        profiles.push({
          id: camper.id,
          name: camper.name,
          code: this.generateCamperCode(camper.name, bunk.displayName),
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

  // Generate camper code from name and bunk
  generateCamperCode(name: string, bunk: string): string {
    const initials = name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
    const bunkCode = bunk.charAt(0).toUpperCase();
    const random = Math.floor(Math.random() * 900) + 100;
    return `${initials}${bunkCode}${random}`;
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
    const profile = this.getAllCamperProfiles().find(p => p.id === camperId);
    if (!profile) return;

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
  }

  // Get today's submission for a camper
  getCamperTodaySubmission(camperId: string): CamperSubmission | null {
    const submissions = this.getAllSubmissions();
    const today = this.getTodayString();
    return submissions.find(s => s.camperId === camperId && s.date === today) || null;
  }

  // Request edit for today's submission
  requestEdit(camperId: string, reason: string): void {
    const submissions = this.getAllSubmissions();
    const today = this.getTodayString();
    const submission = submissions.find(s => s.camperId === camperId && s.date === today);
    
    if (submission && submission.status === 'submitted') {
      submission.status = 'edit_requested';
      submission.editRequestReason = reason;
      submission.editRequestedAt = new Date().toISOString();
      this.saveAllSubmissions(submissions);
    }
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
}

export const MasterData = MasterDataStorage.getInstance();
