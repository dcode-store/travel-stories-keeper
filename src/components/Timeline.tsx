import { useRef, useEffect, useState } from 'react';
import { Memory } from '@/types/memory';
import { MemoryCard } from './MemoryCard';
import { TimelineSpiral } from './TimelineSpiral';

interface TimelineProps {
  memories: Memory[];
  onEdit: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onShare?: (memory: Memory) => void;
}

export function Timeline({ memories, onEdit, onDelete, onShare }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const cards = container.querySelectorAll('[data-memory-card]');
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - containerCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => container.removeEventListener('scroll', handleScroll);
  }, [memories.length]);

  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-2xl font-serif text-foreground mb-2">Your Memory Lane is Empty</h2>
        <p className="text-muted-foreground max-w-md">
          Begin your journey by adding your first memory. Capture moments, stories, and feelings that matter to you.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen">
      {/* Timeline spiral on the left */}
      <TimelineSpiral 
        totalMemories={memories.length} 
        activeIndex={activeIndex} 
      />

      {/* Memories container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth-timeline px-4 md:px-8 lg:px-12 py-[40vh]"
        style={{ maxHeight: '100vh' }}
      >
        <div className="max-w-2xl mx-auto space-y-8">
          {memories.map((memory, index) => (
            <div 
              key={memory.id} 
              data-memory-card
              className="scroll-snap-center"
            >
              <MemoryCard
                memory={memory}
                isActive={index === activeIndex}
                onEdit={() => onEdit(memory)}
                onDelete={() => onDelete(memory.id)}
                onShare={onShare ? () => onShare(memory) : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
