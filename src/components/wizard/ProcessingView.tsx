'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  FileText, 
  Archive,
  AlertCircle,
  Eye,
  ImageIcon
} from 'lucide-react';

interface ProcessingViewProps {
  onComplete: () => void;
}

// ============================================
// FUNCIÓN DE COMPRESIÓN - DEL CÓDIGO DE REFERENCIA
// ============================================
function compressImage(file: File, quality: number, maxPx: number): Promise<{ blob: Blob; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new window.Image(); // Usar window.Image para evitar conflicto con lucide-react
      
      img.onload = () => {
        try {
          // Calcular nuevas dimensiones respetando aspect ratio
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;
          
          if (w > maxPx || h > maxPx) {
            const ratio = Math.min(maxPx / w, maxPx / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', { alpha: false });
          
          // Fondo blanco para imágenes con transparencia
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
          
          // Usar mejor algoritmo de suavizado
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(img, 0, 0, w, h);
          
          canvas.toBlob(
            blob => {
              if (blob) {
                resolve({ blob, w, h });
              } else {
                reject(new Error('Canvas toBlob falló - posible problema de memoria'));
              }
            },
            'image/webp',
            quality
          );
        } catch (err) {
          reject(new Error(`Error procesando imagen: ${err instanceof Error ? err.message : 'Error desconocido'}`));
        }
      };
      
      img.onerror = () => {
        reject(new Error(`No se pudo cargar la imagen: ${file.name}`));
      };
      
      // Usar data URL en lugar de blob URL para evitar CSP
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error(`Error leyendo archivo: ${file.name}`));
    };
    
    // Leer como Data URL para evitar problemas de CSP
    reader.readAsDataURL(file);
  });
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export function ProcessingView({ onComplete }: ProcessingViewProps) {
  const { productData, settings, setResults } = useApp();
  const [steps, setSteps] = useState([
    { id: 'seo', name: 'Generando contenido SEO', status: 'pending' },
    { id: 'analyze', name: 'Analizando fotos con IA', status: 'pending' },
    { id: 'compress', name: 'Optimizando imágenes del usuario', status: 'pending' },
    { id: 'pack', name: 'Empaquetando', status: 'pending' }
  ]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [hasError, setHasError] = useState(false);
  const hasRunRef = useRef(false);

  const updateStep = (id: string, status: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const generateSlug = (text: string) => 
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const fileToBase64 = (file: File): Promise<string> => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const generateFilename = (index: number): string => {
    const ref = productData.ref || 'prod';
    const name = generateSlug(productData.name);
    const cat = generateSlug(productData.selectedCategories[0] || 'producto');
    const mat = generateSlug(productData.selectedMaterials[0] || 'madera');
    const brand = generateSlug(settings.brandName);
    
    return `ref-${ref}-${name}-${cat}-${mat}-${brand}-${String(index + 1).padStart(3, '0')}.webp`;
  };

  // ============================================
  // PROCESAMIENTO
  // ============================================
  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const run = async () => {
      // Perfil Balanceada del código de referencia
      const QUALITY = 0.78;
      const MAX_PX = 1800;

      let seoContent: any = null;
      let imageToImagePrompt: string | null = null;
      const processedImages: Blob[] = [];
      const imageMetadata: any[] = [];
      let failedCount = 0;

      try {
        // ========================================
        // PASO 1: SEO
        // ========================================
        updateStep('seo', 'processing');
        setOverallProgress(5);

        try {
          const res = await fetch('/api/seo/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productData, brandData: settings })
          });
          const data = await res.json();
          if (data.success) seoContent = data.data;
        } catch (e) {
          console.error('SEO error:', e);
        }
        
        if (!seoContent) {
          // Fallback mejorado con contenido rico
          const val = Math.floor(Math.random() * 1200) + 800;
          const rating = (Math.random() * 0.5 + 4.4).toFixed(2);
          const pct = Math.round(parseFloat(rating) * 20);
          const materiales = productData.selectedMaterials?.length > 0 
            ? productData.selectedMaterials.join(' y ') 
            : 'madera';
          
          // Solo mostrar dimensiones si hay valores válidos
          const hasDims = productData.length > 0 || productData.width > 0 || productData.height > 0;
          const dimensiones = hasDims 
            ? `${productData.length || 0} x ${productData.width || 0} x ${productData.height || 0} ${settings.unit}`
            : 'Dimensiones no especificadas';
          
          seoContent = {
            keyword: `${productData.name.toLowerCase()} de ${materiales}`,
            title: `${productData.name} | ${settings.brandName} - Artesanal`.substring(0, 60),
            slug: generateSlug(productData.name),
            meta_description: `Descubre ${productData.name} de ${materiales} artesanal. Hecho a mano por ${settings.brandName}. Pieza única para tu hogar. ¡Envíos a Colombia!`.substring(0, 155),
            long_description: `<h2>${productData.name} Artesanal de ${materiales}</h2>\n\n<p>El ${productData.name.toLowerCase()} que tienes frente a ti representa la esencia del arte popular colombiano. Cada pieza es elaborada por los maestros artesanos de ${settings.brandName}, quienes dedican horas de trabajo minucioso para garantizarte un producto de excelencia.</p>\n\n<h2>Características y Beneficios</h2>\n\n<p>Este producto destaca por su elaboración en ${materiales} de primera calidad. Sus dimensiones de ${dimensiones} lo hacen perfecto para cualquier espacio de tu hogar. Lo que realmente lo hace especial es que cada pieza lleva el sello único de la artesanía colombiana.</p>\n\n<p>En ${settings.brandName} nos enorgullece mantener viva la tradición de la madera en Colombia. Cada producto es único y puede presentar ligeras variaciones en el tono, lo cual añade carácter y autenticidad.</p>\n\n<p><strong>REF: ${productData.ref}</strong></p>`,
            html_block: `<strong>REF: </strong>${productData.ref}\n${dimensiones}\n(${val} Valoraciones) Global ${rating}/5: <span style="font-size: 150%; color: orange;">★★★★<span style="background: linear-gradient(to right, orange ${pct}%, transparent ${100 - pct}%); -webkit-background-clip: text; color: transparent;">★</span></span>\nPieza artesanal única hecha con amor. 🪵✨`,
            alt_texts: [
              `${productData.name} de ${materiales} artesanal - ${settings.brandName}`,
              `${productData.name} hecho a mano - ${settings.brandName}`
            ]
          };
          console.log('Using fallback SEO content');
        }
        updateStep('seo', 'completed');
        setOverallProgress(20);

        // ========================================
        // PASO 2: ANÁLISIS (incluye prompt imagen-a-imagen)
        // ========================================
        updateStep('analyze', 'processing');
        let analysis: any = null;
        
        try {
          const base64Images = await Promise.all(
            productData.photos.slice(0, 3).map(p => fileToBase64(p))
          );
          console.log('=== LLAMANDO API ANALYZE ===');
          console.log('Imágenes a analizar:', base64Images.length);
          
          const res = await fetch('/api/image/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ images: base64Images, productData, brandData: settings })
          });
          const data = await res.json();
          console.log('Respuesta API Analyze:', data.success ? 'SUCCESS' : 'ERROR', data.error || '');
          
          if (data.success) {
            analysis = data.data;
            imageToImagePrompt = data.data.imageToImagePrompt || null;
            console.log('=== PROMPT RECIBIDO ===');
            console.log('imageToImagePrompt:', imageToImagePrompt ? 'RECIBIDO' : 'NO RECIBIDO');
            console.log('======================');
          }
        } catch (e) {
          console.error('Analyze error:', e);
        }
        
        // Si no se generó el prompt, crear uno de fallback
        if (!imageToImagePrompt) {
          console.log('=== GENERANDO PROMPT FALLBACK ===');
          const materiales = productData.selectedMaterials?.length > 0 
            ? productData.selectedMaterials.join(' y ') 
            : 'madera';
          
          imageToImagePrompt = `Te proporciono la imagen de un producto. Analiza cuidadosamente su forma, materiales, colores y función.

Descripción: ${productData.name} artesanal de madera. Elaborado en ${materiales} por ${settings.brandName}. Producto artesanal colombiano de alta calidad.

Actúa como fotógrafo publicitario profesional y diseñador de producto.

OBJETIVO:

Generar una imagen fotorrealista del producto en su entorno de uso natural y típico.

INSTRUCCIONES:

- Mantén EXACTAMENTE el diseño del producto (no lo rediseñes).
- Conserva proporciones, logotipos, colores y materiales.
- Ubica el producto en: hogar elegante.
- Muestra el producto en una situación realista de uso.
- Iluminación profesional tipo fotografía comercial.
- Profundidad de campo suave (background ligeramente desenfocado).
- Estilo: fotografía publicitaria premium.
- Cámara: lente 50mm o 85mm, alta resolución.
- Composición limpia y moderna.
- Sin texto, sin marcas de agua.
- El producto debe ser el protagonista visual.

ENTREGA:

Imagen fotorrealista de alta calidad.`;
          console.log('Prompt fallback generado');
        }
        
        updateStep('analyze', 'completed');
        setOverallProgress(35);

        // ========================================
        // PASO 3: COMPRIMIR IMÁGENES DEL USUARIO
        // ========================================
        updateStep('compress', 'processing');
        
        console.log(`\n=== COMPRIMIENDO ${productData.photos.length} IMÁGENES ===\n`);
        
        for (let i = 0; i < productData.photos.length; i++) {
          const photo = productData.photos[i];
          const progLabel = `Comprimiendo imagen ${i + 1} de ${productData.photos.length}…`;
          console.log(progLabel);
          
          try {
            const { blob, w, h } = await compressImage(photo, QUALITY, MAX_PX);
            processedImages.push(blob);
            
            const filename = generateFilename(i);
            const saved = Math.round((1 - blob.size / photo.size) * 100);
            
            imageMetadata.push({
              filename,
              originalName: photo.name,
              originalSize: photo.size,
              compressedSize: blob.size,
              dimensions: `${w}×${h}px`,
              altText: `${productData.name} - ${settings.brandName}`.substring(0, 125),
              title: `${productData.name} | ${settings.brandName}`,
              caption: productData.name,
              description: productData.description || '',
              isAIGenerated: false
            });
            
            console.log(`✓ ${photo.name}: ${(photo.size/1024).toFixed(1)}KB → ${(blob.size/1024).toFixed(1)}KB (-${saved}%)`);
            
          } catch (err) {
            console.error(`Error comprimiendo ${photo.name}:`, err);
            failedCount++;
            
            // Fallback: usar archivo original
            processedImages.push(photo);
            imageMetadata.push({
              filename: generateFilename(i),
              originalName: photo.name,
              originalSize: photo.size,
              compressedSize: photo.size,
              dimensions: 'Original sin comprimir',
              altText: productData.name,
              title: productData.name,
              caption: productData.name,
              description: '',
              isAIGenerated: false,
              error: err instanceof Error ? err.message : 'Error desconocido'
            });
          }
          
          setOverallProgress(35 + Math.round(((i + 1) / productData.photos.length) * 50));
        }
        
        if (failedCount > 0) {
          console.log(`⚠️ ${failedCount} imagen(es) no pudieron comprimirse`);
        }
        
        console.log(`\n=== COMPLETADO ===\n`);
        updateStep('compress', 'completed');
        setOverallProgress(90);

        // ========================================
        // PASO 4: EMPAQUETAR
        // ========================================
        updateStep('pack', 'processing');
        
        console.log('=== GUARDANDO RESULTADOS ===');
        console.log('imageToImagePrompt a guardar:', imageToImagePrompt ? 'CON VALOR' : 'NULL');
        console.log('===========================');
        
        setResults({
          seoContent,
          processedImages,
          imageMetadata,
          imageToImagePrompt
        });
        
        updateStep('pack', 'completed');
        setOverallProgress(100);
        
        setTimeout(onComplete, 300);

      } catch (e) {
        console.error('Critical error:', e);
        setHasError(true);
      }
    };

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getIcon = (status: string) => {
    if (status === 'processing') return <Loader2 className="h-5 w-5 animate-spin text-amber-600" />;
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === 'error') return <XCircle className="h-5 w-5 text-red-600" />;
    return <div className="h-5 w-5 rounded-full border-2 border-amber-300" />;
  };

  const getIconComp = (id: string) => {
    const map: Record<string, React.ReactNode> = {
      seo: <FileText className="h-4 w-4" />,
      analyze: <Eye className="h-4 w-4" />,
      compress: <ImageIcon className="h-4 w-4" />,
      pack: <Archive className="h-4 w-4" />
    };
    return map[id] || null;
  };

  if (hasError) {
    return (
      <div className="max-w-xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error durante el procesamiento. Intenta de nuevo.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="border-amber-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg text-center">
          <CardTitle className="text-xl text-amber-900 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Procesando con IA
          </CardTitle>
          <CardDescription>Optimizando tu producto</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium text-amber-700">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-amber-100" />
          </div>
          <div className="space-y-3">
            {steps.map(s => (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  s.status === 'processing' ? 'bg-amber-50 border border-amber-200' :
                  s.status === 'completed' ? 'bg-green-50 border border-green-200' :
                  s.status === 'error' ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex-shrink-0">{getIcon(s.status)}</div>
                <div className="flex items-center gap-2">
                  {getIconComp(s.id)}
                  <span className="font-medium text-amber-900">{s.name}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
