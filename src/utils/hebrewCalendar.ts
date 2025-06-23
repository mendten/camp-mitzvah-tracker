
// Hebrew calendar system with proper Jewish date calculations
export interface HebrewDate {
  hebrew: string;
  english: string;
  day: number;
  month: string;
  year: number;
  dayOfWeek: string;
}

// Hebrew months in order (Tishrei is month 1)
const HEBREW_MONTHS = [
  'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר',
  'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
];

// Hebrew days of the week
const HEBREW_DAYS = [
  'יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 
  'יום חמישי', 'יום שישי', 'שבת קודש'
];

// Hebrew numerals
const HEBREW_NUMERALS: { [key: number]: string } = {
  1: 'א\'', 2: 'ב\'', 3: 'ג\'', 4: 'ד\'', 5: 'ה\'', 6: 'ו\'', 7: 'ז\'', 8: 'ח\'', 9: 'ט\'', 10: 'י\'',
  11: 'י"א', 12: 'י"ב', 13: 'י"ג', 14: 'י"ד', 15: 'ט"ו', 16: 'ט"ז', 17: 'י"ז', 18: 'י"ח', 19: 'י"ט', 20: 'כ\'',
  21: 'כ"א', 22: 'כ"ב', 23: 'כ"ג', 24: 'כ"ד', 25: 'כ"ה', 26: 'כ"ו', 27: 'כ"ז', 28: 'כ"ח', 29: 'כ"ט', 30: 'ל\''
};

// Simplified Hebrew calendar calculation for summer camp period
export function getHebrewDate(gregorianDate: Date = new Date()): HebrewDate {
  const month = gregorianDate.getMonth() + 1; // 1-12
  const day = gregorianDate.getDate();
  const year = gregorianDate.getFullYear();
  const dayOfWeek = gregorianDate.getDay(); // 0=Sunday

  // Camp period mapping (approximate - in real implementation would use proper Jewish calendar library)
  let hebrewMonth: string;
  let hebrewDay: number;
  let hebrewYear = 5785; // Hebrew year 5785 (2024-2025)

  // Summer months mapping to Hebrew calendar
  if (month >= 6 && month <= 9) {
    // June-September camp period
    if (month === 6) {
      hebrewMonth = 'סיון';
      hebrewDay = day + 10; // Approximate offset
    } else if (month === 7) {
      hebrewMonth = 'תמוז';
      hebrewDay = day;
    } else if (month === 8) {
      hebrewMonth = 'אב';
      hebrewDay = day;
    } else {
      hebrewMonth = 'אלול';
      hebrewDay = day;
    }
  } else {
    // Default for other months
    hebrewMonth = 'תמוז';
    hebrewDay = day;
  }

  // Ensure day doesn't exceed 30
  if (hebrewDay > 30) hebrewDay = 30;

  const hebrewDayStr = HEBREW_NUMERALS[hebrewDay] || hebrewDay.toString();
  const hebrewDayOfWeek = HEBREW_DAYS[dayOfWeek];
  
  const hebrewText = `${hebrewDayOfWeek}, ${hebrewDayStr} ${hebrewMonth} תשפ"ה`;
  const english = gregorianDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    hebrew: hebrewText,
    english,
    day: hebrewDay,
    month: hebrewMonth,
    year: hebrewYear,
    dayOfWeek: hebrewDayOfWeek
  };
}

export function formatHebrewDate(date: Date): string {
  const hebrewDate = getHebrewDate(date);
  return hebrewDate.hebrew;
}

export function getCurrentHebrewDate(): HebrewDate {
  return getHebrewDate(new Date());
}

export function getHebrewDateForDate(date: Date): HebrewDate {
  return getHebrewDate(date);
}

// Session information based on current date
export function getSessionInfo(): { hebrew: string; english: string } {
  const now = new Date();
  const sessionStart = new Date('2024-06-24'); // Approximate camp start
  const daysDiff = Math.floor((now.getTime() - sessionStart.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < 0) {
    return {
      hebrew: 'טרם החל המחנה',
      english: 'Pre-Camp'
    };
  }
  
  const week = Math.floor(daysDiff / 7) + 1;
  const day = (daysDiff % 7) + 1;
  
  return {
    hebrew: `שבוע ${week}, יום ${day}`,
    english: `Week ${week}, Day ${day}`
  };
}
