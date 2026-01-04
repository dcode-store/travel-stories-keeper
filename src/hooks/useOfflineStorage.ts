import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { useState, useEffect, useCallback, useRef } from 'react';

interface JournoDBSchema extends DBSchema {
  memories: {
    key: string;
    value: {
      id: string;
      data: unknown;
      updatedAt: number;
      synced: boolean;
    };
    indexes: { 'by-updated': number };
  };
  itineraries: {
    key: string;
    value: {
      id: string;
      data: unknown;
      updatedAt: number;
      synced: boolean;
    };
    indexes: { 'by-updated': number };
  };
  bucketList: {
    key: string;
    value: {
      id: string;
      data: unknown;
      updatedAt: number;
      synced: boolean;
    };
    indexes: { 'by-updated': number };
  };
  visitedPlaces: {
    key: string;
    value: {
      id: string;
      data: unknown;
      updatedAt: number;
      synced: boolean;
    };
    indexes: { 'by-updated': number };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: unknown;
      updatedAt: number;
    };
  };
}

const DB_NAME = 'journo-offline-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<JournoDBSchema>> | null = null;

async function getDB(): Promise<IDBPDatabase<JournoDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<JournoDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Memories store
        if (!db.objectStoreNames.contains('memories')) {
          const memoriesStore = db.createObjectStore('memories', { keyPath: 'id' });
          memoriesStore.createIndex('by-updated', 'updatedAt');
        }
        
        // Itineraries store
        if (!db.objectStoreNames.contains('itineraries')) {
          const itinerariesStore = db.createObjectStore('itineraries', { keyPath: 'id' });
          itinerariesStore.createIndex('by-updated', 'updatedAt');
        }
        
        // Bucket list store
        if (!db.objectStoreNames.contains('bucketList')) {
          const bucketListStore = db.createObjectStore('bucketList', { keyPath: 'id' });
          bucketListStore.createIndex('by-updated', 'updatedAt');
        }
        
        // Visited places store
        if (!db.objectStoreNames.contains('visitedPlaces')) {
          const visitedPlacesStore = db.createObjectStore('visitedPlaces', { keyPath: 'id' });
          visitedPlacesStore.createIndex('by-updated', 'updatedAt');
        }
        
        // Metadata store for app settings, last sync time, etc.
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

export type StoreName = 'memories' | 'itineraries' | 'bucketList' | 'visitedPlaces';

export interface OfflineStorageOptions<T> {
  storeName: StoreName;
  localStorageKey?: string; // For migration from localStorage
}

export function useOfflineStorage<T extends { id: string }>(options: OfflineStorageOptions<T>) {
  const { storeName, localStorageKey } = options;
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initializedRef = useRef(false);

  // Load data from IndexedDB
  const loadData = useCallback(async () => {
    try {
      const db = await getDB();
      const allItems = await db.getAll(storeName);
      const data = allItems.map(item => item.data as T);
      setItems(data);
      setError(null);
      return data;
    } catch (e) {
      console.error(`Failed to load ${storeName} from IndexedDB:`, e);
      setError(e as Error);
      return [];
    }
  }, [storeName]);

  // Migrate from localStorage to IndexedDB (one-time)
  const migrateFromLocalStorage = useCallback(async () => {
    if (!localStorageKey) return;
    
    try {
      const stored = localStorage.getItem(localStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as T[];
        const db = await getDB();
        const tx = db.transaction(storeName, 'readwrite');
        
        for (const item of parsed) {
          await tx.store.put({
            id: item.id,
            data: item,
            updatedAt: Date.now(),
            synced: true,
          });
        }
        
        await tx.done;
        
        // Mark migration as complete
        await db.put('metadata', {
          key: `migrated-${localStorageKey}`,
          value: true,
          updatedAt: Date.now(),
        });
        
        console.log(`Migrated ${parsed.length} items from localStorage to IndexedDB`);
      }
    } catch (e) {
      console.error('Migration from localStorage failed:', e);
    }
  }, [localStorageKey, storeName]);

  // Check if migration is needed
  const checkMigration = useCallback(async () => {
    if (!localStorageKey) return false;
    
    try {
      const db = await getDB();
      const migrationRecord = await db.get('metadata', `migrated-${localStorageKey}`);
      return !migrationRecord?.value;
    } catch {
      return false;
    }
  }, [localStorageKey]);

  // Initialize
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const init = async () => {
      setIsLoading(true);
      
      const needsMigration = await checkMigration();
      if (needsMigration) {
        await migrateFromLocalStorage();
      }
      
      await loadData();
      setIsLoading(false);
    };

    init();
  }, [checkMigration, migrateFromLocalStorage, loadData]);

  // Save single item
  const saveItem = useCallback(async (item: T) => {
    try {
      const db = await getDB();
      await db.put(storeName, {
        id: item.id,
        data: item,
        updatedAt: Date.now(),
        synced: false,
      });
      
      setItems(prev => {
        const existing = prev.findIndex(i => i.id === item.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = item;
          return updated;
        }
        return [...prev, item];
      });
      
      // Also save to localStorage as backup
      if (localStorageKey) {
        try {
          const allItems = await db.getAll(storeName);
          const data = allItems.map(i => i.data);
          localStorage.setItem(localStorageKey, JSON.stringify(data));
        } catch {
          // Ignore localStorage errors
        }
      }
      
      return true;
    } catch (e) {
      console.error(`Failed to save item to ${storeName}:`, e);
      setError(e as Error);
      return false;
    }
  }, [storeName, localStorageKey]);

  // Save all items (bulk)
  const saveAll = useCallback(async (newItems: T[]) => {
    try {
      const db = await getDB();
      const tx = db.transaction(storeName, 'readwrite');
      
      // Clear existing items
      await tx.store.clear();
      
      // Add all new items
      for (const item of newItems) {
        await tx.store.put({
          id: item.id,
          data: item,
          updatedAt: Date.now(),
          synced: false,
        });
      }
      
      await tx.done;
      setItems(newItems);
      
      // Also save to localStorage as backup
      if (localStorageKey) {
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(newItems));
        } catch {
          // Ignore localStorage errors
        }
      }
      
      return true;
    } catch (e) {
      console.error(`Failed to save all items to ${storeName}:`, e);
      setError(e as Error);
      return false;
    }
  }, [storeName, localStorageKey]);

  // Delete single item
  const deleteItem = useCallback(async (id: string) => {
    try {
      const db = await getDB();
      await db.delete(storeName, id);
      
      setItems(prev => prev.filter(item => item.id !== id));
      
      // Update localStorage backup
      if (localStorageKey) {
        try {
          const allItems = await db.getAll(storeName);
          const data = allItems.map(i => i.data);
          localStorage.setItem(localStorageKey, JSON.stringify(data));
        } catch {
          // Ignore localStorage errors
        }
      }
      
      return true;
    } catch (e) {
      console.error(`Failed to delete item from ${storeName}:`, e);
      setError(e as Error);
      return false;
    }
  }, [storeName, localStorageKey]);

  // Clear all items
  const clearAll = useCallback(async () => {
    try {
      const db = await getDB();
      await db.clear(storeName);
      setItems([]);
      
      if (localStorageKey) {
        localStorage.removeItem(localStorageKey);
      }
      
      return true;
    } catch (e) {
      console.error(`Failed to clear ${storeName}:`, e);
      setError(e as Error);
      return false;
    }
  }, [storeName, localStorageKey]);

  return {
    items,
    isLoading,
    error,
    saveItem,
    saveAll,
    deleteItem,
    clearAll,
    reload: loadData,
  };
}

// Utility to get last sync time
export async function getLastSyncTime(): Promise<Date | null> {
  try {
    const db = await getDB();
    const record = await db.get('metadata', 'lastSyncTime');
    return record?.value ? new Date(record.value as number) : null;
  } catch {
    return null;
  }
}

// Utility to set last sync time
export async function setLastSyncTime(time: Date = new Date()): Promise<void> {
  try {
    const db = await getDB();
    await db.put('metadata', {
      key: 'lastSyncTime',
      value: time.getTime(),
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.error('Failed to set last sync time:', e);
  }
}
