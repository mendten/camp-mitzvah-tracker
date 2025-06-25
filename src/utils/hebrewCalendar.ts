
// Simple Hebrew calendar utility
export const formatHebrewDate = (date: Date): string => {
  // For now, return a consistent format until proper Hebrew calendar is implemented
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return today.toLocaleDateString('en-US', options);
};

export const getTodayHebrewDate = (): string => {
  return formatHebrewDate(new Date());
};
