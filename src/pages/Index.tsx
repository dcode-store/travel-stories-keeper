import { useState, useEffect } from 'react';
import { useMemories } from '@/hooks/useMemories';
import { Header } from '@/components/Header';
import { Timeline } from '@/components/Timeline';
import { MemoryForm } from '@/components/MemoryForm';
import { Memory, MemoryFormData } from '@/types/memory';
import { exportToPDF } from '@/lib/exportPDF';
import { useToast } from '@/hooks/use-toast';

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
      <Header 
        onAddMemory={handleAddMemory} 
        onExport={handleExport}
        memoryCount={memories.length}
      />
      
      <main className="pt-16">
        <Timeline 
          memories={memories}
          onEdit={handleEditMemory}
          onDelete={handleDeleteMemory}
        />
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
