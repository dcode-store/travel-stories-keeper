import { useState, useEffect, useCallback } from 'react';
import { Memory, MemoryFormData } from '@/types/memory';

const STORAGE_KEY = 'journo-memories';

const generateId = () => Math.random().toString(36).substring(2, 15);

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Sort by date descending (newest first)
        const sorted = parsed.sort((a: Memory, b: Memory) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setMemories(sorted);
      } catch (e) {
        console.error('Failed to parse memories:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever memories change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    }
  }, [memories, isLoading]);

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

  return {
    memories,
    isLoading,
    addMemory,
    updateMemory,
    deleteMemory,
  };
}
