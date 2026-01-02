import { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ImagePlus, Bold, Italic, List, Quote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inlineImages: string[];
  onAddInlineImage: (image: string) => void;
}

const compressImage = (file: File, maxWidth: number = 600, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder,
  inlineImages,
  onAddInlineImage 
}: RichTextEditorProps) {
  const { toast } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ 
          title: 'Image too large', 
          description: `${file.name} is over 10MB.`, 
          variant: 'destructive' 
        });
        continue;
      }
      try {
        const compressed = await compressImage(file);
        onAddInlineImage(compressed);
      } catch {
        toast({ 
          title: 'Image failed', 
          description: `Could not process ${file.name}.`, 
          variant: 'destructive' 
        });
      }
    }
    e.target.value = '';
  }, [toast, onAddInlineImage]);

  const applyFormat = (format: 'bold' | 'italic' | 'list' | 'quote') => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectedText = selection.toString();
    if (!selectedText) return;

    let formattedText = selectedText;
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `_${selectedText}_`;
        break;
      case 'list':
        formattedText = selectedText.split('\n').map(line => `• ${line}`).join('\n');
        break;
      case 'quote':
        formattedText = selectedText.split('\n').map(line => `> ${line}`).join('\n');
        break;
    }

    // Replace selected text in the value
    const start = value.indexOf(selectedText);
    if (start !== -1) {
      const newValue = value.substring(0, start) + formattedText + value.substring(start + selectedText.length);
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-3">
      {/* Formatting toolbar */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('list')}
          title="List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormat('quote')}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 gap-1"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className="w-4 h-4" />
          <span className="text-xs">Add Photo</span>
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Text area */}
      <textarea
        ref={editorRef as any}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[280px] p-4 bg-background border border-input rounded-xl resize-y text-base focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />

      {/* Inline images preview */}
      {inlineImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Attached photos:</p>
          <div className="flex flex-wrap gap-2">
            {inlineImages.map((img, index) => (
              <div key={index} className="relative group">
                <img 
                  src={img} 
                  alt={`Inline ${index + 1}`} 
                  className="w-16 h-16 object-cover rounded-lg border border-border"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
