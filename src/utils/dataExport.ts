
import { CAMP_DATA, DEFAULT_MISSIONS } from '@/data/campData';

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
}

export function getCamperStats(camperId: string) {
  const progress = localStorage.getItem(`camper_${camperId}_missions`);
  const submitted = localStorage.getItem(`camper_${camperId}_submitted`);
  const approved = localStorage.getItem(`camper_${camperId}_approved`);
  
  const completedMissions = progress ? JSON.parse(progress) : [];
  const submittedMissions = submitted ? JSON.parse(submitted) : [];
  const approvedMissions = approved ? JSON.parse(approved) : [];
  
  const activeMissions = DEFAULT_MISSIONS.filter(m => m.isActive);
  const mandatoryMissions = activeMissions.filter(m => m.isMandatory);
  
  const dailyRequired = parseInt(localStorage.getItem('mission_daily_required') || '3');
  const weeklyRequired = parseInt(localStorage.getItem('mission_weekly_required') || '15');
  
  const completedMandatory = mandatoryMissions.filter(m => 
    approvedMissions.includes(m.id)
  ).length;
  
  const todayQualified = approvedMissions.length >= dailyRequired;
  const weekTotal = approvedMissions.length;
  const sessionTotal = approvedMissions.length;
  
  return {
    completedMissions: completedMissions.length,
    submittedMissions: submittedMissions.length,
    approvedMissions: approvedMissions.length,
    totalMissions: activeMissions.length,
    mandatoryCompleted: completedMandatory,
    mandatoryTotal: mandatoryMissions.length,
    todayQualified,
    weekTotal,
    sessionTotal,
    weeklyRequired,
    dailyRequired,
    progressPercentage: Math.round((approvedMissions.length / activeMissions.length) * 100)
  };
}

export function exportAllData(): FullExportData {
  const allCampers = CAMP_DATA.flatMap(bunk => 
    bunk.campers.map(camper => {
      const stats = getCamperStats(camper.id);
      return {
        id: camper.id,
        name: camper.name,
        bunk: bunk.displayName,
        completedMissions: JSON.parse(localStorage.getItem(`camper_${camper.id}_missions`) || '[]'),
        submittedMissions: JSON.parse(localStorage.getItem(`camper_${camper.id}_submitted`) || '[]'),
        approvedMissions: JSON.parse(localStorage.getItem(`camper_${camper.id}_approved`) || '[]'),
        dailyQualified: stats.todayQualified,
        weekTotal: stats.weekTotal,
        sessionTotal: stats.sessionTotal,
        mandatoryCompleted: stats.mandatoryCompleted,
        mandatoryTotal: stats.mandatoryTotal,
        progressPercentage: stats.progressPercentage
      };
    })
  );

  const missionStats = DEFAULT_MISSIONS.map(mission => {
    const totalCampers = CAMP_DATA.reduce((sum, bunk) => sum + bunk.campers.length, 0);
    let completionCount = 0;
    
    CAMP_DATA.forEach(bunk => {
      bunk.campers.forEach(camper => {
        const approved = JSON.parse(localStorage.getItem(`camper_${camper.id}_approved`) || '[]');
        if (approved.includes(mission.id)) {
          completionCount++;
        }
      });
    });

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
  });

  const bunkStats = CAMP_DATA.map(bunk => {
    const camperStats = bunk.campers.map(camper => getCamperStats(camper.id));
    const qualifiedCount = camperStats.filter(stats => stats.todayQualified).length;
    const avgProgress = Math.round(
      camperStats.reduce((sum, stats) => sum + stats.progressPercentage, 0) / camperStats.length
    );

    return {
      id: bunk.id,
      name: bunk.displayName,
      totalCampers: bunk.campers.length,
      qualifiedToday: qualifiedCount,
      averageProgress: avgProgress,
      staff: bunk.staff.map(s => s.name)
    };
  });

  return {
    exportDate: new Date().toISOString(),
    session: parseInt(localStorage.getItem('current_session') || '0'),
    week: parseInt(localStorage.getItem('current_week') || '1'),
    day: parseInt(localStorage.getItem('current_day') || '1'),
    campers: allCampers,
    missions: missionStats,
    bunks: bunkStats,
    settings: {
      dailyRequired: parseInt(localStorage.getItem('mission_daily_required') || '3'),
      weeklyRequired: parseInt(localStorage.getItem('mission_weekly_required') || '15')
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

export function downloadFullReport() {
  const fullData = exportAllData();
  
  // Export campers data
  downloadCSV(fullData.campers, `campers-session-${fullData.session}`);
  
  // Export mission analytics
  downloadCSV(fullData.missions, `missions-analytics-session-${fullData.session}`);
  
  // Export bunk performance
  downloadCSV(fullData.bunks, `bunks-performance-session-${fullData.session}`);
  
  // Export summary JSON
  const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `camp-complete-data-session-${fullData.session}.json`;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function importData(jsonData: string): boolean {
  try {
    const data: FullExportData = JSON.parse(jsonData);
    
    // Confirm with user before importing
    const confirm = window.confirm(
      `Import data from ${data.exportDate}?\n` +
      `Session: ${data.session}, Week: ${data.week}, Day: ${data.day}\n` +
      `This will overwrite current data. Continue?`
    );
    
    if (!confirm) return false;
    
    // Import camper data
    data.campers.forEach(camper => {
      localStorage.setItem(`camper_${camper.id}_missions`, JSON.stringify(camper.completedMissions));
      localStorage.setItem(`camper_${camper.id}_submitted`, JSON.stringify(camper.submittedMissions));
      localStorage.setItem(`camper_${camper.id}_approved`, JSON.stringify(camper.approvedMissions));
    });
    
    // Import settings
    localStorage.setItem('mission_daily_required', data.settings.dailyRequired.toString());
    localStorage.setItem('mission_weekly_required', data.settings.weeklyRequired.toString());
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
