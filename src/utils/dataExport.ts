import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';
import { MasterData } from '@/utils/masterDataStorage';

export interface CamperExportData {
  id: string;
  name: string;
  bunk: string;
  completedMissions: string[];
  submittedMissions: string[];
  approvedMissions: string[];
  dailyQualified: boolean;
  weekTotal: number;
  sessionTotal: number;
  mandatoryCompleted: number;
  mandatoryTotal: number;
  progressPercentage: number;
}

export interface MissionExportData {
  id: string;
  title: string;
  type: string;
  isMandatory: boolean;
  isActive: boolean;
  completionCount: number;
  totalCampers: number;
  completionRate: number;
}

export interface BunkExportData {
  id: string;
  name: string;
  totalCampers: number;
  qualifiedToday: number;
  averageProgress: number;
  staff: string[];
}

export interface FullExportData {
  exportDate: string;
  session: number;
  week: number;
  day: number;
  campers: CamperExportData[];
  missions: MissionExportData[];
  bunks: BunkExportData[];
  settings: {
    dailyRequired: number;
    weeklyRequired: number;
  };
  masterData: {
    profiles: any[];
    submissions: any[];
  };
}

export async function getCamperStats(camperId: string) {
  const submission = await MasterData.getCamperTodaySubmission(camperId);
  const workingMissions = MasterData.getCamperWorkingMissions(camperId);
  
  const activeMissions = DEFAULT_MISSIONS.filter(m => m.isActive);
  const mandatoryMissions = activeMissions.filter(m => m.isMandatory);
  
  const dailyRequired = MasterData.getDailyRequired();
  
  let completedMissions = [];
  let approvedMissions = [];
  let submittedMissions = [];
  
  if (submission) {
    submittedMissions = submission.missions;
    if (submission.status === 'approved') {
      approvedMissions = submission.missions;
      completedMissions = submission.missions;
    }
  } else {
    completedMissions = workingMissions;
  }
  
  const completedMandatory = mandatoryMissions.filter(m => 
    approvedMissions.includes(m.id)
  ).length;
  
  const todayQualified = approvedMissions.length >= dailyRequired;
  
  return {
    completedMissions: completedMissions.length,
    submittedMissions: submittedMissions.length,
    approvedMissions: approvedMissions.length,
    totalMissions: activeMissions.length,
    mandatoryCompleted: completedMandatory,
    mandatoryTotal: mandatoryMissions.length,
    todayQualified,
    weekTotal: approvedMissions.length,
    sessionTotal: approvedMissions.length,
    weeklyRequired: dailyRequired * 7,
    dailyRequired,
    progressPercentage: Math.round((approvedMissions.length / activeMissions.length) * 100)
  };
}

export async function exportAllData(): Promise<FullExportData> {
  const allCamperProfiles = await MasterData.getAllCamperProfiles();
  const allSubmissions = await MasterData.getAllSubmissions();
  
  const allCampers = await Promise.all(allCamperProfiles.map(async profile => {
    const stats = await getCamperStats(profile.id);
    const submission = await MasterData.getCamperTodaySubmission(profile.id);
    const workingMissions = MasterData.getCamperWorkingMissions(profile.id);
    
    return {
      id: profile.id,
      name: profile.name,
      bunk: profile.bunkName,
      completedMissions: workingMissions,
      submittedMissions: submission ? submission.missions : [],
      approvedMissions: submission && submission.status === 'approved' ? submission.missions : [],
      dailyQualified: stats.todayQualified,
      weekTotal: stats.weekTotal,
      sessionTotal: stats.sessionTotal,
      mandatoryCompleted: stats.mandatoryCompleted,
      mandatoryTotal: stats.mandatoryTotal,
      progressPercentage: stats.progressPercentage
    };
  }));

  const missionStats = await Promise.all(DEFAULT_MISSIONS.map(async mission => {
    const totalCampers = allCamperProfiles.length;
    let completionCount = 0;
    
    for (const profile of allCamperProfiles) {
      const submission = await MasterData.getCamperTodaySubmission(profile.id);
      if (submission && submission.status === 'approved' && submission.missions.includes(mission.id)) {
        completionCount++;
      }
    }

    return {
      id: mission.id,
      title: mission.title,
      type: mission.type,
      isMandatory: mission.isMandatory,
      isActive: mission.isActive,
      completionCount,
      totalCampers,
      completionRate: Math.round((completionCount / totalCampers) * 100)
    };
  }));

  const bunkStats = await Promise.all(CAMP_DATA.map(async bunk => {
    const bunkCampers = allCamperProfiles.filter(profile => profile.bunkId === bunk.id);
    const camperStats = await Promise.all(bunkCampers.map(profile => getCamperStats(profile.id)));
    const qualifiedCount = camperStats.filter(stats => stats.todayQualified).length;
    const avgProgress = camperStats.length > 0 ? Math.round(
      camperStats.reduce((sum, stats) => sum + stats.progressPercentage, 0) / camperStats.length
    ) : 0;

    return {
      id: bunk.id,
      name: bunk.displayName,
      totalCampers: bunkCampers.length,
      qualifiedToday: qualifiedCount,
      averageProgress: avgProgress,
      staff: bunk.staff.map(s => s.name)
    };
  }));

  return {
    exportDate: new Date().toISOString(),
    session: parseInt(localStorage.getItem('current_session') || '0'),
    week: parseInt(localStorage.getItem('current_week') || '1'),
    day: parseInt(localStorage.getItem('current_day') || '1'),
    campers: allCampers,
    missions: missionStats,
    bunks: bunkStats,
    settings: {
      dailyRequired: MasterData.getDailyRequired(),
      weeklyRequired: MasterData.getDailyRequired() * 7
    },
    masterData: {
      profiles: allCamperProfiles,
      submissions: allSubmissions
    }
  };
}

export function downloadCSV(data: any[], filename: string) {
  if (!data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (Array.isArray(value)) return `"${value.join('; ')}"`;
        if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
        return value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function downloadFullReport() {
  const fullData = await exportAllData();
  
  // Export campers data
  downloadCSV(fullData.campers, `campers-session-${fullData.session}`);
  
  // Export mission analytics
  downloadCSV(fullData.missions, `missions-analytics-session-${fullData.session}`);
  
  // Export bunk performance
  downloadCSV(fullData.bunks, `bunks-performance-session-${fullData.session}`);
  
  // Export summary JSON with MasterData
  const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `camp-complete-data-session-${fullData.session}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function importData(jsonData: string): Promise<boolean> {
  try {
    const data: FullExportData = JSON.parse(jsonData);
    
    // Confirm with user before importing
    const confirm = window.confirm(
      `Import data from ${data.exportDate}?\n` +
      `Session: ${data.session}, Week: ${data.week}, Day: ${data.day}\n` +
      `This will overwrite current data. Continue?`
    );
    
    if (!confirm) return false;
    
    // Import MasterData if available (new format)
    if (data.masterData) {
      MasterData.saveAllCamperProfiles(data.masterData.profiles);
      MasterData.saveAllSubmissions(data.masterData.submissions);
    } else {
      // Legacy import - convert old format to new MasterData format
      console.warn('Importing legacy format - some data may be lost');
      for (const camper of data.campers) {
        // This is a simplified conversion - you may want to enhance this
        const profile = {
          id: camper.id,
          name: camper.name,
          code: camper.id.toUpperCase(),
          bunkId: camper.bunk.toLowerCase(),
          bunkName: camper.bunk
        };
        
        // We can't perfectly recreate the old localStorage format,
        // so we'll create basic submissions
        if (camper.approvedMissions.length > 0) {
          await MasterData.submitCamperMissions(camper.id, camper.approvedMissions);
          const todaySubmission = await MasterData.getCamperTodaySubmission(camper.id);
          if (todaySubmission) {
            await MasterData.approveSubmission(todaySubmission.id, 'Import');
          }
        }
      }
    }
    
    // Import settings
    await MasterData.setDailyRequired(data.settings.dailyRequired);
    localStorage.setItem('current_session', data.session.toString());
    localStorage.setItem('current_week', data.week.toString());
    localStorage.setItem('current_day', data.day.toString());
    
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    alert('Import failed. Please check the file format.');
    return false;
  }
}

export const exportCamperData = () => {
  const csvContent = [
    ['Name', 'Bunk', 'Total Missions', 'Qualified Days', 'Current Streak', 'Total Submissions'],
    // Placeholder data - would be replaced with actual stats
    ['Sample Camper', 'Alef', '25', '15', '5', '20']
  ];

  const csvString = csvContent.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `camper-stats-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
