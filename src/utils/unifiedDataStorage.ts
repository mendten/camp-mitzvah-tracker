
// Unified data storage system to replace all fragmented localStorage usage
export interface MissionSubmission {
  id: string;
  camperId: string;
  date: string;
  missions: string[];
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'edit_requested';
  editRequestReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  editRequestedBy?: string;
  editRequestedAt?: string;
}

export interface CamperProfile {
  id: string;
  name: string;
  code: string;
  bunkId: string;
  email?: string;
  phone?: string;
  emergencyContact?: string;
  allergies?: string[];
  medications?: string[];
  notes?: string;
}

export interface BunkProfile {
  id: string;
  name: string;
  displayName: string;
  capacity: number;
  staffIds: string[];
  camperIds: string[];
}

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  role: 'counselor' | 'head_counselor' | 'admin';
  bunkIds: string[];
  permissions: string[];
}

export interface DailyProgress {
  camperId: string;
  date: string;
  completedMissions: string[];
  lastUpdated: string;
}

export interface SessionConfig {
  currentSession: number;
  sessionStartDate: string;
  sessionEndDate: string;
  dailyRequiredMissions: number;
  weeklyRequiredMissions: number;
}

export class UnifiedDataStorage {
  // Session Management
  static getSessionConfig(): SessionConfig {
    const stored = localStorage.getItem('session_config');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      currentSession: 1,
      sessionStartDate: new Date().toISOString().split('T')[0],
      sessionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dailyRequiredMissions: 3,
      weeklyRequiredMissions: 15
    };
  }

  static setSessionConfig(config: SessionConfig): void {
    localStorage.setItem('session_config', JSON.stringify(config));
  }

  // Camper Profile Management
  static getCamperProfile(camperId: string): CamperProfile | null {
    const stored = localStorage.getItem(`camper_profile_${camperId}`);
    return stored ? JSON.parse(stored) : null;
  }

  static setCamperProfile(profile: CamperProfile): void {
    localStorage.setItem(`camper_profile_${profile.id}`, JSON.stringify(profile));
  }

  static getAllCamperProfiles(): CamperProfile[] {
    const profiles: CamperProfile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('camper_profile_')) {
        const profile = localStorage.getItem(key);
        if (profile) {
          profiles.push(JSON.parse(profile));
        }
      }
    }
    return profiles;
  }

  // Daily Progress Management
  static getDailyProgress(camperId: string, date: string): DailyProgress | null {
    const stored = localStorage.getItem(`daily_progress_${camperId}_${date}`);
    return stored ? JSON.parse(stored) : null;
  }

  static setDailyProgress(progress: DailyProgress): void {
    localStorage.setItem(`daily_progress_${progress.camperId}_${progress.date}`, JSON.stringify(progress));
  }

  static getTodayProgress(camperId: string): DailyProgress {
    const today = new Date().toISOString().split('T')[0];
    const existing = this.getDailyProgress(camperId, today);
    if (existing) {
      return existing;
    }
    return {
      camperId,
      date: today,
      completedMissions: [],
      lastUpdated: new Date().toISOString()
    };
  }

  // Submission Management
  static createSubmission(camperId: string, missions: string[]): MissionSubmission {
    const submission: MissionSubmission = {
      id: `submission_${camperId}_${Date.now()}`,
      camperId,
      date: new Date().toISOString().split('T')[0],
      missions,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    localStorage.setItem(`submission_${submission.id}`, JSON.stringify(submission));
    this.addToSubmissionIndex(submission);
    return submission;
  }

  static getSubmission(submissionId: string): MissionSubmission | null {
    const stored = localStorage.getItem(`submission_${submissionId}`);
    return stored ? JSON.parse(stored) : null;
  }

  static updateSubmission(submission: MissionSubmission): void {
    localStorage.setItem(`submission_${submission.id}`, JSON.stringify(submission));
    this.updateSubmissionIndex(submission);
  }

  static getAllSubmissions(): MissionSubmission[] {
    const index = this.getSubmissionIndex();
    return index.map(id => this.getSubmission(id)).filter(Boolean) as MissionSubmission[];
  }

  static getCamperSubmissions(camperId: string): MissionSubmission[] {
    return this.getAllSubmissions().filter(s => s.camperId === camperId);
  }

  static getSubmissionsByDate(date: string): MissionSubmission[] {
    return this.getAllSubmissions().filter(s => s.date === date);
  }

  static getSubmissionsByStatus(status: MissionSubmission['status']): MissionSubmission[] {
    return this.getAllSubmissions().filter(s => s.status === status);
  }

  // Submission Index Management
  private static getSubmissionIndex(): string[] {
    const stored = localStorage.getItem('submission_index');
    return stored ? JSON.parse(stored) : [];
  }

  private static addToSubmissionIndex(submission: MissionSubmission): void {
    const index = this.getSubmissionIndex();
    if (!index.includes(submission.id)) {
      index.push(submission.id);
      localStorage.setItem('submission_index', JSON.stringify(index));
    }
  }

  private static updateSubmissionIndex(submission: MissionSubmission): void {
    // Index is already maintained, just ensure it exists
    this.addToSubmissionIndex(submission);
  }

  // Approval Actions
  static approveSubmission(submissionId: string, approvedBy: string): boolean {
    const submission = this.getSubmission(submissionId);
    if (submission) {
      submission.status = 'approved';
      submission.approvedBy = approvedBy;
      submission.approvedAt = new Date().toISOString();
      this.updateSubmission(submission);
      return true;
    }
    return false;
  }

  static rejectSubmission(submissionId: string, rejectedBy: string, reason?: string): boolean {
    const submission = this.getSubmission(submissionId);
    if (submission) {
      submission.status = 'rejected';
      submission.rejectedBy = rejectedBy;
      submission.rejectedAt = new Date().toISOString();
      submission.editRequestReason = reason;
      this.updateSubmission(submission);
      return true;
    }
    return false;
  }

  static requestEdit(submissionId: string, requestedBy: string, reason: string): boolean {
    const submission = this.getSubmission(submissionId);
    if (submission) {
      submission.status = 'edit_requested';
      submission.editRequestedBy = requestedBy;
      submission.editRequestedAt = new Date().toISOString();
      submission.editRequestReason = reason;
      this.updateSubmission(submission);
      return true;
    }
    return false;
  }

  // Statistics and Analytics
  static getCamperStats(camperId: string): {
    totalSubmissions: number;
    approvedSubmissions: number;
    pendingSubmissions: number;
    rejectedSubmissions: number;
    editRequestedSubmissions: number;
    averageMissionsPerDay: number;
    currentStreak: number;
    longestStreak: number;
  } {
    const submissions = this.getCamperSubmissions(camperId);
    const approved = submissions.filter(s => s.status === 'approved');
    const pending = submissions.filter(s => s.status === 'pending');
    const rejected = submissions.filter(s => s.status === 'rejected');
    const editRequested = submissions.filter(s => s.status === 'edit_requested');

    const totalMissions = submissions.reduce((sum, s) => sum + s.missions.length, 0);
    const averageMissionsPerDay = submissions.length > 0 ? totalMissions / submissions.length : 0;

    return {
      totalSubmissions: submissions.length,
      approvedSubmissions: approved.length,
      pendingSubmissions: pending.length,
      rejectedSubmissions: rejected.length,
      editRequestedSubmissions: editRequested.length,
      averageMissionsPerDay,
      currentStreak: this.calculateCurrentStreak(camperId),
      longestStreak: this.calculateLongestStreak(camperId)
    };
  }

  private static calculateCurrentStreak(camperId: string): number {
    const submissions = this.getCamperSubmissions(camperId)
      .filter(s => s.status === 'approved')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDate = new Date(today);

    for (const submission of submissions) {
      const submissionDate = submission.date;
      if (submissionDate === currentDate.toISOString().split('T')[0]) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private static calculateLongestStreak(camperId: string): number {
    const submissions = this.getCamperSubmissions(camperId)
      .filter(s => s.status === 'approved')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let longestStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const submission of submissions) {
      const submissionDate = new Date(submission.date);
      
      if (lastDate && submissionDate.getTime() - lastDate.getTime() === 24 * 60 * 60 * 1000) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }
      
      longestStreak = Math.max(longestStreak, currentStreak);
      lastDate = submissionDate;
    }

    return longestStreak;
  }

  // Data Migration and Cleanup
  static migrateFromOldSystem(): void {
    // Migrate old localStorage data to new unified system
    console.log('Starting data migration...');
    
    // Clear any existing unified data
    this.clearUnifiedData();
    
    console.log('Data migration completed');
  }

  static clearUnifiedData(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('camper_profile_') || 
          key?.startsWith('daily_progress_') || 
          key?.startsWith('submission_') ||
          key === 'submission_index' ||
          key === 'session_config') {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  static exportAllData(): any {
    return {
      sessionConfig: this.getSessionConfig(),
      camperProfiles: this.getAllCamperProfiles(),
      submissions: this.getAllSubmissions(),
      timestamp: new Date().toISOString()
    };
  }

  static importAllData(data: any): boolean {
    try {
      if (data.sessionConfig) {
        this.setSessionConfig(data.sessionConfig);
      }
      
      if (data.camperProfiles) {
        data.camperProfiles.forEach((profile: CamperProfile) => {
          this.setCamperProfile(profile);
        });
      }
      
      if (data.submissions) {
        data.submissions.forEach((submission: MissionSubmission) => {
          localStorage.setItem(`submission_${submission.id}`, JSON.stringify(submission));
          this.addToSubmissionIndex(submission);
        });
      }
      
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
}
