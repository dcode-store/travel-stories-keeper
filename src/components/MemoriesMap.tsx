import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Memory } from '@/types/memory';
import { Card } from '@/components/ui/card';
import { MapPin, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface MemoriesMapProps {
  memories: Memory[];
  onSelectMemory?: (memory: Memory) => void;
}

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Simple geocoding using Mapbox Geocoding API
async function geocodeLocation(location: string, accessToken: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${accessToken}&limit=1`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].center as [number, number];
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  return null;
}

export function MemoriesMap({ memories, onSelectMemory }: MemoriesMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const memoriesWithLocation = memories.filter(m => m.location && m.location.trim());

  const initializeMap = async () => {
    if (!mapContainer.current || !mapboxToken) return;

    setIsLoading(true);

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        zoom: 2,
        center: [0, 20],
        pitch: 0,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      map.current.on('load', async () => {
        // Geocode all memory locations and add markers
        for (const memory of memoriesWithLocation) {
          const coords = await geocodeLocation(memory.location!, mapboxToken);
          if (coords) {
            // Create custom marker element
            const el = document.createElement('div');
            el.className = 'memory-marker';
            el.innerHTML = `
              <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform border-2 border-white">
                <svg class="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            `;
            
            el.addEventListener('click', () => {
              setSelectedMemory(memory);
              onSelectMemory?.(memory);
            });

            const marker = new mapboxgl.Marker(el)
              .setLngLat(coords)
              .addTo(map.current!);
            
            markersRef.current.push(marker);
          }
        }

        // Fit bounds to show all markers
        if (markersRef.current.length > 0) {
          const bounds = new mapboxgl.LngLatBounds();
          markersRef.current.forEach(marker => {
            bounds.extend(marker.getLngLat());
          });
          map.current?.fitBounds(bounds, { padding: 50, maxZoom: 10 });
        }

        setIsLoading(false);
      });
    } catch (error) {
      console.error('Map initialization error:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      map.current?.remove();
    };
  }, [memories]);

  if (!mapboxToken) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="font-display text-lg font-medium">Mapbox Token Required</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please add your Mapbox public token to the <code className="bg-muted px-1 rounded">VITE_MAPBOX_TOKEN</code> environment variable.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (memoriesWithLocation.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
          <MapPin className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="font-display text-lg font-medium">No locations yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add locations to your memories to see them on the map.
        </p>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-border">
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Selected memory popup */}
      {selectedMemory && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80">
          <Card className="p-4 shadow-lg">
            <button
              onClick={() => setSelectedMemory(null)}
              className="absolute top-2 right-2 p-1 hover:bg-muted rounded"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex gap-3">
              {selectedMemory.images[0] && (
                <img
                  src={selectedMemory.images[0]}
                  alt={selectedMemory.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-display font-medium truncate">{selectedMemory.title}</h4>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedMemory.date), 'MMM d, yyyy')}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{selectedMemory.location}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-muted-foreground">
        {memoriesWithLocation.length} location{memoriesWithLocation.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
