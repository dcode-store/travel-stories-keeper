import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TagFilterProps {
    tags: string[];
    selectedTags: string[];
    tagCounts: Record<string, number>;
    onTagToggle: (tag: string) => void;
    className?: string;
}

export function TagFilter({
    tags,
    selectedTags,
    tagCounts,
    onTagToggle,
    className,
}: TagFilterProps) {
    if (tags.length === 0) {
        return null;
    }

    return (
        <div className={cn('flex flex-wrap gap-2', className)}>
            {tags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                const count = tagCounts[tag] || 0;

                return (
                    <Badge
                        key={tag}
                        variant={isSelected ? 'default' : 'outline'}
                        className={cn(
                            'cursor-pointer transition-all hover:scale-105',
                            isSelected && 'ring-2 ring-primary/20'
                        )}
                        onClick={() => onTagToggle(tag)}
                    >
                        <span>{tag}</span>
                        <span className={cn(
                            'ml-1.5 text-xs',
                            isSelected ? 'opacity-80' : 'opacity-50'
                        )}>
                            {count}
                        </span>
                    </Badge>
                );
            })}
        </div>
    );
}
