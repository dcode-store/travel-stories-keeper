import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Itinerary,
    ItineraryFormData,
    Activity,
    Accommodation,
    Transportation
} from '@/types/itinerary';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'journo-itineraries';
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB limit

const generateId = () => Math.random().toString(36).substring(2, 15);

const getStorageSize = (data: unknown): number => {
    return new Blob([JSON.stringify(data)]).size;
};

export function useItineraries() {
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
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
                    const sorted = parsed.sort((a: Itinerary, b: Itinerary) =>
                        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                    );
                    setItineraries(sorted);
                } catch (e) {
                    console.error('Failed to parse itineraries:', e);
                    localStorage.removeItem(STORAGE_KEY);
                }
            }
        } catch (e) {
            console.error('Failed to access localStorage:', e);
        }
        setIsLoading(false);
    }, []);

    // Save to localStorage whenever itineraries change
    useEffect(() => {
        if (!isLoading) {
            try {
                const dataSize = getStorageSize(itineraries);
                if (dataSize > MAX_STORAGE_SIZE) {
                    setStorageError(true);
                    toast({
                        title: 'Storage limit reached',
                        description: 'Your itineraries are too large to save locally.',
                        variant: 'destructive',
                    });
                    return;
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(itineraries));
                setStorageError(false);
            } catch (e) {
                console.error('Failed to save itineraries:', e);
                setStorageError(true);
                toast({
                    title: 'Storage error',
                    description: 'Could not save itineraries. Storage may be full.',
                    variant: 'destructive',
                });
            }
        }
    }, [itineraries, isLoading, toast]);

    // CRUD operations for itineraries
    const addItinerary = useCallback((data: ItineraryFormData | Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>): Itinerary => {
        const now = Date.now();
        const newItinerary: Itinerary = {
            id: generateId(),
            ...data,
            activities: 'activities' in data ? data.activities : [],
            accommodations: 'accommodations' in data ? data.accommodations : [],
            transportation: 'transportation' in data ? data.transportation : [],
            createdAt: now,
            updatedAt: now,
        };

        setItineraries(prev => {
            const updated = [...prev, newItinerary];
            return updated.sort((a, b) =>
                new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );
        });

        return newItinerary;
    }, []);

    const updateItinerary = useCallback((id: string, data: Partial<ItineraryFormData>) => {
        setItineraries(prev =>
            prev.map(itinerary =>
                itinerary.id === id
                    ? { ...itinerary, ...data, updatedAt: Date.now() }
                    : itinerary
            ).sort((a, b) =>
                new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            )
        );
    }, []);

    const deleteItinerary = useCallback((id: string) => {
        setItineraries(prev => prev.filter(itinerary => itinerary.id !== id));
    }, []);

    const getItinerary = useCallback((id: string): Itinerary | undefined => {
        return itineraries.find(itinerary => itinerary.id === id);
    }, [itineraries]);

    // Activity operations
    const addActivity = useCallback((itineraryId: string, activity: Omit<Activity, 'id'>): Activity => {
        const newActivity: Activity = {
            ...activity,
            id: generateId(),
        };

        setItineraries(prev =>
            prev.map(itinerary => {
                if (itinerary.id !== itineraryId) return itinerary;
                const activities = [...itinerary.activities, newActivity].sort((a, b) => {
                    const dateCompare = a.date.localeCompare(b.date);
                    if (dateCompare !== 0) return dateCompare;
                    return (a.time || '').localeCompare(b.time || '');
                });
                return { ...itinerary, activities, updatedAt: Date.now() };
            })
        );

        return newActivity;
    }, []);

    const updateActivity = useCallback((itineraryId: string, activityId: string, data: Partial<Activity>) => {
        setItineraries(prev =>
            prev.map(itinerary => {
                if (itinerary.id !== itineraryId) return itinerary;
                const activities = itinerary.activities
                    .map(activity => activity.id === activityId ? { ...activity, ...data } : activity)
                    .sort((a, b) => {
                        const dateCompare = a.date.localeCompare(b.date);
                        if (dateCompare !== 0) return dateCompare;
                        return (a.time || '').localeCompare(b.time || '');
                    });
                return { ...itinerary, activities, updatedAt: Date.now() };
            })
        );
    }, []);

    const deleteActivity = useCallback((itineraryId: string, activityId: string) => {
        setItineraries(prev =>
            prev.map(itinerary => {
                if (itinerary.id !== itineraryId) return itinerary;
                return {
                    ...itinerary,
                    activities: itinerary.activities.filter(a => a.id !== activityId),
                    updatedAt: Date.now(),
                };
            })
        );
    }, []);

    // Accommodation operations
    const addAccommodation = useCallback((itineraryId: string, accommodation: Omit<Accommodation, 'id'>): Accommodation => {
        const newAccommodation: Accommodation = {
            ...accommodation,
            id: generateId(),
        };

        setItineraries(prev =>
            prev.map(itinerary => {
                if (itinerary.id !== itineraryId) return itinerary;
                const accommodations = [...itinerary.accommodations, newAccommodation].sort(
                    (a, b) => a.checkIn.localeCompare(b.checkIn)
                );
                return { ...itinerary, accommodations, updatedAt: Date.now() };
            })
        );

        return newAccommodation;
    }, []);

    const updateAccommodation = useCallback((itineraryId: string, accommodationId: string, data: Partial<Accommodation>) => {
        setItineraries(prev =>
            prev.map(itinerary => {
                if (itinerary.id !== itineraryId) return itinerary;
                const accommodations = itinerary.accommodations
                    .map(acc => acc.id === accommodationId ? { ...acc, ...data } : acc)
                    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
                return { ...itinerary, accommodations, updatedAt: Date.now() };
            })
        );
    }, []);

    const deleteAccommodation = useCallback((itineraryId: string, accommodationId: string) => {
        setItineraries(prev =>
            prev.map(itinerary => {
                if (itinerary.id !== itineraryId) return itinerary;
                return {
                    ...itinerary,
                    accommodations: itinerary.accommodations.filter(a => a.id !== accommodationId),
                    updatedAt: Date.now(),
                };
            })
        );
    }, []);

    // Transportation operations
    const addTransportation = useCallback((itineraryId: string, transport: Omit<Transportation, 'id'>): Transportation => {
        const newTransport: Transportation = {
            ...transport,
            id: generateId(),
        };

        setItineraries(prev =>
            prev.map(itinerary => {
                if (itinerary.id !== itineraryId) return itinerary;
                const transportation = [...itinerary.transportation, newTransport].sort(
                    (a, b) => a.departureDate.localeCompare(b.departureDate)
                );
                return { ...itinerary, transportation, updatedAt: Date.now() };
            })
        );

        return newTransport;
    }, []);

    const updateTransportation = useCallback((itineraryId: string, transportId: string, data: Partial<Transportation>) => {
        setItineraries(prev =>
            prev.map(itinerary => {
                if (itinerary.id !== itineraryId) return itinerary;
                const transportation = itinerary.transportation
                    .map(t => t.id === transportId ? { ...t, ...data } : t)
                    .sort((a, b) => a.departureDate.localeCompare(b.departureDate));
                return { ...itinerary, transportation, updatedAt: Date.now() };
            })
        );
    }, []);

    const deleteTransportation = useCallback((itineraryId: string, transportId: string) => {
        setItineraries(prev =>
            prev.map(itinerary => {
                if (itinerary.id !== itineraryId) return itinerary;
                return {
                    ...itinerary,
                    transportation: itinerary.transportation.filter(t => t.id !== transportId),
                    updatedAt: Date.now(),
                };
            })
        );
    }, []);

    // Computed values
    const upcomingItineraries = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return itineraries.filter(it => it.startDate >= today);
    }, [itineraries]);

    const pastItineraries = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return itineraries.filter(it => it.endDate < today);
    }, [itineraries]);

    const currentItineraries = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        return itineraries.filter(it => it.startDate <= today && it.endDate >= today);
    }, [itineraries]);

    const clearAllItineraries = useCallback(() => {
        setItineraries([]);
        localStorage.removeItem(STORAGE_KEY);
        setStorageError(false);
    }, []);

    return {
        itineraries,
        isLoading,
        storageError,
        // Itinerary CRUD
        addItinerary,
        updateItinerary,
        deleteItinerary,
        getItinerary,
        clearAllItineraries,
        // Activity CRUD
        addActivity,
        updateActivity,
        deleteActivity,
        // Accommodation CRUD
        addAccommodation,
        updateAccommodation,
        deleteAccommodation,
        // Transportation CRUD
        addTransportation,
        updateTransportation,
        deleteTransportation,
        // Computed
        upcomingItineraries,
        pastItineraries,
        currentItineraries,
    };
}
