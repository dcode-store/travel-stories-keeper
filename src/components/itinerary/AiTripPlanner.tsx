import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, MapPin, Calendar, Users, Wallet, Heart, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { Itinerary, TripType, TripTheme, TRIP_TYPES, TRIP_THEMES } from '@/types/itinerary';
import { format, addDays } from 'date-fns';

interface AiTripPlannerProps {
  onComplete: (itinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

type Step = 'destination' | 'dates' | 'travelers' | 'budget' | 'type' | 'themes' | 'interests' | 'generating';

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

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget-Friendly', description: 'Hostels, street food, free activities', icon: '💰' },
  { value: 'moderate', label: 'Moderate', description: 'Mid-range hotels, local restaurants', icon: '💵' },
  { value: 'luxury', label: 'Luxury', description: 'Premium stays, fine dining, exclusive experiences', icon: '💎' },
];

const DURATION_OPTIONS = [3, 5, 7, 10, 14];

export function AiTripPlanner({ onComplete, onCancel }: AiTripPlannerProps) {
  const [currentStep, setCurrentStep] = useState<Step>('destination');
  const [answers, setAnswers] = useState<Partial<TripAnswers>>({
    duration: 7,
    travelers: 2,
    themes: [],
  });

  const steps: Step[] = ['destination', 'dates', 'travelers', 'budget', 'type', 'themes', 'interests', 'generating'];
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex) / (steps.length - 1)) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 'destination': return !!answers.destination?.trim();
      case 'dates': return !!answers.startDate;
      case 'travelers': return !!answers.travelers;
      case 'budget': return !!answers.budget;
      case 'type': return !!answers.tripType;
      case 'themes': return (answers.themes?.length || 0) > 0;
      case 'interests': return true;
      default: return true;
    }
  };

  const nextStep = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
      if (steps[nextIndex] === 'generating') {
        setTimeout(() => generateTrip(), 2000);
      }
    }
  };

  const prevStep = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const generateTrip = () => {
    const startDate = new Date(answers.startDate!);
    const endDate = addDays(startDate, answers.duration! - 1);

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
      activities: [],
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
      <Card className="w-full max-w-2xl border-primary/20 shadow-2xl">
        <CardContent className="p-0">
          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-t-lg overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/60"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Plan Your Trip</h2>
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
                className="min-h-[280px]"
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
              <div className="flex justify-between mt-8">
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
                  {currentStep === 'interests' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Create Trip
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
