import { useState, useMemo } from 'react';
import { Itinerary, Activity as ActivityType, Accommodation, getItineraryDates, getActivitiesForDate, TRANSPORTATION_TYPES, calculateDuration } from '@/types/itinerary';
import { ActivityForm } from './ActivityForm';
import { AccommodationForm } from './AccommodationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Pencil, Trash2, MapPin, Calendar, Clock, DollarSign, Hotel, Plane, Activity, Plus, ChevronDown, Phone, Mail, Globe, ExternalLink, Moon, Link, Ticket, ClipboardCheck } from 'lucide-react';
import { format, isToday, isPast, startOfDay, differenceInDays, isWithinInterval } from 'date-fns';

interface ItineraryDetailProps {
  itinerary: Itinerary;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddActivity: (activity: Omit<ActivityType, 'id'>) => void;
  onUpdateActivity: (activityId: string, activity: Partial<ActivityType>) => void;
  onDeleteActivity: (activityId: string) => void;
  onAddAccommodation: (accommodation: Omit<Accommodation, 'id'>) => void;
  onUpdateAccommodation: (accommodationId: string, accommodation: Partial<Accommodation>) => void;
  onDeleteAccommodation: (accommodationId: string) => void;
}

export function ItineraryDetail({ 
  itinerary, 
  onBack, 
  onEdit, 
  onDelete,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onAddAccommodation,
  onUpdateAccommodation,
  onDeleteAccommodation,
}: ItineraryDetailProps) {
  const dates = getItineraryDates(itinerary.startDate, itinerary.endDate);
  const duration = calculateDuration(itinerary.startDate, itinerary.endDate);
  
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityType | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [showPastDays, setShowPastDays] = useState(false);
  
  // Accommodation form state
  const [accommodationFormOpen, setAccommodationFormOpen] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | undefined>();

  // Determine if this is an ongoing trip (started but not ended)
  const today = startOfDay(new Date());
  const tripStart = startOfDay(new Date(itinerary.startDate));
  const tripEnd = startOfDay(new Date(itinerary.endDate));
  const isOngoingTrip = today >= tripStart && today <= tripEnd;

  // Split dates into past and current/future for ongoing trips
  const { pastDates, currentAndFutureDates } = useMemo(() => {
    if (!isOngoingTrip) {
      return { pastDates: [], currentAndFutureDates: dates };
    }
    const past: string[] = [];
    const currentFuture: string[] = [];
    dates.forEach(date => {
      const dateObj = startOfDay(new Date(date));
      if (isPast(dateObj) && !isToday(dateObj)) {
        past.push(date);
      } else {
        currentFuture.push(date);
      }
    });
    return { pastDates: past, currentAndFutureDates: currentFuture };
  }, [dates, isOngoingTrip]);

  const handleAddActivity = (date?: string) => {
    setEditingActivity(undefined);
    setSelectedDate(date);
    setActivityFormOpen(true);
  };

  const handleEditActivity = (activity: ActivityType) => {
    setEditingActivity(activity);
    setSelectedDate(activity.date);
    setActivityFormOpen(true);
  };

  const handleActivitySubmit = (data: Omit<ActivityType, 'id'>) => {
    if (editingActivity) {
      onUpdateActivity(editingActivity.id, data);
    } else {
      onAddActivity(data);
    }
  };

  // Accommodation handlers
  const handleAddAccommodation = () => {
    setEditingAccommodation(undefined);
    setAccommodationFormOpen(true);
  };

  const handleEditAccommodation = (accommodation: Accommodation) => {
    setEditingAccommodation(accommodation);
    setAccommodationFormOpen(true);
  };

  const handleAccommodationSubmit = (data: Omit<Accommodation, 'id'>) => {
    if (editingAccommodation) {
      onUpdateAccommodation(editingAccommodation.id, data);
    } else {
      onAddAccommodation(data);
    }
  };

  // Calculate nights for an accommodation
  const calculateNights = (checkIn: string, checkOut: string) => {
    return differenceInDays(new Date(checkOut), new Date(checkIn));
  };

  // Check if accommodation is currently active
  const isCurrentStay = (acc: Accommodation) => {
    const today = new Date();
    const checkIn = new Date(acc.checkIn);
    const checkOut = new Date(acc.checkOut);
    return isWithinInterval(today, { start: checkIn, end: checkOut });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{itinerary.title}" and all its data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Trip Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-medium mb-2">{itinerary.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {itinerary.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(itinerary.startDate), 'MMM d')} - {format(new Date(itinerary.endDate), 'MMM d, yyyy')}
            </span>
            <span>{duration} days</span>
            {itinerary.budget && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {itinerary.currency} {itinerary.budget.toLocaleString()}
              </span>
            )}
          </div>
          {itinerary.description && <p className="text-muted-foreground">{itinerary.description}</p>}
          {itinerary.tags && itinerary.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {itinerary.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="accommodations" className="gap-2">
              <Hotel className="w-4 h-4" />
              Stays ({itinerary.accommodations.length})
            </TabsTrigger>
            <TabsTrigger value="transportation" className="gap-2">
              <Plane className="w-4 h-4" />
              Transport ({itinerary.transportation.length})
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            {/* Past days collapsible for ongoing trips */}
            {isOngoingTrip && pastDates.length > 0 && (
              <Collapsible open={showPastDays} onOpenChange={setShowPastDays}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-muted-foreground hover:text-foreground">
                    <span>{pastDates.length} past day{pastDates.length > 1 ? 's' : ''}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showPastDays ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                  {pastDates.map((date, index) => (
                    <DayCard
                      key={date}
                      date={date}
                      dayNumber={index + 1}
                      activities={getActivitiesForDate(itinerary, date)}
                      itinerary={itinerary}
                      isPastDay
                      onAddActivity={handleAddActivity}
                      onEditActivity={handleEditActivity}
                      onDeleteActivity={onDeleteActivity}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Current and future days */}
            {currentAndFutureDates.map((date, index) => {
              const dayNumber = isOngoingTrip ? pastDates.length + index + 1 : index + 1;
              const isTodayDate = isToday(new Date(date));
              return (
                <DayCard
                  key={date}
                  date={date}
                  dayNumber={dayNumber}
                  activities={getActivitiesForDate(itinerary, date)}
                  itinerary={itinerary}
                  isToday={isTodayDate}
                  onAddActivity={handleAddActivity}
                  onEditActivity={handleEditActivity}
                  onDeleteActivity={onDeleteActivity}
                />
              );
            })}
          </TabsContent>

          {/* Accommodations Tab */}
          <TabsContent value="accommodations" className="space-y-6">
            {/* Add Stay Button */}
            <Button onClick={handleAddAccommodation} className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Stay
            </Button>

            {itinerary.accommodations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Hotel className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-1">No accommodations added yet</p>
                  <p className="text-sm text-muted-foreground/70 mb-6">Find your perfect stay or add one manually</p>
                  
                  {/* Booking Provider Links */}
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Find accommodations on</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <a 
                        href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(itinerary.destination)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#003580] text-white rounded-md hover:bg-[#003580]/90 transition-colors"
                      >
                        Booking.com
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a 
                        href={`https://www.airbnb.com/s/${encodeURIComponent(itinerary.destination)}/homes`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#FF5A5F] text-white rounded-md hover:bg-[#FF5A5F]/90 transition-colors"
                      >
                        Airbnb
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a 
                        href={`https://www.hotels.com/search.do?q-destination=${encodeURIComponent(itinerary.destination)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#D32F2F] text-white rounded-md hover:bg-[#D32F2F]/90 transition-colors"
                      >
                        Hotels.com
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a 
                        href={`https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(itinerary.destination)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#00355F] text-white rounded-md hover:bg-[#00355F]/90 transition-colors"
                      >
                        Expedia
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a 
                        href={`https://www.agoda.com/search?city=${encodeURIComponent(itinerary.destination)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#5391D0] text-white rounded-md hover:bg-[#5391D0]/90 transition-colors"
                      >
                        Agoda
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Timeline View */}
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-4">
                    {itinerary.accommodations.map((acc, index) => {
                      const nights = calculateNights(acc.checkIn, acc.checkOut);
                      const isCurrent = isCurrentStay(acc);
                      
                      return (
                        <div key={acc.id} className="relative pl-10">
                          {/* Timeline dot */}
                          <div className={`absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 ${
                            isCurrent 
                              ? 'bg-primary border-primary animate-pulse' 
                              : 'bg-background border-muted-foreground/50'
                          }`} />
                          
                          <Card className={`transition-all ${isCurrent ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1">
                                  <Hotel className={`w-5 h-5 mt-0.5 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-medium">{acc.name}</h4>
                                      {isCurrent && (
                                        <Badge variant="default" className="text-xs">
                                          Current Stay
                                        </Badge>
                                      )}
                                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                        <Moon className="w-3 h-3" />
                                        {nights} night{nights !== 1 ? 's' : ''}
                                      </Badge>
                                    </div>
                                    
                                    {acc.address && (
                                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{acc.address}</span>
                                      </p>
                                    )}
                                    
                                    <p className="text-sm text-muted-foreground mt-1">
                                      <span className="font-medium">Check-in:</span> {format(new Date(acc.checkIn), 'EEE, MMM d')} → 
                                      <span className="font-medium"> Check-out:</span> {format(new Date(acc.checkOut), 'EEE, MMM d')}
                                    </p>
                                    
                                    {acc.reservationNumber && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        <span className="font-medium">Confirmation:</span> {acc.reservationNumber}
                                      </p>
                                    )}
                                    
                                    {/* Contact Info */}
                                    {(acc.phone || acc.email || acc.website) && (
                                      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-border/50">
                                        {acc.phone && (
                                          <a 
                                            href={`tel:${acc.phone}`} 
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                          >
                                            <Phone className="w-3 h-3" />
                                            {acc.phone}
                                          </a>
                                        )}
                                        {acc.email && (
                                          <a 
                                            href={`mailto:${acc.email}`} 
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                          >
                                            <Mail className="w-3 h-3" />
                                            {acc.email}
                                          </a>
                                        )}
                                        {acc.website && (
                                          <a 
                                            href={acc.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                          >
                                            <Globe className="w-3 h-3" />
                                            Hotel Website
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Booking Links */}
                                    {(acc.bookingLink || acc.confirmationLink || acc.ticketLink) && (
                                      <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-border/50">
                                        {acc.bookingLink && (
                                          <a 
                                            href={acc.bookingLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                          >
                                            <Link className="w-3 h-3" />
                                            Booking Details
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                        {acc.confirmationLink && (
                                          <a 
                                            href={acc.confirmationLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                          >
                                            <ClipboardCheck className="w-3 h-3" />
                                            Confirmation
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                        {acc.ticketLink && (
                                          <a 
                                            href={acc.ticketLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-primary hover:underline flex items-center gap-1"
                                          >
                                            <Ticket className="w-3 h-3" />
                                            E-Ticket/Voucher
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                      </div>
                                    )}
                                    
                                    {acc.notes && (
                                      <p className="text-xs text-muted-foreground mt-2 italic">
                                        {acc.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                  {acc.cost && (
                                    <span className="text-sm font-semibold">
                                      {acc.currency || itinerary.currency || '$'}{acc.cost.toLocaleString()}
                                    </span>
                                  )}
                                  
                                  {/* Quick Actions */}
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEditAccommodation(acc)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete this stay?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will permanently delete "{acc.name}" from your itinerary.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => onDeleteAccommodation(acc.id)}
                                            className="bg-destructive text-destructive-foreground"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total Cost Summary */}
                {itinerary.accommodations.some(a => a.cost) && (
                  <Card className="bg-muted/30">
                    <CardContent className="py-3 px-4 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Accommodation Cost</span>
                      <span className="font-semibold">
                        {itinerary.currency || '$'}
                        {itinerary.accommodations
                          .reduce((sum, acc) => sum + (acc.cost || 0), 0)
                          .toLocaleString()}
                      </span>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Transportation Tab */}
          <TabsContent value="transportation" className="space-y-4">
            {itinerary.transportation.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No transportation added yet
                </CardContent>
              </Card>
            ) : (
              itinerary.transportation.map(transport => {
                const typeInfo = TRANSPORTATION_TYPES[transport.type];
                return (
                  <Card key={transport.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{typeInfo.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{transport.name || typeInfo.label}</h4>
                            {transport.number && (
                              <Badge variant="outline" className="text-xs">
                                {transport.number}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {transport.departureLocation} → {transport.arrivalLocation}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(transport.departureDate), 'MMM d, yyyy')}
                            {transport.departureTime && ` at ${transport.departureTime}`}
                          </p>
                          {transport.confirmationNumber && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Confirmation: {transport.confirmationNumber}
                            </p>
                          )}
                        </div>
                        {transport.cost && (
                          <span className="text-sm font-medium">
                            {transport.currency || itinerary.currency || '$'}{transport.cost}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Activity Form */}
      <ActivityForm
        open={activityFormOpen}
        onOpenChange={setActivityFormOpen}
        onSubmit={handleActivitySubmit}
        initialData={editingActivity}
        selectedDate={selectedDate}
        currency={itinerary.currency}
      />

      {/* Accommodation Form */}
      <AccommodationForm
        open={accommodationFormOpen}
        onOpenChange={setAccommodationFormOpen}
        onSubmit={handleAccommodationSubmit}
        initialData={editingAccommodation}
        currency={itinerary.currency}
        tripStartDate={itinerary.startDate}
        tripEndDate={itinerary.endDate}
      />
    </div>
  );
}

// Extracted DayCard component for cleaner code
interface DayCardProps {
  date: string;
  dayNumber: number;
  activities: ActivityType[];
  itinerary: Itinerary;
  isPastDay?: boolean;
  isToday?: boolean;
  onAddActivity: (date: string) => void;
  onEditActivity: (activity: ActivityType) => void;
  onDeleteActivity: (activityId: string) => void;
}

function DayCard({
  date,
  dayNumber,
  activities,
  itinerary,
  isPastDay,
  isToday,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: DayCardProps) {
  const isEmpty = activities.length === 0;
  
  return (
    <Card className={`group ${isPastDay ? 'opacity-60' : isToday ? 'ring-2 ring-primary/50' : ''}`}>
      <CardHeader className={`pb-3 ${isEmpty && !isPastDay ? 'py-4' : ''}`}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-lg">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isToday ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
            }`}>
              {dayNumber}
            </span>
            <span className="flex items-center gap-2">
              {format(new Date(date), 'EEEE, MMMM d')}
              {isToday && <Badge className="text-xs">Today</Badge>}
            </span>
          </div>
          {!isPastDay && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddActivity(date)}
              className="text-muted-foreground hover:text-primary transition-all"
            >
              <Plus className="w-4 h-4 mr-1" />
              {isEmpty ? 'Add activity' : 'Add'}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      {(activities.length > 0 || isPastDay) && (
        <CardContent>
          {activities.length === 0 && isPastDay ? (
            <p className="text-sm text-muted-foreground py-2 text-center">No activities</p>
          ) : (
            <div className="space-y-3">
              {activities.map(activity => (
                <div 
                  key={activity.id} 
                  className="flex gap-3 p-3 rounded-lg bg-muted/50 group/activity cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => onEditActivity(activity)}
                >
                  <Activity className="w-4 h-4 mt-0.5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{activity.name}</span>
                      {activity.booked && <Badge variant="outline" className="text-xs">Booked</Badge>}
                    </div>
                    {activity.time && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                        {activity.endTime && ` - ${activity.endTime}`}
                      </p>
                    )}
                    {activity.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {activity.location}
                      </p>
                    )}
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.cost && (
                      <span className="text-sm text-muted-foreground">
                        {activity.currency || itinerary.currency || '$'}{activity.cost}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover/activity:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteActivity(activity.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
