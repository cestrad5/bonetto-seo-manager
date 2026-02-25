import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productData, brandData } = body;

    const zai = await ZAI.create();

    // Generar números aleatorios para el HTML
    const valoraciones = Math.floor(Math.random() * (2000 - 800 + 1)) + 800;
    const rating = (Math.random() * (4.9 - 4.4) + 4.4).toFixed(2);
    const ratingPercent = Math.round(parseFloat(rating) * 20);

    // Crear el bloque HTML con el formato específico
    const htmlBlock = `<strong>REF: </strong>${productData.ref}
${productData.length}x${productData.width}x${productData.height}${brandData.unit}
(${valoraciones} Valoraciones) Global ${rating}/5: <span style="font-size: 150%; color: orange;">★★★★<span style="background: linear-gradient(to right, orange ${ratingPercent}%, transparent ${100 - ratingPercent}%); -webkit-background-clip: text; color: transparent;">★</span></span>
${productData.descripcionCreativa || `Una pieza artesanal única que transforma cualquier espacio con la calidez de la madera natural. 🪵✨`}`;

    const systemPrompt = `Eres experto en SEO para WooCommerce. Genera contenido optimizado para Yoast SEO (semáforo verde). 

Reglas importantes:
- Usa voz activa
- Incluye palabras de transición
- NO incluyas precios
- Responde SOLO en formato JSON válido
- El JSON debe tener exactamente estas claves: keyword, title, slug, meta_description, long_description, html_block

Información de la marca:
- Nombre: ${brandData.brandName}
- Descripción: ${brandData.brandDescription}

Información del producto:
- Nombre: ${productData.name}
- Referencia: ${productData.ref}
- Dimensiones: ${productData.length} x ${productData.width} x ${productData.height} ${brandData.unit}
- Categorías: ${productData.selectedCategories.join(', ')}
- Materiales: ${productData.selectedMaterials.join(', ')}
- Descripción del usuario: ${productData.description}

IMPORTANTE para html_block:
El HTML ya está predefinido con este formato exacto:
<strong>REF: </strong>${productData.ref}
${productData.length}x${productData.width}x${productData.height}${brandData.unit}
(${valoraciones} Valoraciones) Global ${rating}/5: <span style="font-size: 150%; color: orange;">★★★★<span style="background: linear-gradient(to right, orange ${ratingPercent}%, transparent ${100 - ratingPercent}%); -webkit-background-clip: text; color: transparent;">★</span></span>
[Una frase creativa relacionada con el producto con emojis apropiados]

Debes generar una frase creativa única para este producto específico (máximo 100 caracteres, incluyendo emojis apropiados).`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Genera el contenido SEO optimizado para este producto en formato JSON. 

Para el campo html_block, usa EXACTAMENTE este formato:
<strong>REF: </strong>${productData.ref}
${productData.length}x${productData.width}x${productData.height}${brandData.unit}
(${valoraciones} Valoraciones) Global ${rating}/5: <span style="font-size: 150%; color: orange;">★★★★<span style="background: linear-gradient(to right, orange ${ratingPercent}%, transparent ${100 - ratingPercent}%); -webkit-background-clip: text; color: transparent;">★</span></span>
[FRASE CREATIVA AQUÍ CON EMOJIS]

Solo responde con el JSON, sin texto adicional.`
        }
      ],
      thinking: { type: 'disabled' }
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    // Intentar parsear el JSON de la respuesta
    let seoContent;
    try {
      // Limpiar la respuesta de posibles caracteres extra
      const cleanResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      seoContent = JSON.parse(cleanResponse);
      
      // Asegurar que el html_block tenga el formato correcto
      // Si el AI no lo generó correctamente, usar el predefinido
      if (!seoContent.html_block || !seoContent.html_block.includes('REF:')) {
        const fraseCreativa = seoContent.long_description 
          ? seoContent.long_description.split('.')[0] + ' ✨'
          : `Una pieza artesanal única que transforma cualquier espacio. 🪵✨`;
        seoContent.html_block = htmlBlock.replace(
          '[Una pieza artesanal única que transforma cualquier espacio con la calidez de la madera natural. 🪵✨]',
          fraseCreativa.substring(0, 100)
        );
      }
    } catch {
      // Si no se puede parsear, crear un objeto con valores por defecto
      const fraseCreativa = productData.description 
        ? productData.description.split('.')[0].substring(0, 90) + ' ✨'
        : `Una pieza artesanal única de ${brandData.brandName}. 🪵✨`;
      
      seoContent = {
        keyword: productData.name.toLowerCase(),
        title: `${productData.name} | ${brandData.brandName}`,
        slug: productData.name.toLowerCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
        meta_description: `${productData.name} - Producto artesanal de ${brandData.brandName}. Elaborado en ${productData.selectedMaterials.join(' y ')}.`.substring(0, 160),
        long_description: `${productData.name} es un producto artesanal creado con amor por ${brandData.brandName}. Elaborado en ${productData.selectedMaterials.join(' y ')}, este producto destaca por su calidad y diseño único. Dimensiones: ${productData.length} x ${productData.width} x ${productData.height} ${brandData.unit}.`,
        html_block: htmlBlock.replace(
          '[Una pieza artesanal única que transforma cualquier espacio con la calidez de la madera natural. 🪵✨]',
          fraseCreativa
        )
      };
    }

    return NextResponse.json({
      success: true,
      data: seoContent
    });

  } catch (error) {
    console.error('Error generating SEO content:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      },
      { status: 500 }
    );
  }
}
