import { useState, useEffect, useCallback, useMemo } from 'react';
import { BucketListItem, BucketListFormData, BucketListCategory, BucketListPriority } from '@/types/bucketlist';
import { Memory } from '@/types/memory';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

const STORAGE_KEY = 'journo-bucket-list';

const generateId = () => Math.random().toString(36).substring(2, 15);

export function useBucketList(memories: Memory[] = []) {
  const {
    items: storedItems,
    isLoading,
    saveAll,
  } = useOfflineStorage<BucketListItem>({
    storeName: 'bucketList',
    localStorageKey: STORAGE_KEY,
  });

  const [items, setItems] = useState<BucketListItem[]>([]);

  // Sync from IndexedDB
  useEffect(() => {
    if (!isLoading) {
      setItems(storedItems);
    }
  }, [storedItems, isLoading]);

  // Save to IndexedDB
  useEffect(() => {
    if (!isLoading && items.length > 0) {
      saveAll(items);
    }
  }, [items, isLoading, saveAll]);

  // Add new item
  const addItem = useCallback((data: BucketListFormData): BucketListItem => {
    const now = Date.now();
    const newItem: BucketListItem = {
      id: generateId(),
      ...data,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    setItems(prev => [...prev, newItem]);
    return newItem;
  }, []);

  // Update item
  const updateItem = useCallback((id: string, data: Partial<BucketListFormData>) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, ...data, updatedAt: Date.now() }
          : item
      )
    );
  }, []);

  // Delete item
  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  // Mark as completed
  const completeItem = useCallback((id: string, memoryId?: string, tripId?: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'completed' as const,
              completedDate: new Date().toISOString().split('T')[0],
              completedMemoryId: memoryId,
              completedTripId: tripId,
              updatedAt: Date.now(),
            }
          : item
      )
    );
  }, []);

  // Unmark completion
  const uncompleteItem = useCallback((id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'pending' as const,
              completedDate: undefined,
              completedMemoryId: undefined,
              completedTripId: undefined,
              updatedAt: Date.now(),
            }
          : item
      )
    );
  }, []);

  // Auto-check completion based on memories
  const checkCompletionFromMemories = useCallback(() => {
    if (memories.length === 0) return;

    setItems(prev =>
      prev.map(item => {
        if (item.status === 'completed') return item;
        if (!item.location) return item;

        const matchingMemory = memories.find(memory => {
          if (!memory.location) return false;
          const itemLoc = item.location?.toLowerCase() || '';
          const memLoc = memory.location.toLowerCase();
          return memLoc.includes(itemLoc) || itemLoc.includes(memLoc);
        });

        if (matchingMemory) {
          return {
            ...item,
            status: 'completed' as const,
            completedDate: matchingMemory.date,
            completedMemoryId: matchingMemory.id,
            updatedAt: Date.now(),
          };
        }

        return item;
      })
    );
  }, [memories]);

  // Filter items
  const getItemsByCategory = useCallback((category: BucketListCategory): BucketListItem[] => {
    return items.filter(item => item.category === category);
  }, [items]);

  const getItemsByPriority = useCallback((priority: BucketListPriority): BucketListItem[] => {
    return items.filter(item => item.priority === priority);
  }, [items]);

  const getItemsByStatus = useCallback((status: 'pending' | 'completed'): BucketListItem[] => {
    return items.filter(item => item.status === status);
  }, [items]);

  // Stats
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter(i => i.status === 'completed').length;
    const pending = total - completed;
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    items.forEach(item => {
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
    });

    return {
      total,
      completed,
      pending,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      byCategory,
      byPriority,
    };
  }, [items]);

  // Sorted items
  const sortedItems = useMemo(() => {
    const priorityOrder = { 'must-visit': 0, 'want-to-visit': 1, 'someday': 2 };
    return [...items].sort((a, b) => {
      // Pending first
      if (a.status !== b.status) {
        return a.status === 'pending' ? -1 : 1;
      }
      // Then by priority
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [items]);

  return {
    items: sortedItems,
    isLoading,
    stats,
    addItem,
    updateItem,
    deleteItem,
    completeItem,
    uncompleteItem,
    checkCompletionFromMemories,
    getItemsByCategory,
    getItemsByPriority,
    getItemsByStatus,
  };
}
