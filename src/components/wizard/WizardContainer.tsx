'use client';

import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { ProductForm } from './ProductForm';
import { ProcessingView } from './ProcessingView';
import { ResultsView } from './ResultsView';

export function WizardContainer() {
  const { wizardState, setWizardState } = useApp();

  const handleProductSubmit = () => {
    setWizardState(prev => ({ ...prev, step: 'processing' }));
  };

  const handleProcessingComplete = () => {
    setWizardState(prev => ({ ...prev, step: 'results' }));
  };

  const handleBack = () => {
    setWizardState(prev => ({ ...prev, step: 'product', progress: 0, progressMessage: '' }));
  };

  if (wizardState.step === 'processing') {
    return <ProcessingView onComplete={handleProcessingComplete} />;
  }

  if (wizardState.step === 'results') {
    return <ResultsView onBack={handleBack} />;
  }

  return <ProductForm onSubmit={handleProductSubmit} />;
}
