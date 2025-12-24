import { useState } from 'react';
import { MemoryFilters, MOOD_OPTIONS } from '@/types/memory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X, MapPin, Calendar, Tag, Smile } from 'lucide-react';
import { hasActiveFilters } from '@/hooks/useMemories';

interface MemorySearchProps {
    filters: MemoryFilters;
    onFiltersChange: (filters: MemoryFilters) => void;
    allTags: string[];
    allLocations: string[];
    tagCounts: Record<string, number>;
    locationCounts: Record<string, number>;
    resultCount: number;
    totalCount: number;
}

export function MemorySearch({
    filters,
    onFiltersChange,
    allTags,
    allLocations,
    tagCounts,
    locationCounts,
    resultCount,
    totalCount,
}: MemorySearchProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const isFiltering = hasActiveFilters(filters);
    const activeFilterCount = [
        filters.tags.length > 0,
        filters.location !== '',
        filters.dateFrom !== '' || filters.dateTo !== '',
        filters.mood !== '',
    ].filter(Boolean).length;

    const handleSearchChange = (value: string) => {
        onFiltersChange({ ...filters, searchQuery: value });
    };

    const handleTagToggle = (tag: string) => {
        const newTags = filters.tags.includes(tag)
            ? filters.tags.filter(t => t !== tag)
            : [...filters.tags, tag];
        onFiltersChange({ ...filters, tags: newTags });
    };

    const handleLocationChange = (value: string) => {
        onFiltersChange({ ...filters, location: value === 'all' ? '' : value });
    };

    const handleMoodChange = (value: string) => {
        onFiltersChange({ ...filters, mood: value === 'all' ? '' : value });
    };

    const handleDateFromChange = (value: string) => {
        onFiltersChange({ ...filters, dateFrom: value });
    };

    const handleDateToChange = (value: string) => {
        onFiltersChange({ ...filters, dateTo: value });
    };

    const clearFilters = () => {
        onFiltersChange({
            searchQuery: '',
            tags: [],
            location: '',
            dateFrom: '',
            dateTo: '',
            mood: '',
        });
    };

    return (
        <div className="space-y-3">
            {/* Search bar row */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search memories..."
                        value={filters.searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-9 pr-4"
                    />
                    {filters.searchQuery && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="relative">
                            <Filter className="w-4 h-4" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium">Filters</h4>
                                {isFiltering && (
                                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                                        Clear all
                                    </Button>
                                )}
                            </div>

                            {/* Location filter */}
                            {allLocations.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm">
                                        <MapPin className="w-3 h-3" />
                                        Location
                                    </Label>
                                    <Select value={filters.location || 'all'} onValueChange={handleLocationChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All locations" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All locations</SelectItem>
                                            {allLocations.map(loc => (
                                                <SelectItem key={loc} value={loc}>
                                                    {loc} ({locationCounts[loc]})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Mood filter */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm">
                                    <Smile className="w-3 h-3" />
                                    Mood
                                </Label>
                                <Select value={filters.mood || 'all'} onValueChange={handleMoodChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Any mood" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Any mood</SelectItem>
                                        {MOOD_OPTIONS.map(mood => (
                                            <SelectItem key={mood.value} value={mood.value}>
                                                {mood.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date range filter */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-3 h-3" />
                                    Date range
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="date"
                                        value={filters.dateFrom}
                                        onChange={(e) => handleDateFromChange(e.target.value)}
                                        placeholder="From"
                                    />
                                    <Input
                                        type="date"
                                        value={filters.dateTo}
                                        onChange={(e) => handleDateToChange(e.target.value)}
                                        placeholder="To"
                                    />
                                </div>
                            </div>

                            {/* Tags filter */}
                            {allTags.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm">
                                        <Tag className="w-3 h-3" />
                                        Tags
                                    </Label>
                                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                        {allTags.map(tag => (
                                            <Badge
                                                key={tag}
                                                variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                                                className="cursor-pointer text-xs"
                                                onClick={() => handleTagToggle(tag)}
                                            >
                                                {tag}
                                                <span className="ml-1 opacity-60">({tagCounts[tag]})</span>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Active filters & result count */}
            {isFiltering && (
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                        {filters.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="gap-1">
                                {tag}
                                <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => handleTagToggle(tag)}
                                />
                            </Badge>
                        ))}
                        {filters.location && (
                            <Badge variant="secondary" className="gap-1">
                                <MapPin className="w-3 h-3" />
                                {filters.location}
                                <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => onFiltersChange({ ...filters, location: '' })}
                                />
                            </Badge>
                        )}
                        {filters.mood && (
                            <Badge variant="secondary" className="gap-1">
                                {MOOD_OPTIONS.find(m => m.value === filters.mood)?.label}
                                <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => onFiltersChange({ ...filters, mood: '' })}
                                />
                            </Badge>
                        )}
                        {(filters.dateFrom || filters.dateTo) && (
                            <Badge variant="secondary" className="gap-1">
                                <Calendar className="w-3 h-3" />
                                {filters.dateFrom || '...'} - {filters.dateTo || '...'}
                                <X
                                    className="w-3 h-3 cursor-pointer"
                                    onClick={() => onFiltersChange({ ...filters, dateFrom: '', dateTo: '' })}
                                />
                            </Badge>
                        )}
                    </div>
                    <span className="text-muted-foreground whitespace-nowrap">
                        {resultCount} of {totalCount}
                    </span>
                </div>
            )}
        </div>
    );
}
