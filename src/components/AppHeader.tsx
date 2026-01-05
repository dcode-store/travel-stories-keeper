import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Plane, Globe, Star, Menu, WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AppHeader() {
  const location = useLocation();
  const { isOnline, wasOffline } = useOnlineStatus();

  const navItems = [
    { path: '/trips', label: 'Trips', icon: Plane },
    { path: '/memories', label: 'Memories', icon: BookOpen },
    { path: '/travel-map', label: 'Map', icon: Globe },
    { path: '/bucket-list', label: 'Bucket List', icon: Star },
  ];

  const isActive = (path: string) => {
    // Handle /trips being the default route (also accessible via /)
    if (path === '/trips') {
      return location.pathname === '/trips' || location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-xl font-medium tracking-tight">Journo</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right side: Online Status + Mobile Nav */}
        <div className="flex items-center gap-2">
          {/* Online/Offline Indicator */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-all cursor-default',
                  isOnline
                    ? wasOffline
                      ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'text-muted-foreground hover:text-foreground'
                    : 'bg-orange-500/10 text-orange-600 dark:text-orange-400 animate-pulse'
                )}
              >
                {isOnline ? (
                  <Wifi className="w-4 h-4" />
                ) : (
                  <WifiOff className="w-4 h-4" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isOnline
                ? wasOffline ? 'Back Online' : 'Online'
                : 'Offline - Changes saved locally'}
            </TooltipContent>
          </Tooltip>

          {/* Mobile Navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navItems.map(item => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 w-full',
                      isActive(item.path) && 'text-primary font-medium'
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
