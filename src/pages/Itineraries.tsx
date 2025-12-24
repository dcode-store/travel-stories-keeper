import { useState } from 'react';
import { useItineraries } from '@/hooks/useItineraries';
import { ItineraryCard } from '@/components/itinerary/ItineraryCard';
import { ItineraryForm } from '@/components/itinerary/ItineraryForm';
import { ItineraryDetail } from '@/components/itinerary/ItineraryDetail';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Itinerary, ItineraryFormData, Activity } from '@/types/itinerary';
import { Plus, Plane, Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Itineraries = () => {
  const {
    itineraries,
    isLoading,
    upcomingItineraries,
    pastItineraries,
    currentItineraries,
    addItinerary,
    updateItinerary,
    deleteItinerary,
    getItinerary,
    addActivity,
    updateActivity,
    deleteActivity,
    addAccommodation,
    updateAccommodation,
    deleteAccommodation,
    addTransportation,
    updateTransportation,
    deleteTransportation,
  } = useItineraries();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<Itinerary | undefined>();
  const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | undefined>();

  const handleAdd = () => {
    setEditingItinerary(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (itinerary: Itinerary) => {
    setEditingItinerary(itinerary);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: ItineraryFormData) => {
    if (editingItinerary) {
      updateItinerary(editingItinerary.id, data);
      toast({ title: 'Trip updated', description: 'Your itinerary has been saved.' });
    } else {
      addItinerary(data);
      toast({ title: 'Trip created', description: 'A new trip has been added.' });
    }
  };

  const handleDelete = (id: string) => {
    deleteItinerary(id);
    toast({ title: 'Trip deleted', description: 'The itinerary has been removed.' });
    if (selectedItinerary?.id === id) {
      setSelectedItinerary(undefined);
    }
  };

  const handleView = (itinerary: Itinerary) => {
    setSelectedItinerary(itinerary);
  };

  // Keep selectedItinerary in sync with updates
  const currentItinerary = selectedItinerary ? getItinerary(selectedItinerary.id) : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentItinerary) {
    return (
      <ItineraryDetail
        itinerary={currentItinerary}
        onBack={() => setSelectedItinerary(undefined)}
        onEdit={() => handleEdit(currentItinerary)}
        onDelete={() => handleDelete(currentItinerary.id)}
        onAddActivity={(data) => {
          addActivity(currentItinerary.id, data);
          toast({ title: 'Activity added', description: 'The activity has been added to your itinerary.' });
        }}
        onUpdateActivity={(activityId, data) => {
          updateActivity(currentItinerary.id, activityId, data);
          toast({ title: 'Activity updated', description: 'The activity has been saved.' });
        }}
        onDeleteActivity={(activityId) => {
          deleteActivity(currentItinerary.id, activityId);
          toast({ title: 'Activity deleted', description: 'The activity has been removed.' });
        }}
        onAddAccommodation={(data) => {
          addAccommodation(currentItinerary.id, data);
          toast({ title: 'Stay added', description: 'The accommodation has been added.' });
        }}
        onUpdateAccommodation={(accId, data) => {
          updateAccommodation(currentItinerary.id, accId, data);
          toast({ title: 'Stay updated', description: 'The accommodation has been saved.' });
        }}
        onDeleteAccommodation={(accId) => {
          deleteAccommodation(currentItinerary.id, accId);
          toast({ title: 'Stay deleted', description: 'The accommodation has been removed.' });
        }}
        onAddTransportation={(data) => {
          addTransportation(currentItinerary.id, data);
          toast({ title: 'Transport added', description: 'The transport has been added.' });
        }}
        onUpdateTransportation={(transportId, data) => {
          updateTransportation(currentItinerary.id, transportId, data);
          toast({ title: 'Transport updated', description: 'The transport has been saved.' });
        }}
        onDeleteTransportation={(transportId) => {
          deleteTransportation(currentItinerary.id, transportId);
          toast({ title: 'Transport deleted', description: 'The transport has been removed.' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-medium">My Trips</h1>
              <p className="text-muted-foreground mt-1">
                {itineraries.length} {itineraries.length === 1 ? 'itinerary' : 'itineraries'}
              </p>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>

          {itineraries.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Plane className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl mb-2">No trips yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start planning your next adventure. Create an itinerary to organize your activities, accommodations, and transportation.
              </p>
              <Button onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Plan Your First Trip
              </Button>
            </div>
          ) : (
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  All ({itineraries.length})
                </TabsTrigger>
                {currentItineraries.length > 0 && (
                  <TabsTrigger value="current" className="gap-2">
                    <MapPin className="w-4 h-4" />
                    Current ({currentItineraries.length})
                  </TabsTrigger>
                )}
                <TabsTrigger value="upcoming" className="gap-2">
                  Upcoming ({upcomingItineraries.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  Past ({pastItineraries.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {itineraries.map(itinerary => (
                  <ItineraryCard
                    key={itinerary.id}
                    itinerary={itinerary}
                    onView={() => handleView(itinerary)}
                    onEdit={() => handleEdit(itinerary)}
                    onDelete={() => handleDelete(itinerary.id)}
                  />
                ))}
              </TabsContent>

              <TabsContent value="current" className="space-y-4">
                {currentItineraries.map(itinerary => (
                  <ItineraryCard
                    key={itinerary.id}
                    itinerary={itinerary}
                    onView={() => handleView(itinerary)}
                    onEdit={() => handleEdit(itinerary)}
                    onDelete={() => handleDelete(itinerary.id)}
                  />
                ))}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                {upcomingItineraries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No upcoming trips</p>
                ) : (
                  upcomingItineraries.map(itinerary => (
                    <ItineraryCard
                      key={itinerary.id}
                      itinerary={itinerary}
                      onView={() => handleView(itinerary)}
                      onEdit={() => handleEdit(itinerary)}
                      onDelete={() => handleDelete(itinerary.id)}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {pastItineraries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No past trips</p>
                ) : (
                  pastItineraries.map(itinerary => (
                    <ItineraryCard
                      key={itinerary.id}
                      itinerary={itinerary}
                      onView={() => handleView(itinerary)}
                      onEdit={() => handleEdit(itinerary)}
                      onDelete={() => handleDelete(itinerary.id)}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <ItineraryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        initialData={editingItinerary}
      />
    </div>
  );
};

export default Itineraries;
