import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, MapPin, Calendar, Users, Wallet, Heart, ArrowRight, ArrowLeft, Check, Eye, Lightbulb } from 'lucide-react';
import { Itinerary, TripType, TripTheme, TRIP_TYPES, TRIP_THEMES, Activity } from '@/types/itinerary';
import { format, addDays } from 'date-fns';

interface AiTripPlannerProps {
  onComplete: (itinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

type Step = 'destination' | 'dates' | 'travelers' | 'budget' | 'type' | 'themes' | 'interests' | 'review' | 'generating';

interface TripAnswers {
  destination: string;
  startDate: string;
  duration: number;
  travelers: number;
  budget: 'budget' | 'moderate' | 'luxury';
  tripType: TripType;
  themes: TripTheme[];
  interests: string;
}

interface SuggestedActivity {
  name: string;
  description: string;
  theme: TripTheme;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  duration: string;
  location?: string;
}

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget-Friendly', description: 'Hostels, street food, free activities', icon: '💰' },
  { value: 'moderate', label: 'Moderate', description: 'Mid-range hotels, local restaurants', icon: '💵' },
  { value: 'luxury', label: 'Luxury', description: 'Premium stays, fine dining, exclusive experiences', icon: '💎' },
];

const DURATION_OPTIONS = [3, 5, 7, 10, 14];

// Activity templates by theme
const ACTIVITY_TEMPLATES: Record<TripTheme, SuggestedActivity[]> = {
  beach: [
    { name: 'Beach sunrise walk', description: 'Start your day with a peaceful walk along the shore', theme: 'beach', timeOfDay: 'morning', duration: '1-2 hours' },
    { name: 'Snorkeling adventure', description: 'Explore underwater marine life', theme: 'beach', timeOfDay: 'morning', duration: '2-3 hours' },
    { name: 'Beach club relaxation', description: 'Enjoy loungers, cocktails, and ocean views', theme: 'beach', timeOfDay: 'afternoon', duration: '3-4 hours' },
    { name: 'Sunset dinner by the sea', description: 'Fresh seafood with stunning sunset views', theme: 'beach', timeOfDay: 'evening', duration: '2 hours' },
  ],
  adventure: [
    { name: 'Hiking expedition', description: 'Trek through scenic trails and viewpoints', theme: 'adventure', timeOfDay: 'morning', duration: '4-5 hours' },
    { name: 'Zip-lining or canopy tour', description: 'Adrenaline-pumping aerial adventure', theme: 'adventure', timeOfDay: 'afternoon', duration: '2-3 hours' },
    { name: 'Rock climbing session', description: 'Scale natural rock formations', theme: 'adventure', timeOfDay: 'morning', duration: '3 hours' },
    { name: 'Night safari or stargazing', description: 'Experience nature after dark', theme: 'adventure', timeOfDay: 'evening', duration: '2-3 hours' },
  ],
  cultural: [
    { name: 'Museum & gallery tour', description: 'Discover local art and history', theme: 'cultural', timeOfDay: 'morning', duration: '2-3 hours' },
    { name: 'Historic walking tour', description: 'Explore landmarks with a local guide', theme: 'cultural', timeOfDay: 'afternoon', duration: '2-3 hours' },
    { name: 'Traditional cooking class', description: 'Learn to prepare authentic local dishes', theme: 'cultural', timeOfDay: 'afternoon', duration: '3 hours' },
    { name: 'Cultural performance', description: 'Watch traditional dance, music, or theater', theme: 'cultural', timeOfDay: 'evening', duration: '2 hours' },
  ],
  relaxation: [
    { name: 'Spa & wellness morning', description: 'Massage, sauna, and rejuvenation', theme: 'relaxation', timeOfDay: 'morning', duration: '2-3 hours' },
    { name: 'Yoga or meditation class', description: 'Find inner peace with guided practice', theme: 'relaxation', timeOfDay: 'morning', duration: '1-2 hours' },
    { name: 'Pool day with reading', description: 'Unwind by the pool with a good book', theme: 'relaxation', timeOfDay: 'afternoon', duration: '3-4 hours' },
    { name: 'Sunset cocktails', description: 'End the day with drinks and views', theme: 'relaxation', timeOfDay: 'evening', duration: '1-2 hours' },
  ],
  roadtrip: [
    { name: 'Scenic drive to viewpoint', description: 'Hit the open road to stunning overlooks', theme: 'roadtrip', timeOfDay: 'morning', duration: '2-3 hours' },
    { name: 'Quirky roadside attraction', description: 'Stop at unique landmarks and photo ops', theme: 'roadtrip', timeOfDay: 'afternoon', duration: '1 hour' },
    { name: 'Local diner experience', description: 'Authentic regional food at a classic spot', theme: 'roadtrip', timeOfDay: 'afternoon', duration: '1-2 hours' },
    { name: 'Campfire under the stars', description: 'End the day with s\'mores and stories', theme: 'roadtrip', timeOfDay: 'evening', duration: '2-3 hours' },
  ],
  nature: [
    { name: 'Nature reserve visit', description: 'Observe wildlife in their natural habitat', theme: 'nature', timeOfDay: 'morning', duration: '3-4 hours' },
    { name: 'Botanical garden stroll', description: 'Explore diverse plant collections', theme: 'nature', timeOfDay: 'afternoon', duration: '2 hours' },
    { name: 'Waterfall hike', description: 'Trek to a stunning cascading waterfall', theme: 'nature', timeOfDay: 'morning', duration: '3-4 hours' },
    { name: 'Bird watching tour', description: 'Spot local and migratory bird species', theme: 'nature', timeOfDay: 'morning', duration: '2-3 hours' },
  ],
  city: [
    { name: 'Neighborhood food tour', description: 'Taste the best local eats with a guide', theme: 'city', timeOfDay: 'afternoon', duration: '3 hours' },
    { name: 'Rooftop bar hopping', description: 'Enjoy city views from the top', theme: 'city', timeOfDay: 'evening', duration: '3-4 hours' },
    { name: 'Street art walking tour', description: 'Discover murals and urban creativity', theme: 'city', timeOfDay: 'afternoon', duration: '2 hours' },
    { name: 'Local market exploration', description: 'Shop for crafts, food, and souvenirs', theme: 'city', timeOfDay: 'morning', duration: '2-3 hours' },
  ],
  romantic: [
    { name: 'Couples spa treatment', description: 'Relaxing massage for two', theme: 'romantic', timeOfDay: 'afternoon', duration: '2 hours' },
    { name: 'Private sunset cruise', description: 'Sail into the sunset together', theme: 'romantic', timeOfDay: 'evening', duration: '2-3 hours' },
    { name: 'Candlelit dinner', description: 'Intimate fine dining experience', theme: 'romantic', timeOfDay: 'evening', duration: '2-3 hours' },
    { name: 'Picnic in a scenic spot', description: 'Enjoy wine and cheese with a view', theme: 'romantic', timeOfDay: 'afternoon', duration: '2 hours' },
  ],
};

// Destination-specific activity templates
const DESTINATION_ACTIVITIES: Record<string, SuggestedActivity[]> = {
  tokyo: [
    { name: 'Senso-ji Temple visit', description: 'Explore Tokyo\'s oldest and most famous temple in Asakusa', theme: 'cultural', timeOfDay: 'morning', duration: '2 hours', location: 'Asakusa, Tokyo' },
    { name: 'Shibuya Crossing experience', description: 'Walk the world\'s busiest intersection', theme: 'city', timeOfDay: 'afternoon', duration: '1 hour', location: 'Shibuya, Tokyo' },
    { name: 'Tsukiji Outer Market food tour', description: 'Fresh sushi and Japanese street food', theme: 'city', timeOfDay: 'morning', duration: '2-3 hours', location: 'Tsukiji, Tokyo' },
    { name: 'TeamLab Borderless', description: 'Immersive digital art museum experience', theme: 'cultural', timeOfDay: 'afternoon', duration: '2-3 hours', location: 'Odaiba, Tokyo' },
    { name: 'Golden Gai bar hopping', description: 'Explore tiny bars in this historic alley', theme: 'city', timeOfDay: 'evening', duration: '3 hours', location: 'Shinjuku, Tokyo' },
    { name: 'Meiji Shrine morning walk', description: 'Peaceful shrine in the heart of Tokyo', theme: 'nature', timeOfDay: 'morning', duration: '1-2 hours', location: 'Harajuku, Tokyo' },
    { name: 'Ramen tasting adventure', description: 'Try different regional ramen styles', theme: 'city', timeOfDay: 'evening', duration: '2 hours', location: 'Various, Tokyo' },
    { name: 'Harajuku fashion district', description: 'Experience unique Japanese street fashion', theme: 'city', timeOfDay: 'afternoon', duration: '2-3 hours', location: 'Harajuku, Tokyo' },
  ],
  paris: [
    { name: 'Eiffel Tower at sunrise', description: 'Beat the crowds with an early morning visit', theme: 'cultural', timeOfDay: 'morning', duration: '2 hours', location: 'Champ de Mars, Paris' },
    { name: 'Louvre Museum exploration', description: 'See the Mona Lisa and thousands of masterpieces', theme: 'cultural', timeOfDay: 'morning', duration: '4 hours', location: 'Louvre, Paris' },
    { name: 'Montmartre walking tour', description: 'Bohemian neighborhood with Sacré-Cœur views', theme: 'cultural', timeOfDay: 'afternoon', duration: '3 hours', location: 'Montmartre, Paris' },
    { name: 'Seine River sunset cruise', description: 'Romantic boat ride past illuminated landmarks', theme: 'romantic', timeOfDay: 'evening', duration: '2 hours', location: 'Seine River, Paris' },
    { name: 'Le Marais food & wine tour', description: 'French pastries, cheese, and wine tasting', theme: 'city', timeOfDay: 'afternoon', duration: '3 hours', location: 'Le Marais, Paris' },
    { name: 'Versailles day trip', description: 'Explore the opulent palace and gardens', theme: 'cultural', timeOfDay: 'morning', duration: '6 hours', location: 'Versailles' },
    { name: 'Café culture experience', description: 'Leisurely coffee at historic Parisian cafés', theme: 'relaxation', timeOfDay: 'afternoon', duration: '2 hours', location: 'Saint-Germain, Paris' },
    { name: 'Moulin Rouge show', description: 'Classic Parisian cabaret experience', theme: 'cultural', timeOfDay: 'evening', duration: '3 hours', location: 'Pigalle, Paris' },
  ],
  'new york': [
    { name: 'Central Park morning jog', description: 'Start your day in Manhattan\'s green oasis', theme: 'nature', timeOfDay: 'morning', duration: '1-2 hours', location: 'Central Park, NYC' },
    { name: 'Statue of Liberty & Ellis Island', description: 'Iconic American landmark visit', theme: 'cultural', timeOfDay: 'morning', duration: '4 hours', location: 'Liberty Island, NYC' },
    { name: 'Broadway show', description: 'World-class theater experience', theme: 'cultural', timeOfDay: 'evening', duration: '3 hours', location: 'Times Square, NYC' },
    { name: 'High Line walk', description: 'Elevated park with city views and art', theme: 'city', timeOfDay: 'afternoon', duration: '2 hours', location: 'Chelsea, NYC' },
    { name: 'Brooklyn pizza tour', description: 'Taste legendary NYC pizza spots', theme: 'city', timeOfDay: 'afternoon', duration: '3 hours', location: 'Brooklyn, NYC' },
    { name: 'Top of the Rock sunset', description: 'Panoramic views of Manhattan skyline', theme: 'city', timeOfDay: 'evening', duration: '1-2 hours', location: 'Rockefeller Center, NYC' },
    { name: 'MoMA or Met Museum', description: 'World-renowned art collections', theme: 'cultural', timeOfDay: 'afternoon', duration: '3-4 hours', location: 'Manhattan, NYC' },
    { name: 'Speakeasy bar crawl', description: 'Hidden cocktail bars with 1920s vibes', theme: 'city', timeOfDay: 'evening', duration: '3 hours', location: 'Various, NYC' },
  ],
  london: [
    { name: 'Tower of London tour', description: 'See the Crown Jewels and historic fortress', theme: 'cultural', timeOfDay: 'morning', duration: '3 hours', location: 'Tower of London' },
    { name: 'Borough Market food tour', description: 'London\'s premier food market experience', theme: 'city', timeOfDay: 'morning', duration: '2-3 hours', location: 'Southwark, London' },
    { name: 'British Museum exploration', description: 'Free world-class museum with ancient artifacts', theme: 'cultural', timeOfDay: 'afternoon', duration: '3-4 hours', location: 'Bloomsbury, London' },
    { name: 'West End theatre show', description: 'World-famous London theatre district', theme: 'cultural', timeOfDay: 'evening', duration: '3 hours', location: 'West End, London' },
    { name: 'Camden Market adventure', description: 'Eclectic market with food, fashion, and music', theme: 'city', timeOfDay: 'afternoon', duration: '3 hours', location: 'Camden, London' },
    { name: 'Thames River cruise', description: 'See London\'s landmarks from the water', theme: 'city', timeOfDay: 'afternoon', duration: '1-2 hours', location: 'Thames River' },
    { name: 'Afternoon tea experience', description: 'Traditional British afternoon tea', theme: 'relaxation', timeOfDay: 'afternoon', duration: '2 hours', location: 'Various, London' },
    { name: 'Pub crawl in Shoreditch', description: 'Trendy East London nightlife', theme: 'city', timeOfDay: 'evening', duration: '3-4 hours', location: 'Shoreditch, London' },
  ],
  rome: [
    { name: 'Colosseum & Roman Forum', description: 'Walk through ancient Roman history', theme: 'cultural', timeOfDay: 'morning', duration: '4 hours', location: 'Colosseum, Rome' },
    { name: 'Vatican Museums & Sistine Chapel', description: 'Michelangelo\'s masterpiece and papal treasures', theme: 'cultural', timeOfDay: 'morning', duration: '4-5 hours', location: 'Vatican City' },
    { name: 'Trastevere food tour', description: 'Authentic Roman cuisine in charming neighborhood', theme: 'city', timeOfDay: 'evening', duration: '3 hours', location: 'Trastevere, Rome' },
    { name: 'Trevi Fountain & Spanish Steps', description: 'Iconic Roman landmarks stroll', theme: 'cultural', timeOfDay: 'afternoon', duration: '2 hours', location: 'Centro Storico, Rome' },
    { name: 'Gelato tasting tour', description: 'Sample the best artisan gelato in Rome', theme: 'city', timeOfDay: 'afternoon', duration: '2 hours', location: 'Various, Rome' },
    { name: 'Aperitivo in Campo de\' Fiori', description: 'Evening drinks in a lively Roman square', theme: 'relaxation', timeOfDay: 'evening', duration: '2 hours', location: 'Campo de\' Fiori, Rome' },
  ],
  barcelona: [
    { name: 'Sagrada Familia visit', description: 'Gaudí\'s unfinished masterpiece basilica', theme: 'cultural', timeOfDay: 'morning', duration: '2-3 hours', location: 'Eixample, Barcelona' },
    { name: 'Park Güell exploration', description: 'Whimsical park with mosaic art and city views', theme: 'nature', timeOfDay: 'morning', duration: '2 hours', location: 'Gràcia, Barcelona' },
    { name: 'La Boqueria market tour', description: 'Vibrant food market on Las Ramblas', theme: 'city', timeOfDay: 'morning', duration: '2 hours', location: 'Las Ramblas, Barcelona' },
    { name: 'Gothic Quarter walking tour', description: 'Medieval streets and hidden plazas', theme: 'cultural', timeOfDay: 'afternoon', duration: '2-3 hours', location: 'Gothic Quarter, Barcelona' },
    { name: 'Barceloneta Beach day', description: 'Mediterranean beach and seafood', theme: 'beach', timeOfDay: 'afternoon', duration: '4 hours', location: 'Barceloneta, Barcelona' },
    { name: 'Flamenco show & tapas', description: 'Traditional Spanish performance with dinner', theme: 'cultural', timeOfDay: 'evening', duration: '3 hours', location: 'El Born, Barcelona' },
  ],
  bali: [
    { name: 'Tegallalang Rice Terraces', description: 'Stunning UNESCO rice terrace landscapes', theme: 'nature', timeOfDay: 'morning', duration: '2-3 hours', location: 'Ubud, Bali' },
    { name: 'Uluwatu Temple sunset', description: 'Clifftop temple with Kecak fire dance', theme: 'cultural', timeOfDay: 'evening', duration: '3 hours', location: 'Uluwatu, Bali' },
    { name: 'Ubud Monkey Forest', description: 'Sacred sanctuary with playful monkeys', theme: 'nature', timeOfDay: 'morning', duration: '2 hours', location: 'Ubud, Bali' },
    { name: 'Balinese spa treatment', description: 'Traditional massage and flower bath', theme: 'relaxation', timeOfDay: 'afternoon', duration: '2-3 hours', location: 'Various, Bali' },
    { name: 'Seminyak beach club', description: 'Trendy beach club with pool and DJ', theme: 'beach', timeOfDay: 'afternoon', duration: '4-5 hours', location: 'Seminyak, Bali' },
    { name: 'Sunrise Mount Batur hike', description: 'Trek active volcano for stunning sunrise', theme: 'adventure', timeOfDay: 'morning', duration: '5-6 hours', location: 'Kintamani, Bali' },
    { name: 'Cooking class in Ubud', description: 'Learn traditional Balinese recipes', theme: 'cultural', timeOfDay: 'afternoon', duration: '4 hours', location: 'Ubud, Bali' },
  ],
  dubai: [
    { name: 'Burj Khalifa observation deck', description: 'Views from the world\'s tallest building', theme: 'city', timeOfDay: 'evening', duration: '2 hours', location: 'Downtown Dubai' },
    { name: 'Desert safari adventure', description: 'Dune bashing, camel rides, and BBQ dinner', theme: 'adventure', timeOfDay: 'afternoon', duration: '6 hours', location: 'Dubai Desert' },
    { name: 'Dubai Mall & Fountain show', description: 'World\'s largest mall and dancing fountains', theme: 'city', timeOfDay: 'evening', duration: '3-4 hours', location: 'Downtown Dubai' },
    { name: 'Old Dubai walking tour', description: 'Gold Souk, Spice Souk, and heritage area', theme: 'cultural', timeOfDay: 'morning', duration: '3 hours', location: 'Deira, Dubai' },
    { name: 'Palm Jumeirah beach day', description: 'Luxury beach clubs on the iconic palm', theme: 'beach', timeOfDay: 'afternoon', duration: '4-5 hours', location: 'Palm Jumeirah, Dubai' },
    { name: 'Dhow cruise dinner', description: 'Traditional boat cruise with dinner buffet', theme: 'romantic', timeOfDay: 'evening', duration: '2-3 hours', location: 'Dubai Marina' },
  ],
};

// Helper to match destination to templates
function getDestinationKey(destination: string): string | null {
  const normalized = destination.toLowerCase().trim();
  const keys = Object.keys(DESTINATION_ACTIVITIES);
  
  for (const key of keys) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return key;
    }
  }
  return null;
}
export function AiTripPlanner({ onComplete, onCancel }: AiTripPlannerProps) {
  const [currentStep, setCurrentStep] = useState<Step>('destination');
  const [answers, setAnswers] = useState<Partial<TripAnswers>>({
    duration: 7,
    travelers: 2,
    themes: [],
  });
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

  const steps: Step[] = ['destination', 'dates', 'travelers', 'budget', 'type', 'themes', 'interests', 'review', 'generating'];
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex) / (steps.length - 1)) * 100;

  // Generate suggested activities based on destination and themes
  const suggestedActivities = useMemo(() => {
    const activities: SuggestedActivity[] = [];
    
    // First, check for destination-specific activities
    const destKey = answers.destination ? getDestinationKey(answers.destination) : null;
    if (destKey) {
      const destActivities = DESTINATION_ACTIVITIES[destKey] || [];
      // Filter by selected themes if any, otherwise include all
      const filteredDest = answers.themes?.length 
        ? destActivities.filter(a => answers.themes?.includes(a.theme))
        : destActivities;
      activities.push(...filteredDest.slice(0, 8));
    }
    
    // Then add generic theme activities if we don't have enough
    if (activities.length < 6) {
      (answers.themes || []).forEach(theme => {
        const themeActivities = ACTIVITY_TEMPLATES[theme] || [];
        // Avoid duplicates based on name
        const newActivities = themeActivities.filter(a => 
          !activities.some(existing => existing.name === a.name)
        );
        activities.push(...newActivities.slice(0, 3));
      });
    }
    
    return activities;
  }, [answers.destination, answers.themes]);

  const canProceed = () => {
    switch (currentStep) {
      case 'destination': return !!answers.destination?.trim();
      case 'dates': return !!answers.startDate;
      case 'travelers': return !!answers.travelers;
      case 'budget': return !!answers.budget;
      case 'type': return !!answers.tripType;
      case 'themes': return (answers.themes?.length || 0) > 0;
      case 'interests': return true;
      case 'review': return true;
      default: return true;
    }
  };

  const nextStep = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
      if (steps[nextIndex] === 'generating') {
        setTimeout(() => generateTrip(), 1500);
      }
    }
  };

  const prevStep = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const toggleActivity = (activityName: string) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activityName)) {
      newSelected.delete(activityName);
    } else {
      newSelected.add(activityName);
    }
    setSelectedActivities(newSelected);
  };

  const generateTrip = () => {
    const startDate = new Date(answers.startDate!);
    const endDate = addDays(startDate, answers.duration! - 1);

    // Create activities from selected suggestions
    const activities: Activity[] = [];
    let dayIndex = 0;
    const selectedList = suggestedActivities.filter(a => selectedActivities.has(a.name));
    
    selectedList.forEach((suggestion, index) => {
      const activityDate = addDays(startDate, dayIndex % answers.duration!);
      const timeMap = { morning: '09:00', afternoon: '14:00', evening: '19:00' };
      
      activities.push({
        id: crypto.randomUUID(),
        name: suggestion.name,
        description: suggestion.description,
        date: format(activityDate, 'yyyy-MM-dd'),
        time: timeMap[suggestion.timeOfDay],
        location: suggestion.location || answers.destination!,
      });
      
      if ((index + 1) % 2 === 0) dayIndex++;
    });

    const itinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${answers.destination} Adventure`,
      destination: answers.destination!,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      tripType: answers.tripType!,
      tripThemes: answers.themes!,
      travelers: Array.from({ length: answers.travelers! }, (_, i) => ({
        id: crypto.randomUUID(),
        name: i === 0 ? 'Me' : `Traveler ${i + 1}`,
      })),
      activities,
      accommodations: [],
      transportation: [],
      notes: answers.interests ? `Interests: ${answers.interests}` : '',
    };

    onComplete(itinerary);
  };

  const toggleTheme = (theme: TripTheme) => {
    const current = answers.themes || [];
    if (current.includes(theme)) {
      setAnswers({ ...answers, themes: current.filter(t => t !== theme) });
    } else if (current.length < 3) {
      setAnswers({ ...answers, themes: [...current, theme] });
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-primary/20 shadow-2xl max-h-[90vh] flex flex-col">
        <CardContent className="p-0 flex flex-col overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-muted overflow-hidden flex-shrink-0">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/60"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-6 md:p-8 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 flex-shrink-0">
              <div className="p-2 rounded-xl bg-primary/10">
                {currentStep === 'review' ? (
                  <Eye className="w-6 h-6 text-primary" />
                ) : (
                  <Sparkles className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {currentStep === 'review' ? 'Review Your Trip' : 'Plan Your Trip'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Step {currentIndex + 1} of {steps.length - 1}
                </p>
              </div>
            </div>

            {/* Question content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={currentStep === 'review' ? 'flex-1 overflow-hidden flex flex-col' : 'min-h-[280px]'}
              >
                {currentStep === 'destination' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <MapPin className="w-5 h-5 text-primary" />
                      Where would you like to go?
                    </div>
                    <Input
                      placeholder="e.g., Tokyo, Japan"
                      value={answers.destination || ''}
                      onChange={(e) => setAnswers({ ...answers, destination: e.target.value })}
                      className="text-lg h-14"
                      autoFocus
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter a city, country, or region you want to explore
                    </p>
                  </div>
                )}

                {currentStep === 'dates' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <Calendar className="w-5 h-5 text-primary" />
                      When do you want to travel?
                    </div>
                    <Input
                      type="date"
                      value={answers.startDate || ''}
                      onChange={(e) => setAnswers({ ...answers, startDate: e.target.value })}
                      className="text-lg h-14"
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">How many days?</p>
                      <div className="flex flex-wrap gap-2">
                        {DURATION_OPTIONS.map((days) => (
                          <Button
                            key={days}
                            variant={answers.duration === days ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setAnswers({ ...answers, duration: days })}
                          >
                            {days} days
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 'travelers' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <Users className="w-5 h-5 text-primary" />
                      How many travelers?
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setAnswers({ ...answers, travelers: Math.max(1, (answers.travelers || 1) - 1) })}
                        disabled={answers.travelers === 1}
                      >
                        -
                      </Button>
                      <span className="text-4xl font-bold w-16 text-center">{answers.travelers}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setAnswers({ ...answers, travelers: Math.min(10, (answers.travelers || 1) + 1) })}
                        disabled={answers.travelers === 10}
                      >
                        +
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Including yourself
                    </p>
                  </div>
                )}

                {currentStep === 'budget' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <Wallet className="w-5 h-5 text-primary" />
                      What's your budget style?
                    </div>
                    <div className="grid gap-3">
                      {BUDGET_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setAnswers({ ...answers, budget: option.value as TripAnswers['budget'] })}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            answers.budget === option.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{option.icon}</span>
                            <div>
                              <p className="font-medium">{option.label}</p>
                              <p className="text-sm text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 'type' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <Heart className="w-5 h-5 text-primary" />
                      What type of trip is this?
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(TRIP_TYPES).map(([key, { label, icon }]) => (
                        <button
                          key={key}
                          onClick={() => setAnswers({ ...answers, tripType: key as TripType })}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            answers.tripType === key
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span className="text-2xl mb-2 block">{icon}</span>
                          <p className="font-medium">{label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentStep === 'themes' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <Sparkles className="w-5 h-5 text-primary" />
                      What interests you? (Pick up to 3)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(TRIP_THEMES).map(([key, { label, icon }]) => (
                        <button
                          key={key}
                          onClick={() => toggleTheme(key as TripTheme)}
                          className={`px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2 ${
                            answers.themes?.includes(key as TripTheme)
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <span>{icon}</span>
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Selected: {answers.themes?.length || 0}/3
                    </p>
                  </div>
                )}

                {currentStep === 'interests' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <Heart className="w-5 h-5 text-primary" />
                      Anything specific you'd like to do?
                    </div>
                    <Input
                      placeholder="e.g., Visit famous temples, try local street food..."
                      value={answers.interests || ''}
                      onChange={(e) => setAnswers({ ...answers, interests: e.target.value })}
                      className="text-lg h-14"
                    />
                    <p className="text-sm text-muted-foreground">
                      Optional: Add any specific activities or places you want to include
                    </p>
                  </div>
                )}

                {currentStep === 'review' && (
                  <div className="flex flex-col overflow-hidden">
                    {/* Trip Summary */}
                    <div className="p-4 rounded-xl bg-muted/50 mb-4 flex-shrink-0">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">{answers.destination}</h3>
                        <Badge variant="secondary">{TRIP_TYPES[answers.tripType!]?.icon} {TRIP_TYPES[answers.tripType!]?.label}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {answers.startDate && format(new Date(answers.startDate), 'MMM d, yyyy')} · {answers.duration} days
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {answers.travelers} {answers.travelers === 1 ? 'traveler' : 'travelers'}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {answers.themes?.map(theme => (
                          <Badge key={theme} variant="outline" className="text-xs">
                            {TRIP_THEMES[theme]?.icon} {TRIP_THEMES[theme]?.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
                      {/* Activity Suggestions */}
                      <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                          <Lightbulb className="w-5 h-5 text-primary" />
                          <h4 className="font-medium">Suggested Activities</h4>
                        </div>

                        <ScrollArea className="flex-1 -mx-2 px-2">
                          <div className="space-y-2 pb-2">
                            {suggestedActivities.filter(a => !selectedActivities.has(a.name)).map((activity) => (
                              <button
                                key={activity.name}
                                onClick={() => toggleActivity(activity.name)}
                                className="w-full p-3 rounded-lg border-2 text-left transition-all flex items-start gap-3 border-border hover:border-primary/30 hover:bg-primary/5"
                              >
                                <div className="p-1 rounded bg-primary/10 text-primary">
                                  <ArrowRight className="w-3 h-3" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{activity.name}</span>
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {activity.timeOfDay}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {TRIP_THEMES[activity.theme]?.icon}
                                </span>
                              </button>
                            ))}
                            {suggestedActivities.filter(a => !selectedActivities.has(a.name)).length === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">All activities added to your schedule!</p>
                            )}
                          </div>
                        </ScrollArea>
                      </div>

                      {/* Your Schedule */}
                      <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                          <Check className="w-5 h-5 text-primary" />
                          <h4 className="font-medium">Your Schedule</h4>
                          <span className="text-sm text-muted-foreground">({selectedActivities.size})</span>
                        </div>

                        <ScrollArea className="flex-1 -mx-2 px-2">
                          <div className="space-y-2 pb-2">
                            <AnimatePresence mode="popLayout">
                              {suggestedActivities.filter(a => selectedActivities.has(a.name)).map((activity) => (
                                <motion.button
                                  key={activity.name}
                                  initial={{ opacity: 0, scale: 0.9, x: -20 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                                  layout
                                  onClick={() => toggleActivity(activity.name)}
                                  className="w-full p-3 rounded-lg border-2 text-left transition-all flex items-start gap-3 border-primary bg-primary/5 hover:bg-primary/10"
                                >
                                  <div className="p-1 rounded bg-destructive/10 text-destructive">
                                    <ArrowLeft className="w-3 h-3" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-sm">{activity.name}</span>
                                      <Badge variant="outline" className="text-xs capitalize">
                                        {activity.timeOfDay}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                                  </div>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {TRIP_THEMES[activity.theme]?.icon}
                                  </span>
                                </motion.button>
                              ))}
                            </AnimatePresence>
                            {selectedActivities.size === 0 && (
                              <p className="text-sm text-muted-foreground text-center py-4">Click activities to add them here</p>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>

                    {answers.interests && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/30 flex-shrink-0">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Your notes:</span> {answers.interests}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 'generating' && (
                  <div className="flex flex-col items-center justify-center py-8 space-y-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="p-4 rounded-full bg-primary/10"
                    >
                      <Sparkles className="w-10 h-10 text-primary" />
                    </motion.div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold mb-2">Creating your trip...</h3>
                      <p className="text-muted-foreground">
                        Planning the perfect {answers.duration}-day adventure to {answers.destination}
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            {currentStep !== 'generating' && (
              <div className="flex justify-between mt-6 flex-shrink-0">
                <Button
                  variant="ghost"
                  onClick={currentIndex === 0 ? onCancel : prevStep}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {currentIndex === 0 ? 'Cancel' : 'Back'}
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!canProceed()}
                >
                  {currentStep === 'review' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Create Trip
                    </>
                  ) : currentStep === 'interests' ? (
                    <>
                      Review
                      <Eye className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
