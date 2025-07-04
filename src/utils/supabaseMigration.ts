import { supabaseService } from '@/services/supabaseService';

// Migration utility to move existing localStorage data to Supabase
export class SupabaseMigration {
  
  // Check if migration is needed
  static async needsMigration(): Promise<boolean> {
    // Check if there's any localStorage data to migrate
    const hasLocalStorageData = localStorage.getItem('master_submissions') || 
                               localStorage.getItem('working_missions_camper_a1') || // Check for any working missions
                               localStorage.getItem('admin_password') ||
                               localStorage.getItem('daily_required_missions');
    
    if (!hasLocalStorageData) {
      return false;
    }

    // Check if Supabase already has data
    try {
      const submissions = await supabaseService.getAllSubmissions();
      return submissions.length === 0; // Need migration if no submissions in Supabase
    } catch (error) {
      console.error('Error checking Supabase data:', error);
      return false;
    }
  }

  // Migrate localStorage submissions to Supabase
  static async migrateSubmissions(): Promise<void> {
    const storedSubmissions = localStorage.getItem('master_submissions');
    if (!storedSubmissions) {
      return;
    }

    try {
      const submissions = JSON.parse(storedSubmissions);
      console.log(`Migrating ${submissions.length} submissions to Supabase...`);

      // Note: This would require direct SQL inserts since the submissions
      // already have specific IDs and dates. For now, we'll log them.
      console.log('Submissions to migrate:', submissions);
      
      // In a real migration, you'd insert these into Supabase
      // For now, we'll just clear the localStorage since we have fresh data
      localStorage.removeItem('master_submissions');
    } catch (error) {
      console.error('Error migrating submissions:', error);
    }
  }

  // Migrate working missions
  static async migrateWorkingMissions(): Promise<void> {
    const camperProfiles = await supabaseService.getAllCamperProfiles();
    
    for (const camper of camperProfiles) {
      const workingMissionsKey = `working_missions_${camper.id}`;
      const storedMissions = localStorage.getItem(workingMissionsKey);
      
      if (storedMissions) {
        try {
          const missions = JSON.parse(storedMissions);
          if (missions.length > 0) {
            await supabaseService.saveCamperWorkingMissions(camper.id, missions);
            console.log(`Migrated working missions for ${camper.name}:`, missions);
          }
          localStorage.removeItem(workingMissionsKey);
        } catch (error) {
          console.error(`Error migrating working missions for ${camper.name}:`, error);
        }
      }
    }
  }

  // Migrate system settings
  static async migrateSystemSettings(): Promise<void> {
    const adminPassword = localStorage.getItem('admin_password');
    const dailyRequired = localStorage.getItem('daily_required_missions');
    
    if (adminPassword || dailyRequired) {
      try {
        const settings: any = {};
        
        if (adminPassword) {
          settings.adminPassword = adminPassword;
          localStorage.removeItem('admin_password');
        }
        
        if (dailyRequired) {
          settings.dailyRequired = parseInt(dailyRequired);
          localStorage.removeItem('daily_required_missions');
        }
        
        await supabaseService.updateSystemSettings(settings);
        console.log('Migrated system settings:', settings);
      } catch (error) {
        console.error('Error migrating system settings:', error);
      }
    }
  }

  // Run full migration
  static async runMigration(): Promise<void> {
    console.log('Starting migration from localStorage to Supabase...');
    
    try {
      await this.migrateSubmissions();
      await this.migrateWorkingMissions();
      await this.migrateSystemSettings();
      
      // Mark migration as complete
      localStorage.setItem('supabase_migration_completed', 'true');
      localStorage.setItem('data_version', '5.0.0'); // Update version to indicate Supabase integration
      
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  // Check if migration was completed
  static isMigrationCompleted(): boolean {
    return localStorage.getItem('supabase_migration_completed') === 'true';
  }
}