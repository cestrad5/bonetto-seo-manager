'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  Ruler, 
  Tag, 
  Image, 
  Upload, 
  X, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface ProductFormProps {
  onSubmit: () => void;
}

export function ProductForm({ onSubmit }: ProductFormProps) {
  const { settings, productData, setProductData } = useApp();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!productData.name.trim()) {
      newErrors.name = 'El nombre del producto es requerido';
    }
    if (!productData.ref.trim()) {
      newErrors.ref = 'La referencia es requerida';
    }
    if (productData.selectedCategories.length === 0) {
      newErrors.categories = 'Selecciona al menos una categoría';
    }
    if (productData.selectedMaterials.length === 0) {
      newErrors.materials = 'Selecciona al menos un material';
    }
    if (productData.photos.length === 0) {
      newErrors.photos = 'Agrega al menos una foto del producto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setProductData(prev => {
      if (checked && prev.selectedCategories.length >= 3) {
        return prev;
      }
      return {
        ...prev,
        selectedCategories: checked
          ? [...prev.selectedCategories, category]
          : prev.selectedCategories.filter(c => c !== category)
      };
    });
  };

  const handleMaterialChange = (material: string, checked: boolean) => {
    setProductData(prev => ({
      ...prev,
      selectedMaterials: checked
        ? [...prev.selectedMaterials, material]
        : prev.selectedMaterials.filter(m => m !== material)
    }));
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles: File[] = [];
    const remainingSlots = 10 - productData.photos.length;
    
    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
      }
    }
    
    if (validFiles.length > 0) {
      setProductData(prev => ({
        ...prev,
        photos: [...prev.photos, ...validFiles]
      }));
      setErrors(prev => ({ ...prev, photos: '' }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    setProductData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card className="border-amber-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
          <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Información del Producto
          </CardTitle>
          <CardDescription>
            Ingresa los datos básicos del producto
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">
                Nombre del Producto <span className="text-red-500">*</span>
              </Label>
              <Input
                id="product-name"
                value={productData.name}
                onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Árbol de Navidad Decorativo"
                className={`border-amber-200 focus:border-amber-500 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="product-ref">
                Referencia (REF) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="product-ref"
                value={productData.ref}
                onChange={(e) => setProductData(prev => ({ ...prev, ref: e.target.value }))}
                placeholder="Ej: 9049"
                className={`border-amber-200 focus:border-amber-500 ${errors.ref ? 'border-red-500' : ''}`}
              />
              {errors.ref && <p className="text-xs text-red-500">{errors.ref}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dimensions */}
      <Card className="border-amber-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
          <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            Dimensiones ({settings.unit})
          </CardTitle>
          <CardDescription>
            Ingresa las medidas del producto
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Largo</Label>
              <Input
                id="length"
                type="number"
                min="0"
                step="0.1"
                value={productData.length || ''}
                onChange={(e) => setProductData(prev => ({ ...prev, length: parseFloat(e.target.value) || 0 }))}
                className="border-amber-200 focus:border-amber-500"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Ancho</Label>
              <Input
                id="width"
                type="number"
                min="0"
                step="0.1"
                value={productData.width || ''}
                onChange={(e) => setProductData(prev => ({ ...prev, width: parseFloat(e.target.value) || 0 }))}
                className="border-amber-200 focus:border-amber-500"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Alto</Label>
              <Input
                id="height"
                type="number"
                min="0"
                step="0.1"
                value={productData.height || ''}
                onChange={(e) => setProductData(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                className="border-amber-200 focus:border-amber-500"
                placeholder="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="border-amber-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
          <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Categorías <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>
            Selecciona hasta 3 categorías (de {settings.categories.length} disponibles)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {errors.categories && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.categories}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap gap-3">
            {settings.categories.map((category) => {
              const isSelected = productData.selectedCategories.includes(category);
              const isDisabled = !isSelected && productData.selectedCategories.length >= 3;
              
              return (
                <label
                  key={category}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-amber-100 border-amber-400 text-amber-800' 
                      : isDisabled
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-amber-200 hover:border-amber-400'
                    }`}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  />
                  <span className="text-sm font-medium">{category}</span>
                </label>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Seleccionadas: {productData.selectedCategories.length}/3
          </p>
        </CardContent>
      </Card>

      {/* Materials */}
      <Card className="border-amber-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
          <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Materiales <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>
            Selecciona los materiales del producto
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {errors.materials && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.materials}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap gap-3">
            {settings.materials.map((material) => {
              const isSelected = productData.selectedMaterials.includes(material);
              
              return (
                <label
                  key={material}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-orange-100 border-orange-400 text-orange-800' 
                      : 'bg-white border-amber-200 hover:border-amber-400'
                    }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleMaterialChange(material, checked as boolean)}
                  />
                  <span className="text-sm font-medium">{material}</span>
                </label>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="border-amber-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
          <CardTitle className="text-lg text-amber-900">
            Descripción del Producto
          </CardTitle>
          <CardDescription>
            Una descripción breve para ayudar a la IA
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Textarea
            value={productData.description}
            onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe brevemente el producto, sus características principales, usos, etc."
            className="border-amber-200 focus:border-amber-500 min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* Photos */}
      <Card className="border-amber-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
          <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
            <Image className="w-5 h-5" />
            Fotos del Producto <span className="text-red-500">*</span>
          </CardTitle>
          <CardDescription>
            Sube hasta 10 fotos del producto (la primera será la principal)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {errors.photos && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.photos}</AlertDescription>
            </Alert>
          )}
          
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all
              ${dragActive 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-amber-200 hover:border-amber-400'
              }
              ${productData.photos.length >= 10 ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={productData.photos.length >= 10}
            />
            <Upload className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-amber-700 font-medium">
              Arrastra imágenes aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {productData.photos.length}/10 fotos subidas
            </p>
          </div>
          
          {/* Photo Preview Grid */}
          {productData.photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
              {productData.photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-amber-200 bg-amber-50"
                >
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(index);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {index === 0 && (
                    <Badge className="absolute top-2 left-2 bg-amber-600">
                      Principal
                    </Badge>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 text-center truncate">
                    {formatFileSize(photo.size)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          Procesar con IA
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
