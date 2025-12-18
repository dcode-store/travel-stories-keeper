import { Button } from '@/components/ui/button';
import { Plus, FileDown, BookOpen } from 'lucide-react';

interface HeaderProps {
  onAddMemory: () => void;
  onExport: () => void;
  memoryCount: number;
}

export function Header({ onAddMemory, onExport, memoryCount }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-medium tracking-tight">Journo</h1>
            <p className="text-xs text-muted-foreground">
              {memoryCount} {memoryCount === 1 ? 'memory' : 'memories'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {memoryCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              className="text-muted-foreground hover:text-foreground"
            >
              <FileDown className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          )}
          <Button onClick={onAddMemory} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">New Memory</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
