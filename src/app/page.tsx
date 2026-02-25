'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { AuthPage } from '@/components/auth/AuthPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { WizardContainer } from '@/components/wizard/WizardContainer';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, isGuest, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'wizard' | 'settings'>('wizard');

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-amber-700">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar página de autenticación si no está autenticado
  if (!user && !isGuest) {
    return <AuthPage />;
  }

  // Mostrar la aplicación principal
  return (
    <MainLayout currentView={currentView} onViewChange={setCurrentView}>
      {currentView === 'wizard' ? <WizardContainer /> : <SettingsPage />}
    </MainLayout>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}
