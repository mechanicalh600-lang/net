// Simple mock for ID generation
export const generateId = (): string => Math.random().toString(36).substring(2, 9);

// Mock Shamsi Date (In real app, use jalaali-js or moment-jalaali)
export const getShamsiDate = (): string => {
  const date = new Date();
  // Simplified conversion for demo purposes
  const year = date.getFullYear() - 621;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

export const getTime = (): string => {
  const date = new Date();
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export const generateTrackingCode = (type: 'W' | 'P' | 'J' | 'G' | 'H' | 'K'): string => {
  const date = new Date();
  const year = String(date.getFullYear() - 621).substring(1); // 403
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const randomCounter = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${type}${year}${month}${randomCounter}`;
};

export const mockIp = "192.168.1.105"; // Simulated IP