import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Memory, MemoryFormData, MOOD_OPTIONS } from '@/types/memory';
import { X, Plus, ImagePlus, ArrowLeft, ArrowRight, Check, MapPin, Tag, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface MemoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: MemoryFormData) => void;
  initialData?: Memory;
}

const STEPS = [
  { id: 'title', label: 'Title', question: 'What would you call this memory?' },
  { id: 'date', label: 'Date', question: 'When did this happen?' },
  { id: 'content', label: 'Story', question: 'Tell us what happened or how was it? (optional)' },
  { id: 'photos', label: 'Photos', question: 'Add some photos (optional)' },
  { id: 'location', label: 'Location', question: 'Where did this take place?' },
  { id: 'extras', label: 'Extras', question: 'Any mood, tags or video to add?' },
];

const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
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

export function MemoryForm({ open, onOpenChange, onSubmit, initialData }: MemoryFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<MemoryFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    content: '',
    images: [],
    videoUrl: '',
    location: '',
    tags: [],
    mood: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          date: initialData.date,
          content: initialData.content,
          images: initialData.images,
          videoUrl: initialData.videoUrl || '',
          location: initialData.location || '',
          tags: initialData.tags || [],
          mood: initialData.mood || '',
        });
      } else {
        setFormData({
          title: '',
          date: new Date().toISOString().split('T')[0],
          content: '',
          images: [],
          videoUrl: '',
          location: '',
          tags: [],
          mood: '',
        });
      }
      setCurrentStep(0);
      setTagInput('');
    }
  }, [initialData, open]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsUploading(true);
    const newImages: string[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'Image too large', description: `${file.name} is over 10MB.`, variant: 'destructive' });
        continue;
      }
      try {
        newImages.push(await compressImage(file));
      } catch {
        toast({ title: 'Image failed', description: `Could not process ${file.name}.`, variant: 'destructive' });
      }
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    setIsUploading(false);
    e.target.value = '';
  }, [toast]);

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags?.filter(t => t !== tag) || [] }));
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'title':
        return formData.title.trim().length > 0;
      case 'date':
        return formData.date.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({ title: 'Missing required fields', description: 'Please fill in the title.', variant: 'destructive' });
      return;
    }
    onSubmit(formData);
    onOpenChange(false);
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const step = STEPS[currentStep];

  const renderStepContent = () => {
    switch (step.id) {
      case 'title':
        return (
          <div className="space-y-4">
            <Input
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="A moment to remember..."
              className="text-lg font-display h-14"
              autoFocus
            />
          </div>
        );

      case 'date':
        return (
          <div className="space-y-4">
            <Input
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="h-14 text-lg"
            />
          </div>
        );

      case 'content':
        return (
          <div className="space-y-4">
            <Textarea
              value={formData.content}
              onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write about this memory..."
              className="min-h-[180px] resize-none text-base"
              autoFocus
            />
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {formData.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt={`Upload ${i + 1}`} className="w-24 h-24 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 border-2 border-dashed border-muted-foreground/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={isUploading} />
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

      case 'location':
        return (
          <div className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Paris, France"
                className="pl-12 h-14 text-lg"
              />
            </div>
          </div>
        );

      case 'extras':
        return (
          <div className="space-y-6">
            {/* Mood */}
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">How were you feeling?</div>
              <div className="grid grid-cols-2 gap-2">
                {MOOD_OPTIONS.map(mood => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mood: prev.mood === mood.value ? '' : mood.value }))}
                    className={`px-3 py-2 rounded-lg text-left transition-all text-sm ${
                      formData.mood === mood.value 
                        ? 'ring-2 ring-primary ring-offset-1 bg-primary/10' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {mood.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                Tags
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 py-1">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Video */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Video className="w-4 h-4" />
                Video URL
              </div>
              <Input
                value={formData.videoUrl}
                onChange={e => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {/* Progress */}
        <div className="px-6 pt-6">
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{step.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-display font-medium mb-6">
                {step.question}
              </h2>
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 pt-0">
          <Button
            type="button"
            variant="ghost"
            onClick={currentStep === 0 ? () => onOpenChange(false) : handleBack}
            className="gap-2"
          >
            {currentStep === 0 ? (
              'Cancel'
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                Back
              </>
            )}
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed() || isUploading}
            className="gap-2"
          >
            {currentStep === STEPS.length - 1 ? (
              <>
                <Check className="w-4 h-4" />
                {initialData ? 'Save Changes' : 'Create Memory'}
              </>
            ) : (
              <>
                {STEPS[currentStep].id === 'content' || STEPS[currentStep].id === 'photos' || STEPS[currentStep].id === 'location' ? 'Skip' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
