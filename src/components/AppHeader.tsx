import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Plane, Globe, Star, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const location = useLocation();

  const navItems = [
    { path: '/trips', label: 'Trips', icon: Plane },
    { path: '/memories', label: 'Memories', icon: BookOpen },
    { path: '/travel-map', label: 'Map', icon: Globe },
    { path: '/bucket-list', label: 'Bucket List', icon: Star },
  ];

  const isActive = (path: string) => location.pathname === path;

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
    </header>
  );
}
