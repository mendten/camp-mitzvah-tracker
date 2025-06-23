
// Generate memorable 6-character codes for campers
export const generateCamperCode = (camperName: string, bunkId: string): string => {
  // Create a memorable code using name initials and random elements
  const nameInitials = camperName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
  
  // Bunk letter
  const bunkLetter = bunkId.charAt(0).toUpperCase();
  
  // Random 3-digit number
  const randomNum = Math.floor(100 + Math.random() * 900);
  
  return `${nameInitials}${bunkLetter}${randomNum}`;
};

export const generateUniqueCode = (existingCodes: Set<string>): string => {
  let code: string;
  let attempts = 0;
  
  do {
    // Generate a random memorable code
    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ';
    const vowels = 'AEIOU';
    const numbers = '0123456789';
    
    code = 
      consonants[Math.floor(Math.random() * consonants.length)] +
      vowels[Math.floor(Math.random() * vowels.length)] +
      consonants[Math.floor(Math.random() * consonants.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      numbers[Math.floor(Math.random() * numbers.length)];
    
    attempts++;
  } while (existingCodes.has(code) && attempts < 100);
  
  return code;
};

export const initializeCamperCodes = () => {
  const existingCodes = new Set<string>();
  
  // Load existing codes
  CAMP_DATA.forEach(bunk => {
    bunk.campers.forEach(camper => {
      const existingCode = localStorage.getItem(`camper_${camper.id}_code`);
      if (existingCode) {
        existingCodes.add(existingCode);
      }
    });
  });
  
  // Generate codes for campers without them
  CAMP_DATA.forEach(bunk => {
    bunk.campers.forEach(camper => {
      const existingCode = localStorage.getItem(`camper_${camper.id}_code`);
      if (!existingCode) {
        let newCode: string;
        
        // Try name-based code first
        newCode = generateCamperCode(camper.name, bunk.id);
        
        // If it exists, generate a unique one
        if (existingCodes.has(newCode)) {
          newCode = generateUniqueCode(existingCodes);
        }
        
        existingCodes.add(newCode);
        localStorage.setItem(`camper_${camper.id}_code`, newCode);
      }
    });
  });
};

export const getCamperCode = (camperId: string): string => {
  return localStorage.getItem(`camper_${camperId}_code`) || 'CODE01';
};

export const regenerateCamperCode = (camperId: string): string => {
  const existingCodes = new Set<string>();
  
  // Load all existing codes except this camper's
  CAMP_DATA.forEach(bunk => {
    bunk.campers.forEach(camper => {
      if (camper.id !== camperId) {
        const code = localStorage.getItem(`camper_${camper.id}_code`);
        if (code) existingCodes.add(code);
      }
    });
  });
  
  const newCode = generateUniqueCode(existingCodes);
  localStorage.setItem(`camper_${camperId}_code`, newCode);
  return newCode;
};

// Import CAMP_DATA at the top of the file
import { CAMP_DATA } from '@/data/campData';
