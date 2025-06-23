
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

export function getCurrentHebrewDate(): HebrewDate {
  const now = new Date();
  
  // Simple summer camp period mapping (June-August)
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  let hebrewMonth: string;
  let hebrewDay: number;
  
  // During summer camp period (June-August)
  if (month === 6) {
    hebrewMonth = 'סיון';
    hebrewDay = day + 15; // Approximate offset
  } else if (month === 7) {
    hebrewMonth = 'תמוז';
    hebrewDay = day;
  } else if (month === 8) {
    hebrewMonth = 'אב';
    hebrewDay = day;
  } else {
    // Default for other times of year
    hebrewMonth = 'אב';
    hebrewDay = day;
  }
  
  // Ensure day doesn't exceed 30
  if (hebrewDay > 30) hebrewDay = 30;
  
  const hebrewDayStr = HEBREW_NUMBERS[hebrewDay] || hebrewDay.toString();
  const hebrewText = `${hebrewDayStr} ${hebrewMonth} תשפ"ה`;
  
  const english = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return { hebrew: hebrewText, english };
}

export function getHebrewDateForDate(date: Date): HebrewDate {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = HEBREW_DAYS[date.getDay()];
  
  let hebrewMonth: string;
  let hebrewDay: number;
  
  if (month === 6) {
    hebrewMonth = 'סיון';
    hebrewDay = day + 15;
  } else if (month === 7) {
    hebrewMonth = 'תמוז';
    hebrewDay = day;
  } else if (month === 8) {
    hebrewMonth = 'אב';
    hebrewDay = day;
  } else {
    hebrewMonth = 'אב';
    hebrewDay = day;
  }
  
  if (hebrewDay > 30) hebrewDay = 30;
  
  const hebrewDayStr = HEBREW_NUMBERS[hebrewDay] || hebrewDay.toString();
  const hebrewText = `${dayOfWeek}, ${hebrewDayStr} ${hebrewMonth} תשפ"ה`;
  
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
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let hebrewMonth: string;
  let hebrewDay: number;
  
  if (month === 6) {
    hebrewMonth = 'סיון';
    hebrewDay = day + 15;
  } else if (month === 7) {
    hebrewMonth = 'תמוז';
    hebrewDay = day;
  } else if (month === 8) {
    hebrewMonth = 'אב';
    hebrewDay = day;
  } else {
    hebrewMonth = 'אב';
    hebrewDay = day;
  }
  
  if (hebrewDay > 30) hebrewDay = 30;
  
  const hebrewDayStr = HEBREW_NUMBERS[hebrewDay] || hebrewDay.toString();
  return `${hebrewDayStr} ${hebrewMonth} תשפ"ה`;
}
