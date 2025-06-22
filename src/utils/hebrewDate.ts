
export interface HebrewDate {
  hebrew: string;
  english: string;
}

// Hebrew month names
const HEBREW_MONTHS = [
  'ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול',
  'תשרי', 'חשון', 'כסלו', 'טבת', 'שבט', 'אדר'
];

// Hebrew day prefixes for numbers
const HEBREW_NUMBERS: { [key: number]: string } = {
  1: 'א\'', 2: 'ב\'', 3: 'ג\'', 4: 'ד\'', 5: 'ה\'', 6: 'ו\'', 7: 'ז\'', 8: 'ח\'', 9: 'ט\'', 10: 'י\'',
  11: 'י"א', 12: 'י"ב', 13: 'י"ג', 14: 'י"ד', 15: 'ט"ו', 16: 'ט"ז', 17: 'י"ז', 18: 'י"ח', 19: 'י"ט', 20: 'כ\'',
  21: 'כ"א', 22: 'כ"ב', 23: 'כ"ג', 24: 'כ"ד', 25: 'כ"ה', 26: 'כ"ו', 27: 'כ"ז', 28: 'כ"ח', 29: 'כ"ט', 30: 'ל\''
};

export function getCurrentHebrewDate(): HebrewDate {
  const now = new Date();
  
  // For simulation purposes, let's create a summer date in Hebrew year 5785 (תשפ"ה)
  // Assuming we're in the month of Sivan (סיון) which is typically when summer camps occur
  
  const day = 26; // כ"ו
  const month = 'סיון';
  const year = 'תשפ"ה';
  
  const hebrewDay = HEBREW_NUMBERS[day] || day.toString();
  const hebrew = `${hebrewDay} ${month} ${year}`;
  
  const english = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return { hebrew, english };
}

export function getSessionInfo(sessionConfig: any) {
  const { currentSession, currentWeek, currentDay } = sessionConfig;
  return {
    hebrew: `שבוע ${currentWeek}, יום ${currentDay} - מחנה קיץ`,
    english: `Week ${currentWeek}, Day ${currentDay} - Session ${currentSession}`
  };
}
