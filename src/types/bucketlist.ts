export interface BucketListItem {
  id: string;
  name: string;
  description?: string;
  location?: string; // City, Country, or Region
  countryCode?: string; // ISO code for map display
  category: BucketListCategory;
  priority: BucketListPriority;
  status: 'pending' | 'completed';
  completedDate?: string; // ISO date when completed
  completedMemoryId?: string; // ID of the memory that completed this
  completedTripId?: string; // ID of the trip that completed this
  imageUrl?: string; // Optional inspiration image
  notes?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export type BucketListCategory = 
  | 'country'
  | 'city' 
  | 'experience'
  | 'landmark'
  | 'nature'
  | 'food'
  | 'culture'
  | 'adventure';

export type BucketListPriority = 
  | 'must-visit'
  | 'want-to-visit'
  | 'someday';

export interface BucketListFormData {
  name: string;
  description?: string;
  location?: string;
  countryCode?: string;
  category: BucketListCategory;
  priority: BucketListPriority;
  imageUrl?: string;
  notes?: string;
  tags?: string[];
}

export const BUCKET_LIST_CATEGORIES: { value: BucketListCategory; label: string; icon: string }[] = [
  { value: 'country', label: 'Country', icon: '🌍' },
  { value: 'city', label: 'City', icon: '🏙️' },
  { value: 'experience', label: 'Experience', icon: '✨' },
  { value: 'landmark', label: 'Landmark', icon: '🗼' },
  { value: 'nature', label: 'Nature', icon: '🏔️' },
  { value: 'food', label: 'Food & Cuisine', icon: '🍜' },
  { value: 'culture', label: 'Culture', icon: '🎭' },
  { value: 'adventure', label: 'Adventure', icon: '🎢' },
];

export const BUCKET_LIST_PRIORITIES: { value: BucketListPriority; label: string; color: string }[] = [
  { value: 'must-visit', label: 'Must Visit', color: 'hsl(0 65% 55%)' },
  { value: 'want-to-visit', label: 'Want to Visit', color: 'hsl(24 60% 55%)' },
  { value: 'someday', label: 'Someday', color: 'hsl(200 15% 50%)' },
];
