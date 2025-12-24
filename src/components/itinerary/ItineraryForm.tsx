import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Itinerary,
  ItineraryFormData,
  TripType,
  TripTheme,
  Traveler,
  TRIP_TYPES,
  TRIP_THEMES,
} from '@/types/itinerary';
import { X, Plus, MapPin, Calendar, DollarSign, Users, UserPlus, Trash2, ArrowRight, ArrowLeft, Check, Sparkles, Heart, Wallet, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ItineraryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ItineraryFormData) => void;
  initialData?: Itinerary;
}

type Step = 'type' | 'destination' | 'dates' | 'companion' | 'travelers' | 'themes' | 'budget' | 'notes';

const generateId = () => Math.random().toString(36).substring(2, 10);

export function ItineraryForm({ open, onOpenChange, onSubmit, initialData }: ItineraryFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [formData, setFormData] = useState<ItineraryFormData>({
    title: '',
    destination: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    tags: [],
    budget: undefined,
    currency: 'USD',
    tripType: 'solo',
    tripThemes: [],
    travelers: [],
    companionName: '',
    adultsCount: 1,
    childrenCount: 0,
  });

  // Define steps based on trip type
  const getSteps = (): Step[] => {
    const baseSteps: Step[] = ['type', 'destination', 'dates'];
    
    if (formData.tripType === 'couple') {
      return [...baseSteps, 'companion', 'themes', 'budget', 'notes'];
    } else if (formData.tripType === 'family' || formData.tripType === 'group') {
      return [...baseSteps, 'travelers', 'themes', 'budget', 'notes'];
    }
    
    return [...baseSteps, 'themes', 'budget', 'notes'];
  };

  const steps = getSteps();
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;
  const isLastStep = currentIndex === steps.length - 1;

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          destination: initialData.destination,
          description: initialData.description || '',
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          coverImage: initialData.coverImage,
          notes: initialData.notes || '',
          tags: initialData.tags || [],
          budget: initialData.budget,
          currency: initialData.currency || 'USD',
          tripType: initialData.tripType || 'solo',
          tripThemes: initialData.tripThemes || [],
          travelers: initialData.travelers || [],
          companionName: initialData.companionName || '',
          adultsCount: initialData.adultsCount || 1,
          childrenCount: initialData.childrenCount || 0,
        });
        // For edit mode, go to last step
        setCurrentStep('notes');
      } else {
        setFormData({
          title: '',
          destination: '',
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: '',
          tags: [],
          budget: undefined,
          currency: 'USD',
          tripType: 'solo',
          tripThemes: [],
          travelers: [],
          companionName: '',
          adultsCount: 1,
          childrenCount: 0,
        });
        setCurrentStep('type');
      }
    }
  }, [initialData, open]);

  const toggleTheme = (theme: TripTheme) => {
    setFormData(prev => ({
      ...prev,
      tripThemes: prev.tripThemes?.includes(theme)
        ? prev.tripThemes.filter(t => t !== theme)
        : [...(prev.tripThemes || []), theme],
    }));
  };

  const addTraveler = () => {
    const newTraveler: Traveler = { id: generateId(), name: '', isChild: false };
    setFormData(prev => ({ ...prev, travelers: [...(prev.travelers || []), newTraveler] }));
  };

  const updateTraveler = (id: string, updates: Partial<Traveler>) => {
    setFormData(prev => ({
      ...prev,
      travelers: prev.travelers?.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const removeTraveler = (id: string) => {
    setFormData(prev => ({ ...prev, travelers: prev.travelers?.filter(t => t.id !== id) }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'type': return true;
      case 'destination': return formData.destination.trim() !== '';
      case 'dates': return !!formData.startDate && !!formData.endDate && formData.startDate <= formData.endDate;
      case 'companion': return true; // Optional
      case 'travelers': return (formData.adultsCount || 0) >= 1;
      case 'themes': return true; // Optional
      case 'budget': return true; // Optional
      case 'notes': return true; // Optional
      default: return true;
    }
  };

  const nextStep = () => {
    if (!canProceed()) return;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const prevStep = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleSubmit = () => {
    if (!formData.destination.trim()) {
      toast({ title: 'Missing destination', description: 'Please enter where you\'re going.', variant: 'destructive' });
      return;
    }
    
    const finalData = {
      ...formData,
      title: formData.title.trim() || `Trip to ${formData.destination}`,
    };
    
    onSubmit(finalData);
    onOpenChange(false);
  };

  if (!open) return null;

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
            <div className="flex items-center justify-between mb-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {initialData ? 'Edit Trip' : 'Plan Your Trip'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Step {currentIndex + 1} of {steps.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Step content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="min-h-[300px] flex-1 overflow-auto"
              >
                {/* Step: Trip Type */}
                {currentStep === 'type' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <Users className="w-5 h-5 text-primary" />
                      Who's traveling?
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This helps personalize your planning experience
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {(Object.entries(TRIP_TYPES) as [TripType, typeof TRIP_TYPES[TripType]][]).map(([type, info]) => (
                        <button
                          key={type}
                          onClick={() => setFormData(prev => ({ ...prev, tripType: type }))}
                          className={cn(
                            'p-4 rounded-xl border-2 text-left transition-all',
                            formData.tripType === type
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <span className="text-2xl mb-2 block">{info.icon}</span>
                          <p className="font-medium">{info.label}</p>
                          <p className="text-xs text-muted-foreground">{info.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step: Destination */}
                {currentStep === 'destination' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <MapPin className="w-5 h-5 text-primary" />
                      Where are you heading?
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formData.tripType === 'solo' && 'Your solo adventure awaits!'}
                      {formData.tripType === 'couple' && 'Where will love take you both?'}
                      {formData.tripType === 'family' && 'Where is the family going?'}
                      {formData.tripType === 'group' && 'Where is the crew heading?'}
                    </p>
                    <Input
                      value={formData.destination}
                      onChange={e => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      placeholder="e.g., Paris, France"
                      className="text-lg h-14"
                      autoFocus
                    />
                    <div className="pt-4">
                      <Label className="text-sm text-muted-foreground">Trip name (optional)</Label>
                      <Input
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={`e.g., Summer in ${formData.destination || 'Paris'}`}
                        className="mt-2"
                      />
                    </div>
                  </div>
                )}

                {/* Step: Dates */}
                {currentStep === 'dates' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <Calendar className="w-5 h-5 text-primary" />
                      When are you going?
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pick your travel dates
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label>Start date</Label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>End date</Label>
                        <Input
                          type="date"
                          value={formData.endDate}
                          min={formData.startDate}
                          onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="h-12"
                        />
                      </div>
                    </div>
                    {formData.startDate && formData.endDate && (
                      <p className="text-sm text-primary font-medium pt-2">
                        {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                      </p>
                    )}
                  </div>
                )}

                {/* Step: Companion (for couple trips) */}
                {currentStep === 'companion' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <span className="text-xl">💕</span>
                      Who's your travel partner?
                    </div>
                    <p className="text-sm text-muted-foreground">
                      The special someone joining you on this adventure
                    </p>
                    <Input
                      value={formData.companionName}
                      onChange={e => setFormData(prev => ({ ...prev, companionName: e.target.value }))}
                      placeholder="Their name..."
                      className="text-lg h-14"
                      autoFocus
                    />
                  </div>
                )}

                {/* Step: Travelers (for family/group trips) */}
                {currentStep === 'travelers' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <Users className="w-5 h-5 text-primary" />
                      Who's coming along?
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add your travel companions
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">Adults</Label>
                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setFormData(prev => ({ ...prev, adultsCount: Math.max(1, (prev.adultsCount || 1) - 1) }))}
                            disabled={(formData.adultsCount || 1) <= 1}
                          >
                            -
                          </Button>
                          <span className="text-2xl font-bold w-12 text-center">{formData.adultsCount || 1}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setFormData(prev => ({ ...prev, adultsCount: (prev.adultsCount || 1) + 1 }))}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {formData.tripType === 'family' && (
                        <div className="space-y-2">
                          <Label>Children</Label>
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setFormData(prev => ({ ...prev, childrenCount: Math.max(0, (prev.childrenCount || 0) - 1) }))}
                              disabled={(formData.childrenCount || 0) <= 0}
                            >
                              -
                            </Button>
                            <span className="text-2xl font-bold w-12 text-center">{formData.childrenCount || 0}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setFormData(prev => ({ ...prev, childrenCount: (prev.childrenCount || 0) + 1 }))}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <Label>Traveler names (optional)</Label>
                        <Button type="button" variant="ghost" size="sm" onClick={addTraveler}>
                          <UserPlus className="w-4 h-4 mr-1" /> Add
                        </Button>
                      </div>
                      
                      {formData.travelers && formData.travelers.length > 0 ? (
                        <div className="space-y-2">
                          {formData.travelers.map((traveler, index) => (
                            <div key={traveler.id} className="flex items-center gap-2">
                              <Input
                                value={traveler.name}
                                onChange={e => updateTraveler(traveler.id, { name: e.target.value })}
                                placeholder={`Traveler ${index + 1}`}
                                className="flex-1"
                              />
                              {formData.tripType === 'family' && (
                                <Button
                                  type="button"
                                  variant={traveler.isChild ? 'secondary' : 'outline'}
                                  size="sm"
                                  onClick={() => updateTraveler(traveler.id, { isChild: !traveler.isChild })}
                                >
                                  {traveler.isChild ? 'Child' : 'Adult'}
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTraveler(traveler.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4 bg-muted/50 rounded-lg">
                          Add names to keep track of who's going
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step: Themes */}
                {currentStep === 'themes' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <Heart className="w-5 h-5 text-primary" />
                      What's the vibe?
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Pick what describes your trip (select multiple)
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(Object.entries(TRIP_THEMES) as [TripTheme, typeof TRIP_THEMES[TripTheme]][]).map(([theme, info]) => (
                        <button
                          key={theme}
                          type="button"
                          onClick={() => toggleTheme(theme)}
                          className={cn(
                            'px-4 py-2 rounded-full border-2 transition-all flex items-center gap-2',
                            formData.tripThemes?.includes(theme)
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          )}
                        >
                          <span>{info.icon}</span>
                          <span className="text-sm font-medium">{info.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step: Budget */}
                {currentStep === 'budget' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <Wallet className="w-5 h-5 text-primary" />
                      What's your budget?
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Optional: Set a budget to help track expenses
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input
                          type="number"
                          value={formData.budget || ''}
                          onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value ? Number(e.target.value) : undefined }))}
                          placeholder="2000"
                          className="h-12 text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Currency</Label>
                        <Input
                          value={formData.currency}
                          onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                          placeholder="USD"
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step: Notes */}
                {currentStep === 'notes' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <FileText className="w-5 h-5 text-primary" />
                      Any notes for this trip?
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Optional: Add reminders, must-do activities, or special occasions
                    </p>
                    <Textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Things to remember, special occasions, must-do activities..."
                      className="min-h-[150px] resize-none text-base"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6 flex-shrink-0 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={currentIndex === 0 ? () => onOpenChange(false) : prevStep}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentIndex === 0 ? 'Cancel' : 'Back'}
              </Button>
              <Button
                onClick={isLastStep ? handleSubmit : nextStep}
                disabled={!canProceed()}
              >
                {isLastStep ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {initialData ? 'Save Changes' : 'Create Trip'}
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
