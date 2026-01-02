import { useState, useMemo, DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Itinerary, Activity as ActivityType, Accommodation, Transportation, getItineraryDates, getActivitiesForDate, TRANSPORTATION_TYPES, calculateDuration } from '@/types/itinerary';
import { ActivityForm } from './ActivityForm';
import { AccommodationForm } from './AccommodationForm';
import { TransportForm } from './TransportForm';
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
import { ArrowLeft, Pencil, Trash2, MapPin, Calendar, Clock, DollarSign, Hotel, Plane, Activity, Plus, ChevronDown, Phone, Mail, Globe, ExternalLink, Moon, Link, Ticket, ClipboardCheck, ArrowRight, GripVertical, ChevronRight } from 'lucide-react';
import { format, isToday, isPast, startOfDay, differenceInDays, isWithinInterval } from 'date-fns';
import { Link as RouterLink } from 'react-router-dom';

// Expense Link Component
function ExpenseLink({ itineraryId }: { itineraryId: string }) {
  return (
    <RouterLink 
      to={`/expenses?tripId=${itineraryId}`}
      className="mb-8 flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Expenses & Budget</h3>
          <p className="text-sm text-muted-foreground">View spending breakdown and charts</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </RouterLink>
  );
}

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
  onAddTransportation: (transport: Omit<Transportation, 'id'>) => void;
  onUpdateTransportation: (transportId: string, transport: Partial<Transportation>) => void;
  onDeleteTransportation: (transportId: string) => void;
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
  onAddTransportation,
  onUpdateTransportation,
  onDeleteTransportation,
}: ItineraryDetailProps) {
  const dates = getItineraryDates(itinerary.startDate, itinerary.endDate);
  const duration = calculateDuration(itinerary.startDate, itinerary.endDate);
  
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityType | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [showPastDays, setShowPastDays] = useState(false);
  const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  
  // Accommodation form state
  const [accommodationFormOpen, setAccommodationFormOpen] = useState(false);
  const [editingAccommodation, setEditingAccommodation] = useState<Accommodation | undefined>();

  // Transport form state
  const [transportFormOpen, setTransportFormOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState<Transportation | undefined>();

  // Drag and drop handlers
  const handleDragStart = (activityId: string) => {
    setDraggedActivityId(activityId);
  };

  const handleDragEnd = () => {
    setDraggedActivityId(null);
    setDragOverDate(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, date: string) => {
    e.preventDefault();
    setDragOverDate(date);
  };

  const handleDragLeave = () => {
    setDragOverDate(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetDate: string) => {
    e.preventDefault();
    if (draggedActivityId) {
      const activity = itinerary.activities.find(a => a.id === draggedActivityId);
      if (activity && activity.date !== targetDate) {
        onUpdateActivity(draggedActivityId, { date: targetDate });
      }
    }
    setDraggedActivityId(null);
    setDragOverDate(null);
  };

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

  // Transport handlers
  const handleAddTransport = () => {
    setEditingTransport(undefined);
    setTransportFormOpen(true);
  };

  const handleEditTransport = (transport: Transportation) => {
    setEditingTransport(transport);
    setTransportFormOpen(true);
  };

  const handleTransportSubmit = (data: Omit<Transportation, 'id'>) => {
    if (editingTransport) {
      onUpdateTransportation(editingTransport.id, data);
    } else {
      onAddTransportation(data);
    }
  };

  // Check if transport is happening today
  const isCurrentTransport = (transport: Transportation) => {
    const today = new Date().toISOString().split('T')[0];
    return transport.departureDate === today;
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

        {/* View Expenses Link */}
        <ExpenseLink itineraryId={itinerary.id} />

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
                      onUpdateActivityCost={(activityId, cost) => onUpdateActivity(activityId, { cost })}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      isDragOver={dragOverDate === date}
                      isDragging={!!draggedActivityId}
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
                  onUpdateActivityCost={(activityId, cost) => onUpdateActivity(activityId, { cost })}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  isDragOver={dragOverDate === date}
                  isDragging={!!draggedActivityId}
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
          <TabsContent value="transportation" className="space-y-6">
            {/* Add Transport Button */}
            <Button onClick={handleAddTransport} className="w-full" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Transport
            </Button>

            {itinerary.transportation.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground mb-1">No transportation added yet</p>
                  <p className="text-sm text-muted-foreground/70 mb-6">Book your transport or add existing bookings</p>
                  
                  {/* Transport Provider Links */}
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Find transport on</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <a 
                        href={`https://www.skyscanner.com/transport/flights/${encodeURIComponent(itinerary.destination)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#0770E3] text-white rounded-md hover:bg-[#0770E3]/90 transition-colors"
                      >
                        Skyscanner
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a 
                        href={`https://www.google.com/travel/flights?q=flights+to+${encodeURIComponent(itinerary.destination)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#4285F4] text-white rounded-md hover:bg-[#4285F4]/90 transition-colors"
                      >
                        Google Flights
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a 
                        href="https://www.rome2rio.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#FF6B00] text-white rounded-md hover:bg-[#FF6B00]/90 transition-colors"
                      >
                        Rome2Rio
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a 
                        href="https://www.thetrainline.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#03A9A3] text-white rounded-md hover:bg-[#03A9A3]/90 transition-colors"
                      >
                        Trainline
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <a 
                        href="https://www.kayak.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-[#FF690F] text-white rounded-md hover:bg-[#FF690F]/90 transition-colors"
                      >
                        Kayak
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
                    {itinerary.transportation.map((transport) => {
                      const typeInfo = TRANSPORTATION_TYPES[transport.type];
                      const isCurrent = isCurrentTransport(transport);
                      
                      return (
                        <div key={transport.id} className="relative pl-10">
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
                                  <span className={`text-2xl ${isCurrent ? 'animate-pulse' : ''}`}>{typeInfo.icon}</span>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-medium">{transport.name || typeInfo.label}</h4>
                                      {isCurrent && (
                                        <Badge variant="default" className="text-xs">
                                          Today
                                        </Badge>
                                      )}
                                      {transport.number && (
                                        <Badge variant="outline" className="text-xs">
                                          {transport.number}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {/* Route */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                      <span>{transport.departureLocation}</span>
                                      <ArrowRight className="w-3 h-3" />
                                      <span>{transport.arrivalLocation}</span>
                                    </div>
                                    
                                    {/* Date/Time */}
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {format(new Date(transport.departureDate), 'MMM d, yyyy')}
                                      </span>
                                      {transport.departureTime && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {transport.departureTime}
                                          {transport.arrivalTime && ` - ${transport.arrivalTime}`}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Company */}
                                    {transport.company && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {transport.company}
                                      </p>
                                    )}
                                    
                                    {/* Confirmation */}
                                    {transport.confirmationNumber && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Confirmation: <span className="font-mono">{transport.confirmationNumber}</span>
                                      </p>
                                    )}
                                    
                                    {/* Booking Links */}
                                    {(transport.bookingLink || transport.confirmationLink) && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {transport.bookingLink && (
                                          <a
                                            href={transport.bookingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                          >
                                            <Link className="w-3 h-3" />
                                            Booking
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                        {transport.confirmationLink && (
                                          <a
                                            href={transport.confirmationLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                          >
                                            <ClipboardCheck className="w-3 h-3" />
                                            Confirmation
                                            <ExternalLink className="w-2.5 h-2.5" />
                                          </a>
                                        )}
                                      </div>
                                    )}
                                    
                                    {transport.notes && (
                                      <p className="text-xs text-muted-foreground mt-2 italic">
                                        {transport.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                  {transport.cost && (
                                    <span className="text-sm font-semibold">
                                      {transport.currency || itinerary.currency || '$'}{transport.cost.toLocaleString()}
                                    </span>
                                  )}
                                  
                                  {/* Quick Actions */}
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleEditTransport(transport)}
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
                                          <AlertDialogTitle>Delete this transport?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This will permanently delete "{transport.name || typeInfo.label}" from your itinerary.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => onDeleteTransportation(transport.id)}
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
                {itinerary.transportation.some(t => t.cost) && (
                  <Card className="bg-muted/30">
                    <CardContent className="py-3 px-4 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Transport Cost</span>
                      <span className="font-semibold">
                        {itinerary.currency || '$'}
                        {itinerary.transportation
                          .reduce((sum, t) => sum + (t.cost || 0), 0)
                          .toLocaleString()}
                      </span>
                    </CardContent>
                  </Card>
                )}
              </>
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

      {/* Transport Form */}
      <TransportForm
        open={transportFormOpen}
        onOpenChange={setTransportFormOpen}
        onSubmit={handleTransportSubmit}
        initialData={editingTransport}
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
  onUpdateActivityCost: (activityId: string, cost: number | undefined) => void;
  onDragStart: (activityId: string) => void;
  onDragEnd: () => void;
  onDragOver: (e: DragEvent<HTMLDivElement>, date: string) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>, targetDate: string) => void;
  isDragOver: boolean;
  isDragging: boolean;
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
  onUpdateActivityCost,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver,
  isDragging,
}: DayCardProps) {
  const isEmpty = activities.length === 0;
  const currency = itinerary.currency || '$';
  
  return (
    <Card 
      className={`group transition-all ${isPastDay ? 'opacity-60' : isToday ? 'ring-2 ring-primary/50' : ''} ${
        isDragOver ? 'ring-2 ring-primary bg-primary/5' : ''
      } ${isDragging ? 'border-dashed' : ''}`}
      onDragOver={(e) => onDragOver(e, date)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, date)}
    >
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
      {(activities.length > 0 || isPastDay || isDragOver) && (
        <CardContent>
          {activities.length === 0 && isPastDay && !isDragOver ? (
            <p className="text-sm text-muted-foreground py-2 text-center">No activities</p>
          ) : activities.length === 0 && isDragOver ? (
            <div className="py-6 text-center border-2 border-dashed border-primary/30 rounded-lg">
              <p className="text-sm text-primary">Drop activity here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map(activity => (
                <div 
                  key={activity.id}
                  draggable
                  onDragStart={() => onDragStart(activity.id)}
                  onDragEnd={onDragEnd}
                  className="flex gap-3 p-3 rounded-lg bg-muted/50 group/activity cursor-grab hover:bg-muted transition-colors active:cursor-grabbing"
                  onClick={() => onEditActivity(activity)}
                >
                  <div className="flex items-center">
                    <GripVertical className="w-4 h-4 text-muted-foreground/50 mr-1" />
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
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
                    <div className="flex items-center gap-1 opacity-0 group-hover/activity:opacity-100 transition-opacity">
                      <span className="text-xs text-muted-foreground">{currency}</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={activity.cost ?? ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          onUpdateActivityCost(activity.id, e.target.value ? parseFloat(e.target.value) : undefined);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="0"
                        className="w-16 h-7 px-2 text-sm bg-background border border-input rounded text-right focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    {activity.cost && (
                      <span className="text-sm text-muted-foreground group-hover/activity:hidden">
                        {currency}{activity.cost}
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
