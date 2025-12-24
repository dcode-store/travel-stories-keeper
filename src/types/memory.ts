export interface Memory {
  id: string;
  title: string;
  date: string;
  content: string;
  images: string[];
  videoUrl?: string;
  audioUrl?: string;
  location?: string;
  tags?: string[];
  mood?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MemoryFormData {
  title: string;
  date: string;
  content: string;
  images: string[];
  videoUrl?: string;
  audioUrl?: string;
  location?: string;
  tags?: string[];
  mood?: string;
}

// Available mood options
export const MOOD_OPTIONS = [
  { value: 'excited', label: '🤩 Excited', color: '#f59e0b' },
  { value: 'happy', label: '😊 Happy', color: '#22c55e' },
  { value: 'peaceful', label: '😌 Peaceful', color: '#3b82f6' },
  { value: 'nostalgic', label: '🥹 Nostalgic', color: '#8b5cf6' },
  { value: 'adventurous', label: '🏔️ Adventurous', color: '#ec4899' },
  { value: 'romantic', label: '💕 Romantic', color: '#f43f5e' },
  { value: 'tired', label: '😴 Tired', color: '#6b7280' },
  { value: 'reflective', label: '🤔 Reflective', color: '#0ea5e9' },
] as const;

export type MoodValue = typeof MOOD_OPTIONS[number]['value'];

// Filter state for searching memories
export interface MemoryFilters {
  searchQuery: string;
  tags: string[];
  location: string;
  dateFrom: string;
  dateTo: string;
  mood: string;
}
