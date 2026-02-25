'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Ruler, 
  Tag, 
  Package, 
  Plus, 
  X, 
  Save, 
  Loader2,
  CheckCircle
} from 'lucide-react';

export function SettingsPage() {
  const { settings, setSettings, saveSettings } = useApp();
  const { user, isGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Temporary state for tags
  const [newCategory, setNewCategory] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  const handleSave = async () => {
    setIsLoading(true);
    setSuccess(false);
    
    try {
      await saveSettings();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && settings.categories.length < 10 && !settings.categories.includes(newCategory.trim())) {
      setSettings(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const addMaterial = () => {
    if (newMaterial.trim() && settings.materials.length < 15 && !settings.materials.includes(newMaterial.trim())) {
      setSettings(prev => ({
        ...prev,
        materials: [...prev.materials, newMaterial.trim()]
      }));
      setNewMaterial('');
    }
  };

  const removeMaterial = (material: string) => {
    setSettings(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m !== material)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Configuración
            </h1>
            <p className="text-amber-700 text-sm mt-1">
              {isGuest ? 'Modo invitado - Los cambios se guardan localmente' : 'Configuración global de tu cuenta'}
            </p>
          </div>
          {success && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Guardado</span>
            </div>
          )}
        </div>

        {/* Unit of Measurement */}
        <Card className="border-amber-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
            <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Unidad de Medida
            </CardTitle>
            <CardDescription>
              Selecciona la unidad para las dimensiones de los productos
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Select
              value={settings.unit}
              onValueChange={(value: 'cm' | 'mm' | 'in' | 'm') => 
                setSettings(prev => ({ ...prev, unit: value }))
              }
            >
              <SelectTrigger className="border-amber-200 focus:border-amber-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cm">Centímetros (cm)</SelectItem>
                <SelectItem value="mm">Milímetros (mm)</SelectItem>
                <SelectItem value="in">Pulgadas (in)</SelectItem>
                <SelectItem value="m">Metros (m)</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Brand Information */}
        <Card className="border-amber-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
            <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Información de Marca
            </CardTitle>
            <CardDescription>
              Datos de tu marca para personalizar el contenido SEO
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Nombre de la Marca</Label>
              <Input
                id="brand-name"
                value={settings.brandName}
                onChange={(e) => setSettings(prev => ({ ...prev, brandName: e.target.value }))}
                className="border-amber-200 focus:border-amber-500"
                placeholder="Bonetto con Amor"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand-description">Descripción de la Marca</Label>
              <Textarea
                id="brand-description"
                value={settings.brandDescription}
                onChange={(e) => setSettings(prev => ({ ...prev, brandDescription: e.target.value }))}
                className="border-amber-200 focus:border-amber-500 min-h-[100px]"
                placeholder="Describe tu marca, tono de voz y valores..."
              />
              <p className="text-xs text-muted-foreground">
                Esta descripción se usará para generar contenido coherente con tu marca
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="border-amber-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
            <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Categorías
            </CardTitle>
            <CardDescription>
              Define las categorías de productos (máximo 10)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {settings.categories.map((category) => (
                <Badge 
                  key={category} 
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 hover:bg-amber-200 pr-1"
                >
                  {category}
                  <button
                    onClick={() => removeCategory(category)}
                    className="ml-2 hover:bg-amber-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                placeholder="Nueva categoría..."
                className="border-amber-200 focus:border-amber-500"
                disabled={settings.categories.length >= 10}
              />
              <Button 
                onClick={addCategory}
                variant="outline"
                className="border-amber-300 hover:bg-amber-50"
                disabled={settings.categories.length >= 10 || !newCategory.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {settings.categories.length >= 10 && (
              <p className="text-xs text-amber-600">
                Has alcanzado el máximo de 10 categorías
              </p>
            )}
          </CardContent>
        </Card>

        {/* Materials */}
        <Card className="border-amber-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
            <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Materiales
            </CardTitle>
            <CardDescription>
              Define los materiales que usas (máximo 15)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {settings.materials.map((material) => (
                <Badge 
                  key={material} 
                  variant="secondary"
                  className="bg-orange-100 text-orange-800 hover:bg-orange-200 pr-1"
                >
                  {material}
                  <button
                    onClick={() => removeMaterial(material)}
                    className="ml-2 hover:bg-orange-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                placeholder="Nuevo material..."
                className="border-amber-200 focus:border-amber-500"
                disabled={settings.materials.length >= 15}
              />
              <Button 
                onClick={addMaterial}
                variant="outline"
                className="border-amber-300 hover:bg-amber-50"
                disabled={settings.materials.length >= 15 || !newMaterial.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {settings.materials.length >= 15 && (
              <p className="text-xs text-amber-600">
                Has alcanzado el máximo de 15 materiales
              </p>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
