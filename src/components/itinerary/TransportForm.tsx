import { useState, useEffect, useRef } from 'react';
import { Transportation, TransportationType, TRANSPORTATION_TYPES } from '@/types/itinerary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plane, MapPin, Calendar, Clock, DollarSign, FileText, Link, ClipboardCheck, ImagePlus, X, ChevronDown, Building } from 'lucide-react';

interface TransportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Transportation, 'id'>) => void;
  initialData?: Transportation;
  currency?: string;
  tripStartDate?: string;
  tripEndDate?: string;
}

export function TransportForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  currency = 'USD',
  tripStartDate,
  tripEndDate,
}: TransportFormProps) {
  const [formData, setFormData] = useState({
    type: 'flight' as TransportationType,
    name: '',
    company: '',
    number: '',
    departureLocation: '',
    arrivalLocation: '',
    departureDate: tripStartDate || '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    confirmationNumber: '',
    notes: '',
    cost: '',
    bookingLink: '',
    confirmationLink: '',
  });

  const [bookingScreenshots, setBookingScreenshots] = useState<string[]>([]);
  const [confirmationScreenshots, setConfirmationScreenshots] = useState<string[]>([]);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const bookingInputRef = useRef<HTMLInputElement>(null);
  const confirmationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        name: initialData.name || '',
        company: initialData.company || '',
        number: initialData.number || '',
        departureLocation: initialData.departureLocation,
        arrivalLocation: initialData.arrivalLocation,
        departureDate: initialData.departureDate,
        departureTime: initialData.departureTime || '',
        arrivalDate: initialData.arrivalDate || '',
        arrivalTime: initialData.arrivalTime || '',
        confirmationNumber: initialData.confirmationNumber || '',
        notes: initialData.notes || '',
        cost: initialData.cost?.toString() || '',
        bookingLink: initialData.bookingLink || '',
        confirmationLink: initialData.confirmationLink || '',
      });
      setBookingScreenshots(initialData.bookingScreenshots || []);
      setConfirmationScreenshots(initialData.confirmationScreenshots || []);
      if (initialData.company || initialData.cost || initialData.notes || initialData.arrivalDate) {
        setShowOptionalFields(true);
      }
    } else {
      setFormData({
        type: 'flight',
        name: '',
        company: '',
        number: '',
        departureLocation: '',
        arrivalLocation: '',
        departureDate: tripStartDate || '',
        departureTime: '',
        arrivalDate: '',
        arrivalTime: '',
        confirmationNumber: '',
        notes: '',
        cost: '',
        bookingLink: '',
        confirmationLink: '',
      });
      setBookingScreenshots([]);
      setConfirmationScreenshots([]);
      setShowOptionalFields(false);
    }
  }, [initialData, open, tripStartDate, tripEndDate]);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImages: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeImage = (
    index: number,
    setImages: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: Omit<Transportation, 'id'> = {
      type: formData.type,
      departureLocation: formData.departureLocation,
      arrivalLocation: formData.arrivalLocation,
      departureDate: formData.departureDate,
      ...(formData.name && { name: formData.name }),
      ...(formData.company && { company: formData.company }),
      ...(formData.number && { number: formData.number }),
      ...(formData.departureTime && { departureTime: formData.departureTime }),
      ...(formData.arrivalDate && { arrivalDate: formData.arrivalDate }),
      ...(formData.arrivalTime && { arrivalTime: formData.arrivalTime }),
      ...(formData.confirmationNumber && { confirmationNumber: formData.confirmationNumber }),
      ...(formData.notes && { notes: formData.notes }),
      ...(formData.cost && { cost: parseFloat(formData.cost), currency }),
      ...(formData.bookingLink && { bookingLink: formData.bookingLink }),
      ...(formData.confirmationLink && { confirmationLink: formData.confirmationLink }),
      ...(bookingScreenshots.length > 0 && { bookingScreenshots }),
      ...(confirmationScreenshots.length > 0 && { confirmationScreenshots }),
    };

    onSubmit(data);
    onOpenChange(false);
  };

  const typeInfo = TRANSPORTATION_TYPES[formData.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{typeInfo.icon}</span>
            {initialData ? 'Edit Transport' : 'Add Transport'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* IMPORTANT FIELDS SECTION */}
          <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide">Transport Details</p>
            
            {/* Type Selection */}
            <div className="space-y-2">
              <Label>Transport Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: TransportationType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRANSPORTATION_TYPES).map(([key, { label, icon }]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <span>{icon}</span>
                        {label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From / To */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureLocation">From *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="departureLocation"
                    value={formData.departureLocation}
                    onChange={(e) => setFormData({ ...formData, departureLocation: e.target.value })}
                    placeholder="Departure"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalLocation">To *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="arrivalLocation"
                    value={formData.arrivalLocation}
                    onChange={(e) => setFormData({ ...formData, arrivalLocation: e.target.value })}
                    placeholder="Arrival"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Departure Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate">Departure Date *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="departureDate"
                    type="date"
                    value={formData.departureDate}
                    onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departureTime">Departure Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="departureTime"
                    type="time"
                    value={formData.departureTime}
                    onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Flight/Train Number */}
            <div className="space-y-2">
              <Label htmlFor="number">{formData.type === 'flight' ? 'Flight' : 'Reference'} Number</Label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder={formData.type === 'flight' ? 'e.g., BA123' : 'e.g., Train 456'}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* ADDITIONAL DETAILS - Collapsible */}
          <Collapsible open={showOptionalFields} onOpenChange={setShowOptionalFields}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                <span>Additional Details</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showOptionalFields ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Trip Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Flight to Paris"
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">Company / Operator</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., British Airways"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Arrival Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="arrivalDate">Arrival Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="arrivalDate"
                      type="date"
                      value={formData.arrivalDate}
                      onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arrivalTime">Arrival Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="arrivalTime"
                      type="time"
                      value={formData.arrivalTime}
                      onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <Label htmlFor="cost">Cost</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Seat numbers, luggage info, special requirements..."
                  rows={3}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* BOOKING CONFIRMATION SECTION */}
          <div className="space-y-4 p-4 bg-accent/30 rounded-lg border border-accent/50">
            <p className="text-xs font-medium text-accent-foreground uppercase tracking-wide">Booking Confirmation Details</p>
            
            {/* Confirmation Number */}
            <div className="space-y-2">
              <Label htmlFor="confirmationNumber">Confirmation / Booking #</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmationNumber"
                  value={formData.confirmationNumber}
                  onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value })}
                  placeholder="ABC123"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Booking/Confirmation Link */}
            <div className="space-y-2">
              <Label>Booking Link</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="url"
                  value={formData.bookingLink}
                  onChange={(e) => setFormData({ ...formData, bookingLink: e.target.value })}
                  placeholder="Link to booking or confirmation page"
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Screenshots */}
            <div className="space-y-2">
              <Label>Screenshots</Label>
              <input
                ref={bookingInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, setBookingScreenshots)}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-dashed"
                onClick={() => bookingInputRef.current?.click()}
              >
                <ImagePlus className="w-4 h-4 mr-2" />
                Add Screenshots
              </Button>
              
              {bookingScreenshots.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {bookingScreenshots.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Screenshot ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index, setBookingScreenshots)}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Save Changes' : 'Add Transport'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}