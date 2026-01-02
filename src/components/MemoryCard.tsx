import { useState } from 'react';
import { Memory } from '@/types/memory';
import { ImageStack } from './ImageStack';
import { SimpleMarkdown } from './SimpleMarkdown';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Calendar, Play, Pause, Volume2, VolumeX, Share2 } from 'lucide-react';
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

interface MemoryCardProps {
  memory: Memory;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onShare?: () => void;
  onClick?: () => void;
}

export function MemoryCard({ memory, isActive, onEdit, onDelete, onShare, onClick }: MemoryCardProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const formattedDate = new Date(memory.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleCardClick = () => {
    if (!isActive && onClick) {
      onClick();
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`
        group memory-card p-6 md:p-8 border-0 shadow-lg bg-card/80 backdrop-blur-sm
        transition-all duration-500 ease-out min-h-[180px]
        ${isActive 
          ? 'memory-card-expanded shadow-xl ring-1 ring-primary/10' 
          : 'memory-card-collapsed hover:opacity-80 cursor-pointer'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className={`
            font-serif transition-all duration-300
            ${isActive ? 'text-2xl md:text-3xl' : 'text-xl'}
          `}>
            {memory.title}
          </h2>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
        
        {/* Actions - show on hover or when active */}
        <div className={`flex items-center gap-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            {onShare && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onShare}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Memory</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{memory.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>

      {/* Content - only fully visible when active */}
      <div className={`
        transition-all duration-500 overflow-hidden
        ${isActive ? 'max-h-[2000px] opacity-100' : 'max-h-24 opacity-70'}
      `}>
        {/* Images */}
        {memory.images.length > 0 && (
          <div className="mb-6">
            <ImageStack images={memory.images} isActive={isActive} />
          </div>
        )}

        {/* Video */}
        {memory.videoUrl && isActive && (
          <div className="mb-6 relative rounded-lg overflow-hidden bg-muted">
            <video
              src={memory.videoUrl}
              className="w-full max-h-80 object-cover"
              muted={isVideoMuted}
              loop
              playsInline
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              ref={(el) => {
                if (el) {
                  isVideoPlaying ? el.play() : el.pause();
                }
              }}
            />
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              >
                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-background/80 backdrop-blur-sm"
                onClick={() => setIsVideoMuted(!isVideoMuted)}
              >
                {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Journal content */}
        <div className={isActive ? '' : 'line-clamp-3'}>
          <SimpleMarkdown content={memory.content} />
        </div>
      </div>
    </Card>
  );
}
