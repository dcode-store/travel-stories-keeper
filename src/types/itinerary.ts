export interface Activity {
    id: string;
    name: string;
    date: string;
    time?: string;
    endTime?: string;
    location?: string;
    description?: string;
    notes?: string;
    cost?: number;
    currency?: string;
    booked?: boolean;
    confirmationNumber?: string;
}

export interface Accommodation {
    id: string;
    name: string;
    address?: string;
    checkIn: string;
    checkOut: string;
    reservationNumber?: string;
    notes?: string;
    cost?: number;
    currency?: string;
    phone?: string;
    email?: string;
    website?: string;
    // Booking links
    bookingLink?: string;
    confirmationLink?: string;
    ticketLink?: string;
    // Screenshots
    bookingScreenshots?: string[];
    confirmationScreenshots?: string[];
}

export type TransportationType = 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'taxi' | 'other';

export interface Transportation {
    id: string;
    type: TransportationType;
    name?: string; // e.g., "Flight to Paris"
    company?: string; // airline, train company, etc.
    number?: string; // flight number, train number
    departureLocation: string;
    arrivalLocation: string;
    departureDate: string;
    departureTime?: string;
    arrivalDate?: string;
    arrivalTime?: string;
    confirmationNumber?: string;
    notes?: string;
    cost?: number;
    currency?: string;
    // Booking links
    bookingLink?: string;
    confirmationLink?: string;
    // Screenshots
    bookingScreenshots?: string[];
    confirmationScreenshots?: string[];
}

// Trip types
export type TripType = 'solo' | 'couple' | 'family' | 'group';

export const TRIP_TYPES: Record<TripType, { label: string; icon: string; description: string }> = {
    solo: { label: 'Solo', icon: '🧳', description: 'Just me, myself & I' },
    couple: { label: 'Couple', icon: '💑', description: 'Romantic getaway for two' },
    family: { label: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Adventure with the whole family' },
    group: { label: 'Group', icon: '👥', description: 'Fun with friends' },
};

// Trip themes/vibes
export type TripTheme = 'beach' | 'adventure' | 'cultural' | 'relaxation' | 'roadtrip' | 'nature' | 'city' | 'romantic';

export const TRIP_THEMES: Record<TripTheme, { label: string; icon: string }> = {
    beach: { label: 'Beach & Sun', icon: '🏖️' },
    adventure: { label: 'Adventure', icon: '🏔️' },
    cultural: { label: 'Cultural', icon: '🏛️' },
    relaxation: { label: 'Relaxation', icon: '🧘' },
    roadtrip: { label: 'Road Trip', icon: '🚗' },
    nature: { label: 'Nature', icon: '🌲' },
    city: { label: 'City Break', icon: '🌆' },
    romantic: { label: 'Romantic', icon: '💕' },
};

// Traveler info
export interface Traveler {
    id: string;
    name: string;
    isChild?: boolean;
    age?: number;
    specialRequirements?: string;
}

export interface Itinerary {
    id: string;
    title: string;
    destination: string;
    description?: string;
    startDate: string;
    endDate: string;
    coverImage?: string;
    activities: Activity[];
    accommodations: Accommodation[];
    transportation: Transportation[];
    notes?: string;
    tags?: string[];
    budget?: number;
    currency?: string;
    // New fields
    tripType: TripType;
    tripThemes?: TripTheme[];
    travelers?: Traveler[];
    companionName?: string; // For couple trips
    adultsCount?: number;
    childrenCount?: number;
    createdAt: number;
    updatedAt: number;
}

export interface ItineraryFormData {
    title: string;
    destination: string;
    description?: string;
    startDate: string;
    endDate: string;
    coverImage?: string;
    notes?: string;
    tags?: string[];
    budget?: number;
    currency?: string;
    // New fields
    tripType: TripType;
    tripThemes?: TripTheme[];
    travelers?: Traveler[];
    companionName?: string;
    adultsCount?: number;
    childrenCount?: number;
}

// Helper to calculate trip duration in days
export function calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
}

// Helper to get activities for a specific date
export function getActivitiesForDate(itinerary: Itinerary, date: string): Activity[] {
    return itinerary.activities.filter(activity => activity.date === date);
}

// Helper to get all dates in the itinerary range
export function getItineraryDates(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

// Transportation type display info
export const TRANSPORTATION_TYPES: Record<TransportationType, { label: string; icon: string }> = {
    flight: { label: 'Flight', icon: '✈️' },
    train: { label: 'Train', icon: '🚂' },
    bus: { label: 'Bus', icon: '🚌' },
    car: { label: 'Car', icon: '🚗' },
    ferry: { label: 'Ferry', icon: '⛴️' },
    taxi: { label: 'Taxi/Rideshare', icon: '🚕' },
    other: { label: 'Other', icon: '🚐' },
};
