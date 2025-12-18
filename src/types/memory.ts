export interface Memory {
  id: string;
  title: string;
  date: string;
  content: string;
  images: string[];
  videoUrl?: string;
  audioUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MemoryFormData {
  title: string;
  date: string;
  content: string;
  images: string[];
  videoUrl?: string;
}
