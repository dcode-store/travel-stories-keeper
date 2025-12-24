import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Itinerary,
  ItineraryFormData,
  TripType,
  TripTheme,
  Traveler,
  TRIP_TYPES,
  TRIP_THEMES,
} from '@/types/itinerary';
import { X, Plus, MapPin, Calendar, DollarSign, Users, UserPlus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ItineraryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ItineraryFormData) => void;
  initialData?: Itinerary;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

export function ItineraryForm({ open, onOpenChange, onSubmit, initialData }: ItineraryFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
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

  const isSimpleTrip = formData.tripType === 'solo' || formData.tripType === 'couple';
  const totalSteps = isSimpleTrip ? 3 : 4;

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
      }
      // For edit mode, go to final step; for new trip, start at step 1
      if (initialData) {
        const editTripType = initialData.tripType || 'solo';
        const isEditSimple = editTripType === 'solo' || editTripType === 'couple';
        setStep(isEditSimple ? 3 : 4);
      } else {
        setStep(1);
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
    if (step === 1) return true; // Trip type selection always valid
    if (step === 2) {
      return formData.destination.trim() !== '' && !!formData.startDate && !!formData.endDate;
    }
    if (step === 3 && !isSimpleTrip) {
      return (formData.adultsCount || 0) >= 1;
    }
    return true;
  };

  const handleNext = () => {
    if (step < totalSteps && canProceed()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (!formData.destination.trim()) {
      toast({ title: 'Missing destination', description: 'Please enter where you\'re going.', variant: 'destructive' });
      return;
    }
    if (formData.startDate > formData.endDate) {
      toast({ title: 'Invalid dates', description: 'End date must be after start date.', variant: 'destructive' });
      return;
    }
    
    // Auto-generate title if empty
    const finalData = {
      ...formData,
      title: formData.title.trim() || `Trip to ${formData.destination}`,
    };
    
    onSubmit(finalData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="font-display text-2xl">
            {initialData ? 'Edit Trip' : 'Plan Your Trip'}
          </DialogTitle>
          {/* Progress indicator */}
          <div className="flex items-center gap-2 pt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  i + 1 <= step ? 'bg-primary' : 'bg-muted'
                )}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="p-6 pt-4">
          {/* Step 1: Trip Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-1">Who's traveling?</h3>
                <p className="text-sm text-muted-foreground">This helps us personalize your planning experience</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(TRIP_TYPES) as [TripType, typeof TRIP_TYPES[TripType]][]).map(([type, info]) => (
                  <Card
                    key={type}
                    className={cn(
                      'p-4 cursor-pointer transition-all hover:shadow-md',
                      formData.tripType === type
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => setFormData(prev => ({ ...prev, tripType: type }))}
                  >
                    <div className="text-3xl mb-2">{info.icon}</div>
                    <div className="font-medium">{info.label}</div>
                    <div className="text-xs text-muted-foreground">{info.description}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Where & When - Q&A Style */}
          {step === 2 && (
            <div className="space-y-8">
              {/* Question 1: Where */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">Where are you heading?</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {formData.tripType === 'solo' && 'Your solo adventure awaits!'}
                      {formData.tripType === 'couple' && 'Where will love take you both?'}
                      {formData.tripType === 'family' && 'Where is the family going?'}
                      {formData.tripType === 'group' && 'Where is the crew heading?'}
                    </p>
                    <Input
                      value={formData.destination}
                      onChange={e => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                      placeholder="Paris, France"
                      className="text-lg bg-muted/50 border-0 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Question 2: When */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">When are you going?</h3>
                    <p className="text-sm text-muted-foreground mb-3">Pick your travel dates</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground mb-1 block">From</span>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                          className="bg-muted/50 border-0 focus-visible:ring-primary"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground mb-1 block">To</span>
                        <Input
                          type="date"
                          value={formData.endDate}
                          min={formData.startDate}
                          onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                          className="bg-muted/50 border-0 focus-visible:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 3: Companion (Couple only) */}
              {formData.tripType === 'couple' && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">💕</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">Who's your travel partner?</h3>
                      <p className="text-sm text-muted-foreground mb-3">The special someone joining you</p>
                      <Input
                        value={formData.companionName}
                        onChange={e => setFormData(prev => ({ ...prev, companionName: e.target.value }))}
                        placeholder="Their name..."
                        className="bg-muted/50 border-0 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Question 4: Trip Name */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">✨</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">What should we call this trip?</h3>
                    <p className="text-sm text-muted-foreground mb-3">Give it a memorable name (optional)</p>
                    <Input
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder={`e.g., Summer in ${formData.destination || 'Paris'}`}
                      className="bg-muted/50 border-0 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 for Family/Group: Travelers */}
          {step === 3 && !isSimpleTrip && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-1">Who's coming along?</h3>
                <p className="text-sm text-muted-foreground">Add your travel companions</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Adults
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setFormData(prev => ({ ...prev, adultsCount: Math.max(1, (prev.adultsCount || 1) - 1) }))}
                      disabled={(formData.adultsCount || 1) <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center text-lg font-medium">{formData.adultsCount || 1}</span>
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
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setFormData(prev => ({ ...prev, childrenCount: Math.max(0, (prev.childrenCount || 0) - 1) }))}
                        disabled={(formData.childrenCount || 0) <= 0}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center text-lg font-medium">{formData.childrenCount || 0}</span>
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

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
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
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Add names to keep track of who's going
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Final Step: Vibe & Budget */}
          {step === totalSteps && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-1">What's the vibe?</h3>
                <p className="text-sm text-muted-foreground">Pick what describes your trip (select multiple)</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {(Object.entries(TRIP_THEMES) as [TripTheme, typeof TRIP_THEMES[TripTheme]][]).map(([theme, info]) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => toggleTheme(theme)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2',
                      formData.tripThemes?.includes(theme)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                  </button>
                ))}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Budget (optional)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget || ''}
                    onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="2000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={e => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    placeholder="USD"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Any notes for this trip?</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Things to remember, special occasions, must-do activities..."
                  className="min-h-[80px] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer with navigation */}
        <div className="flex items-center justify-between p-6 pt-0 gap-3">
          {step > 1 ? (
            <Button type="button" variant="ghost" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}

          {step < totalSteps ? (
            <Button type="button" onClick={handleNext} disabled={!canProceed()}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              {initialData ? 'Save Changes' : 'Create Trip'} 🎉
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
