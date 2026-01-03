import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MapPin, BarChart3, Plus, Check, Trash2, RefreshCw } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import WorldMap from '@/components/WorldMap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useVisitedPlaces } from '@/hooks/useVisitedPlaces';
import { useMemories } from '@/hooks/useMemories';
import { CONTINENT_MAP, COUNTRY_CODE_TO_NAME } from '@/types/places';
import { cn } from '@/lib/utils';

export default function TravelMap() {
  const { memories } = useMemories();
  const {
    visitedPlaces,
    isLoading,
    stats,
    visitedCountryCodes,
    syncFromMemories,
    togglePlace,
    removePlace,
  } = useVisitedPlaces(memories);

  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);

  // Sync from memories on mount
  useEffect(() => {
    if (memories.length > 0) {
      syncFromMemories();
    }
  }, [memories.length, syncFromMemories]);

  const handleCountryClick = (countryCode: string, countryName: string) => {
    togglePlace(countryCode, countryName);
  };

  const continents = Object.entries(stats.continentBreakdown).sort((a, b) => b[1] - a[1]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="pt-20 flex items-center justify-center h-[80vh]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h1 className="font-serif text-4xl font-medium">Your Travel Map</h1>
            <p className="text-muted-foreground">
              Click on countries to mark them as visited
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-semibold">{stats.totalCountries}</p>
                    <p className="text-sm text-muted-foreground">Countries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-semibold">{stats.percentageOfWorld}%</p>
                    <p className="text-sm text-muted-foreground">of World</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-semibold">{stats.totalMemoriesWithLocation}</p>
                    <p className="text-sm text-muted-foreground">Memories</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-serif font-semibold">{Object.keys(stats.continentBreakdown).length}</p>
                    <p className="text-sm text-muted-foreground">Continents</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* World Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium">World Exploration Progress</p>
                    <p className="text-sm text-muted-foreground">{stats.totalCountries} of 195 countries</p>
                  </div>
                  <Progress value={stats.percentageOfWorld} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-serif">Interactive World Map</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncFromMemories}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sync from Memories
                </Button>
              </CardHeader>
              <CardContent>
                <WorldMap
                  visitedCountries={visitedCountryCodes}
                  onCountryClick={handleCountryClick}
                  interactive={true}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Continent Breakdown */}
          {continents.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Continents Explored</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {continents.map(([continent, count]) => (
                      <Badge
                        key={continent}
                        variant={selectedContinent === continent ? 'default' : 'secondary'}
                        className="cursor-pointer text-sm py-1.5 px-3"
                        onClick={() => setSelectedContinent(
                          selectedContinent === continent ? null : continent
                        )}
                      >
                        {continent}: {count} {count === 1 ? 'country' : 'countries'}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Visited Countries List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">
                  Visited Countries
                  {selectedContinent && (
                    <span className="text-muted-foreground font-normal text-base ml-2">
                      in {selectedContinent}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visitedPlaces.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No countries marked yet.</p>
                    <p className="text-sm mt-1">Click on the map above to mark your visited countries!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    <AnimatePresence>
                      {visitedPlaces
                        .filter(place => 
                          !selectedContinent || 
                          CONTINENT_MAP[place.countryCode] === selectedContinent
                        )
                        .map((place) => (
                          <motion.div
                            key={place.countryCode}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={cn(
                              "group relative p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
                              place.manuallyAdded ? "border-dashed" : "border-solid"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-primary shrink-0" />
                              <span className="text-sm font-medium truncate">
                                {place.countryName}
                              </span>
                            </div>
                            {place.memoryIds.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {place.memoryIds.length} {place.memoryIds.length === 1 ? 'memory' : 'memories'}
                              </p>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removePlace(place.countryCode);
                              }}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </button>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
