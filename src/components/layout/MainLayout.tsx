'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, LogOut, User, ChevronLeft } from 'lucide-react';

type View = 'wizard' | 'settings';

interface MainLayoutProps {
  children: React.ReactNode;
  currentView: View;
  onViewChange: (view: View) => void;
}

export function MainLayout({ children, currentView, onViewChange }: MainLayoutProps) {
  const { user, isGuest, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return isGuest ? 'IN' : '??';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl shadow-md">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-amber-900">Bonetto SEO Manager</h1>
                <p className="text-xs text-amber-600 hidden sm:block">Optimización WooCommerce</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant={currentView === 'wizard' ? 'default' : 'ghost'}
                onClick={() => onViewChange('wizard')}
                className={currentView === 'wizard' 
                  ? 'bg-amber-600 hover:bg-amber-700' 
                  : 'text-amber-700 hover:bg-amber-100'
                }
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                Nuevo Producto
              </Button>
              <Button
                variant={currentView === 'settings' ? 'default' : 'ghost'}
                onClick={() => onViewChange('settings')}
                className={currentView === 'settings' 
                  ? 'bg-amber-600 hover:bg-amber-700' 
                  : 'text-amber-700 hover:bg-amber-100'
                }
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuración
              </Button>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {isGuest && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full hidden sm:block">
                  Modo Invitado
                </span>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-amber-300">
                      <AvatarFallback className="bg-amber-100 text-amber-700 font-medium">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {isGuest ? 'Invitado' : user?.email?.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {isGuest ? 'Sin datos persistentes' : user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Mobile Navigation */}
                  <div className="md:hidden">
                    <DropdownMenuItem onClick={() => onViewChange('wizard')}>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M12 8v8M8 12h8" />
                      </svg>
                      Nuevo Producto
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewChange('settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </div>
                  
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-sm">
              © 2024 <span className="font-semibold">Bonetto con Amor</span> • Artesanos de madera en Colombia
            </p>
            <p className="text-xs text-amber-300">
              Powered by GLM AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
