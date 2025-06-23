
export interface HebrewDate {
  hebrew: string;
  english: string;
}

// Hebrew month names in order
const HEBREW_MONTHS = [
  'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר',
  'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול'
];

// Hebrew day prefixes for numbers
const HEBREW_NUMBERS: { [key: number]: string } = {
  1: 'א\'', 2: 'ב\'', 3: 'ג\'', 4: 'ד\'', 5: 'ה\'', 6: 'ו\'', 7: 'ז\'', 8: 'ח\'', 9: 'ט\'', 10: 'י\'',
  11: 'י"א', 12: 'י"ב', 13: 'י"ג', 14: 'י"ד', 15: 'ט"ו', 16: 'ט"ז', 17: 'י"ז', 18: 'י"ח', 19: 'י"ט', 20: 'כ\'',
  21: 'כ"א', 22: 'כ"ב', 23: 'כ"ג', 24: 'כ"ד', 25: 'כ"ה', 26: 'כ"ו', 27: 'כ"ז', 28: 'כ"ח', 29: 'כ"ט', 30: 'ל\''
};

// Hebrew days of week
const HEBREW_DAYS = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת קודש'];

// Convert Gregorian date to Hebrew date (simplified algorithm)
function gregorianToHebrew(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Simple conversion - Hebrew year is approximately Gregorian year + 3760
  const hebrewYear = year + 3760;
  
  // Determine Hebrew month based on time of year
  let hebrewMonth: string;
  let hebrewDay: number;
  
  // Summer camp period (June-August) mapping
  if (month >= 6 && month <= 8) {
    if (month === 6) {
      hebrewMonth = 'סיון';
      hebrewDay = day + 15; // Approximate offset for Sivan
    } else if (month === 7) {
      hebrewMonth = 'תמוז';
      hebrewDay = day;
    } else {
      hebrewMonth = 'אב';
      hebrewDay = day;
    }
  } else {
    // Default mapping for other months
    const monthMap = [
      'טבת', 'שבט', 'אדר', 'ניסן', 'אייר', 'סיון',
      'תמוז', 'אב', 'אלול', 'תשרי', 'חשון', 'כסלו'
    ];
    hebrewMonth = monthMap[month - 1];
    hebrewDay = day;
  }
  
  // Ensure day doesn't exceed 30
  if (hebrewDay > 30) hebrewDay = 30;
  
  return {
    year: hebrewYear,
    month: hebrewMonth,
    day: hebrewDay
  };
}

export function getCurrentHebrewDate(): HebrewDate {
  const now = new Date();
  const hebrew = gregorianToHebrew(now);
  
  const hebrewDayStr = HEBREW_NUMBERS[hebrew.day] || hebrew.day.toString();
  const hebrewText = `${hebrewDayStr} ${hebrew.month} תשפ"ה`;
  
  const english = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return { hebrew: hebrewText, english };
}

export function getHebrewDateForDate(date: Date): HebrewDate {
  const hebrew = gregorianToHebrew(date);
  const dayOfWeek = HEBREW_DAYS[date.getDay()];
  
  const hebrewDayStr = HEBREW_NUMBERS[hebrew.day] || hebrew.day.toString();
  const hebrewText = `${dayOfWeek}, ${hebrewDayStr} ${hebrew.month} תשפ"ה`;
  
  const english = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return { hebrew: hebrewText, english };
}

export function getSessionInfo(sessionConfig: any) {
  const { currentSession, currentWeek, currentDay } = sessionConfig;
  return {
    hebrew: `שבוע ${currentWeek}, יום ${currentDay} - מחנה קיץ`,
    english: `Week ${currentWeek}, Day ${currentDay} - Session ${currentSession}`
  };
}

export function formatHebrewDate(date: Date): string {
  const hebrew = gregorianToHebrew(date);
  const hebrewDayStr = HEBREW_NUMBERS[hebrew.day] || hebrew.day.toString();
  return `${hebrewDayStr} ${hebrew.month} תשפ"ה`;
}
