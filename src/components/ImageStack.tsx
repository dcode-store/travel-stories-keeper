import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageStackProps {
  images: string[];
  isActive: boolean;
}

export function ImageStack({ images, isActive }: ImageStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  if (images.length === 0) return null;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Show stacked preview when not active
  if (!isActive) {
    return (
      <div className="image-stack h-32 w-full relative">
        {images.slice(0, 3).map((image, index) => (
          <div
            key={index}
            className="image-stack-item"
            style={{
              transform: `rotate(${(index - 1) * 3}deg) translateY(${index * 2}px)`,
              zIndex: images.length - index,
            }}
          >
            <img
              src={image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {images.length > 3 && (
          <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-muted-foreground">
            +{images.length - 3} more
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Main image display */}
      <div className="relative rounded-lg overflow-hidden bg-muted aspect-video group">
        <img
          src={images[currentIndex]}
          alt=""
          className="w-full h-full object-cover transition-transform duration-300"
        />
        
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToPrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Expand button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsExpanded(true)}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        {/* Dots indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                className={`
                  w-2 h-2 rounded-full transition-all
                  ${index === currentIndex 
                    ? 'bg-primary-foreground w-4' 
                    : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'
                  }
                `}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={`
                flex-shrink-0 w-16 h-12 rounded-md overflow-hidden transition-all
                ${index === currentIndex 
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' 
                  : 'opacity-60 hover:opacity-100'
                }
              `}
              onClick={() => setCurrentIndex(index)}
            >
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen dialog */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-4xl p-0 border-0 bg-transparent">
          <div className="relative">
            <img
              src={images[currentIndex]}
              alt=""
              className="w-full max-h-[85vh] object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-10 w-10 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsExpanded(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-sm"
                  onClick={goToPrev}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-sm"
                  onClick={goToNext}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
