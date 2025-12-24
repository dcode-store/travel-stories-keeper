import { Memory } from '@/types/memory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TravelAnalytics } from './TravelAnalytics';
import { StoryGenerator } from './StoryGenerator';
import { TripSummary } from './TripSummary';
import { AutoCaptioning } from './AutoCaptioning';
import { TrendingUp, BookOpen, FileText, ImageIcon } from 'lucide-react';

interface MemoryAIPanelProps {
  memories: Memory[];
  onUpdateMemory?: (id: string, data: Partial<Memory>) => void;
}

export function MemoryAIPanel({ memories, onUpdateMemory }: MemoryAIPanelProps) {
  return (
    <Tabs defaultValue="analytics" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="analytics" className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4" />
          <span className="hidden sm:inline">Analytics</span>
        </TabsTrigger>
        <TabsTrigger value="stories" className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">Stories</span>
        </TabsTrigger>
        <TabsTrigger value="summaries" className="flex items-center gap-1.5">
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Summaries</span>
        </TabsTrigger>
        <TabsTrigger value="captions" className="flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Captions</span>
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="analytics" className="mt-0">
          <TravelAnalytics memories={memories} />
        </TabsContent>

        <TabsContent value="stories" className="mt-0">
          <StoryGenerator memories={memories} />
        </TabsContent>

        <TabsContent value="summaries" className="mt-0">
          <TripSummary memories={memories} />
        </TabsContent>

        <TabsContent value="captions" className="mt-0">
          <AutoCaptioning memories={memories} onUpdateMemory={onUpdateMemory} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
