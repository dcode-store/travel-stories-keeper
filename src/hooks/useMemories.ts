import { useState, useEffect, useCallback, useMemo } from 'react';
import { Memory, MemoryFormData, MemoryFilters } from '@/types/memory';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'journo-memories';
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB limit (localStorage is ~5MB)

const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to estimate storage size
const getStorageSize = (data: unknown): number => {
  return new Blob([JSON.stringify(data)]).size;
};

// Default empty filters
export const defaultFilters: MemoryFilters = {
  searchQuery: '',
  tags: [],
  location: '',
  dateFrom: '',
  dateTo: '',
  mood: '',
};

// Helper to check if filters are active
export const hasActiveFilters = (filters: MemoryFilters): boolean => {
  return (
    filters.searchQuery.trim() !== '' ||
    filters.tags.length > 0 ||
    filters.location !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.mood !== ''
  );
};

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const { toast } = useToast();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const sorted = parsed.sort((a: Memory, b: Memory) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setMemories(sorted);
        } catch (e) {
          console.error('Failed to parse memories:', e);
          // Clear corrupted data
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (e) {
      console.error('Failed to access localStorage:', e);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever memories change
  useEffect(() => {
    if (!isLoading) {
      try {
        const dataSize = getStorageSize(memories);
        if (dataSize > MAX_STORAGE_SIZE) {
          setStorageError(true);
          toast({
            title: 'Storage limit reached',
            description: 'Your memories are too large to save locally. Consider removing some images or exporting to PDF.',
            variant: 'destructive',
          });
          return;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
        setStorageError(false);
      } catch (e) {
        console.error('Failed to save memories:', e);
        setStorageError(true);
        toast({
          title: 'Storage error',
          description: 'Could not save memories. Storage may be full.',
          variant: 'destructive',
        });
      }
    }
  }, [memories, isLoading, toast]);

  const addMemory = useCallback((data: MemoryFormData) => {
    const now = Date.now();
    const newMemory: Memory = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    setMemories(prev => {
      const updated = [...prev, newMemory];
      return updated.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });

    return newMemory;
  }, []);

  const updateMemory = useCallback((id: string, data: Partial<MemoryFormData>) => {
    setMemories(prev =>
      prev.map(memory =>
        memory.id === id
          ? { ...memory, ...data, updatedAt: Date.now() }
          : memory
      ).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    );
  }, []);

  const deleteMemory = useCallback((id: string) => {
    setMemories(prev => prev.filter(memory => memory.id !== id));
  }, []);

  const clearAllMemories = useCallback(() => {
    setMemories([]);
    localStorage.removeItem(STORAGE_KEY);
    setStorageError(false);
  }, []);

  // Extract all unique tags from memories
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    memories.forEach(memory => {
      memory.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [memories]);

  // Extract all unique locations from memories
  const allLocations = useMemo(() => {
    const locationSet = new Set<string>();
    memories.forEach(memory => {
      if (memory.location) {
        locationSet.add(memory.location);
      }
    });
    return Array.from(locationSet).sort();
  }, [memories]);

  // Get tag counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    memories.forEach(memory => {
      memory.tags?.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [memories]);

  // Get location counts
  const locationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    memories.forEach(memory => {
      if (memory.location) {
        counts[memory.location] = (counts[memory.location] || 0) + 1;
      }
    });
    return counts;
  }, [memories]);

  // Filter memories based on filters
  const filterMemories = useCallback((filters: MemoryFilters): Memory[] => {
    return memories.filter(memory => {
      // Search query - match title or content
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = memory.title.toLowerCase().includes(query);
        const matchesContent = memory.content.toLowerCase().includes(query);
        const matchesLocation = memory.location?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContent && !matchesLocation) {
          return false;
        }
      }

      // Filter by tags (match any)
      if (filters.tags.length > 0) {
        const memoryTags = memory.tags || [];
        const hasMatchingTag = filters.tags.some(tag => memoryTags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }

      // Filter by location
      if (filters.location) {
        if (memory.location !== filters.location) {
          return false;
        }
      }

      // Filter by date range
      if (filters.dateFrom) {
        if (memory.date < filters.dateFrom) {
          return false;
        }
      }
      if (filters.dateTo) {
        if (memory.date > filters.dateTo) {
          return false;
        }
      }

      // Filter by mood
      if (filters.mood) {
        if (memory.mood !== filters.mood) {
          return false;
        }
      }

      return true;
    });
  }, [memories]);

  return {
    memories,
    isLoading,
    storageError,
    addMemory,
    updateMemory,
    deleteMemory,
    clearAllMemories,
    // New filter-related exports
    allTags,
    allLocations,
    tagCounts,
    locationCounts,
    filterMemories,
  };
}
