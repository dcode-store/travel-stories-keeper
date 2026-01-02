import { useState, useEffect, useRef } from 'react';
import { Accommodation } from '@/types/itinerary';
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
import { Hotel, MapPin, Calendar, DollarSign, FileText, Link, ClipboardCheck, ImagePlus, X, ChevronDown } from 'lucide-react';

interface AccommodationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Accommodation, 'id'>) => void;
  initialData?: Accommodation;
  currency?: string;
  tripStartDate?: string;
  tripEndDate?: string;
}

export function AccommodationForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  currency = 'USD',
  tripStartDate,
  tripEndDate,
}: AccommodationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    checkIn: tripStartDate || '',
    checkOut: tripEndDate || '',
    reservationNumber: '',
    notes: '',
    cost: '',
    bookingLink: '',
    confirmationLink: '',
    ticketLink: '',
  });

  const [bookingScreenshots, setBookingScreenshots] = useState<string[]>([]);
  const [confirmationScreenshots, setConfirmationScreenshots] = useState<string[]>([]);
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  const bookingInputRef = useRef<HTMLInputElement>(null);
  const confirmationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address || '',
        checkIn: initialData.checkIn,
        checkOut: initialData.checkOut,
        reservationNumber: initialData.reservationNumber || '',
        notes: initialData.notes || '',
        cost: initialData.cost?.toString() || '',
        bookingLink: initialData.bookingLink || '',
        confirmationLink: initialData.confirmationLink || '',
        ticketLink: initialData.ticketLink || '',
      });
      setBookingScreenshots(initialData.bookingScreenshots || []);
      setConfirmationScreenshots(initialData.confirmationScreenshots || []);
      // Show optional fields if any have data
      if (initialData.address || initialData.cost || initialData.notes) {
        setShowOptionalFields(true);
      }
    } else {
      setFormData({
        name: '',
        address: '',
        checkIn: tripStartDate || '',
        checkOut: tripEndDate || '',
        reservationNumber: '',
        notes: '',
        cost: '',
        bookingLink: '',
        confirmationLink: '',
        ticketLink: '',
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

    // Reset input
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
    
    const data: Omit<Accommodation, 'id'> = {
      name: formData.name,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      ...(formData.address && { address: formData.address }),
      ...(formData.reservationNumber && { reservationNumber: formData.reservationNumber }),
      ...(formData.notes && { notes: formData.notes }),
      ...(formData.cost && { cost: parseFloat(formData.cost), currency }),
      ...(formData.bookingLink && { bookingLink: formData.bookingLink }),
      ...(formData.confirmationLink && { confirmationLink: formData.confirmationLink }),
      ...(formData.ticketLink && { ticketLink: formData.ticketLink }),
      ...(bookingScreenshots.length > 0 && { bookingScreenshots }),
      ...(confirmationScreenshots.length > 0 && { confirmationScreenshots }),
    };

    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hotel className="w-5 h-5" />
            {initialData ? 'Edit Stay' : 'Add Stay'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* IMPORTANT FIELDS SECTION */}
          <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs font-medium text-primary uppercase tracking-wide">Important Details</p>
            
            {/* Name - Most Important */}
            <div className="space-y-2">
              <Label htmlFor="name">Hotel / Property Name *</Label>
              <div className="relative">
                <Hotel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grand Hotel Paris"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Check-in / Check-out */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-in *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="checkIn"
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-out *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="checkOut"
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
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
              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street, City"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Cost */}
              <div className="space-y-2">
                <Label htmlFor="cost">Total Cost</Label>
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
                  placeholder="Check-in instructions, door codes, special requests..."
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
              <Label htmlFor="reservationNumber">Confirmation / Reservation #</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="reservationNumber"
                  value={formData.reservationNumber}
                  onChange={(e) => setFormData({ ...formData, reservationNumber: e.target.value })}
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
              {initialData ? 'Save Changes' : 'Add Stay'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}