import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, productData, brandData } = body;

    if (!images || images.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No se proporcionaron imágenes para analizar'
      }, { status: 400 });
    }

    const zai = await ZAI.create();

    // Crear contenido con las imágenes (máximo 3 para mejor análisis)
    const imageContents = images.slice(0, 3).map((base64: string) => ({
      type: 'image_url',
      image_url: {
        url: base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`
      }
    }));

    // Prompt detallado para extraer información visual precisa
    const prompt = `Eres un experto en fotografía de productos artesanales. Analiza DETALLADAMENTE estas imágenes de un producto de madera artesanal.

INFORMACIÓN DEL PRODUCTO:
- Nombre: ${productData.name}
- Referencia: ${productData.ref}
- Categorías: ${productData.selectedCategories?.join(', ') || 'No especificadas'}
- Materiales: ${productData.selectedMaterials?.join(', ') || 'No especificados'}
- Dimensiones: ${productData.dimensions || 'No especificadas'}
- Descripción: ${productData.description || 'No proporcionada'}
- Marca: ${brandData.brandName}

ANÁLISIS VISUAL REQUERIDO (sé EXTREMADAMENTE específico):

1. **FORMA Y ESTRUCTURA**:
   - Forma geométrica general (rectangular, circular, ovalada, irregular, etc.)
   - Dimensiones aproximadas visuales
   - Partes o componentes distinguibles
   - Simetría o asimetría

2. **COLOR Y ACABADO**:
   - Color principal exacto (ej: "madera de nogal oscuro", "pino natural claro", "caoba rojizo")
   - Tonos secundarios o vetas visibles
   - Tipo de acabado (mate, brillante, satinado, encerado, aceitado)
   - Variaciones de color naturales

3. **TEXTURA Y MATERIAL**:
   - Textura de la superficie (lisa, rugosa, con vetas marcadas, nudos visibles)
   - Dirección de las vetas de la madera
   - Elementos naturales (nudos, marcas, variaciones)
   - Grosor aparente del material

4. **DETALLES CONSTRUCTIVOS**:
   - Tipo de uniones (inglete, caja y espiga, etc.)
   - Elementos decorativos (tallados, grabados, incrustaciones)
   - Hardware visible (manijas, bisagras, tornillos)
   - Bordes y esquinas (redondeados, cuadrados, biselados)

5. **PRESENTACIÓN FOTOGRÁFICA**:
   - Tipo de fondo (blanco, madera, contexto, gradiente)
   - Iluminación (estudio, natural, lateral, difusa)
   - Ángulos mostrados
   - Calidad de la fotografía

Responde OBLIGATORIAMENTE en formato JSON con esta estructura exacta:
{
  "visualDescription": "descripción ultra-detallada de 150+ palabras del producto",
  "exactColors": ["color1", "color2"],
  "shape": "forma geométrica exacta",
  "texture": "descripción de textura",
  "finish": "tipo de acabado",
  "dimensions": "dimensiones visuales aproximadas",
  "designHighlights": ["detalle1", "detalle2", "detalle3"],
  "constructionDetails": ["detalle constructivo 1", "detalle 2"],
  "visibleAngles": ["frontal", "lateral"],
  "currentStyle": "estilo fotográfico actual",
  "woodGrain": "descripción de vetas",
  "uniqueFeatures": ["característica única 1", "característica 2"],
  "naturalEnvironment": "entorno natural de uso del producto (ej: cocina, sala, oficina, jardín)",
  "usageContext": "situación típica de uso (ej: sobre una mesa, colgado en la pared, en una repisa)"
}`;

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...imageContents
          ]
        }
      ],
      thinking: { type: 'disabled' }
    });

    const analysisText = response.choices[0]?.message?.content || '';
    
    // Intentar parsear como JSON
    let analysis;
    try {
      // Limpiar respuesta
      const cleanResponse = analysisText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      analysis = JSON.parse(cleanResponse);
    } catch {
      // Si falla, crear estructura con el texto
      analysis = {
        visualDescription: analysisText,
        exactColors: [],
        shape: 'No determinada',
        texture: 'No determinada',
        finish: 'No determinado',
        dimensions: 'No especificadas',
        designHighlights: [],
        constructionDetails: [],
        visibleAngles: [],
        currentStyle: 'Estilo actual detectado',
        woodGrain: 'No especificada',
        uniqueFeatures: [],
        naturalEnvironment: 'hogar',
        usageContext: 'uso diario'
      };
    }

    // ============================================
    // GENERAR PROMPT PARA IMAGEN-A-IMAGEN
    // ============================================
    const visualDesc = analysis.visualDescription || `${productData.name} artesanal de madera`;
    const exactColors = analysis.exactColors || ['madera natural'];
    const shape = analysis.shape || 'forma rectangular';
    const texture = analysis.texture || 'textura de madera natural';
    const finish = analysis.finish || 'acabado natural';
    const woodGrain = analysis.woodGrain || 'vetas naturales';
    const uniqueFeatures = analysis.uniqueFeatures || [];
    const naturalEnvironment = analysis.naturalEnvironment || 'hogar elegante';
    const usageContext = analysis.usageContext || 'en uso';

    // Crear descripción detallada para el prompt
    const detailedDescription = `${productData.name} artesanal de madera. ${shape}. Colores: ${exactColors.join(', ')}. ${texture}. ${finish}. Veteadura: ${woodGrain}. ${uniqueFeatures.length > 0 ? `Características distintivas: ${uniqueFeatures.join(', ')}.` : ''} Materiales: ${productData.selectedMaterials?.join(' y ') || 'madera'}. Marca: ${brandData.brandName}. ${visualDesc}`;

    // Prompt estructurado para servicios de imagen-a-imagen
    const imageToImagePrompt = `Te proporciono la imagen de un producto. Analiza cuidadosamente su forma, materiales, colores y función.

Descripción: ${detailedDescription}

Actúa como fotógrafo publicitario profesional y diseñador de producto.

OBJETIVO:

Generar una imagen fotorrealista del producto en su entorno de uso natural y típico.

INSTRUCCIONES:

- Mantén EXACTAMENTE el diseño del producto (no lo rediseñes).
- Conserva proporciones, logotipos, colores y materiales.
- Ubica el producto en: ${naturalEnvironment}.
- Muestra el producto en una situación realista de uso: ${usageContext}.
- Iluminación profesional tipo fotografía comercial.
- Profundidad de campo suave (background ligeramente desenfocado).
- Estilo: fotografía publicitaria premium.
- Cámara: lente 50mm o 85mm, alta resolución.
- Composición limpia y moderna.
- Sin texto, sin marcas de agua.
- El producto debe ser el protagonista visual.

ENTREGA:

Imagen fotorrealista de alta calidad.`;

    // Agregar el prompt al resultado
    analysis.imageToImagePrompt = imageToImagePrompt;

    console.log('=== ANÁLISIS COMPLETADO ===');
    console.log('Prompt generado:', imageToImagePrompt ? 'SÍ' : 'NO');
    console.log('===========================');

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('Error analyzing images:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}
