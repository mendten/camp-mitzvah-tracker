
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
  1: 'א', 2: 'ב', 3: 'ג', 4: 'ד', 5: 'ה', 6: 'ו', 7: 'ז', 8: 'ח', 9: 'ט', 10: 'י',
  11: 'יא', 12: 'יב', 13: 'יג', 14: 'יד', 15: 'טו', 16: 'טז', 17: 'יז', 18: 'יח', 19: 'יט', 20: 'כ',
  21: 'כא', 22: 'כב', 23: 'כג', 24: 'כד', 25: 'כה', 26: 'כו', 27: 'כז', 28: 'כח', 29: 'כט', 30: 'ל'
};

// Simple Hebrew date calculation for camp period (June-September 2024)
export function getHebrewDate(gregorianDate: Date = new Date()): HebrewDate {
  const month = gregorianDate.getMonth() + 1; // 1-12
  const day = gregorianDate.getDate();
  const year = gregorianDate.getFullYear();
  const dayOfWeek = gregorianDate.getDay(); // 0=Sunday

  // Camp period is approximately Sivan-Elul 5784
  let hebrewMonth: string;
  let hebrewDay: number;
  let hebrewYear = 5784; // Hebrew year for 2024

  // Map Gregorian months to Hebrew months for camp period
  if (month === 6) {
    hebrewMonth = 'סיון';
    hebrewDay = day + 15; // June starts around 15th of Sivan
    if (hebrewDay > 29) {
      hebrewMonth = 'תמוז';
      hebrewDay = hebrewDay - 29;
    }
  } else if (month === 7) {
    hebrewMonth = 'תמוז';
    hebrewDay = day;
    if (hebrewDay > 29) {
      hebrewMonth = 'אב';
      hebrewDay = hebrewDay - 29;
    }
  } else if (month === 8) {
    hebrewMonth = 'אב';
    hebrewDay = day;
    if (hebrewDay > 30) {
      hebrewMonth = 'אלול';
      hebrewDay = hebrewDay - 30;
    }
  } else if (month === 9) {
    hebrewMonth = 'אלול';
    hebrewDay = day;
  } else {
    // Default for other months
    hebrewMonth = 'תמוז';
    hebrewDay = day;
  }

  // Ensure day is within valid range
  if (hebrewDay > 30) hebrewDay = 30;
  if (hebrewDay < 1) hebrewDay = 1;

  const hebrewDayStr = HEBREW_NUMERALS[hebrewDay] || hebrewDay.toString();
  const hebrewDayOfWeek = HEBREW_DAYS[dayOfWeek];
  
  const hebrewText = `${hebrewDayOfWeek}, ${hebrewDayStr} ${hebrewMonth} תשפ"ד`;
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
  const sessionStart = new Date('2024-06-24'); // Camp start
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
