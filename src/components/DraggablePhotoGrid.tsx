import { useState, useCallback } from 'react';
import { X, GripVertical, ImagePlus } from 'lucide-react';

interface DraggablePhotoGridProps {
  images: string[];
  onReorder: (images: string[]) => void;
  onRemove: (index: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
}

export function DraggablePhotoGrid({ 
  images, 
  onReorder, 
  onRemove, 
  onUpload, 
  isUploading 
}: DraggablePhotoGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Add a slight delay to allow the drag image to be captured
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5';
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (dragIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newImages = [...images];
    const [draggedItem] = newImages.splice(dragIndex, 1);
    newImages.splice(dropIndex, 0, draggedItem);
    
    onReorder(newImages);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [images, onReorder]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Drag photos to reorder them
      </p>
      <div className="flex flex-wrap gap-3">
        {images.map((img, index) => (
          <div
            key={`${img.slice(0, 50)}-${index}`}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              relative group cursor-grab active:cursor-grabbing
              transition-all duration-200
              ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
              ${dragOverIndex === index ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''}
            `}
          >
            {/* Drag handle indicator */}
            <div className="absolute top-1 left-1 z-10 bg-background/80 backdrop-blur-sm rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </div>
            
            {/* Image */}
            <img 
              src={img} 
              alt={`Photo ${index + 1}`} 
              className="w-24 h-24 object-cover rounded-xl border border-border"
              draggable={false}
            />
            
            {/* Order badge */}
            <div className="absolute bottom-1 left-1 bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {index + 1}
            </div>
            
            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {/* Upload button */}
        <label className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            onChange={onUpload} 
            className="hidden" 
            disabled={isUploading} 
          />
          {isUploading ? (
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Add</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
