import { useState, useEffect } from 'react';
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
import { Hotel, MapPin, Calendar, Phone, Mail, Globe, DollarSign, FileText, Link, Ticket, ClipboardCheck } from 'lucide-react';

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
    phone: '',
    email: '',
    website: '',
    bookingLink: '',
    confirmationLink: '',
    ticketLink: '',
  });

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
        phone: initialData.phone || '',
        email: initialData.email || '',
        website: initialData.website || '',
        bookingLink: initialData.bookingLink || '',
        confirmationLink: initialData.confirmationLink || '',
        ticketLink: initialData.ticketLink || '',
      });
    } else {
      setFormData({
        name: '',
        address: '',
        checkIn: tripStartDate || '',
        checkOut: tripEndDate || '',
        reservationNumber: '',
        notes: '',
        cost: '',
        phone: '',
        email: '',
        website: '',
        bookingLink: '',
        confirmationLink: '',
        ticketLink: '',
      });
    }
  }, [initialData, open, tripStartDate, tripEndDate]);

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
      ...(formData.phone && { phone: formData.phone }),
      ...(formData.email && { email: formData.email }),
      ...(formData.website && { website: formData.website }),
      ...(formData.bookingLink && { bookingLink: formData.bookingLink }),
      ...(formData.confirmationLink && { confirmationLink: formData.confirmationLink }),
      ...(formData.ticketLink && { ticketLink: formData.ticketLink }),
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
          {/* Name */}
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

          {/* Cost & Confirmation */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="reservationNumber">Confirmation #</Label>
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
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Contact Information</Label>
            <div className="grid grid-cols-1 gap-3">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="hotel@example.com"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://hotel-website.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Booking Links */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Booking & Confirmation Links</Label>
            <div className="grid grid-cols-1 gap-3">
              <div className="relative">
                <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="url"
                  value={formData.bookingLink}
                  onChange={(e) => setFormData({ ...formData, bookingLink: e.target.value })}
                  placeholder="Booking details URL"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <ClipboardCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="url"
                  value={formData.confirmationLink}
                  onChange={(e) => setFormData({ ...formData, confirmationLink: e.target.value })}
                  placeholder="Confirmation page URL"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="url"
                  value={formData.ticketLink}
                  onChange={(e) => setFormData({ ...formData, ticketLink: e.target.value })}
                  placeholder="E-ticket or voucher URL"
                  className="pl-10"
                />
              </div>
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
