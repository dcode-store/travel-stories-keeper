import { useMemo } from 'react';
import { Memory, MOOD_OPTIONS } from '@/types/memory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, TrendingUp, Heart, Tag } from 'lucide-react';

interface TravelAnalyticsProps {
  memories: Memory[];
}

export function TravelAnalytics({ memories }: TravelAnalyticsProps) {
  const analytics = useMemo(() => {
    if (memories.length === 0) return null;

    // Destination analysis
    const locationCounts: Record<string, number> = {};
    memories.forEach(m => {
      if (m.location) {
        locationCounts[m.location] = (locationCounts[m.location] || 0) + 1;
      }
    });
    const topDestinations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Mood analysis
    const moodCounts: Record<string, number> = {};
    memories.forEach(m => {
      if (m.mood) {
        moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
      }
    });
    const topMoods = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Seasonal trends
    const monthCounts: Record<string, number> = {};
    memories.forEach(m => {
      const month = new Date(m.date).toLocaleString('en-US', { month: 'long' });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    const peakMonths = Object.entries(monthCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Tag analysis
    const tagCounts: Record<string, number> = {};
    memories.forEach(m => {
      m.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Year distribution
    const yearCounts: Record<string, number> = {};
    memories.forEach(m => {
      const year = new Date(m.date).getFullYear().toString();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    // Average memories per month
    const dates = memories.map(m => new Date(m.date).getTime());
    const firstDate = new Date(Math.min(...dates));
    const lastDate = new Date(Math.max(...dates));
    const monthsDiff = (lastDate.getFullYear() - firstDate.getFullYear()) * 12 + 
                       (lastDate.getMonth() - firstDate.getMonth()) + 1;
    const avgPerMonth = (memories.length / monthsDiff).toFixed(1);

    return {
      totalMemories: memories.length,
      totalLocations: Object.keys(locationCounts).length,
      topDestinations,
      topMoods,
      peakMonths,
      topTags,
      yearCounts,
      avgPerMonth,
      memoriesWithPhotos: memories.filter(m => m.images.length > 0).length,
    };
  }, [memories]);

  if (!analytics) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Add memories to see your travel analytics</p>
        </CardContent>
      </Card>
    );
  }

  const getMoodLabel = (moodValue: string) => {
    return MOOD_OPTIONS.find(m => m.value === moodValue)?.label || moodValue;
  };

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{analytics.totalMemories}</div>
            <p className="text-xs text-muted-foreground">Total Memories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{analytics.totalLocations}</div>
            <p className="text-xs text-muted-foreground">Places Visited</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{analytics.avgPerMonth}</div>
            <p className="text-xs text-muted-foreground">Avg per Month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{analytics.memoriesWithPhotos}</div>
            <p className="text-xs text-muted-foreground">With Photos</p>
          </CardContent>
        </Card>
      </div>

      {/* Favorite Destinations */}
      {analytics.topDestinations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Favorite Destinations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.topDestinations.map(([location, count], i) => (
                <div key={location} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">#{i + 1}</span>
                    <span>{location}</span>
                  </span>
                  <Badge variant="secondary">{count} {count === 1 ? 'memory' : 'memories'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Patterns */}
      {analytics.topMoods.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Common Moods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.topMoods.map(([mood, count]) => (
                <Badge key={mood} variant="outline" className="text-sm">
                  {getMoodLabel(mood)} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Peak Travel Months */}
      {analytics.peakMonths.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Peak Travel Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.peakMonths.map(([month, count]) => (
                <Badge key={month} variant="secondary">
                  {month} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Tags */}
      {analytics.topTags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Popular Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.topTags.map(([tag, count]) => (
                <Badge key={tag} variant="outline">
                  #{tag} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
