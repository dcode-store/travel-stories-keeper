import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Memory } from '@/types/memory';
import { 
  Share2, 
  FileDown, 
  Instagram, 
  LayoutGrid, 
  Film,
  Sparkles,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF } from '@/lib/exportPDF';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memories: Memory[];
  selectedMemory?: Memory;
}

interface ShareOption {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  isPremium?: boolean;
  action: () => void;
}

export function ShareDialog({ open, onOpenChange, memories, selectedMemory }: ShareDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleExportPDF = async () => {
    setIsLoading('export');
    try {
      const toExport = selectedMemory ? [selectedMemory] : memories;
      await exportToPDF(toExport);
      toast({
        title: 'Export ready',
        description: 'Your memories are ready to print or save as PDF.',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleSharePreview = () => {
    // For now, just copy a shareable link placeholder
    toast({
      title: 'Coming soon',
      description: 'Shareable preview links will be available soon.',
    });
  };

  const handleInstagramPost = () => {
    toast({
      title: 'Premium Feature',
      description: 'Instagram post creation is a premium feature coming soon.',
    });
  };

  const handleInstaStory = () => {
    toast({
      title: 'Premium Feature',
      description: 'AI-powered Instagram story creation is coming soon.',
    });
  };

  const handleReelTikTok = () => {
    toast({
      title: 'Premium Feature',
      description: 'AI-powered video creation is coming soon.',
    });
  };

  const shareOptions: ShareOption[] = [
    {
      id: 'preview',
      icon: <Share2 className="w-5 h-5" />,
      title: 'Share as Preview',
      description: 'Create a shareable link to your memories',
      action: handleSharePreview,
    },
    {
      id: 'export',
      icon: <FileDown className="w-5 h-5" />,
      title: 'Export as PDF',
      description: 'Download your memories as a printable document',
      action: handleExportPDF,
    },
    {
      id: 'instagram-post',
      icon: <Instagram className="w-5 h-5" />,
      title: 'Instagram Post',
      description: 'Format your memory for Instagram feed',
      isPremium: true,
      action: handleInstagramPost,
    },
    {
      id: 'insta-story',
      icon: <LayoutGrid className="w-5 h-5" />,
      title: 'Instagram Story',
      description: 'Create a collage or use AI templates',
      isPremium: true,
      action: handleInstaStory,
    },
    {
      id: 'reel-tiktok',
      icon: <Film className="w-5 h-5" />,
      title: 'Reel / TikTok Video',
      description: 'Generate a short video with AI',
      isPremium: true,
      action: handleReelTikTok,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Share Memories
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedMemory 
              ? `Sharing: ${selectedMemory.title}`
              : `Sharing ${memories.length} ${memories.length === 1 ? 'memory' : 'memories'}`
            }
          </p>
        </DialogHeader>

        <div className="px-4 pb-6 space-y-2">
          {shareOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              disabled={isLoading === option.id}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-border transition-all text-left group"
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                ${option.isPremium 
                  ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-600' 
                  : 'bg-primary/10 text-primary'
                }
              `}>
                {option.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{option.title}</span>
                  {option.isPremium && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 text-xs font-medium">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{option.description}</p>
              </div>

              {option.isPremium ? (
                <Lock className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
              )}
            </button>
          ))}
        </div>

        <div className="px-6 py-4 bg-muted/30 border-t">
          <p className="text-xs text-muted-foreground text-center">
            <Sparkles className="w-3 h-3 inline mr-1" />
            AI-powered features are coming soon as premium options
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
