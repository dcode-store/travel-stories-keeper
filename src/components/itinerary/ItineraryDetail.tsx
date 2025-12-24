import { useState } from 'react';
import { Itinerary, Activity as ActivityType, getItineraryDates, getActivitiesForDate, TRANSPORTATION_TYPES, calculateDuration } from '@/types/itinerary';
import { ActivityForm } from './ActivityForm';
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
import { ArrowLeft, Pencil, Trash2, MapPin, Calendar, Clock, DollarSign, Hotel, Plane, Activity, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface ItineraryDetailProps {
  itinerary: Itinerary;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddActivity: (activity: Omit<ActivityType, 'id'>) => void;
  onUpdateActivity: (activityId: string, activity: Partial<ActivityType>) => void;
  onDeleteActivity: (activityId: string) => void;
}

export function ItineraryDetail({ 
  itinerary, 
  onBack, 
  onEdit, 
  onDelete,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
}: ItineraryDetailProps) {
  const dates = getItineraryDates(itinerary.startDate, itinerary.endDate);
  const duration = calculateDuration(itinerary.startDate, itinerary.endDate);
  
  const [activityFormOpen, setActivityFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityType | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();

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
          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {itinerary.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(itinerary.startDate), 'MMM d')} - {format(new Date(itinerary.endDate), 'MMM d, yyyy')}
            </span>
            <span>{duration} days</span>
          </div>
          {itinerary.description && <p className="text-muted-foreground">{itinerary.description}</p>}
          {itinerary.budget && (
            <div className="flex items-center gap-1 mt-2 text-sm">
              <DollarSign className="w-4 h-4" />
              Budget: {itinerary.currency} {itinerary.budget.toLocaleString()}
            </div>
          )}
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
            {dates.map((date, index) => {
              const activities = getActivitiesForDate(itinerary, date);
              return (
                <Card key={date}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-lg">
                        <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                          {index + 1}
                        </span>
                        {format(new Date(date), 'EEEE, MMMM d')}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddActivity(date)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activities.length === 0 ? (
                      <button
                        onClick={() => handleAddActivity(date)}
                        className="w-full py-6 border-2 border-dashed border-muted-foreground/20 rounded-lg text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        <Plus className="w-4 h-4 mx-auto mb-1" />
                        Add your first activity
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {activities.map(activity => (
                          <div 
                            key={activity.id} 
                            className="flex gap-3 p-3 rounded-lg bg-muted/50 group cursor-pointer hover:bg-muted transition-colors"
                            onClick={() => handleEditActivity(activity)}
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
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
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
                </Card>
              );
            })}
          </TabsContent>

          {/* Accommodations Tab */}
          <TabsContent value="accommodations" className="space-y-4">
            {itinerary.accommodations.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No accommodations added yet
                </CardContent>
              </Card>
            ) : (
              itinerary.accommodations.map(acc => (
                <Card key={acc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Hotel className="w-5 h-5 mt-0.5 text-primary" />
                      <div className="flex-1">
                        <h4 className="font-medium">{acc.name}</h4>
                        {acc.address && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {acc.address}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(new Date(acc.checkIn), 'MMM d')} → {format(new Date(acc.checkOut), 'MMM d, yyyy')}
                        </p>
                        {acc.reservationNumber && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Confirmation: {acc.reservationNumber}
                          </p>
                        )}
                      </div>
                      {acc.cost && (
                        <span className="text-sm font-medium">
                          {acc.currency || itinerary.currency || '$'}{acc.cost}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
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
    </div>
  );
}
