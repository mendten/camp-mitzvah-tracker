
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

// Get current Hebrew year (fixed for camp period)
const CURRENT_HEBREW_YEAR = 'תשפ"ה';

export function getCurrentHebrewDate(): HebrewDate {
  const now = new Date();
  return getHebrewDateForDate(now);
}

export function getHebrewDateForDate(date: Date): HebrewDate {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = HEBREW_DAYS[date.getDay()];
  
  let hebrewMonth: string;
  let hebrewDay: number;
  
  // Map Gregorian summer months to Hebrew months for camp period
  if (month === 6) { // June
    hebrewMonth = 'סיון';
    hebrewDay = Math.min(day + 15, 29); // Sivan offset
  } else if (month === 7) { // July
    hebrewMonth = 'תמוז';
    hebrewDay = Math.min(day, 29);
  } else if (month === 8) { // August
    hebrewMonth = 'אב';
    hebrewDay = Math.min(day, 29);
  } else if (month === 9) { // September
    hebrewMonth = 'אלול';
    hebrewDay = Math.min(day, 29);
  } else {
    // Default for other months (camp period focus)
    hebrewMonth = 'תמוז';
    hebrewDay = Math.min(day, 29);
  }
  
  const hebrewDayStr = HEBREW_NUMBERS[hebrewDay] || hebrewDay.toString();
  const hebrewText = `${dayOfWeek}, ${hebrewDayStr} ${hebrewMonth} ${CURRENT_HEBREW_YEAR}`;
  
  const english = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return { hebrew: hebrewText, english };
}

export function formatHebrewDate(date: Date): string {
  const { hebrew } = getHebrewDateForDate(date);
  return hebrew;
}

export function getTodayHebrewDate(): string {
  return formatHebrewDate(new Date());
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
