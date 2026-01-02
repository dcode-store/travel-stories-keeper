import { useNavigate, useSearchParams } from 'react-router-dom';
import { useItineraries } from '@/hooks/useItineraries';
import { ExpenseSummary } from '@/components/itinerary/ExpenseSummary';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Expenses() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const { getItinerary, isLoading } = useItineraries();

  const itinerary = tripId ? getItinerary(tripId) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <Button variant="ghost" onClick={() => navigate('/trips')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Trips
            </Button>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Trip not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="font-display text-lg font-medium">{itinerary.title} - Expenses</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ExpenseSummary itinerary={itinerary} showCharts />
      </main>
    </div>
  );
}
