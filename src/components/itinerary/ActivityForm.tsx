import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Activity } from '@/types/itinerary';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Activity, 'id'>) => void;
  initialData?: Activity;
  selectedDate?: string;
  currency?: string;
}

export function ActivityForm({ open, onOpenChange, onSubmit, initialData, selectedDate, currency = 'USD' }: ActivityFormProps) {
  const { toast } = useToast();
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
        });
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
        });
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
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {initialData ? 'Edit Activity' : 'Add Activity'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">What are you doing? *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Visit the Eiffel Tower"
              className="font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Champ de Mars, Paris"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Any details to remember..."
              className="min-h-[60px] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cost" className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" /> Cost
              </Label>
              <Input
                id="cost"
                type="number"
                value={formData.cost || ''}
                onChange={e => setFormData(prev => ({ ...prev, cost: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="0"
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

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="booked" className="text-sm font-medium">Already booked?</Label>
              <p className="text-xs text-muted-foreground">Mark if you have a reservation</p>
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
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Save Changes' : 'Add Activity'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
