import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Plus, Check, Trash2, Edit2, Star, 
  Filter, Globe, Sparkles, Mountain, Utensils, 
  Ticket, Compass, Building 
} from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBucketList } from '@/hooks/useBucketList';
import { useMemories } from '@/hooks/useMemories';
import { 
  BucketListItem, 
  BucketListFormData, 
  BucketListCategory,
  BucketListPriority,
  BUCKET_LIST_CATEGORIES, 
  BUCKET_LIST_PRIORITIES 
} from '@/types/bucketlist';
import { cn } from '@/lib/utils';

const CATEGORY_ICONS: Record<BucketListCategory, React.ReactNode> = {
  country: <Globe className="w-4 h-4" />,
  city: <Building className="w-4 h-4" />,
  experience: <Sparkles className="w-4 h-4" />,
  landmark: <MapPin className="w-4 h-4" />,
  nature: <Mountain className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  culture: <Ticket className="w-4 h-4" />,
  adventure: <Compass className="w-4 h-4" />,
};

interface BucketListFormProps {
  initialData?: BucketListItem;
  onSubmit: (data: BucketListFormData) => void;
  onClose: () => void;
}

function BucketListForm({ initialData, onSubmit, onClose }: BucketListFormProps) {
  const [formData, setFormData] = useState<BucketListFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    category: initialData?.category || 'city',
    priority: initialData?.priority || 'want-to-visit',
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Visit the Eiffel Tower"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          placeholder="e.g., Paris, France"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as BucketListCategory }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUCKET_LIST_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v as BucketListPriority }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUCKET_LIST_PRIORITIES.map((pri) => (
                <SelectItem key={pri.value} value={pri.value}>
                  {pri.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Why do you want to visit?"
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? 'Update' : 'Add to Bucket List'}
        </Button>
      </div>
    </form>
  );
}

export default function BucketList() {
  const { memories } = useMemories();
  const {
    items,
    isLoading,
    stats,
    addItem,
    updateItem,
    deleteItem,
    completeItem,
    uncompleteItem,
  } = useBucketList(memories);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<BucketListCategory | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  const handleSubmit = (data: BucketListFormData) => {
    if (editingItem) {
      updateItem(editingItem.id, data);
      setEditingItem(null);
    } else {
      addItem(data);
    }
  };

  const handleEdit = (item: BucketListItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const filteredItems = items.filter(item => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const getCategoryInfo = (category: BucketListCategory) => {
    return BUCKET_LIST_CATEGORIES.find(c => c.value === category);
  };

  const getPriorityInfo = (priority: BucketListPriority) => {
    return BUCKET_LIST_PRIORITIES.find(p => p.value === priority);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="pt-20 flex items-center justify-center h-[80vh]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="font-serif text-4xl font-medium">Bucket List</h1>
              <p className="text-muted-foreground mt-1">Places you dream of visiting</p>
            </div>
            
            <Dialog open={isFormOpen} onOpenChange={(open) => {
              setIsFormOpen(open);
              if (!open) setEditingItem(null);
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Dream
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">
                    {editingItem ? 'Edit Bucket List Item' : 'Add to Bucket List'}
                  </DialogTitle>
                </DialogHeader>
                <BucketListForm
                  initialData={editingItem || undefined}
                  onSubmit={handleSubmit}
                  onClose={() => {
                    setIsFormOpen(false);
                    setEditingItem(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Stats */}
          {stats.total > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary" />
                        <span className="font-medium">Progress</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {stats.completed} of {stats.total} completed
                      </span>
                    </div>
                    <Progress value={stats.completionRate} className="h-3" />
                    <div className="flex gap-2 flex-wrap">
                      {BUCKET_LIST_PRIORITIES.map(pri => {
                        const count = stats.byPriority[pri.value] || 0;
                        if (count === 0) return null;
                        return (
                          <Badge key={pri.value} variant="secondary" className="text-xs">
                            {pri.label}: {count}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap gap-3"
          >
            <Select 
              value={filterCategory} 
              onValueChange={(v) => setFilterCategory(v as BucketListCategory | 'all')}
            >
              <SelectTrigger className="w-[160px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {BUCKET_LIST_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filterStatus} 
              onValueChange={(v) => setFilterStatus(v as 'all' | 'pending' | 'completed')}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-16"
            >
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-serif text-xl mb-2">
                {stats.total === 0 ? 'Start Dreaming!' : 'No matches found'}
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {stats.total === 0 
                  ? 'Add places you dream of visiting. Track your progress as you explore the world!'
                  : 'Try adjusting your filters to see more items.'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredItems.map((item, index) => {
                  const categoryInfo = getCategoryInfo(item.category);
                  const priorityInfo = getPriorityInfo(item.priority);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={cn(
                        "transition-all",
                        item.status === 'completed' && "opacity-70"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <button
                              onClick={() => item.status === 'completed' 
                                ? uncompleteItem(item.id) 
                                : completeItem(item.id)
                              }
                              className={cn(
                                "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                item.status === 'completed'
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/30 hover:border-primary"
                              )}
                            >
                              {item.status === 'completed' && <Check className="w-4 h-4" />}
                            </button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className={cn(
                                    "font-medium",
                                    item.status === 'completed' && "line-through text-muted-foreground"
                                  )}>
                                    {item.name}
                                  </h3>
                                  {item.location && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                                      <MapPin className="w-3 h-3" />
                                      {item.location}
                                    </p>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEdit(item)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => deleteItem(item.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              {item.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {item.description}
                                </p>
                              )}

                              <div className="flex items-center gap-2 mt-3 flex-wrap">
                                <Badge variant="secondary" className="gap-1">
                                  {CATEGORY_ICONS[item.category]}
                                  {categoryInfo?.label}
                                </Badge>
                                <Badge 
                                  variant="outline"
                                  style={{ 
                                    borderColor: priorityInfo?.color,
                                    color: priorityInfo?.color 
                                  }}
                                >
                                  {priorityInfo?.label}
                                </Badge>
                                {item.status === 'completed' && item.completedDate && (
                                  <Badge variant="default" className="bg-green-600">
                                    Completed {item.completedDate}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
