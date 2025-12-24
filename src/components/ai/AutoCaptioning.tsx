import { useState } from 'react';
import { Memory } from '@/types/memory';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AutoCaptioningProps {
  memories: Memory[];
  onUpdateMemory?: (id: string, data: Partial<Memory>) => void;
}

interface CaptionResult {
  memoryId: string;
  imageIndex: number;
  caption: string;
  applied: boolean;
}

export function AutoCaptioning({ memories, onUpdateMemory }: AutoCaptioningProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [captions, setCaptions] = useState<CaptionResult[]>([]);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const memoriesWithImages = memories.filter(m => m.images.length > 0);
  const totalImages = memoriesWithImages.reduce((sum, m) => sum + m.images.length, 0);

  const handleAnalyze = async () => {
    if (totalImages === 0) {
      toast({
        title: 'No images found',
        description: 'Add photos to your memories to use auto-captioning.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setCaptions([]);

    // Placeholder for AI integration - simulate caption generation
    setTimeout(() => {
      const generatedCaptions: CaptionResult[] = [];
      
      memoriesWithImages.slice(0, 5).forEach(memory => {
        memory.images.slice(0, 2).forEach((_, imgIndex) => {
          generatedCaptions.push({
            memoryId: memory.id,
            imageIndex: imgIndex,
            caption: `✨ AI-generated caption for "${memory.title}" photo ${imgIndex + 1}. Connect AI to get real descriptions based on image content.`,
            applied: false,
          });
        });
      });

      setCaptions(generatedCaptions);
      setIsAnalyzing(false);
      
      toast({
        title: 'Analysis complete',
        description: `Generated ${generatedCaptions.length} caption suggestions. Connect AI for real image analysis.`,
      });
    }, 2000);
  };

  const handleEditCaption = (key: string, value: string) => {
    setEditingCaption(key);
    setEditValue(value);
  };

  const handleSaveEdit = (memoryId: string, imageIndex: number) => {
    setCaptions(prev =>
      prev.map(c =>
        c.memoryId === memoryId && c.imageIndex === imageIndex
          ? { ...c, caption: editValue }
          : c
      )
    );
    setEditingCaption(null);
    setEditValue('');
  };

  const handleApplyCaption = (caption: CaptionResult) => {
    // In a real implementation, this would update the memory
    setCaptions(prev =>
      prev.map(c =>
        c.memoryId === caption.memoryId && c.imageIndex === caption.imageIndex
          ? { ...c, applied: true }
          : c
      )
    );
    toast({
      title: 'Caption applied',
      description: 'The caption has been saved (demo mode - connect AI for full functionality).',
    });
  };

  const getMemoryForCaption = (caption: CaptionResult) => {
    return memories.find(m => m.id === caption.memoryId);
  };

  if (memories.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Add memories with photos to use auto-captioning</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Auto-Captioning
          </CardTitle>
          <CardDescription>
            Generate descriptions for your photos using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium">{totalImages} photos</p>
              <p className="text-sm text-muted-foreground">
                Across {memoriesWithImages.length} memories
              </p>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || totalImages === 0}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Photos
                </>
              )}
            </Button>
          </div>

          {captions.length === 0 && !isAnalyzing && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Click "Analyze Photos" to generate captions</p>
            </div>
          )}
        </CardContent>
      </Card>

      {captions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Generated Captions</CardTitle>
            <CardDescription>
              Review and apply captions to your photos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {captions.map((caption, idx) => {
                  const memory = getMemoryForCaption(caption);
                  if (!memory) return null;
                  
                  const captionKey = `${caption.memoryId}-${caption.imageIndex}`;
                  const isEditing = editingCaption === captionKey;

                  return (
                    <div
                      key={captionKey}
                      className="flex gap-4 p-4 border rounded-lg"
                    >
                      <img
                        src={memory.images[caption.imageIndex]}
                        alt=""
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{memory.title}</span>
                          <Badge variant="secondary" className="text-xs">
                            Photo {caption.imageIndex + 1}
                          </Badge>
                          {caption.applied && (
                            <Badge variant="default" className="text-xs">
                              <Check className="w-3 h-3 mr-1" />
                              Applied
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(memory.date), 'MMM d, yyyy')}
                        </p>
                        
                        {isEditing ? (
                          <div className="flex gap-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(caption.memoryId, caption.imageIndex)}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">{caption.caption}</p>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditCaption(captionKey, caption.caption)}
                              >
                                Edit
                              </Button>
                              {!caption.applied && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApplyCaption(caption)}
                                >
                                  Apply
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
