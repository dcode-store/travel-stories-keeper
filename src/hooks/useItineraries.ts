import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Itinerary,
    ItineraryFormData,
    Activity,
    Accommodation,
    Transportation
} from '@/types/itinerary';
import { useToast } from '@/hooks/use-toast';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

const STORAGE_KEY = 'journo-itineraries';

const generateId = () => Math.random().toString(36).substring(2, 15);

export function useItineraries() {
    const { toast } = useToast();
    const {
        items: storedItineraries,
        isLoading,
        error,
        saveAll,
        clearAll,
    } = useOfflineStorage<Itinerary>({
        storeName: 'itineraries',
        localStorageKey: STORAGE_KEY,
    });

    const [itineraries, setItineraries] = useState<Itinerary[]>([]);

    // Sync from IndexedDB
    useEffect(() => {
        if (!isLoading) {
            const sorted = [...storedItineraries].sort((a, b) =>
                new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );
            setItineraries(sorted);
        }
    }, [storedItineraries, isLoading]);

    // Save to IndexedDB whenever itineraries change
    useEffect(() => {
        if (!isLoading && itineraries.length > 0) {
            saveAll(itineraries);
        }
    }, [itineraries, isLoading, saveAll]);

    // Show error toast
    useEffect(() => {
        if (error) {
            toast({
                title: 'Storage error',
                description: 'Could not save itineraries. Using offline mode.',
                variant: 'destructive',
            });
        }
    }, [error, toast]);

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
        clearAll();
    }, [clearAll]);

    return {
        itineraries,
        isLoading,
        storageError: !!error,
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
