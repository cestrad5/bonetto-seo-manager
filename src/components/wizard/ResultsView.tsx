'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle, 
  ArrowLeft,
  Copy,
  Package,
  Loader2,
  Wand2
} from 'lucide-react';

interface ResultsViewProps {
  onBack: () => void;
}

export function ResultsView({ onBack }: ResultsViewProps) {
  const { results, productData, settings, resetAll } = useApp();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const fmtBytes = (b: number) => {
    if (!b) return '-';
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
    return `${(b/1048576).toFixed(2)} MB`;
  };

  // ============================================
  // DESCARGAR ZIP
  // ============================================
  const downloadZip = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      const zip = new JSZip();
      
      // 1. Agregar imágenes del usuario optimizadas (WebP)
      for (let i = 0; i < results.processedImages.length; i++) {
        const blob = results.processedImages[i];
        const meta = results.imageMetadata[i];
        
        if (blob && meta) {
          const buffer = await blob.arrayBuffer();
          zip.file(meta.filename, buffer);
        }
        
        setDownloadProgress(Math.round(((i + 1) / (results.processedImages.length + 1)) * 50));
      }
      
      // 2. SEO + Prompt Imagen-a-Imagen
      if (results.seoContent) {
        const seo = results.seoContent;
        
        let seoContent = `CONTENIDO SEO - ${productData.name}
=====================================

PALABRA CLAVE:
${seo.keyword}

TÍTULO:
${seo.title}

SLUG:
${seo.slug}

META DESCRIPCIÓN:
${seo.meta_description}

DESCRIPCIÓN LARGA:
${seo.long_description}

BLOQUE HTML:
${seo.html_block}
`;

        // Agregar prompt para imagen-a-imagen si existe
        if (results.imageToImagePrompt) {
          seoContent += `
=====================================
PROMPT PARA IMAGEN PUBLICITARIA
(Servicios de Imagen-a-Imagen)
=====================================

${results.imageToImagePrompt}
`;
        }

        seoContent += `
---
Generado por Bonetto SEO Manager
Producto: ${productData.name}
REF: ${productData.ref}
Fecha: ${new Date().toLocaleDateString('es-CO')}
`;

        zip.file('seo-copy.txt', seoContent);
        setDownloadProgress(60);
      }
      
      // 3. Metadata JSON
      zip.file('metadata-import.json', JSON.stringify({
        product: { name: productData.name, ref: productData.ref },
        seo: results.seoContent,
        images: results.imageMetadata,
        imageToImagePrompt: results.imageToImagePrompt
      }, null, 2));
      
      setDownloadProgress(70);
      
      // 4. Prompt separado (para fácil acceso)
      if (results.imageToImagePrompt) {
        zip.file('prompt-imagen-publicitaria.txt', results.imageToImagePrompt);
      }
      
      setDownloadProgress(75);
      
      // 5. Generar ZIP
      const blob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      }, m => setDownloadProgress(75 + Math.round(m.percent * 0.25)));
      
      // Descargar
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bonetto-${productData.ref || 'producto'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      
      setDownloadProgress(100);
      
    } catch (error) {
      console.error('Error ZIP:', error);
      alert('Error al generar ZIP');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNewProduct = () => {
    resetAll();
    onBack();
  };

  // Stats
  const totalOriginal = results.imageMetadata.reduce((s, m) => s + (m.originalSize || 0), 0);
  const totalCompressed = results.imageMetadata.reduce((s, m) => s + (m.compressedSize || 0), 0);
  const savings = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-green-800">¡Completado!</h2>
        <p className="text-green-700 mt-1">
          <strong>{productData.name}</strong> está listo
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-amber-200">
          <CardContent className="pt-6 text-center">
            <div className="text-xs uppercase text-gray-500 mb-1">Original</div>
            <div className="text-xl font-bold text-gray-700">{fmtBytes(totalOriginal)}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-6 text-center">
            <div className="text-xs uppercase text-gray-500 mb-1">Optimizado</div>
            <div className="text-xl font-bold text-green-600">{fmtBytes(totalCompressed)}</div>
          </CardContent>
        </Card>
        <Card className="border-amber-200">
          <CardContent className="pt-6 text-center">
            <div className="text-xs uppercase text-gray-500 mb-1">Ahorro</div>
            <div className="text-xl font-bold text-amber-600">{savings}%</div>
          </CardContent>
        </Card>
      </div>

      {/* SEO */}
      {results.seoContent && (
        <Card className="border-amber-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
            <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />Contenido SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid grid-cols-4 bg-amber-100">
                <TabsTrigger value="html" className="data-[state=active]:bg-white">HTML</TabsTrigger>
                <TabsTrigger value="keyword" className="data-[state=active]:bg-white">Keyword</TabsTrigger>
                <TabsTrigger value="title" className="data-[state=active]:bg-white">Título</TabsTrigger>
                <TabsTrigger value="meta" className="data-[state=active]:bg-white">Meta</TabsTrigger>
              </TabsList>
              
              <TabsContent value="html" className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Bloque HTML</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(results.seoContent?.html_block || '', 'html')}>
                    {copied === 'html' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div 
                  className="bg-amber-50 p-4 rounded-lg text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: results.seoContent.html_block }}
                />
              </TabsContent>
              
              <TabsContent value="keyword" className="mt-4">
                <p className="text-lg font-semibold bg-amber-50 p-3 rounded-lg">{results.seoContent.keyword}</p>
              </TabsContent>
              
              <TabsContent value="title" className="mt-4">
                <p className="bg-amber-50 p-3 rounded-lg">{results.seoContent.title}</p>
              </TabsContent>
              
              <TabsContent value="meta" className="mt-4">
                <p className="bg-amber-50 p-3 rounded-lg text-sm">{results.seoContent.meta_description}</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Prompt para Imagen-a-Imagen */}
      {results.imageToImagePrompt && (
        <Card className="border-purple-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-t-lg">
            <CardTitle className="text-lg text-purple-900 flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Prompt para Imagen Publicitaria
            </CardTitle>
            <CardDescription className="text-purple-700">
              Copia este prompt y úsalo en un servicio de imagen-a-imagen (como Midjourney, DALL-E 3 con referencia, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-purple-700">Prompt estructurado:</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(results.imageToImagePrompt || '', 'prompt')}
                className="border-purple-300 hover:bg-purple-50"
              >
                {copied === 'prompt' ? (
                  <><CheckCircle className="h-4 w-4 text-green-600 mr-1" /> Copiado</>
                ) : (
                  <><Copy className="h-4 w-4 mr-1" /> Copiar</>
                )}
              </Button>
            </div>
            <Textarea
              value={results.imageToImagePrompt}
              readOnly
              className="min-h-[300px] bg-purple-50 border-purple-200 text-sm font-mono"
            />
            <p className="text-xs text-purple-600 mt-2">
              💡 <strong>Tip:</strong> Usa este prompt junto con una de tus fotos de producto en servicios que soporten imagen-a-imagen para obtener mejores resultados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Imágenes */}
      <Card className="border-amber-200 shadow-md">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
          <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Imágenes Optimizadas
          </CardTitle>
          <CardDescription>
            {results.imageMetadata.length} imágenes WebP optimizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-1 text-sm">
            {/* Header */}
            <div className="grid grid-cols-5 gap-2 font-bold text-xs uppercase text-gray-500 pb-2 border-b">
              <div className="col-span-2">Archivo</div>
              <div className="text-right">Original</div>
              <div className="text-right">Optimizado</div>
              <div className="text-right">%</div>
            </div>
            
            {/* Filas */}
            {results.imageMetadata.map((m, i) => {
              const saved = m.originalSize && m.compressedSize 
                ? Math.round((1 - m.compressedSize / m.originalSize) * 100)
                : 0;
              
              return (
                <div key={i} className={`grid grid-cols-5 gap-2 py-2 ${i % 2 === 0 ? 'bg-gray-50 rounded px-2' : ''}`}>
                  <div className="col-span-2 font-medium truncate flex items-center gap-1">
                    <span className="text-amber-800">{m.filename}</span>
                  </div>
                  <div className="text-right text-gray-500">{fmtBytes(m.originalSize)}</div>
                  <div className="text-right text-green-600 font-medium">{fmtBytes(m.compressedSize)}</div>
                  <div className="text-right">
                    {saved > 0 ? <Badge className="bg-green-100 text-green-700">-{saved}%</Badge> : <span className="text-gray-400">-</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-between">
        <Button variant="outline" onClick={handleNewProduct} className="border-amber-300">
          <ArrowLeft className="mr-2 h-4 w-4" />Nuevo
        </Button>
        
        <Button
          onClick={downloadZip}
          disabled={isDownloading}
          size="lg"
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          {isDownloading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{downloadProgress}%</>
          ) : (
            <><Download className="mr-2 h-4 w-4" />Descargar ZIP</>
          )}
        </Button>
      </div>

      {isDownloading && (
        <div className="w-full bg-amber-100 rounded-full h-2">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all" style={{ width: `${downloadProgress}%` }} />
        </div>
      )}

      <Alert className="bg-amber-50 border-amber-200">
        <Package className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          <strong>ZIP incluye:</strong> {results.imageMetadata.length} imágenes WebP optimizadas + seo-copy.txt (con prompt para imagen publicitaria) + metadata.json + prompt-imagen-publicitaria.txt
        </AlertDescription>
      </Alert>
    </div>
  );
}
