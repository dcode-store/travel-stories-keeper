import { useState, useMemo } from 'react';
import { Memory } from '@/types/memory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Sparkles, Copy, Check, MapPin, Calendar, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TripSummaryProps {
  memories: Memory[];
}

export function TripSummary({ memories }: TripSummaryProps) {
  const { toast } = useToast();
  const [selectedTrip, setSelectedTrip] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Group memories by location to identify "trips"
  const trips = useMemo(() => {
    const locationGroups: Record<string, Memory[]> = {};
    
    memories.forEach(memory => {
      const location = memory.location || 'Other';
      if (!locationGroups[location]) {
        locationGroups[location] = [];
      }
      locationGroups[location].push(memory);
    });

    return Object.entries(locationGroups)
      .map(([location, mems]) => ({
        location,
        memories: mems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        startDate: mems.reduce((min, m) => m.date < min ? m.date : min, mems[0].date),
        endDate: mems.reduce((max, m) => m.date > max ? m.date : max, mems[0].date),
        photoCount: mems.reduce((sum, m) => sum + m.images.length, 0),
      }))
      .filter(trip => trip.memories.length >= 1)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [memories]);

  const selectedTripData = trips.find(t => t.location === selectedTrip);

  const handleGenerate = async () => {
    if (!selectedTripData) {
      toast({
        title: 'No trip selected',
        description: 'Please select a trip to generate a summary.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    // Placeholder for AI integration
    setTimeout(() => {
      const { location, memories: tripMemories, startDate, endDate, photoCount } = selectedTripData;
      const moods = [...new Set(tripMemories.map(m => m.mood).filter(Boolean))];
      const tags = [...new Set(tripMemories.flatMap(m => m.tags || []))];

      setSummary(
        `✨ **Trip Summary: ${location}**\n\n` +
        `**Overview:**\n` +
        `Your ${location} adventure spanned from ${format(new Date(startDate), 'MMM d')} to ${format(new Date(endDate), 'MMM d, yyyy')}. ` +
        `You captured ${tripMemories.length} memories and ${photoCount} photos during this trip.\n\n` +
        `**Highlights:**\n` +
        tripMemories.slice(0, 3).map(m => `• ${m.title}`).join('\n') + '\n\n' +
        `**Vibes:** ${moods.join(', ') || 'Various moods'}\n` +
        `**Tags:** ${tags.slice(0, 5).map(t => `#${t}`).join(' ') || 'No tags'}\n\n` +
        `*Connect AI to generate detailed, personalized trip summaries with insights and recommendations.*`
      );
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  if (memories.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Add memories to generate trip summaries</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Trip Summary Generator
          </CardTitle>
          <CardDescription>
            Select a destination to generate highlights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedTrip} onValueChange={setSelectedTrip}>
            <SelectTrigger>
              <SelectValue placeholder="Select a trip destination" />
            </SelectTrigger>
            <SelectContent>
              {trips.map(trip => (
                <SelectItem key={trip.location} value={trip.location}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{trip.location}</span>
                    <Badge variant="secondary" className="ml-2">
                      {trip.memories.length} memories
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTripData && (
            <div className="grid grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <Calendar className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-sm font-medium">
                  {format(new Date(selectedTripData.startDate), 'MMM d')} - {format(new Date(selectedTripData.endDate), 'MMM d')}
                </p>
              </div>
              <div className="text-center">
                <FileText className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Memories</p>
                <p className="text-sm font-medium">{selectedTripData.memories.length}</p>
              </div>
              <div className="text-center">
                <Image className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Photos</p>
                <p className="text-sm font-medium">{selectedTripData.photoCount}</p>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={isGenerating || !selectedTrip}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Summary
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Trip Summary</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={summary}
              readOnly
              className="min-h-[200px] resize-none bg-muted/30"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
