
// Unified data storage system to replace fragmented localStorage usage
export interface CamperSubmission {
  date: string;
  missions: string[];
  submittedAt: string;
  status: 'pending' | 'approved' | 'edit_requested';
  editRequestReason?: string;
}

export interface CamperProgress {
  camperId: string;
  completedMissions: string[];
  submissions: CamperSubmission[];
  currentSessionData: {
    session: number;
    startDate: string;
  };
}

export class DataStorage {
  // Get today's date string for consistent date handling
  static getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Get camper's completed missions for today
  static getCamperTodayMissions(camperId: string): string[] {
    const key = `camper_${camperId}_today_missions`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  // Set camper's completed missions for today
  static setCamperTodayMissions(camperId: string, missions: string[]): void {
    const key = `camper_${camperId}_today_missions`;
    localStorage.setItem(key, JSON.stringify(missions));
  }

  // Get camper's submission for today
  static getCamperTodaySubmission(camperId: string): CamperSubmission | null {
    const today = this.getTodayDateString();
    const key = `camper_${camperId}_submission_${today}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  }

  // Submit camper's missions for today
  static submitCamperMissions(camperId: string, missions: string[]): void {
    const today = this.getTodayDateString();
    const submission: CamperSubmission = {
      date: today,
      missions,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    const key = `camper_${camperId}_submission_${today}`;
    localStorage.setItem(key, JSON.stringify(submission));
    
    // Add to submission history
    this.addToSubmissionHistory(camperId, submission);
  }

  // Request edit for today's submission
  static requestSubmissionEdit(camperId: string, reason: string = 'Edit requested'): void {
    const today = this.getTodayDateString();
    const currentSubmission = this.getCamperTodaySubmission(camperId);
    
    if (currentSubmission) {
      currentSubmission.status = 'edit_requested';
      currentSubmission.editRequestReason = reason;
      
      const key = `camper_${camperId}_submission_${today}`;
      localStorage.setItem(key, JSON.stringify(currentSubmission));
      
      // Add to pending edit requests for staff
      this.addToPendingEditRequests(camperId, currentSubmission);
    }
  }

  // Approve camper's submission
  static approveSubmission(camperId: string): void {
    const today = this.getTodayDateString();
    const submission = this.getCamperTodaySubmission(camperId);
    
    if (submission) {
      submission.status = 'approved';
      const key = `camper_${camperId}_submission_${today}`;
      localStorage.setItem(key, JSON.stringify(submission));
      
      // Update submission history
      this.updateSubmissionHistory(camperId, submission);
    }
  }

  // Get camper's submission history
  static getSubmissionHistory(camperId: string): CamperSubmission[] {
    const key = `camper_${camperId}_history`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  // Add to submission history
  private static addToSubmissionHistory(camperId: string, submission: CamperSubmission): void {
    const history = this.getSubmissionHistory(camperId);
    const existingIndex = history.findIndex(h => h.date === submission.date);
    
    if (existingIndex >= 0) {
      history[existingIndex] = submission;
    } else {
      history.push(submission);
    }
    
    const key = `camper_${camperId}_history`;
    localStorage.setItem(key, JSON.stringify(history));
  }

  // Update submission in history
  private static updateSubmissionHistory(camperId: string, submission: CamperSubmission): void {
    const history = this.getSubmissionHistory(camperId);
    const index = history.findIndex(h => h.date === submission.date);
    
    if (index >= 0) {
      history[index] = submission;
      const key = `camper_${camperId}_history`;
      localStorage.setItem(key, JSON.stringify(history));
    }
  }

  // Add to pending edit requests for staff
  private static addToPendingEditRequests(camperId: string, submission: CamperSubmission): void {
    const pending = JSON.parse(localStorage.getItem('pending_edit_requests') || '[]');
    const existing = pending.findIndex((req: any) => req.camperId === camperId && req.date === submission.date);
    
    if (existing >= 0) {
      pending[existing] = { camperId, ...submission };
    } else {
      pending.push({ camperId, ...submission });
    }
    
    localStorage.setItem('pending_edit_requests', JSON.stringify(pending));
  }

  // Get all pending edit requests
  static getPendingEditRequests(): any[] {
    return JSON.parse(localStorage.getItem('pending_edit_requests') || '[]');
  }

  // Get current session info
  static getCurrentSession(): { session: number; startDate: string | null } {
    const session = parseInt(localStorage.getItem('current_session') || '0');
    const startDate = localStorage.getItem('session_start_date');
    return { session, startDate };
  }

  // Get daily required missions count
  static getDailyRequired(): number {
    return parseInt(localStorage.getItem('mission_daily_required') || '3');
  }

  // Get camper status for today
  static getCamperTodayStatus(camperId: string): {
    status: 'not_submitted' | 'pending' | 'approved' | 'edit_requested';
    qualified: boolean;
    submittedCount: number;
  } {
    const submission = this.getCamperTodaySubmission(camperId);
    const dailyRequired = this.getDailyRequired();
    
    if (!submission) {
      const todayMissions = this.getCamperTodayMissions(camperId);
      return {
        status: 'not_submitted',
        qualified: todayMissions.length >= dailyRequired,
        submittedCount: todayMissions.length
      };
    }
    
    return {
      status: submission.status,
      qualified: submission.missions.length >= dailyRequired,
      submittedCount: submission.missions.length
    };
  }

  // Clear all data (for testing/reset)
  static clearAllData(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('camper_') || key === 'pending_edit_requests' || key === 'current_session' || key === 'session_start_date') {
        localStorage.removeItem(key);
      }
    });
  }
}
