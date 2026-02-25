'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Configuración global de la cuenta
export interface AccountSettings {
  unit: 'cm' | 'mm' | 'in' | 'm';
  brandName: string;
  brandDescription: string;
  categories: string[];
  materials: string[];
}

// Datos del producto
export interface ProductData {
  name: string;
  ref: string;
  length: number;
  width: number;
  height: number;
  selectedCategories: string[];
  selectedMaterials: string[];
  description: string;
  photos: File[];
}

// Resultados de SEO
export interface SEOContent {
  keyword: string;
  title: string;
  slug: string;
  meta_description: string;
  long_description: string;
  html_block: string;
}

// Metadata de imagen
export interface ImageMetadata {
  filename: string;
  originalName: string;
  altText: string;
  title: string;
  caption: string;
  description: string;
  isAIGenerated: boolean;
}

// Estado del wizard
export interface WizardState {
  step: 'product' | 'processing' | 'results';
  progress: number;
  progressMessage: string;
}

// Resultados del procesamiento
export interface ProcessingResults {
  seoContent: SEOContent | null;
  processedImages: Blob[];
  imageMetadata: ImageMetadata[];
  imageToImagePrompt: string | null;
}

interface AppContextType {
  // Settings
  settings: AccountSettings;
  setSettings: React.Dispatch<React.SetStateAction<AccountSettings>>;
  saveSettings: () => Promise<void>;
  loadSettings: () => Promise<void>;
  
  // Product
  productData: ProductData;
  setProductData: React.Dispatch<React.SetStateAction<ProductData>>;
  
  // Wizard
  wizardState: WizardState;
  setWizardState: React.Dispatch<React.SetStateAction<WizardState>>;
  
  // Results
  results: ProcessingResults;
  setResults: React.Dispatch<React.SetStateAction<ProcessingResults>>;
  resetAll: () => void;
}

const defaultSettings: AccountSettings = {
  unit: 'cm',
  brandName: 'Bonetto con Amor',
  brandDescription: 'Artesanos de madera en Colombia. Creamos piezas únicas con amor y dedicación, transformando la madera en obras de arte para tu hogar.',
  categories: ['Decoración', 'Juguetes', 'Muebles', 'Navidad', 'Cocina', 'Oficina'],
  materials: ['Pino', 'Cedro', 'Roble', 'Nogal', 'Bambú', 'Madera reciclada']
};

const defaultProductData: ProductData = {
  name: '',
  ref: '',
  length: 0,
  width: 0,
  height: 0,
  selectedCategories: [],
  selectedMaterials: [],
  description: '',
  photos: []
};

const defaultWizardState: WizardState = {
  step: 'product',
  progress: 0,
  progressMessage: ''
};

const defaultResults: ProcessingResults = {
  seoContent: null,
  processedImages: [],
  imageMetadata: [],
  imageToImagePrompt: null
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isGuest } = useAuth();
  const [settings, setSettings] = useState<AccountSettings>(defaultSettings);
  const [productData, setProductData] = useState<ProductData>(defaultProductData);
  const [wizardState, setWizardState] = useState<WizardState>(defaultWizardState);
  const [results, setResults] = useState<ProcessingResults>(defaultResults);

  const saveSettings = useCallback(async () => {
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { settings }, { merge: true });
      } catch (error) {
        console.error('Error saving settings:', error);
        throw error;
      }
    } else if (isGuest) {
      localStorage.setItem('bonetto-guest-settings', JSON.stringify(settings));
    }
  }, [user, isGuest, settings]);

  const loadSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...defaultSettings,
          ...data.settings
        } as AccountSettings;
      }
    } catch (error) {
      // Silenciar error de permisos de Firebase (común si las reglas no están configuradas)
      // console.error('Error loading settings:', error);
    }
    return null;
  }, [user]);

  const resetAll = useCallback(() => {
    setProductData(defaultProductData);
    setWizardState(defaultWizardState);
    setResults(defaultResults);
  }, []);

  // Cargar configuración cuando el usuario cambia
  useEffect(() => {
    let mounted = true;
    
    async function fetchSettings() {
      if (user) {
        const loadedSettings = await loadSettings();
        if (mounted && loadedSettings) {
          setSettings(loadedSettings);
        }
      } else if (isGuest) {
        // Para invitados, usar configuración por defecto guardada en localStorage
        const savedSettings = localStorage.getItem('bonetto-guest-settings');
        if (savedSettings && mounted) {
          setSettings(JSON.parse(savedSettings));
        }
      }
    }
    
    fetchSettings();
    
    return () => {
      mounted = false;
    };
  }, [user, isGuest, loadSettings]);

  return (
    <AppContext.Provider
      value={{
        settings,
        setSettings,
        saveSettings,
        loadSettings: async () => {
          const loadedSettings = await loadSettings();
          if (loadedSettings) {
            setSettings(loadedSettings);
          }
        },
        productData,
        setProductData,
        wizardState,
        setWizardState,
        results,
        setResults,
        resetAll
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
