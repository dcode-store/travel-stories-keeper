import { useState } from 'react';
import { Memory } from '@/types/memory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles, Copy, Check, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface StoryGeneratorProps {
  memories: Memory[];
}

export function StoryGenerator({ memories }: StoryGeneratorProps) {
  const { toast } = useToast();
  const [selectedMemories, setSelectedMemories] = useState<string[]>([]);
  const [generatedStory, setGeneratedStory] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleMemory = (id: string) => {
    setSelectedMemories(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedMemories.length === memories.length) {
      setSelectedMemories([]);
    } else {
      setSelectedMemories(memories.map(m => m.id));
    }
  };

  const handleGenerate = async () => {
    if (selectedMemories.length === 0) {
      toast({
        title: 'No memories selected',
        description: 'Please select at least one memory to generate a story.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    // Placeholder for AI integration
    // When AI is connected, this will call the edge function
    setTimeout(() => {
      const selected = memories.filter(m => selectedMemories.includes(m.id));
      const locations = [...new Set(selected.map(m => m.location).filter(Boolean))];
      const dateRange = selected.length > 0 
        ? `${format(new Date(selected[selected.length - 1].date), 'MMM yyyy')} - ${format(new Date(selected[0].date), 'MMM yyyy')}`
        : '';

      setGeneratedStory(
        `✨ **AI Story Generation Ready**\n\n` +
        `This feature will create a beautiful travel narrative from your ${selected.length} selected memories.\n\n` +
        `**Selected journey:**\n` +
        `- 📍 Destinations: ${locations.join(', ') || 'Various places'}\n` +
        `- 📅 Period: ${dateRange}\n` +
        `- 📝 Stories: ${selected.length} memories\n\n` +
        `*Connect AI (via Cloud or API key) to generate personalized travel narratives that weave your memories into a compelling story.*`
      );
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedStory);
    setCopied(true);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  if (memories.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Add memories to generate travel stories</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Select Memories for Story
          </CardTitle>
          <CardDescription>
            Choose memories to weave into a travel narrative
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedMemories.length === memories.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Badge variant="secondary">
              {selectedMemories.length} of {memories.length} selected
            </Badge>
          </div>
          
          <ScrollArea className="h-[250px] border rounded-md p-4">
            <div className="space-y-3">
              {memories.map(memory => (
                <div
                  key={memory.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleMemory(memory.id)}
                >
                  <Checkbox
                    checked={selectedMemories.includes(memory.id)}
                    onCheckedChange={() => toggleMemory(memory.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{memory.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(memory.date), 'MMM d, yyyy')}
                      {memory.location && ` • ${memory.location}`}
                    </p>
                  </div>
                  {memory.images.length > 0 && (
                    <img
                      src={memory.images[0]}
                      alt=""
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <Button
            className="w-full mt-4"
            onClick={handleGenerate}
            disabled={isGenerating || selectedMemories.length === 0}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Story
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedStory && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Your Travel Story
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedStory}
              readOnly
              className="min-h-[200px] resize-none bg-muted/30"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
