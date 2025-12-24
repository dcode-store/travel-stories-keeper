import { Itinerary, calculateDuration } from '@/types/itinerary';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { MapPin, Calendar, Pencil, Trash2, Eye, Plane, Hotel, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface ItineraryCardProps {
  itinerary: Itinerary;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItineraryCard({ itinerary, onView, onEdit, onDelete }: ItineraryCardProps) {
  const duration = calculateDuration(itinerary.startDate, itinerary.endDate);
  const today = new Date().toISOString().split('T')[0];
  const isCurrent = itinerary.startDate <= today && itinerary.endDate >= today;
  const isUpcoming = itinerary.startDate > today;

  return (
    <Card className="group hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Cover Image or Gradient */}
          <div
            className="w-full sm:w-40 h-32 sm:h-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
            style={
              itinerary.coverImage
                ? { backgroundImage: `url(${itinerary.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : undefined
            }
          >
            {!itinerary.coverImage && <Plane className="w-10 h-10 text-primary/40" />}
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-display text-lg font-medium truncate">{itinerary.title}</h3>
                  {isCurrent && (
                    <Badge variant="default" className="bg-green-500">
                      Ongoing
                    </Badge>
                  )}
                  {isUpcoming && <Badge variant="secondary">Upcoming</Badge>}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {itinerary.destination}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(itinerary.startDate), 'MMM d')} - {format(new Date(itinerary.endDate), 'MMM d, yyyy')}
                  </span>
                </div>

                {itinerary.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{itinerary.description}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    {itinerary.activities.length} activities
                  </span>
                  <span className="flex items-center gap-1">
                    <Hotel className="w-3.5 h-3.5" />
                    {itinerary.accommodations.length} stays
                  </span>
                  <span className="flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5" />
                    {itinerary.transportation.length} transports
                  </span>
                  <span>{duration} days</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={onView}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onEdit}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{itinerary.title}" and all its activities.
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
