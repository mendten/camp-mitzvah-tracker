
import { HDate, months, greg } from '@hebcal/core';

export interface ProperHebrewDate {
  hebrew: string;
  english: string;
  hebrewDay: number;
  hebrewMonth: string;
  hebrewYear: number;
}

// Hebrew day of week names
const HEBREW_DAYS = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת קודש'];

export function getCurrentProperHebrewDate(): ProperHebrewDate {
  const now = new Date();
  return getProperHebrewDateForDate(now);
}

export function getProperHebrewDateForDate(date: Date): ProperHebrewDate {
  const hDate = new HDate(date);
  const dayOfWeek = HEBREW_DAYS[date.getDay()];
  
  const hebrewDay = hDate.getDate();
  const hebrewMonth = hDate.getMonthName();
  const hebrewYear = hDate.getFullYear();
  
  // Format Hebrew date string
  const hebrewDateStr = hDate.render('he');
  const hebrewText = `${dayOfWeek}, ${hebrewDateStr}`;
  
  const english = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return { 
    hebrew: hebrewText, 
    english,
    hebrewDay,
    hebrewMonth,
    hebrewYear
  };
}

export function getSessionInfo() {
  const session = parseInt(localStorage.getItem('current_session') || '0');
  const startDate = localStorage.getItem('session_start_date');
  
  if (session === 0) {
    return {
      hebrew: 'טרם החל המחנה',
      english: 'Pre-Camp Session 0'
    };
  }
  
  if (!startDate) {
    return {
      hebrew: `מפגש ${session} - לא מוגדר`,
      english: `Session ${session} - Not Configured`
    };
  }
  
  const start = new Date(startDate);
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(daysSinceStart / 7) + 1;
  const currentDay = (daysSinceStart % 7) + 1;
  
  return {
    hebrew: `מפגש ${session}, שבוע ${currentWeek}, יום ${currentDay}`,
    english: `Session ${session}, Week ${currentWeek}, Day ${currentDay}`
  };
}
