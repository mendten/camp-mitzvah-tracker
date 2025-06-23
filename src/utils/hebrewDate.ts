
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
  
  // Proper Hebrew calendar calculation (simplified for camp period)
  // This is a basic approximation - for precise Hebrew dates, use a proper Hebrew calendar library
  const gregorianYear = now.getFullYear();
  const hebrewYear = gregorianYear + 3760; // Basic conversion
  
  const month = now.getMonth() + 1;
  const day = now.getDate();
  
  let hebrewMonth: string;
  let hebrewDay: number;
  
  // Summer camp period mapping (June-August to Hebrew months)
  if (month === 6) {
    hebrewMonth = 'סיון';
    hebrewDay = day;
  } else if (month === 7) {
    hebrewMonth = 'תמוז';
    hebrewDay = day;
  } else if (month === 8) {
    hebrewMonth = 'אב';
    hebrewDay = day;
  } else if (month === 9) {
    hebrewMonth = 'אלול';
    hebrewDay = day;
  } else {
    // Default for other months
    hebrewMonth = HEBREW_MONTHS[month - 1] || 'אב';
    hebrewDay = day;
  }
  
  // Ensure day doesn't exceed 29 (Hebrew months are 29-30 days)
  if (hebrewDay > 29) hebrewDay = 29;
  
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
    hebrewDay = day;
  } else if (month === 7) {
    hebrewMonth = 'תמוז';
    hebrewDay = day;
  } else if (month === 8) {
    hebrewMonth = 'אב';
    hebrewDay = day;
  } else if (month === 9) {
    hebrewMonth = 'אלול';
    hebrewDay = day;
  } else {
    hebrewMonth = HEBREW_MONTHS[month - 1] || 'אב';
    hebrewDay = day;
  }
  
  if (hebrewDay > 29) hebrewDay = 29;
  
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

export function getSessionInfo() {
  const currentSession = parseInt(localStorage.getItem('current_session') || '0');
  const sessionStartDate = localStorage.getItem('session_start_date');
  
  if (currentSession === 0) {
    return {
      hebrew: 'טרם החל המחנה',
      english: 'Pre-Camp Session 0'
    };
  }
  
  const startDate = sessionStartDate ? new Date(sessionStartDate) : new Date();
  const daysSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(daysSinceStart / 7) + 1;
  const currentDay = (daysSinceStart % 7) + 1;
  
  return {
    hebrew: `מפגש ${currentSession}, שבוע ${currentWeek}, יום ${currentDay}`,
    english: `Session ${currentSession}, Week ${currentWeek}, Day ${currentDay}`
  };
}

export function formatHebrewDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let hebrewMonth: string;
  let hebrewDay: number;
  
  if (month === 6) {
    hebrewMonth = 'סיון';
    hebrewDay = day;
  } else if (month === 7) {
    hebrewMonth = 'תמוז';
    hebrewDay = day;
  } else if (month === 8) {
    hebrewMonth = 'אב';
    hebrewDay = day;
  } else if (month === 9) {
    hebrewMonth = 'אלול';
    hebrewDay = day;
  } else {
    hebrewMonth = HEBREW_MONTHS[month - 1] || 'אב';
    hebrewDay = day;
  }
  
  if (hebrewDay > 29) hebrewDay = 29;
  
  const hebrewDayStr = HEBREW_NUMBERS[hebrewDay] || hebrewDay.toString();
  return `${hebrewDayStr} ${hebrewMonth} תשפ"ה`;
}
