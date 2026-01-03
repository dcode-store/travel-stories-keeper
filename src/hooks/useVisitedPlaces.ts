import { useState, useEffect, useCallback, useMemo } from 'react';
import { VisitedPlace, PlaceStats, CONTINENT_MAP, COUNTRY_NAME_TO_CODE, COUNTRY_CODE_TO_NAME } from '@/types/places';
import { Memory } from '@/types/memory';

const STORAGE_KEY = 'journo-visited-places';
const TOTAL_COUNTRIES = 195;

const generateId = () => Math.random().toString(36).substring(2, 15);

// Extract country code from location string
const extractCountryFromLocation = (location: string): { code: string; name: string } | null => {
  const lowerLocation = location.toLowerCase().trim();
  
  // Try direct match
  for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
    if (lowerLocation.includes(name)) {
      return { code, name: COUNTRY_CODE_TO_NAME[code] || name };
    }
  }
  
  // Try to extract last part after comma (usually country)
  const parts = location.split(',').map(p => p.trim().toLowerCase());
  for (const part of parts.reverse()) {
    for (const [name, code] of Object.entries(COUNTRY_NAME_TO_CODE)) {
      if (part === name || part.includes(name)) {
        return { code, name: COUNTRY_CODE_TO_NAME[code] || name };
      }
    }
  }
  
  return null;
};

export function useVisitedPlaces(memories: Memory[] = []) {
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVisitedPlaces(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load visited places:', e);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(visitedPlaces));
      } catch (e) {
        console.error('Failed to save visited places:', e);
      }
    }
  }, [visitedPlaces, isLoading]);

  // Auto-sync places from memories
  const syncFromMemories = useCallback(() => {
    const memoryCountryMap = new Map<string, { 
      memoryIds: string[]; 
      firstVisit: string; 
      lastVisit: string;
      countryName: string;
    }>();

    memories.forEach(memory => {
      if (!memory.location) return;
      
      const countryInfo = extractCountryFromLocation(memory.location);
      if (!countryInfo) return;

      const existing = memoryCountryMap.get(countryInfo.code);
      if (existing) {
        existing.memoryIds.push(memory.id);
        if (memory.date < existing.firstVisit) existing.firstVisit = memory.date;
        if (memory.date > existing.lastVisit) existing.lastVisit = memory.date;
      } else {
        memoryCountryMap.set(countryInfo.code, {
          memoryIds: [memory.id],
          firstVisit: memory.date,
          lastVisit: memory.date,
          countryName: countryInfo.name,
        });
      }
    });

    setVisitedPlaces(prev => {
      const updated = [...prev];
      
      memoryCountryMap.forEach((data, code) => {
        const existingIndex = updated.findIndex(p => p.countryCode === code);
        
        if (existingIndex >= 0) {
          // Update existing
          updated[existingIndex] = {
            ...updated[existingIndex],
            memoryIds: [...new Set([...updated[existingIndex].memoryIds, ...data.memoryIds])],
            visitCount: Math.max(updated[existingIndex].visitCount, data.memoryIds.length),
            firstVisit: data.firstVisit < updated[existingIndex].firstVisit 
              ? data.firstVisit 
              : updated[existingIndex].firstVisit,
            lastVisit: data.lastVisit > updated[existingIndex].lastVisit 
              ? data.lastVisit 
              : updated[existingIndex].lastVisit,
            updatedAt: Date.now(),
          };
        } else {
          // Add new
          updated.push({
            id: generateId(),
            countryCode: code,
            countryName: data.countryName,
            visitCount: data.memoryIds.length,
            firstVisit: data.firstVisit,
            lastVisit: data.lastVisit,
            memoryIds: data.memoryIds,
            manuallyAdded: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      });

      return updated;
    });
  }, [memories]);

  // Add a place manually
  const addPlace = useCallback((countryCode: string, countryName?: string) => {
    const name = countryName || COUNTRY_CODE_TO_NAME[countryCode] || countryCode;
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    setVisitedPlaces(prev => {
      const existing = prev.find(p => p.countryCode === countryCode);
      if (existing) return prev;

      return [...prev, {
        id: generateId(),
        countryCode,
        countryName: name,
        visitCount: 1,
        firstVisit: today,
        lastVisit: today,
        memoryIds: [],
        manuallyAdded: true,
        createdAt: now,
        updatedAt: now,
      }];
    });
  }, []);

  // Remove a place
  const removePlace = useCallback((countryCode: string) => {
    setVisitedPlaces(prev => prev.filter(p => p.countryCode !== countryCode));
  }, []);

  // Toggle a place (add if not exists, remove if exists)
  const togglePlace = useCallback((countryCode: string, countryName?: string) => {
    const existing = visitedPlaces.find(p => p.countryCode === countryCode);
    if (existing) {
      removePlace(countryCode);
    } else {
      addPlace(countryCode, countryName);
    }
  }, [visitedPlaces, addPlace, removePlace]);

  // Check if a country is visited
  const isVisited = useCallback((countryCode: string): boolean => {
    return visitedPlaces.some(p => p.countryCode === countryCode);
  }, [visitedPlaces]);

  // Get visited country codes
  const visitedCountryCodes = useMemo(() => {
    return visitedPlaces.map(p => p.countryCode);
  }, [visitedPlaces]);

  // Calculate stats
  const stats: PlaceStats = useMemo(() => {
    const continentBreakdown: Record<string, number> = {};
    
    visitedPlaces.forEach(place => {
      const continent = CONTINENT_MAP[place.countryCode] || 'Other';
      continentBreakdown[continent] = (continentBreakdown[continent] || 0) + 1;
    });

    return {
      totalCountries: visitedPlaces.length,
      totalRegions: visitedPlaces.filter(p => p.region).length,
      totalMemoriesWithLocation: new Set(visitedPlaces.flatMap(p => p.memoryIds)).size,
      continentBreakdown,
      percentageOfWorld: Math.round((visitedPlaces.length / TOTAL_COUNTRIES) * 100 * 10) / 10,
    };
  }, [visitedPlaces]);

  return {
    visitedPlaces,
    isLoading,
    stats,
    visitedCountryCodes,
    syncFromMemories,
    addPlace,
    removePlace,
    togglePlace,
    isVisited,
  };
}
