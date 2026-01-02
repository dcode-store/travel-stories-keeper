import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Activity } from '@/types/itinerary';
import { MapPin, Clock, Bell, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Activity, 'id'>) => void;
  initialData?: Activity;
  selectedDate?: string;
  currency?: string;
}

type ReminderOption = 'none' | '10min' | '30min' | '1hour';

const REMINDER_OPTIONS: { value: ReminderOption; label: string }[] = [
  { value: 'none', label: 'No reminder' },
  { value: '10min', label: '10 mins before' },
  { value: '30min', label: '30 mins before' },
  { value: '1hour', label: '1 hour before' },
];

export function ActivityForm({ open, onOpenChange, onSubmit, initialData, selectedDate, currency = 'USD' }: ActivityFormProps) {
  const { toast } = useToast();
  const [showMore, setShowMore] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: selectedDate || new Date().toISOString().split('T')[0],
    time: '',
    endTime: '',
    location: '',
    description: '',
    notes: '',
    cost: undefined as number | undefined,
    currency: currency,
    booked: false,
    confirmationNumber: '',
    reminder: 'none' as ReminderOption,
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          date: initialData.date,
          time: initialData.time || '',
          endTime: initialData.endTime || '',
          location: initialData.location || '',
          description: initialData.description || '',
          notes: initialData.notes || '',
          cost: initialData.cost,
          currency: initialData.currency || currency,
          booked: initialData.booked || false,
          confirmationNumber: initialData.confirmationNumber || '',
          reminder: (initialData as any).reminder || 'none',
        });
        // Show more if there's existing data in secondary fields
        setShowMore(!!(initialData.location || initialData.booked || (initialData as any).reminder !== 'none'));
      } else {
        setFormData({
          name: '',
          date: selectedDate || new Date().toISOString().split('T')[0],
          time: '',
          endTime: '',
          location: '',
          description: '',
          notes: '',
          cost: undefined,
          currency: currency,
          booked: false,
          confirmationNumber: '',
          reminder: 'none',
        });
        setShowMore(false);
      }
    }
  }, [initialData, open, selectedDate, currency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Name required', description: 'Please enter an activity name.', variant: 'destructive' });
      return;
    }
    if (!formData.date) {
      toast({ title: 'Date required', description: 'Please select a date.', variant: 'destructive' });
      return;
    }
    onSubmit(formData);
    onOpenChange(false);
  };

  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {initialData ? 'Edit Activity' : 'Add Activity'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Primary: Activity Name */}
          <div className="space-y-2">
            <Label htmlFor="name">What are you doing?</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Visit the Eiffel Tower"
              className="text-lg font-medium bg-muted/50 border-0 focus-visible:ring-primary"
              autoFocus
            />
          </div>

          {/* Primary: Time & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> What time?
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="bg-muted/50 border-0 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost" className="flex items-center gap-1.5">
                <span className="text-sm">💰</span> Cost ({currency})
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost ?? ''}
                onChange={e => setFormData(prev => ({ ...prev, cost: e.target.value ? parseFloat(e.target.value) : undefined }))}
                placeholder="0.00"
                className="bg-muted/50 border-0 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Primary: Notes */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Note to remember
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Anything important to remember..."
              className="min-h-[70px] resize-none bg-muted/50 border-0 focus-visible:ring-primary"
            />
            
            {/* Reminder options - shown with notes */}
            {formData.description && (
              <div className="flex flex-wrap gap-2 pt-1">
                {REMINDER_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, reminder: option.value }))}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs transition-all',
                      formData.reminder === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    )}
                  >
                    {option.value === 'none' ? '🔕' : '🔔'} {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* More Options - Collapsible */}
          <Collapsible open={showMore} onOpenChange={setShowMore}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between text-muted-foreground hover:text-foreground text-sm h-9"
              >
                More options
                <ChevronDown className={cn('w-4 h-4 transition-transform', showMore && 'rotate-180')} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-3">
              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Restaurant, club, museum, park..."
                  className="bg-muted/50 border-0"
                />
              </div>


              {/* Booked toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="booked" className="text-sm font-medium">Already booked?</Label>
                  <p className="text-xs text-muted-foreground">Has a reservation</p>
                </div>
                <Switch
                  id="booked"
                  checked={formData.booked}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, booked: checked }))}
                />
              </div>

              {formData.booked && (
                <div className="space-y-2">
                  <Label htmlFor="confirmation">Confirmation #</Label>
                  <Input
                    id="confirmation"
                    value={formData.confirmationNumber}
                    onChange={e => setFormData(prev => ({ ...prev, confirmationNumber: e.target.value }))}
                    placeholder="Booking reference"
                    className="bg-muted/50 border-0"
                  />
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
