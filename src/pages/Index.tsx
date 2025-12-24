import { useState } from 'react';
import { useMemories } from '@/hooks/useMemories';
import { AppHeader } from '@/components/AppHeader';
import { Timeline } from '@/components/Timeline';
import { MemoryForm } from '@/components/MemoryForm';
import { Memory, MemoryFormData } from '@/types/memory';
import { exportToPDF } from '@/lib/exportPDF';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, FileDown, BookOpen } from 'lucide-react';

const Index = () => {
  const { memories, isLoading, addMemory, updateMemory, deleteMemory } = useMemories();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | undefined>();

  const handleAddMemory = () => {
    setEditingMemory(undefined);
    setIsFormOpen(true);
  };

  const handleEditMemory = (memory: Memory) => {
    setEditingMemory(memory);
    setIsFormOpen(true);
  };

  const handleSubmitMemory = (data: MemoryFormData) => {
    if (editingMemory) {
      updateMemory(editingMemory.id, data);
      toast({
        title: 'Memory updated',
        description: 'Your memory has been saved.',
      });
    } else {
      addMemory(data);
      toast({
        title: 'Memory added',
        description: 'A new memory has been added to your timeline.',
      });
    }
  };

  const handleDeleteMemory = (id: string) => {
    deleteMemory(id);
    toast({
      title: 'Memory deleted',
      description: 'The memory has been removed from your timeline.',
    });
  };

  const handleExport = async () => {
    if (memories.length === 0) {
      toast({
        title: 'No memories to export',
        description: 'Add some memories first before exporting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await exportToPDF(memories);
      toast({
        title: 'Export ready',
        description: 'Your memory lane is ready to print or save as PDF.',
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export memories.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-medium">My Memories</h1>
              <p className="text-muted-foreground mt-1">
                {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {memories.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <FileDown className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              )}
              <Button onClick={handleAddMemory} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">New Memory</span>
              </Button>
            </div>
          </div>

          {memories.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl mb-2">No memories yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start capturing your special moments. Add your first memory to begin your journey.
              </p>
              <Button onClick={handleAddMemory}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Memory
              </Button>
            </div>
          ) : (
            <Timeline 
              memories={memories}
              onEdit={handleEditMemory}
              onDelete={handleDeleteMemory}
            />
          )}
        </div>
      </main>

      <MemoryForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmitMemory}
        initialData={editingMemory}
      />
    </div>
  );
};

export default Index;
