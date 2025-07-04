// Data Reset Utility - Force reload from new CAMP_DATA structure

export const resetAllData = () => {
  // Clear all localStorage data to force reload from new CAMP_DATA
  const keysToRemove = [];
  
  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('master_') ||
      key.startsWith('working_missions_') ||
      key.startsWith('staff_') ||
      key.startsWith('admin_') ||
      key.startsWith('daily_')
    )) {
      keysToRemove.push(key);
    }
  }
  
  // Remove all camp-related data
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Force page reload to reinitialize from CAMP_DATA
  window.location.reload();
};

// Check if we need to reset data (version change indicator)
export const checkDataVersion = () => {
  const currentVersion = '2.0.0'; // Increment this when data structure changes
  const storedVersion = localStorage.getItem('data_version');
  
  if (storedVersion !== currentVersion) {
    console.log('Data structure changed, resetting all data...');
    localStorage.setItem('data_version', currentVersion);
    resetAllData();
  }
};